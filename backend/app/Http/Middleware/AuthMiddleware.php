<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthMiddleware {
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next) {
        try {
            // Check if access token is valid
            $user = JWTAuth::parseToken()
                ->authenticate();

            if ($user) {
                return $next($request);
            }
        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Invalid token',
                'error' => $e->getMessage(),
            ], 401);
        }
    }
}
