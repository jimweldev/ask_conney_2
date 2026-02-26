<?php

namespace App\Http\Controllers\Rbac;

use App\Helpers\QueryHelper;
use App\Http\Controllers\Controller;
use App\Models\Rbac\RbacRole;
use App\Models\Rbac\RbacRolePermission;
use Illuminate\Http\Request;

class RbacRoleController extends Controller {
    /**
     * Display a listing of the records.
     */
    public function index(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        // Get all query parameters
        $queryParams = $request->all();

        try {
            // Initialize the query builder
            $query = RbacRole::query();

            $query = RbacRole::with(['rbac_role_permissions' => function ($query) {
                $query->select('id', 'rbac_role_id', 'rbac_permission_id')
                    ->with(['rbac_permission' => function ($query) {
                        $query->select('id', 'label');
                    }]);
            }]);

            // Apply query filters
            $type = 'paginate';
            QueryHelper::apply($query, $queryParams, $type);

            // Search
            if ($request->has('search')) {
                $search = $request->input('search');
                // Apply search conditions to the query
                $query->where(function ($query) use ($search) {
                    $query->where('label', 'LIKE', '%'.$search.'%')
                        ->orWhere('value', 'LIKE', '%'.$search.'%');
                });
            }

            // Get the total count of records matching the query
            $total = $query->count();

            // Retrieve pagination parameters from the request
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            // Apply limit and offset to the query
            QueryHelper::applyLimitAndOffset($query, $limit, $page);

            // Execute the query and get the records
            $records = $query->get();

            // Return the records and pagination info
            return response()->json([
                'records' => $records,
                'meta' => [
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified record.
     */
    public function show(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        // Find the record by ID
        $record = RbacRole::where('id', $id);

        $record->with(['rbac_role_permissions' => function ($query) {
            $query->select('id', 'rbac_role_id', 'rbac_permission_id')
                ->with(['rbac_permission' => function ($query) {
                    $query->select('id', 'label');
                }]);
        },
        ]);

        $record = $record->first();

        if (!$record) {
            // Return a 404 response if the record is not found
            return response()->json([
                'message' => 'Record not found.',
            ], 404);
        }

        // Return the record
        return response()->json($record, 200);
    }

    /**
     * Store a newly created record in storage.
     */
    public function store(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            // Check if record already exists
            $recordExists = RbacRole::where('value', $request->input('value'))->exists();

            if ($recordExists) {
                // Return a 400 response if the record already exists
                return response()->json([
                    'message' => 'Record already exists.',
                ], 400);
            }

            // Create a new record
            $record = RbacRole::create($request->all());

            // Sync permissions
            $record->rbac_permissions()->sync($request->input('permission_ids'));

            // Return the created record
            return response()->json($record, 201);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update the specified record in storage.
     */
    public function update(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            // Find the record by ID
            $record = RbacRole::find($id);

            if (!$record) {
                // Return a 404 response if the record is not found
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            // Update role fields
            $record->update($request->all());

            // Sync permissions (use `rbac_permissions` instead of `rbac_role_permissions`)
            if ($request->has('permission_ids')) {
                $record->rbac_permissions()->sync($request->input('permission_ids'));
            }

            // Return the updated role
            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $record->load('rbac_permissions'),
            ]);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified record from storage.
     */
    public function destroy(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            // Find the record by ID
            $record = RbacRole::find($id);

            if (!$record) {
                // Return a 404 response if the record is not found
                return response()->json([
                    'message' => 'Record not found.',
                ], 404);
            }

            // Delete the record
            $record->delete();

            // Return the deleted record
            return response()->json($record, 200);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get a specific permission for a role.
     */
    public function getPermission($id, $permissionId) {
        // Find the role permission by role ID and permission ID
        $record = RbacRolePermission::where('rbac_role_id', $id)
            ->with(['rbac_permission' => function ($query) {
                $query->select('id', 'label');
            }])
            ->where('rbac_permission_id', $permissionId)
            ->first();

        if (!$record) {
            // Return a 404 response if the record is not found
            return response()->json([
                'message' => 'Record not found.',
            ], 404);
        }

        // Return the record
        return response()->json($record, 200);
    }

    /**
     * Add a permission to a role.
     */
    public function addPermission(Request $request, $id) {
        try {
            // Check if the record already exists
            $recordExists = RbacRolePermission::where('rbac_role_id', $id)
                ->where('rbac_permission_id', $request->input('rbac_permission_id'))
                ->exists();

            if ($recordExists) {
                // Return a 400 response if the record already exists
                return response()->json([
                    'message' => 'Record already exists.',
                ], 400);
            }

            // Create a new record
            $record = RbacRolePermission::create([
                'rbac_role_id' => $id,
                'rbac_permission_id' => $request->input('rbac_permission_id'),
            ]);

            // Return the created record
            return response()->json($record, 200);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove a permission from a role.
     */
    public function removePermission($id, $permissionId) {
        try {
            // Find the role permission by role ID and permission ID
            $record = RbacRolePermission::where('rbac_role_id', $id)
                ->where('rbac_permission_id', $permissionId)
                ->first();

            if (!$record) {
                // Return a 404 response if the role permission is not found
                return response()->json([
                    'message' => 'Role Permission not found.',
                ], 404);
            }

            // Delete the role permission
            $record->delete();

            // Return the deleted role permission
            return response()->json($record, 200);
        } catch (\Exception $e) {
            // Handle exceptions and return an error response
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
