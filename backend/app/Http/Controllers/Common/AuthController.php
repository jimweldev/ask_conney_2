<?php

namespace App\Http\Controllers\Common;

use App\Helpers\UserHelper;
use App\Http\Controllers\Controller;
use App\Models\Mail\MailLog;
use App\Models\Mail\MailTemplate;
use App\Models\User\User;
use App\Models\User\UserResetPasswordToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use PragmaRX\Google2FA\Google2FA;
use PragmaRX\Google2FAQRCode\Google2FA as Google2FAQRCode;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller {
    public function registerWithEmail(Request $request): JsonResponse {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        return $this->respondWithToken($user);
    }

    public function loginWithEmail(Request $request): JsonResponse {
        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // If 2FA is enabled, don't issue token yet — ask for OTP
        if ($user->is_two_factor_enabled) {
            return response()->json([
                'requires_2fa' => true,
                'message' => 'Two-factor authentication required.',
            ]);
        }

        return $this->respondWithToken($user);
    }

    public function verify2faLogin(Request $request): JsonResponse {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $google2fa = new Google2FA;
        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        return $this->respondWithToken($user);
    }

    public function loginWithGoogle(Request $request) {
        $googleUser = Socialite::driver('google')->userFromToken($request->access_token);

        $user = UserHelper::getUser($googleUser->getEmail());

        if (!$user) {
            $firstName = $googleUser->user['given_name'] ?? null;
            $lastName = $googleUser->user['family_name'] ?? null;

            $user = User::create([
                'email' => $googleUser->getEmail(),
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]);

            $user = UserHelper::getUser($user->email);
        }

        try {
            return $this->respondWithToken($user);
        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Authentication failed',
            ], 500);
        }
    }

    public function sendResetPasswordEmail(Request $request): JsonResponse {
        $uiBaseUrl = env('UI_BASE_URL');

        $email = $request->input('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $authUser = UserHelper::getUser($email);

        $token = $this->generateToken($authUser, 5 * 60); // 5 minutes

        $mailTemplateId = MailTemplate::where('label', 'Reset Password Template')->first()->id;

        if (!$mailTemplateId) {
            return response()->json([
                'message' => 'Mail template not found',
            ], 404);
        }

        $name = UserHelper::formatName($user, 'semifull');

        // create or update a record on user_reset_password_tokens table
        $userResetPasswordToken = UserResetPasswordToken::where('user_id', $user->id)->first();

        if (!$userResetPasswordToken) {
            UserResetPasswordToken::create([
                'user_id' => $user->id,
                'token' => $token,
            ]);
        } else {
            $userResetPasswordToken->update([
                'token' => $token,
            ]);
        }

        MailLog::create([
            'user_id' => $user->id,
            'mail_template_id' => $mailTemplateId,
            'subject' => 'Reset Your Password',
            'recipient_email' => $user->email,
            'content_data' => json_encode([
                'name' => $name,
                'reset_url' => $uiBaseUrl.'/reset-password?token='.$token,
            ]),
        ]);

        return response()->json([
            'message' => 'Reset password email sent',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse {
        $token = $request->token;
        $newPassword = $request->new_password;
        $confirmPassword = $request->confirm_password;

        try {
            // Decode the token
            $payload = JWTAuth::setToken($token)->getPayload();
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token has expired.'], 400);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Invalid token.'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Unable to process token.'], 400);
        }

        // Extract user ID from the token payload
        $userId = $payload->get('sub');

        // Verify the token still exists in the DB
        $userResetToken = UserResetPasswordToken::where('user_id', $userId)
            ->where('token', $token)
            ->first();

        if (!$userResetToken) {
            return response()->json([
                'message' => 'Reset token not found or already used.',
            ], 400);
        }

        // Get the user
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Update the password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Delete the used token
        $userResetToken->delete();

        return $this->respondWithToken($user);
    }

    public function enable2fa(Request $request): JsonResponse {
        $authUser = $request->user();

        $google2fa = new Google2FAQRCode;

        // check if user already has 2fa enabled
        if ($authUser->is_two_factor_enabled) {
            return response()->json([
                'message' => 'Two-factor authentication already enabled.',
            ], 400);
        }

        // Generate new secret
        $secret = $google2fa->generateSecretKey();

        $authUser->two_factor_secret = $secret;
        $authUser->save();

        // Generate QR code URL
        $qrCodeSvg = $google2fa->getQRCodeInline(
            env('APP_NAME'),
            $authUser->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_code' => $qrCodeSvg, // Already base64 encoded by the package
        ]);
    }

    public function verify2fa(Request $request): JsonResponse {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $user = $request->user();
        $google2fa = new Google2FA;

        if ($google2fa->verifyKey($user->two_factor_secret, $request->otp)) {
            $user->is_two_factor_enabled = true;
            $user->save();

            return response()->json(['user' => $user]);
        }

        return response()->json(['message' => 'Invalid verification code.'], 422);
    }

    public function disable2fa(Request $request): JsonResponse {
        $authUser = $request->user();

        $authUser->is_two_factor_enabled = false;
        $authUser->two_factor_secret = null;
        $authUser->save();

        return response()->json(['user' => $authUser]);
    }

    // PRIVATE FUNCTIONS
    private function respondWithToken(User $user): JsonResponse {
        $authUser = UserHelper::getUser($user->email);

        $accessToken = $this->generateToken($authUser, config('jwt.ttl'));

        return response()->json([
            'user' => $authUser,
            'access_token' => $accessToken,
        ]);
    }

    private function generateToken(User $user, int $ttl): string {
        return JWTAuth::customClaims(['exp' => now()->addMinutes($ttl)->timestamp])->fromUser($user);
    }
}
