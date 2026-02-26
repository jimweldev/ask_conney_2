<?php

namespace App\Models\Rag;

use Illuminate\Database\Eloquent\Model;

class RagFile extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'allowed_locations' => 'array',
        'allowed_positions' => 'array',
        'allowed_websites' => 'array',
    ];

    public function ragFileChunks() {
        return $this->hasMany(RagFileChunk::class);
    }
}
