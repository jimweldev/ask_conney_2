<?php

namespace App\Models\Ticketing;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model {
    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];
}
