<?php

namespace App\Models\Rbac;

use Illuminate\Database\Eloquent\Model;

class RbacUserRole extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function rbac_role() {
        return $this->hasOne(RbacRole::class, 'id', 'rbac_role_id');
    }

    public function user() {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
