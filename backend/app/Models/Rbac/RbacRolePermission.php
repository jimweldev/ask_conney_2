<?php

namespace App\Models\Rbac;

use Illuminate\Database\Eloquent\Model;

class RbacRolePermission extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function rbac_permission() {
        return $this->hasOne(RbacPermission::class, 'id', 'rbac_permission_id');
    }
}
