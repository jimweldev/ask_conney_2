<?php

namespace App\Jobs\Rag;

use App\Helpers\AiHelper;
use App\Models\Rag\RagFileChunk;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EmbedRagFileChunk implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $chunkId;

    public function __construct(int $chunkId) {
        $this->chunkId = $chunkId;
    }

    public function handle(): void {
        $chunk = RagFileChunk::find($this->chunkId);

        if (!$chunk) {
            return;
        }

        $embeddings = AiHelper::generateEmbeddings($chunk->content);

        $chunk->embeddings = $embeddings;
        $chunk->save();
    }
}
