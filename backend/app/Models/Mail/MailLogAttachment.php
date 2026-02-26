<?php

namespace App\Models\Mail;

use Illuminate\Database\Eloquent\Model;

class MailLogAttachment extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];
}
