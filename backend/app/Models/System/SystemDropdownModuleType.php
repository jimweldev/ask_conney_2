<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;

class SystemDropdownModuleType extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function system_dropdown_module() {
        return $this->belongsTo(SystemDropdownModule::class);
    }
}
