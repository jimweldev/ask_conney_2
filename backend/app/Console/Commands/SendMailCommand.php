<?php

namespace App\Console\Commands;

use App\Helpers\DynamicLogger;
use App\Helpers\MailHelper;
use App\Models\Mail\MailLog;
use App\Models\System\SystemLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Class SendMailCommand
 *
 * Console command to process and send queued emails stored in the mail_logs table.
 * It dynamically renders the content using a mail template and handles attachments, CC, and BCC.
 */
class SendMailCommand extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-mail';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends unsent emails from the mail log using stored templates and attachments.';

    public function __construct() {
        parent::__construct();

        // Create a dynamic logger
        $this->logger = DynamicLogger::create('laravel.log', 'local');
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle() {
        $this->logger->info('Starting SendMailCommand');

        $cronStart = Carbon::now();

        $mailLogs = MailLog::where('is_sent', false)
            ->with(['mail_template:id,content', 'mail_log_attachments:mail_log_id,file_name,file_path'])
            ->get();

        foreach ($mailLogs as $mailLog) {
            MailHelper::sendMail($mailLog);
        }

        $cronEnd = Carbon::now();

        SystemLog::create([
            'label' => 'Send Mail',
            'remarks' => 'Processed '.count($mailLogs).' emails',
            'start_time' => $cronStart,
            'end_time' => $cronEnd,
        ]);
    }
}
