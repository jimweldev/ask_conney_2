<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Model;

class SystemDropdown extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    // with module
    public function system_dropdown_module_type() {
        return $this->belongsTo(SystemDropdownModuleType::class);
    }
}
