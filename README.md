# Nobel To Manga Maker

This repository is now organized into separate frontend and backend applications.

## Project Structure

- `frontend/` - Next.js app (UI/editor)
- `backend/` - Laravel API backend

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` by default.

## Run Backend

```bash
cd backend
composer install
php artisan serve
```

Backend runs on `http://127.0.0.1:8000` by default.

## Notes

- Frontend-specific config files (Next.js, TypeScript, PostCSS, ESLint) are inside `frontend/`.
- Root-level `.gitignore` now supports nested app folders.
- Data management is handled by Laravel API endpoints in `backend/` (no Supabase dependency).
- Set `NEXT_PUBLIC_LARAVEL_API_URL` in `frontend/.env.local` if your backend URL differs from `http://127.0.0.1:8000/api`.
