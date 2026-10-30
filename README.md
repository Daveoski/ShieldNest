# ShieldNest

Blocks ads, trackers, malware and phishing sites on your phone and PC.

```
project1/
├── frontend/   Next.js website: landing and download pages
├── backend/    Python FastAPI blocklist API
├── android/    Kotlin Android app (DNS-filtering local VPN)
├── windows/    Python Windows app (local DNS filter + tkinter window)
└── scripts/    publish-downloads.ps1: copies app builds into the website
```

| Part | Stack | Live |
|---|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind v4, daisyUI 5, shadcn/ui | https://shieldnest-delta.vercel.app |
| Backend | Python, FastAPI | https://shieldnest-api.vercel.app/api/py/docs |
| Android | Kotlin, Jetpack Compose | [ShieldNest-0.1.0.apk](https://shieldnest-delta.vercel.app/downloads/ShieldNest-0.1.0.apk) |
| Windows | Python, tkinter, PyInstaller | [ShieldNest-0.1.0-windows.exe](https://shieldnest-delta.vercel.app/downloads/ShieldNest-0.1.0-windows.exe) |

The website forwards `/api/py/*` to the backend, so the Android app only needs the website URL.

## Backend layout

```
backend/
├── app/
│   ├── main.py                 FastAPI app; mounts each domain's router
│   ├── core/config.py          App-wide settings (API prefix, user agent)
│   └── domains/
│       ├── health/router.py
│       └── blocklist/
│           ├── router.py       HTTP endpoints
│           ├── service.py      Download + 6-hour cache of upstream lists
│           ├── parsing.py      Hosts-file parsing and domain matching
│           ├── schemas.py      Response models
│           └── sources.py      Upstream list URLs and categories
├── tests/
├── requirements.txt            Production dependencies (used by Vercel)
└── requirements-dev.txt        Adds pytest, httpx2 and uvicorn
```

To add a new feature area, create `app/domains/<name>/` with its own `router.py` and include the router in `app/main.py`.

## Run locally

**Backend** (http://localhost:8000):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements-dev.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (http://localhost:3000), in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

In dev, the website forwards `/api/py/*` to the local backend. Set `SHIELDNEST_API_URL` to use a different backend.

**Android:**

```powershell
cd android
.\gradlew.bat testDebugUnitTest assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. `assembleRelease` builds the signed download version using `android/keystore.properties` and `android/keystore/`. Neither is in git. **Back them up:** losing the key means future updates can't install over the current app.

**Windows:**

```powershell
cd windows
.\build.ps1          # runs tests, then builds dist\ShieldNest.exe
```

The app points Windows DNS at a filter on `127.0.0.1:53` and saves your original settings to `%LOCALAPPDATA%\ShieldNest\dns-backup.json`. They are restored when you turn protection off, close the app, or launch it again after a crash. It needs administrator rights.

## Publishing app downloads

```powershell
cd android; .\gradlew.bat assembleRelease; cd ..
.\windows\build.ps1
.\scripts\publish-downloads.ps1      # copies builds to frontend/public/downloads (git-ignored)
cd frontend; npx vercel deploy --prod
```

When you release a new version, update `APP_VERSION` and the file sizes in `frontend/src/lib/platforms.ts`, and the version in `scripts/publish-downloads.ps1`.

## API

| Endpoint | Description |
|---|---|
| `GET /api/py/health` | Health check |
| `GET /api/py/blocklist?category=ads\|malware\|phishing\|all&format=json\|txt` | Merged domain blocklist for the apps |
| `GET /api/py/check?domain=example.com` | Whether a domain, or a parent domain, is on a blocklist |
| `GET /api/py/docs` | Interactive API docs |

Lists come from [StevenBlack/hosts](https://github.com/StevenBlack/hosts) for ads and trackers, and from [malware-filter](https://gitlab.com/malware-filter) for URLhaus malware and phishing domains.

## Tests

```powershell
cd backend;  .\.venv\Scripts\python -m pytest
cd android;  .\gradlew.bat testDebugUnitTest
cd windows;  .\.venv\Scripts\python -m pytest
```

## Deploy

Each folder is its own Vercel project:

```powershell
cd backend;  npx vercel deploy --prod   # shieldnest-api
cd frontend; npx vercel deploy --prod   # shieldnest
```
