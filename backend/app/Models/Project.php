<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'genre',
        'thumbnail_url',
        'pages',
        'characters',
        'story_outline',
    ];

    protected function casts(): array
    {
        return [
            'pages' => 'array',
            'characters' => 'array',
            'story_outline' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project): void {
            if (! $project->getKey()) {
                $project->{$project->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
