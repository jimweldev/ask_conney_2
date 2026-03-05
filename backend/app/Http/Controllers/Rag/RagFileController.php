<?php

namespace App\Http\Controllers\Rag;

use App\Helpers\AiHelper;
use App\Helpers\DynamicLogger;
use App\Http\Controllers\Controller;
use App\Models\Rag\RagFile;
use App\Models\Rag\RagFileChunk;
use Illuminate\Http\Request;

class RagFileController extends Controller {
    private $logger;

    public function __construct() {
        $this->logger = DynamicLogger::create('laravel.log', 'local');
    }

    public function query(Request $request) {
        $question = $request->input('question');
        $history = $request->input('history', []);

        $intent = AiHelper::detectIntentAndExtractData($question, $history);

        $action = $intent['action'] ?? 'none';
        $message = $intent['message'] ?? null;
        $data = $intent['data'] ?? null;

        $this->logger->info("AI Action: $action");

        /*
        |--------------------------------------------------------------------------
        | TICKET FLOW
        |--------------------------------------------------------------------------
        */

        if ($action !== 'none') {
            if ($action === 'ask') {
                return response()->json([
                    'type' => 'message',
                    'answer' => $message,
                ]);
            }

            if ($action === 'confirm') {
                return response()->json([
                    'type' => 'confirm',
                    'ticket_data' => null,
                    'answer' => $message,
                ]);
            }

            if ($action === 'cancel') {
                return response()->json([
                    'type' => 'cancel',
                    'answer' => 'Ticket creation cancelled.',
                    'ticket_data' => null,
                ]);
            }

            if ($action === 'update') {
                $existingTicket = $request->input('ticket_data');

                if (!is_array($existingTicket)) {
                    $existingTicket = [];
                }

                $mergedData = array_merge($existingTicket, $data ?? []);

                $answer = $this->formatTicketDraft($mergedData);

                return response()->json([
                    'type' => 'update',
                    'ticket_data' => $mergedData,
                    'answer' => $answer,
                ]);
            }

            if ($action === 'create') {
                return response()->json([
                    'type' => 'create',
                    'ticket_data' => $data,
                    'answer' => 'Ticket created successfully!',
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | KNOWLEDGE SEARCH (RAG)
        |--------------------------------------------------------------------------
        */

        $locations = $request->input('locations', []);
        $positions = $request->input('positions', []);
        $websites = $request->input('websites', []);

        $queryEmbeddings = AiHelper::generateEmbeddings($question);

        $ragFileIds = RagFile::query()
            ->where(function ($query) use ($locations) {
                $query->whereNull('allowed_locations');

                if (!empty($locations)) {
                    $query->orWhereIn('allowed_locations', $locations);
                }
            })
            ->where(function ($query) use ($positions) {
                $query->whereNull('allowed_positions');

                if (!empty($positions)) {
                    $query->orWhereIn('allowed_positions', $positions);
                }
            })
            ->where(function ($query) use ($websites) {
                $query->whereNull('allowed_websites');

                if (!empty($websites)) {
                    $query->orWhereIn('allowed_websites', $websites);
                }
            })
            ->pluck('id')
            ->toArray();

        if (empty($ragFileIds)) {
            return response()->json([
                'answer' => "I'm sorry, I don't have enough information to answer that.",
            ]);
        }

        $topChunks = RagFileChunk::whereIn('rag_file_id', $ragFileIds)
            ->orderByVectorDistance('embeddings', $queryEmbeddings)
            ->limit(5)
            ->get();

        if ($topChunks->isEmpty()) {
            return response()->json([
                'answer' => "I'm sorry, I don't have enough information to answer that.",
            ]);
        }

        $context = $topChunks->map(
            fn ($chunk, $index) => "Context {$index}: {$chunk->content}"
        );

        $answer = AiHelper::generateAnswer($question, $context, $history);

        return response()->json([
            'type' => 'knowledge',
            'answer' => $answer,
        ]);
    }

    private function formatTicketDraft($data) {
        $labels = [
            'issue' => 'Issue',
            'impact' => 'Impact',
            'urgency' => 'Urgency',
            'issue_summary' => 'Summary',
            'issue_description' => 'Description',
        ];

        $answer = "**Ticket Draft**\n\n";

        foreach ($labels as $key => $label) {
            if (!empty($data[$key])) {
                $value = str_replace('_', ' ', $data[$key]);

                // Only capitalize first letter, not every word
                $value = ucfirst($value);

                $answer .= "**{$label}**: {$value}\n";
            }
        }

        $answer .= "\n---\n";
        $answer .= "Is this correct?\n";
        $answer .= "• Reply **yes** to create the ticket\n";
        $answer .= "• Or tell me what to change\n";

        return $answer;
    }
}
