# CampusConnect: College Engagement App

A full-stack web app where students share **interview experiences** and **technical blogs**, with hashtag search, filters, upvotes and comments.

**Stack:** HTML, CSS, Bootstrap 5, Node.js, Express, EJS, MongoDB (Mongoose)

## Features

- Server-side rendered pages with EJS partials; responsive Bootstrap UI
- RESTful post management: create, read, update, delete (`GET/POST /posts`, `GET/PUT/DELETE /posts/:id`)
- Signup / login with bcrypt-hashed passwords and MongoDB-backed sessions
- Authorization: only the author can edit or delete a post; comment authors (or the post author) can delete comments
- **Hashtag search:** `#tags` in the body and the tags field are normalised and stored in an indexed array; `/posts?tag=dsa`, or type `#dsa` in the search box
- Full-text search (weighted MongoDB text index on title, company, role, body)
- Filters (type, company, difficulty), sort by newest or most upvoted, pagination
- Structured interview fields: company, role, rounds, difficulty, outcome
- Markdown posts, sanitised with `sanitize-html`
- Upvotes (toggle) and comments
- Read-only JSON API: `GET /api/posts`, `GET /api/posts/:id`, `GET /api/tags`
- Security basics: helmet + CSP, CSRF tokens, express-validator, rate limiting on auth and API, session fixation protection, HttpOnly/SameSite cookies

## Run locally

1. Install Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).
2. Install and configure:
   ```bash
   npm install
   cp .env.example .env     # set MONGODB_URI and SESSION_SECRET
   ```
3. (Optional) add demo data: `npm run seed` (login `demo@campus.test` / `demo12345`)
4. Start: `npm run dev` and open http://localhost:3000

## Project structure

```
app.js            Express app (middleware, helpers, routes, error handling)
server.js         DB connection + server start
models/           User, Post (indexes defined here)
routes/           auth, posts (HTML), api (JSON)
middleware/       auth (login/ownership), csrf, flash
utils/            hashtag parsing, search/filter/pagination query builder
views/            EJS templates + partials
public/           CSS and client JS
scripts/seed.js   demo data
```

## Deploy (Render + MongoDB Atlas)

1. Create a free Atlas cluster, add a database user, allow network access (0.0.0.0/0 for a student project), and copy the connection string.
2. Push this folder to GitHub.
3. On Render: New → Web Service → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `NODE_ENV=production`, `MONGODB_URI=<atlas string>`, `SESSION_SECRET=<long random string>`
4. Put the live URL on your resume.

## Resume bullets (adjust to what you actually shipped)

**College Engagement App** | HTML, CSS, Bootstrap, Node.js, Express, EJS, MongoDB
- Built a responsive full-stack web app where students share interview experiences and technical blogs, with session-based authentication and author-only edit/delete.
- Implemented server-rendered EJS pages and RESTful Express routes for post CRUD, upvotes and comments, with input validation, CSRF protection and rate limiting.
- Designed MongoDB schemas with indexed hashtag arrays and a weighted text index to power hashtag search, filtering by company/difficulty and paginated results.
- Deployed on Render with MongoDB Atlas.
