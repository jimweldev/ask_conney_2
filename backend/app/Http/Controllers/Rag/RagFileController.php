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
use App\Models\Ticketing\Ticket;
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

            $request['allowed_locations'] = empty($request->allowed_locations) ? null : $allowedLocations;
            $request['allowed_positions'] = empty($request->allowed_positions) ? null : $allowedPositions;
            $request['allowed_websites'] = empty($request->allowed_websites) ? null : $allowedWebsites;

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
        $pendingTicket = $request->input('pending_ticket');
        $normalized = strtolower(trim($question));

        /*
        |--------------------------------------------------------------------------
        | 1️⃣ Handle Confirmation / Cancellation
        |--------------------------------------------------------------------------
        */

        $isConfirmation = in_array($normalized, ['yes', 'y', 'confirm', 'ok', 'sure']);
        $isCancellation = in_array($normalized, ['no', 'n', 'cancel', 'nope', 'nevermind']);

        if (!empty($pendingTicket)) {
            // ✅ Confirm ticket creation
            if ($isConfirmation) {
                return response()->json([
                    'answer' => 'Your record has been created successfully.',
                    'pending_ticket' => null,
                ]);
            }

            // ❌ Cancel ticket creation
            if ($isCancellation) {
                return response()->json([
                    'answer' => 'Ticket creation cancelled. Let me know if you need anything else.',
                    'pending_ticket' => null,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 2️⃣ Detect Intent via AI
        |--------------------------------------------------------------------------
        */

        $intent = AiHelper::detectIntentAndExtractData($question, $history);
        $action = $intent['action'] ?? 'none';

        /*
        |--------------------------------------------------------------------------
        | 3️⃣ Ask for Confirmation (AI message only)
        |--------------------------------------------------------------------------
        */

        if ($action === 'ask_create_ticket') {
            return response()->json([
                'answer' => $intent['message'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 4️⃣ Always Show Draft Before Creating
        |--------------------------------------------------------------------------
        */

        if (
            in_array($action, ['confirm_ticket', 'create_ticket']) &&
            !empty($intent['data'])
        ) {
            $data = $intent['data'];

            $title = $data['title'] ?? 'Untitled';
            $description = $data['description'] ?? $question;
            $priority = ucfirst(strtolower($data['priority'] ?? 'medium'));

            $message = <<<TEXT
Here is a draft of your ticket:

**Title**: {$title}
**Description**: {$description}
**Priority**: {$priority}

Reply with:
- 'yes' to confirm
- 'no' to cancel
- or edit any part of the draft
TEXT;

            return response()->json([
                'answer' => $message,
                'pending_ticket' => [
                    'title' => $title,
                    'description' => $description,
                    'priority' => $priority,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 5️⃣ RAG Fallback (Knowledge Search)
        |--------------------------------------------------------------------------
        */

        if ($action !== 'none') {
            return response()->json([
                'answer' => "I'm sorry, I don't have any context to answer that question.",
            ]);
        }

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
                'answer' => "I'm sorry, I don't have any context to answer that question.",
            ]);
        }

        $topChunks = RagFileChunk::whereIn('rag_file_id', $ragFileIds)
            ->orderByVectorDistance('embeddings', $queryEmbeddings)
            ->limit(5)
            ->get();

        if ($topChunks->isEmpty()) {
            return response()->json([
                'answer' => "I'm sorry, I don't have any context to answer that question.",
            ]);
        }

        $context = $topChunks->map(
            fn ($chunk, $index) => "Context {$index}: {$chunk->content}"
        );

        $answer = AiHelper::generateAnswer($question, $context, $history);

        return response()->json([
            'answer' => $answer,
        ]);
    }
}
