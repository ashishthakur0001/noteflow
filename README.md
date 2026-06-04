# NoteFlow - Online Notes Application

A full-stack notes application built with Node.js, Express, Firebase Firestore, and a vanilla HTML/CSS/JS frontend.

## Project Structure

```text
noteflow-app/
├── backend/
│   ├── config/
│   │   └── firebase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   └── tagController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── tags.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── pages/
│   └── public/
├── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js v16+
- A Firebase project with Firestore enabled
- A Firebase service account JSON key

### 1. Install dependencies

```bash
npm run setup
```

### 2. Configure Firebase

In Firebase Console:

1. Open your Firebase project.
2. Go to Project settings > Service accounts.
3. Click Generate new private key.
4. Save the downloaded file as:

```text
backend/serviceAccountKey.json
```

Then make sure `backend/.env` contains:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3. Enable Firestore

In Firebase Console:

1. Go to Build > Firestore Database.
2. Create database.
3. Start in production or test mode.
4. Choose a region and create it.

The backend uses Firebase Admin SDK, so Firestore security rules do not block your server-side requests.

### 4. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/stats` | Get note statistics |
| GET | `/api/notes/trash` | Get trashed notes |
| DELETE | `/api/notes/trash/empty` | Empty trash |
| GET | `/api/notes/:id` | Get single note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Move to trash |
| PUT | `/api/notes/:id/restore` | Restore from trash |
| DELETE | `/api/notes/:id/permanent` | Permanent delete |

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | Firebase Firestore |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS |
| Frontend | Vanilla HTML/CSS/JS |
