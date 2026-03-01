<?php

namespace App\Models\Rag;

use Illuminate\Database\Eloquent\Model;

class RagAction extends Model {
    protected $guarded = [
        'id',
        'deleted_at',
        'created_at',
        'updated_at',
    ];
}
