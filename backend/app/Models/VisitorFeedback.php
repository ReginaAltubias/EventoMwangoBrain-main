<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitorFeedback extends Model
{
    use HasFactory;

    protected $table = 'visitor_feedbacks';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'contact_id',
        'overall',
        'team',
        'presentation',
        'relevance',
        'highlights',
        'wants_solution',
        'wants_contact',
        'comment',
    ];

    protected $casts = [
        'overall' => 'integer',
        'team' => 'integer',
        'presentation' => 'integer',
        'relevance' => 'integer',
        'highlights' => 'array',
        'wants_contact' => 'boolean',
    ];

    protected $appends = [
        'contactId',
        'wantsSolution',
        'wantsContact',
    ];

    public function getContactIdAttribute(): ?string
    {
        return $this->attributes['contact_id'] ?? null;
    }

    public function getWantsSolutionAttribute(): ?string
    {
        return $this->attributes['wants_solution'] ?? null;
    }

    public function getWantsContactAttribute(): bool
    {
        return (bool)($this->attributes['wants_contact'] ?? false);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }
}
