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
            $allowedWebsites  = json_decode($request->allowed_websites, true);

            $request['allowed_locations'] = empty($allowedLocations) ? null : $allowedLocations;
            $request['allowed_positions'] = empty($allowedPositions) ? null : $allowedPositions;
            $request['allowed_websites']  = empty($allowedWebsites) ? null : $allowedWebsites;

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

        $intent = AiHelper::detectIntentAndExtractData($question, $history);
        $action = $intent['action'] ?? 'none';

        // Step 1️⃣ Ask if user wants to create ticket
        if ($action === 'ask_create_ticket') {
            return response()->json([
                'answer' => $intent['message'],
            ]);
        }

        // Step 2️⃣ Show ticket draft and ask for final confirmation
        if ($action === 'confirm_ticket') {
            $data = $intent['data'] ?? [];

            $title = $data['title'] ?? 'Untitled';
            $description = $data['description'] ?? $question;
            $priority = ucfirst(strtolower($data['priority'] ?? 'Medium'));
            $project = $data['project'] ?? null;
            $table = $data['table'] ?? 'tickets';

            $confirmationMessage = "Here are the record details. Reply with 'yes' to confirm or 'no' to cancel.\n\n".
                                   "**Title**: {$title}\n".
                                   "**Priority**: {$priority}\n".
                                   "**Project**: {$project}\n".
                                   "**Table**: {$table}\n".
                                   "**Description**: {$description}";

            return response()->json([
                'answer' => $confirmationMessage,
                'pending_ticket' => [
                    'title' => $title,
                    'description' => $description,
                    'priority' => $priority,
                    'project' => $project,
                    'table' => $table,
                ],
            ]);
        }

        if ($action === 'create_ticket') {
            $data = $intent['data'] ?? [];

            $title = $data['title'] ?? 'Untitled';
            $description = $data['description'] ?? $question;
            $priority = strtolower($data['priority'] ?? 'medium');
            $project = $data['project'] ?? null;
            $table = $data['table'] ?? 'tickets';

            if ($table === 'disputes') {
                $record = Dispute::create([
                    'title' => $title,
                    'description' => $description,
                    'user_id' => auth()->id(),
                ]);
            } else {
                $record = Ticket::create([
                    'title' => $title,
                    'description' => $description,
                    'priority' => $priority,
                    'project' => $project,
                    'status' => 'open',
                    'user_id' => auth()->id(),
                ]);
            }

            return response()->json([
                'answer' => 'Your record has been created successfully.',
                'record_id' => $record->id,
                'table' => $table,
            ]);
        }

        // Step 4️⃣ Normal RAG fallback
        $queryEmbeddings = AiHelper::generateEmbeddings($question);
        $locations = $request->input('locations', []);
        $positions = $request->input('positions', []);
        $websites  = $request->input('websites', []);

        $ragFileIds = RagFile::query()

            // Locations
            ->where(function ($query) use ($locations) {
                $query->whereNull('allowed_locations');

                if (!empty($locations)) {
                    $query->orWhere(function ($q) use ($locations) {
                        foreach ($locations as $location) {
                            $q->orWhereJsonContains('allowed_locations', $location);
                        }
                    });
                }
            })

            // Positions
            ->where(function ($query) use ($positions) {
                $query->whereNull('allowed_positions');

                if (!empty($positions)) {
                    $query->orWhere(function ($q) use ($positions) {
                        foreach ($positions as $position) {
                            $q->orWhereJsonContains('allowed_positions', $position);
                        }
                    });
                }
            })

            // Websites
            ->where(function ($query) use ($websites) {
                $query->whereNull('allowed_websites');

                if (!empty($websites)) {
                    $query->orWhere(function ($q) use ($websites) {
                        foreach ($websites as $website) {
                            $q->orWhereJsonContains('allowed_websites', $website);
                        }
                    });
                }
            })

            ->pluck('id');

        $topChunks = RagFileChunk::query()
            ->orderByVectorDistance('embeddings', $queryEmbeddings)
            ->whereIn('rag_file_id', $ragFileIds)
            ->limit(5)
            ->get();

        if (count($topChunks) < 1) {
            return response()->json([
                'answer' => 'No relevant context found.',
            ]);
        }

        $context = collect($topChunks)
            ->map(fn ($c, $i) => 'Context '.($i + 1).":\n".$c->content)
            ->implode("\n\n");

        $answer = AiHelper::generateAnswer($question, $context, $history);

        return response()->json([
            'answer' => $answer,
            'top_chunks' => $topChunks->pluck('id')->toArray(),
        ]);
    }
}
