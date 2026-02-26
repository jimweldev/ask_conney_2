<?php

namespace App\Models\Rag;

use Illuminate\Database\Eloquent\Model;

class RagFileChunk extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'embeddings' => 'array',
    ];

    public function ragFile() {
        return $this->belongsTo(RagFile::class);
    }
}
