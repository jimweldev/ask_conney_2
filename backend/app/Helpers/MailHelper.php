<?php

namespace App\Helpers;

use App\Models\Mail\MailLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailHelper {
    public static function sendMail($mailLog) {
        Log::info('Sending mail...'.$mailLog->id);
        // Get the storage base URL
        $storageBaseUrl = env('STORAGE_BASE_URL');

        $mailLog = MailLog::where('id', $mailLog->id)
            ->where('is_sent', false)
            ->with(['mail_template:id,content', 'mail_log_attachments:mail_log_id,file_name,file_path'])
            ->first();

        // Get email content template
        $template = $mailLog->mail_template->content;

        // Parse dynamic data used to replace placeholders in the template
        $contentData = json_decode($mailLog->content_data, true) ?? [];

        // Replace placeholders in the template with actual data
        $content = $template;
        foreach ($contentData as $key => $value) {
            $content = str_replace('{{ '.$key.' }}', $value, $content);
        }

        // Decode CC and BCC recipients
        $cc = json_decode($mailLog->cc, true) ?? [];
        $bcc = json_decode($mailLog->bcc, true) ?? [];

        // Send the email using Laravel's Mail facade
        Mail::html($content, function ($message) use ($mailLog, $cc, $bcc, $storageBaseUrl) {
            // Set the recipient and subject
            $message->to($mailLog->recipient_email, $mailLog->recipient)
                ->subject($mailLog->subject);

            // Add CC recipients
            foreach ($cc as $email) {
                $message->cc($email);
            }

            // Add BCC recipients
            foreach ($bcc as $email) {
                $message->bcc($email);
            }

            // Loop through and attach each file
            foreach ($mailLog->mail_log_attachments as $attachment) {
                try {
                    // Get the file content from the stored URL
                    $fileContent = file_get_contents($storageBaseUrl.'/'.$attachment->file_path);

                    if ($fileContent !== false) {
                        // Attach file data with original filename
                        $message->attachData($fileContent, $attachment->file_name ?? basename($storageBaseUrl.'/'.$attachment->file_path));

                        // Free memory used by the file content
                        unset($fileContent);
                        gc_collect_cycles();
                    } else {
                        Log::warning("Unable to read file from: {$storageBaseUrl}/{$attachment->file_path}");
                    }
                } catch (\Exception $e) {
                    // Log any exceptions during attachment handling
                    Log::error("Attachment error [{$storageBaseUrl}/{$attachment->file_path}]: ".$e->getMessage());
                }
            }
        });

        // Mark the mail log as sent
        $mailLog->update(['is_sent' => true]);
    }
}
