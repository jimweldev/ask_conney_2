<?php

namespace App\Helpers;

use Illuminate\Support\Facades\File;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

class DynamicLogger {
    /**
     * Create a dynamic logger that writes to the given path.
     *
     * @param  string  $path  Absolute path or relative to storage/logs
     * @param  string  $channel  Logger name
     *
     * @throws \Exception
     */
    public static function create(string $path, string $channel = 'custom'): Logger {
        // If the path is relative, store under storage/logs/
        if (!str_starts_with($path, storage_path())) {
            $path = storage_path("logs/{$path}");
        }

        // Ensure directory exists
        $dir = dirname($path);
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        // Create a new Monolog instance
        $logger = new Logger($channel);

        // Add stream handler (append mode)
        $logger->pushHandler(new StreamHandler($path, Logger::DEBUG));

        return $logger;
    }
}
