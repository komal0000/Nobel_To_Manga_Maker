'use client';

import { Project } from './types';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api';

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_LARAVEL_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

type ProjectCollectionResponse = {
  data: Project[];
};

type ProjectResponse = {
  data: Project;
};

export async function fetchProjects(): Promise<Project[]> {
  const response = await request<ProjectCollectionResponse>('/projects');
  return response.data;
}

export async function fetchProject(id: string): Promise<Project> {
  const response = await request<ProjectResponse>(`/projects/${id}`);
  return response.data;
}

export async function createProjectRemote(project: Project): Promise<Project> {
  const response = await request<ProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });

  return response.data;
}

export async function updateProjectRemote(project: Project): Promise<Project> {
  const response = await request<ProjectResponse>(`/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });

  return response.data;
}

export async function deleteProjectRemote(id: string): Promise<void> {
  await request<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function duplicateProjectRemote(id: string): Promise<Project> {
  const response = await request<ProjectResponse>(`/projects/${id}/duplicate`, {
    method: 'POST',
  });

  return response.data;
}
