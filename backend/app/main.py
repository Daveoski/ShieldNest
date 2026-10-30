"""ShieldNest API entrypoint.

Vercel detects the `app` instance here; locally run from the backend folder with:
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI

from app.core.config import API_PREFIX
from app.domains.blocklist.router import router as blocklist_router
from app.domains.health.router import router as health_router

app = FastAPI(
    title="ShieldNest API",
    docs_url=f"{API_PREFIX}/docs",
    openapi_url=f"{API_PREFIX}/openapi.json",
)

app.include_router(health_router, prefix=API_PREFIX)
app.include_router(blocklist_router, prefix=API_PREFIX)
