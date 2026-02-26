<?php

namespace App\Models\Mail;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Model;

class MailLog extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'content_data' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function mail_template() {
        return $this->belongsTo(MailTemplate::class);
    }

    public function mail_log_attachments() {
        return $this->hasMany(MailLogAttachment::class, 'mail_log_id', 'id');
    }
}
