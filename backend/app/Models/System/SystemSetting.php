<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];
}
