# Curated

A full-stack social media application built with:

- React + Vite
- Tailwind CSS
- React Router
- Node.js + Express
- MongoDB + Mongoose
- JWT access + refresh tokens
- Multer image uploads

## Project structure

```text
.
├── client
│   ├── src
│   └── package.json
├── server
│   ├── src
│   └── package.json
├── .env.example
└── package.json
```

## Features

- Register and login with hashed passwords
- Access + refresh token flow
- Axios auth interceptor with automatic token refresh
- Protected client routes
- Feed endpoint for followed users and your own posts
- Explore grid backed by MongoDB data
- Profile pages with follow and unfollow
- Create post modal with image upload
- Post detail view with live comments
- Local saved-post toggle in the client UI
- Responsive dark Curated-style layout

## Environment setup

Copy the root env template and update the values:

```bash
cp .env.example .env
```

Required root variables:

```env
MONGO_URI=mongodb://127.0.0.1:27017/curated
JWT_SECRET=replace-with-a-strong-secret
JWT_REFRESH_SECRET=replace-with-a-second-strong-secret
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

Optional client-side override:

```bash
cp client/.env.example client/.env
```

## Install

Run this from the repo root:

```bash
npm install
```

The root workspace installs the client, server, and `concurrently`.

## Development

Start both apps together:

```bash
npm run dev
```

This runs:

- Vite client on `http://localhost:5173`
- Express server on `http://localhost:5000`

Uploads are stored locally in `server/uploads`.

## Production flow

Build the client:

```bash
npm run build
```

Start the server:

```bash
npm start
```

If `client/dist` exists, the Express app will serve the built frontend.

## API overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Posts

- `GET /api/posts/feed`
- `GET /api/posts/explore`
- `GET /api/posts/:id`
- `POST /api/posts`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comments`

### Users

- `GET /api/users/:username`
- `POST /api/users/:id/follow`

## Notes

- The feed shows your own posts plus posts from accounts you follow.
- Saved posts are intentionally local-only in the client, as requested.
- The server uses Multer disk storage to keep the upload pipeline simple and production-friendly for local deployments.
