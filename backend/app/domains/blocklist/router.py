from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse

from app.domains.blocklist import service
from app.domains.blocklist.schemas import BlocklistResponse, CheckResponse
from app.domains.blocklist.sources import Category

router = APIRouter(tags=["blocklist"])

CDN_CACHE_HEADER = (
    f"public, s-maxage={service.CACHE_TTL_SECONDS}, stale-while-revalidate=86400"
)


@router.get(
    "/blocklist",
    response_model=BlocklistResponse,
    responses={200: {"content": {"text/plain": {}}}},
)
def blocklist(
    response: Response,
    category: Category = Category.all,
    format: str = Query("json", pattern="^(json|txt)$"),
):
    try:
        domains = sorted(service.load(category))
    except service.UpstreamUnavailable as e:
        raise HTTPException(status_code=502, detail=str(e))

    if format == "txt":
        return PlainTextResponse("\n".join(domains), headers={"Cache-Control": CDN_CACHE_HEADER})
    response.headers["Cache-Control"] = CDN_CACHE_HEADER
    return BlocklistResponse(category=category.value, count=len(domains), domains=domains)


@router.get("/check", response_model=CheckResponse, response_model_exclude_none=True)
def check(domain: str = Query(..., min_length=3, max_length=253)) -> CheckResponse:
    try:
        result = service.check(domain)
    except service.UpstreamUnavailable as e:
        raise HTTPException(status_code=502, detail=str(e))

    if result:
        category, match = result
        return CheckResponse(domain=domain, blocked=True, category=category, match=match)
    return CheckResponse(domain=domain, blocked=False)
