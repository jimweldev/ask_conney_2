<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;

class SystemDropdownModule extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function system_dropdown_module_types() {
        return $this->hasMany(SystemDropdownModuleType::class);
    }
}
