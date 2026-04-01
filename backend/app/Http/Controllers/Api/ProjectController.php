<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::query()
            ->latest('updated_at')
            ->get();

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): ProjectResource
    {
        $validated = $request->validated();

        if (! array_key_exists('characters', $validated)) {
            $validated['characters'] = [];
        }

        $project = Project::create($this->payload($validated));

        return new ProjectResource($project);
    }

    public function show(Project $project): ProjectResource
    {
        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($this->payload($request->validated()));

        return new ProjectResource($project->fresh());
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->noContent();
    }

    public function duplicate(Project $project): ProjectResource
    {
        $copy = DB::transaction(function () use ($project) {
            return Project::create([
                'id' => (string) Str::uuid(),
                'title' => $project->title.' (Copy)',
                'genre' => $project->genre,
                'thumbnail_url' => $project->thumbnail_url,
                'pages' => $project->pages ?? [],
                'characters' => $project->characters ?? [],
                'story_outline' => $project->story_outline,
            ]);
        });

        return new ProjectResource($copy);
    }

    private function payload(array $validated): array
    {
        $payload = [];

        if (array_key_exists('id', $validated)) {
            $payload['id'] = $validated['id'];
        }

        if (array_key_exists('title', $validated)) {
            $payload['title'] = $validated['title'];
        }

        if (array_key_exists('genre', $validated)) {
            $payload['genre'] = $validated['genre'];
        }

        if (array_key_exists('thumbnailUrl', $validated)) {
            $payload['thumbnail_url'] = $validated['thumbnailUrl'];
        }

        if (array_key_exists('pages', $validated)) {
            $payload['pages'] = $validated['pages'];
        }

        if (array_key_exists('characters', $validated)) {
            $payload['characters'] = $validated['characters'];
        }

        if (array_key_exists('storyOutline', $validated)) {
            $payload['story_outline'] = $validated['storyOutline'];
        }

        return $payload;
    }
}
