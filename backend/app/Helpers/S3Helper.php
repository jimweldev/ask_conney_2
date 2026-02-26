<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Smalot\PdfParser\Parser as PdfParser;

class S3Helper {
    public static function uploadFile(UploadedFile $file, string $folder, bool $private = false): string|false {
        $disk = 's3';
        $baseFolder = 'ask_conney';

        try {
            $filename = sprintf(
                '%s_%s.%s',
                time(),
                Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)),
                $file->getClientOriginalExtension()
            );

            $directory = "{$baseFolder}/{$folder}";
            $path = "{$directory}/{$filename}";

            Storage::disk($disk)->putFileAs(
                $directory,
                $file,
                $filename,
                [
                    'visibility' => $private ? 'private' : 'public',
                ]
            );

            return '/'.$path;
        } catch (\Throwable $e) {
            report($e); // optional: log error

            return false;
        }
    }

    public static function extractFileContent($filePath) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $disk = Storage::disk('s3');

        switch (strtolower($extension)) {
            case 'txt':
                return $disk->get($filePath);
            case 'pdf':
                $pdfParser = new PdfParser;
                $tempPath = tempnam(sys_get_temp_dir(), 'pdf_');
                file_put_contents($tempPath, $disk->get($filePath));
                $pdf = $pdfParser->parseFile($tempPath);
                unlink($tempPath);

                return $pdf->getText();
            case 'docx':
                $tempPath = tempnam(sys_get_temp_dir(), 'docx_');
                file_put_contents($tempPath, $disk->get($filePath));

                $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempPath);
                unlink($tempPath);

                $text = '';

                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        // Handle plain Text elements
                        if ($element instanceof \PhpOffice\PhpWord\Element\Text) {
                            $text .= $element->getText()."\n";
                        }

                        // Handle TextRun (very common in DOCX)
                        elseif ($element instanceof \PhpOffice\PhpWord\Element\TextRun) {
                            foreach ($element->getElements() as $child) {
                                if ($child instanceof \PhpOffice\PhpWord\Element\Text) {
                                    $text .= $child->getText();
                                }
                            }
                            $text .= "\n";
                        }

                        // Handle Tables (optional but useful)
                        elseif ($element instanceof \PhpOffice\PhpWord\Element\Table) {
                            foreach ($element->getRows() as $row) {
                                foreach ($row->getCells() as $cell) {
                                    foreach ($cell->getElements() as $cellElement) {
                                        if ($cellElement instanceof \PhpOffice\PhpWord\Element\Text) {
                                            $text .= $cellElement->getText().' ';
                                        }
                                    }
                                }
                                $text .= "\n";
                            }
                        }
                    }
                }

                return trim($text);
            default:
                return null;
        }
    }
}
