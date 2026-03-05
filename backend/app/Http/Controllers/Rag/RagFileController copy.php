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

        $isConfirmation = in_array($normalized, ['yes', 'y', 'confirm', 'ok', 'sure']);
        $isCancellation = in_array($normalized, ['no', 'n', 'cancel', 'nope', 'nevermind']);

        /*
        |--------------------------------------------------------------------------
        | 1️⃣ Handle Confirmation / Cancellation
        |--------------------------------------------------------------------------
        */

        if (!empty($pendingTicket)) {
            if ($isConfirmation) {
                // TODO: Send to endpoint here

                return response()->json([
                    'answer' => 'Your record has been created successfully.',
                    'pending_ticket' => null,
                ]);
            }

            if ($isCancellation) {
                return response()->json([
                    'answer' => 'Ticket creation cancelled.',
                    'pending_ticket' => null,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Handle "What are the choices?" for Active Ticket Flow
        |--------------------------------------------------------------------------
        */

        if (!empty($history)) {
            $lastAssistantMessage = collect($history)
                ->where('role', 'assistant')
                ->last();

            $askingForChoices = str_contains($normalized, 'choice') ||
                                str_contains($normalized, 'option') ||
                                str_contains($normalized, 'list');

            if ($lastAssistantMessage && $askingForChoices) {
                // Try to detect which field we were asking about
                if (str_contains(strtolower($lastAssistantMessage['content']), 'impact')) {
                    // You may store action_id in session or pending_ticket
                    $actionId = $pendingTicket['action_id'] ?? null;

                    if ($actionId) {
                        $action = \App\Models\Rag\RagAction::with('fields')
                            ->find($actionId);

                        $impactField = $action?->fields
                            ->firstWhere('name', 'impact');

                        if ($impactField && $impactField->dropdown_options) {
                            $options = json_decode($impactField->dropdown_options, true);

                            $message = "Here are the available impact options:\n\n";

                            foreach ($options as $index => $option) {
                                $formatted = ucwords(
                                    str_replace(
                                        ['_', '/'],
                                        [' ', ' / '],
                                        $option
                                    )
                                );

                                $message .= ($index + 1).". {$formatted}\n";
                            }

                            return response()->json([
                                'answer' => $message,
                            ]);
                        }
                    }
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Handle Field Continuation (User Answering a Question)
        |--------------------------------------------------------------------------
        */

        if (!empty($pendingTicket) && !empty($pendingTicket['current_field'])) {
            $action = \App\Models\Rag\RagAction::with('fields')
                ->find($pendingTicket['action_id']);

            if ($action) {
                $fieldName = $pendingTicket['current_field'];

                // Save user input into data
                $pendingTicket['data'][$fieldName] = $question;

                // Remove current field (we just filled it)
                unset($pendingTicket['current_field']);

                // Check for next missing required field
                foreach ($action->fields->sortBy('order') as $field) {
                    if ($field->is_required &&
                        empty($pendingTicket['data'][$field->name])) {
                        return response()->json([
                            'answer' => "Please provide the {$field->name} details.",
                            'pending_ticket' => [
                                ...$pendingTicket,
                                'current_field' => $field->name,
                            ],
                        ]);
                    }
                }

                // If no missing fields → show draft
                $message = "Here is a draft of your {$action->name} request:\n\n";

                foreach ($action->fields->sortBy('order') as $field) {
                    $value = $pendingTicket['data'][$field->name]
                        ?? $field->default_value
                        ?? '—';

                    $label = ucwords(str_replace('_', ' ', $field->name));
                    $message .= "**{$label}**: {$value}\n";
                }

                $message .= "\nReply with:\n- 'yes' to confirm\n- 'no' to cancel\n- or edit any field.";

                return response()->json([
                    'answer' => $message,
                    'pending_ticket' => $pendingTicket,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 2️⃣ Detect Intent
        |--------------------------------------------------------------------------
        */

        $intent = AiHelper::detectIntentAndExtractData($question, $history);
        $action = $intent['action'] ?? 'none';

        /*
        |--------------------------------------------------------------------------
        | 3️⃣ Ask Confirmation
        |--------------------------------------------------------------------------
        */

        if ($action === 'ask_create_ticket' && !empty($intent['selected_action_id'])) {
            $actionModel = \App\Models\Rag\RagAction::with('fields')
                ->find($intent['selected_action_id']);

            if (!$actionModel) {
                return response()->json([
                    'answer' => $intent['message'],
                ]);
            }

            // Ask first required field
            $firstRequired = $actionModel->fields
                ->where('is_required', true)
                ->sortBy('order')
                ->first();

            return response()->json([
                'answer' => "Please provide the {$firstRequired->name} details.",
                'pending_ticket' => [
                    'action_id' => $actionModel->id,
                    'endpoint' => $actionModel->endpoint,
                    'data' => [],
                    'current_field' => $firstRequired->name,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 4️⃣ Show Draft Dynamically
        |--------------------------------------------------------------------------
        */

        if (
            in_array($action, ['confirm_ticket', 'create_ticket']) &&
            !empty($intent['data']) &&
            !empty($intent['selected_action_id'])
        ) {
            $actionModel = \App\Models\Rag\RagAction::with('fields')
                ->find($intent['selected_action_id']);

            if (!$actionModel) {
                return response()->json([
                    'answer' => 'Invalid action selected.',
                ]);
            }

            $data = $intent['data'];
            $message = "Here is a draft of your {$actionModel->name} request:\n\n";

            foreach ($actionModel->fields->sortBy('order') as $field) {
                $value = $data[$field->name]
                    ?? $field->default_value
                    ?? '—';

                $label = ucwords(str_replace('_', ' ', $field->name));
                $message .= "**{$label}**: {$value}\n";
            }

            $message .= "\nReply with:\n- 'yes' to confirm\n- 'no' to cancel\n- or edit any field.";

            return response()->json([
                'answer' => $message,
                'pending_ticket' => [
                    'action_id' => $actionModel->id,
                    'endpoint' => $actionModel->endpoint,
                    'data' => $data,
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
