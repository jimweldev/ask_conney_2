<?php

namespace App\Http\Controllers\Rag;

use App\Helpers\AiHelper;
use App\Helpers\DynamicLogger;
use App\Helpers\QueryHelper;
use App\Helpers\S3Helper;
use App\Http\Controllers\Controller;
use App\Jobs\Rag\EmbedRagFileChunk;
use App\Models\Rag\RagFile;
use App\Models\Rag\RagFileChunk;
use Illuminate\Http\Request;

class RagFileController extends Controller {
    private $logger;

    public function __construct() {
        $this->logger = DynamicLogger::create('laravel.log', 'local');
    }

    /**
     * Display a paginated list of records with optional filtering and search.
     */
    public function index(Request $request) {
        $queryParams = $request->all();

        try {
            $query = RagFile::query();
            $type = 'paginate';
            QueryHelper::apply($query, $queryParams, $type);

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('id', 'LIKE', '%'.$search.'%');
                });
            }

            $totalRecords = $query->count();
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            QueryHelper::applyLimitAndOffset($query, $limit, $page);

            $records = $query->get();

            return response()->json([
                'records' => $records,
                'meta' => [
                    'total_records' => $totalRecords,
                    'total_pages' => ceil($totalRecords / $limit),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified record.
     */
    public function show($id) {
        $record = RagFile::where('id', $id)->first();

        if (!$record) {
            return response()->json([
                'message' => 'Record not found.',
            ], 404);
        }

        return response()->json($record, 200);
    }

    /**
     * Store a newly created record in storage.
     */
    public function store(Request $request) {
        try {
            $filePath = S3Helper::uploadFile($request->file('file'), 'rag_files');

            if (!$filePath) {
                return response()->json([
                    'message' => 'Failed to upload file.',
                ], 400);
            }

            // Merge unique files
            $request->merge([
                'file_path' => $filePath,
            ]);

            $allowedLocations = json_decode($request->allowed_locations, true);
            $allowedPositions = json_decode($request->allowed_positions, true);
            $allowedWebsites = json_decode($request->allowed_websites, true);

            $request['allowed_locations'] = empty($allowedLocations) ? null : $allowedLocations;
            $request['allowed_positions'] = empty($allowedPositions) ? null : $allowedPositions;
            $request['allowed_websites'] = empty($allowedWebsites) ? null : $allowedWebsites;

            $record = RagFile::create($request->all());

            $extractedText = S3Helper::extractFileContent($record->file_path);

            $chunks = array_filter(preg_split('/\s+/', $extractedText));
            $chunkSize = 500;
            $chunkIndex = 0;
            $createdChunkIds = [];

            for ($i = 0; $i < count($chunks); $i += $chunkSize) {
                $chunkContent = implode(' ', array_slice($chunks, $i, $chunkSize));

                $chunk = RagFileChunk::create([
                    'rag_file_id' => $record->id,
                    'chunk_index' => $chunkIndex,
                    'content' => $chunkContent,
                ]);

                $createdChunkIds[] = $chunk->id;
                $chunkIndex++;
            }

            // Dispatch embedding jobs after commit
            foreach ($createdChunkIds as $chunkId) {
                EmbedRagFileChunk::dispatch($chunkId);
            }

            return response()->json($record, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update the specified record in storage.
     */
    public function update(Request $request, $id) {
        try {
            $record = RagFile::find($id);

            if (!$record) {
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            // if has file
            if ($request->hasFile('file')) {
                // delete the current file chunks
                $record->ragFileChunks()->delete();

                $filePath = S3Helper::uploadFile($request->file('file'), 'rag_files');

                if (!$filePath) {
                    return response()->json([
                        'message' => 'Failed to upload file.',
                    ], 400);
                }

                $request->merge([
                    'file_path' => $filePath,
                ]);
            }

            $allowedLocations = json_decode($request->allowed_locations, true);
            $allowedPositions = json_decode($request->allowed_positions, true);
            $allowedWebsites = json_decode($request->allowed_websites, true);

            $request['allowed_locations'] = empty($allowedLocations) ? null : $allowedLocations;
            $request['allowed_positions'] = empty($allowedPositions) ? null : $allowedPositions;
            $request['allowed_websites'] = empty($allowedWebsites) ? null : $allowedWebsites;

            $record->update($request->all());

            // if has file
            if ($request->hasFile('file')) {
                $extractedText = S3Helper::extractFileContent($record->file_path);

                $chunks = array_filter(preg_split('/\s+/', $extractedText));
                $chunkSize = 500;
                $chunkIndex = 0;
                $createdChunkIds = [];

                for ($i = 0; $i < count($chunks); $i += $chunkSize) {
                    $chunkContent = implode(' ', array_slice($chunks, $i, $chunkSize));

                    $chunk = RagFileChunk::create([
                        'rag_file_id' => $record->id,
                        'chunk_index' => $chunkIndex,
                        'content' => $chunkContent,
                    ]);

                    $createdChunkIds[] = $chunk->id;
                    $chunkIndex++;
                }

                // Dispatch embedding jobs after commit
                foreach ($createdChunkIds as $chunkId) {
                    EmbedRagFileChunk::dispatch($chunkId);
                }
            }

            return response()->json($record, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified record from storage.
     */
    public function destroy($id) {
        try {
            $record = RagFile::find($id);

            if (!$record) {
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            // Delete the record
            $record->delete();

            return response()->json($record, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function query(Request $request) {
        $question = $request->input('question');
        $history = $request->input('history', []);
        $ticketData = $request->input('ticket_data', []);
        $state = $request->input('state', []);

        /*
        |--------------------------------------------------------------------------
        | STEP 1 — Handle Ticket Offer Confirmation
        |--------------------------------------------------------------------------
        */

        if (!empty($state['ticket_offer_pending'])) {
            $yesWords = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'go ahead', 'please do', 'create it'];

            if (in_array(strtolower(trim($question)), $yesWords)) {
                $intent = AiHelper::detectIntentAndExtractData(
                    $state['detected_issue_message'],
                    $history
                );

                if (($intent['action'] ?? null) === 'update') {
                    return response()->json([
                        'type' => 'update',
                        'ticket_data' => $intent['data'],
                        'state' => [
                            'ticket_offer_pending' => false,
                        ],
                        'answer' => $this->formatTicketDraft($intent['data']),
                    ]);
                }
            }

            if (strtolower(trim($question)) === 'no') {
                return response()->json([
                    'type' => 'message',
                    'state' => [
                        'ticket_offer_pending' => false,
                    ],
                    'answer' => 'Okay, I will not create a ticket. Let me know if you need help with anything else.',
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 2 — AI Intent Detection
        |--------------------------------------------------------------------------
        */

        $intent = AiHelper::detectIntentAndExtractData($question, $history);

        $action = $intent['action'] ?? 'none';
        $message = $intent['message'] ?? null;
        $data = $intent['data'] ?? null;

        $this->logger->info("AI Action: $action");

        /*
        |--------------------------------------------------------------------------
        | STEP 3 — Ticket Offer Handling
        |--------------------------------------------------------------------------
        */

        if ($action === 'ask' && str_contains(strtolower($message), 'create an it helpdesk ticket')) {
            return response()->json([
                'type' => 'message',
                'state' => [
                    'ticket_offer_pending' => true,
                    'detected_issue_message' => $question,
                ],
                'answer' => $message,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 4 — Ticket Flow
        |--------------------------------------------------------------------------
        */

        if ($action !== 'none') {
            if ($action === 'greeting') {
                return response()->json([
                    'type' => 'message',
                    'answer' => $message ?? 'Hello! How can I help you today?',
                ]);
            }

            if ($action === 'ask') {
                return response()->json([
                    'type' => 'message',
                    'answer' => $message,
                ]);
            }

            if ($action === 'confirm') {
                return response()->json([
                    'type' => 'confirm',
                    'ticket_data' => $data,
                    'answer' => $this->formatTicketDraft($data),
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
                if (!is_array($ticketData)) {
                    $ticketData = [];
                }

                $mergedData = array_merge($ticketData, $data ?? []);

                return response()->json([
                    'type' => 'update',
                    'ticket_data' => $mergedData,
                    'answer' => $this->formatTicketDraft($mergedData),
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
        | STEP 5 — RAG Knowledge Search (unchanged)
        |--------------------------------------------------------------------------
        */

        $locations = $request->input('locations', []);
        $positions = $request->input('positions', []);
        $websites = $request->input('websites', []);

        $queryEmbeddings = AiHelper::generateEmbeddings($question);

        $ragFileIds = RagFile::query()
            ->where(function ($query) use ($locations) {
                $query->whereNull('allowed_locations');

                foreach ($locations as $location) {
                    $query->orWhereJsonContains('allowed_locations', $location);
                }
            })
            ->where(function ($query) use ($positions) {
                $query->whereNull('allowed_positions');

                foreach ($positions as $position) {
                    $query->orWhereJsonContains('allowed_positions', $position);
                }
            })
            ->where(function ($query) use ($websites) {
                $query->whereNull('allowed_websites');

                foreach ($websites as $website) {
                    $query->orWhereJsonContains('allowed_websites', $website);
                }
            })
            ->pluck('id')
            ->toArray();

        if (empty($ragFileIds)) {
            return response()->json([
                'type' => 'knowledge',
                'answer' => "I'm sorry, I don't have enough information to answer that.",
            ]);
        }

        $topChunks = RagFileChunk::whereIn('rag_file_id', $ragFileIds)
            ->orderByVectorDistance('embeddings', $queryEmbeddings)
            ->limit(5)
            ->get();

        if ($topChunks->isEmpty()) {
            return response()->json([
                'type' => 'knowledge',
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
