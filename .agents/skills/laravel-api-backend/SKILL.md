---
name: laravel-api-backend
description: Laravel API backend development for creating API-only services. Use when setting up Laravel projects for REST APIs, configuring API routes and authentication, or building backend services for SPAs and mobile apps.
---

# Laravel API Backend

Build Laravel projects as API-only backend services with proper routing, authentication, and response handling.

## When to Apply

- Creating new Laravel project for API backend development
- Setting up API routes and resource controllers
- Configuring authentication for mobile apps or SPAs
- Building stateless REST APIs with Laravel

## Critical Rules

**Enable API Routes First**: Laravel doesn't include API routing by default

```shell
# WRONG - using basic Laravel installation
laravel new api-project

# RIGHT - enable API functionality
laravel new api-project
cd api-project
php artisan install:api
```

**Use API Resource Routes**: Exclude HTML-based actions (create, edit)

```php
// WRONG - full resource routes
Route::resource('posts', PostController::class);

// RIGHT - API-only routes
Route::apiResource('posts', PostController::class);
Route::apiResources([
    'posts' => PostController::class,
    'users' => UserController::class,
]);
```

## Key Patterns

### Project Setup

```shell
# Create project and enable API
laravel new my-api
cd my-api
php artisan install:api

# Generate API controllers
php artisan make:controller PostController --api
php artisan make:model Post -m
```

### API Route Structure

```php
// routes/api.php - automatically prefixed with /api
use App\Http\Controllers\PostController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::apiResource('posts', PostController::class);
});

// Public routes
Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});
```

### Resource Controllers

```php
class PostController extends Controller
{
    public function index()
    {
        return Post::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'body' => 'required',
        ]);

        return Post::create($validated);
    }

    public function show(Post $post)
    {
        return $post;
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'sometimes|max:255',
            'body' => 'sometimes',
        ]);

        $post->update($validated);
        return $post;
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return response()->noContent();
    }
}
```

### API Resources for Response Control

```php
// Generate resource
php artisan make:resource PostResource

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'published' => $this->published_at !== null,
            'created_at' => $this->created_at,
        ];
    }
}

// Use in controller
public function show(Post $post)
{
    return new PostResource($post);
}

public function index()
{
    return PostResource::collection(Post::paginate());
}
```

### Authentication Setup

```php
// User model - add HasApiTokens trait
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}

// Protect routes
Route::middleware('auth:sanctum')->group(function () {
    // Protected API routes
});
```

## Common Mistakes

- **Missing API installation**: Routes return 404 without `php artisan install:api`
- **Using wrong route methods**: `Route::resource()` includes HTML routes; use `Route::apiResource()`
- **Direct model returns**: Use API Resources for consistent response formatting
- **Validation errors**: API requests return JSON error responses, not redirects