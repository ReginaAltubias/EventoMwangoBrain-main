<?php

namespace App\Http\Controllers\Api;

use App\Models\BrainUser;
use App\Models\User;

// Alias BrainUser model to target the single `users` table
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class BrainUser extends Authenticatable
{
    use HasFactory;

    protected $table = 'users';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'role',
        'initials',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
