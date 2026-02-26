<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];
}
