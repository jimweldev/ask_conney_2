<?php

namespace App\Http\Controllers\Rag;

use App\Helpers\DynamicLogger;
use App\Helpers\QueryHelper;
use App\Http\Controllers\Controller;
use App\Models\Rag\RagAction;
use App\Models\Rag\RagActionField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RagActionController extends Controller {
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
            $query = RagAction::with('fields');
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
        $record = RagAction::where('id', $id)->first();

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
            DB::beginTransaction();

            // Create the main rag action
            $ragAction = RagAction::create([
                'name' => $request->name,
                'description' => $request->description,
                'endpoint' => $request->endpoint,
                'notes' => $request->notes,
            ]);

            // Create the associated fields
            if ($request->has('fields') && is_array($request->fields)) {
                foreach ($request->fields as $fieldData) {
                    // Prepare dropdown options if exists
                    if (isset($fieldData['dropdown_options']) && is_array($fieldData['dropdown_options'])) {
                        $fieldData['dropdown_options'] = json_encode($fieldData['dropdown_options']);
                    }

                    // Create the field
                    RagActionField::create([
                        'rag_action_id' => $ragAction->id,
                        'order' => $fieldData['order'] ?? 0,
                        'name' => $fieldData['name'],
                        'type' => $fieldData['type'],
                        'default_value' => $fieldData['default_value'] ?? null,
                        'dropdown_options' => $fieldData['dropdown_options'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                    ]);
                }
            }

            DB::commit();

            // Load the fields relationship for the response
            $ragAction->load('fields');

            return response()->json($ragAction, 201);
        } catch (\Exception $e) {
            DB::rollBack();

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
            $record = RagAction::find($id);

            if (!$record) {
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            $record->update($request->all());

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
            $record = RagAction::find($id);

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
}
