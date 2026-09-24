# AI Debate Arena

AI Debate Arena is a Next.js client and an Express API backed by MongoDB.

## Repository structure

```text
ai-debate-arena/
├── client/                 # Next.js application and its npm package
├── server/                 # Express API and its npm package
└── .github/workflows/ci.yml
```

The client and server are independent npm packages. Run package commands from the relevant directory; the repository root has no npm package.

## Install dependencies

```bash
cd client
npm ci
```

In a separate terminal:

```bash
cd server
npm ci
```

## Development

Start the client from `client/`:

```bash
npm run dev
```

Start the API from `server/`:

```bash
npm run dev
```

## Typecheck, tests, and builds

Run these commands from `client/`:

```bash
npm run typecheck
npm test
npm run build
```

Run these commands from `server/`:

```bash
npm run typecheck
npm test
npm run build
```

The production server is started from `server/` with `npm start`.

## Pilot deployment architecture

- **Frontend:** Next.js deployed on Vercel. Set the project root directory to `client` and `NEXT_PUBLIC_API_URL` to the Render API URL ending in `/api`.
- **Backend:** Express deployed on Render. Set the service root directory to `server`; use `npm ci && npm run build` to build and `npm start` to start. Configure `MONGODB_URI` (MongoDB Atlas), `CLIENT_URL` (Vercel origin), `JWT_SECRET`, and `GROQ_API_KEY` in Render's environment settings.
- **AI:** Use Ollama for local development and Groq for production. Configure the server's AI credentials in the deployment environment; do not commit secrets.
- **Database:** Use MongoDB Atlas for production and provide its connection string through the server deployment environment.

The GitHub Actions workflow installs, typechecks, and tests both packages on pushes and pull requests.
