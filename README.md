# ShieldNest

The ShieldNest website and blocklist API.

- **Website:** Next.js 16, TypeScript, Tailwind v4, daisyUI 5 and shadcn/ui (`src/`)
- **API:** Python FastAPI (`api/index.py`), served at `/api/py/*`
- **Live:** https://shieldnest-delta.vercel.app

## Run locally

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt uvicorn pytest

# terminal 1: website on http://localhost:3000
npm run dev

# terminal 2: Python API on http://localhost:8000
.\.venv\Scripts\activate
npm run api
```

In dev, Next.js forwards `/api/py/*` requests to the Python server on port 8000.

## API

| Endpoint | Description |
|---|---|
| `GET /api/py/health` | Health check |
| `GET /api/py/blocklist?category=ads\|malware\|phishing\|all&format=json\|txt` | Merged domain blocklist for the apps |
| `GET /api/py/check?domain=example.com` | Whether a domain, or a parent domain, is on a blocklist |
| `GET /api/py/docs` | Interactive API docs |

Lists are pulled from [StevenBlack/hosts](https://github.com/StevenBlack/hosts) for ads and trackers, and from [malware-filter](https://gitlab.com/malware-filter) for URLhaus malware and phishing domains. Each server instance caches them for 6 hours, and Vercel's CDN caches responses too.

## Tests

```powershell
.\.venv\Scripts\python -m pytest tests
```

## Deploy

```powershell
npx vercel deploy --prod
```
