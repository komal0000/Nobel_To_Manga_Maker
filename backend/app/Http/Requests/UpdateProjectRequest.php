<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'genre' => ['sometimes', 'required', 'string', 'max:50'],
            'thumbnailUrl' => ['nullable', 'string', 'max:2048'],
            'pages' => ['sometimes', 'required', 'array'],
            'characters' => ['sometimes', 'required', 'array'],
            'storyOutline' => ['nullable', 'array'],
            'createdAt' => ['nullable', 'date'],
            'updatedAt' => ['nullable', 'date'],
        ];
    }
}
