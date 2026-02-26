<?php

namespace App\Models\User;

use App\Models\Core\User;
use Illuminate\Database\Eloquent\Model;

class UserResetPasswordToken extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
