<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalEvaluation extends Model
{
    use HasFactory;

    protected $table = 'internal_evaluations';

    protected $fillable = [
        'scores',
        'went_well',
        'difficulties',
        'top_solutions',
        'main_needs',
        'improvements',
        'saved_at',
    ];

    protected $casts = [
        'scores' => 'array',
        'top_solutions' => 'array',
        'saved_at' => 'datetime',
    ];
}
