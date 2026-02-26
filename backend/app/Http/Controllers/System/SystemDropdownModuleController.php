<?php

namespace App\Http\Controllers\System;

use App\Helpers\QueryHelper;
use App\Http\Controllers\Controller;
use App\Models\System\SystemDropdownModule;
use Illuminate\Http\Request;

class SystemDropdownModuleController extends Controller {
    /**
     * Display a paginated list of records with optional filtering and search.
     */
    public function index(Request $request) {
        $queryParams = $request->all();

        try {
            $query = SystemDropdownModule::with('system_dropdown_module_types:system_dropdown_module_id,label');
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
        $record = SystemDropdownModule::where('id', $id)->first();

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
            $request->validate([
                'label' => 'required|string',
                'system_dropdown_module_types' => 'array',
            ]);

            $module = SystemDropdownModule::create([
                'label' => $request->label,
            ]);

            // Sync module types
            if ($request->has('system_dropdown_module_types')) {
                $types = collect($request->system_dropdown_module_types)->map(function ($type) {
                    return ['label' => $type];
                });

                $module->system_dropdown_module_types()->createMany($types);
            }

            return response()->json($module->load('system_dropdown_module_types'), 201);
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
            $record = SystemDropdownModule::with('system_dropdown_module_types')->find($id);

            if (!$record) {
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            // Update module main data
            $record->update([
                'label' => $request->label,
            ]);

            // Sync module types
            if ($request->has('system_dropdown_module_types')) {
                $newTypes = $request->system_dropdown_module_types;

                // Delete types not in request
                $record->system_dropdown_module_types()
                    ->whereNotIn('label', $newTypes)
                    ->delete();

                // Get existing labels
                $existingTypes = $record->system_dropdown_module_types()->pluck('label')->toArray();

                // Insert new ones
                $toInsert = array_diff($newTypes, $existingTypes);

                foreach ($toInsert as $type) {
                    $record->system_dropdown_module_types()->create([
                        'label' => $type,
                    ]);
                }
            }

            return response()->json($record->load('system_dropdown_module_types'), 200);
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
            $record = SystemDropdownModule::find($id);

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
