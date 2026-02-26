<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];
}
