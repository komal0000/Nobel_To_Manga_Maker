<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['required', 'string', 'max:64'],
            'title' => ['required', 'string', 'max:255'],
            'genre' => ['required', 'string', 'max:50'],
            'thumbnailUrl' => ['nullable', 'string', 'max:2048'],
            'pages' => ['required', 'array'],
            'characters' => ['sometimes', 'array'],
            'storyOutline' => ['nullable', 'array'],
            'createdAt' => ['nullable', 'date'],
            'updatedAt' => ['nullable', 'date'],
        ];
    }
}
