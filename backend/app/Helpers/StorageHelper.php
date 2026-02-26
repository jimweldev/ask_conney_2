<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageHelper {
    /**
     * Upload a file with a unique name (UUID) and custom extension
     * to the specified disk and path.
     *
     * @param  UploadedFile  $file  The uploaded file instance
     * @param  string  $path  The folder/directory (e.g., 'uploads/images')
     * @param  string  $extension  File extension (e.g., 'jpg', 'png')
     * @param  string  $disk  Storage disk (default: 'public')
     * @return string|null Path to stored file or null on failure
     */
    public static function uploadFileAs(UploadedFile $file, string $path, string $extension, string $disk = 'public'): ?string {
        $fileName = Str::uuid().'.'.$extension;

        try {
            return '/'.$file->storeAs($path, $fileName, $disk);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Delete a file from the specified disk.
     *
     * @param  string  $filePath  Path to the file relative to the disk root
     * @param  string  $disk  Storage disk (default: 'public')
     * @return bool True if file was deleted or doesn't exist; false on failure
     */
    public static function deleteFile(string $filePath, string $disk = 'public'): bool {
        try {
            if (Storage::disk($disk)->exists($filePath)) {
                return Storage::disk($disk)->delete($filePath);
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
