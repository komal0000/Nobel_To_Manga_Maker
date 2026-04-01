<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::apiResource('projects', ProjectController::class);
Route::post('projects/{project}/duplicate', [ProjectController::class, 'duplicate']);
