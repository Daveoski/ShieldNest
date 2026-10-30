from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse

from app.domains.blocklist import service
from app.domains.blocklist.schemas import BlocklistResponse, CheckResponse, StatsResponse
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


@router.get("/stats", response_model=StatsResponse)
def stats(response: Response) -> StatsResponse:
    try:
        categories, total = service.stats()
    except service.UpstreamUnavailable as e:
        raise HTTPException(status_code=502, detail=str(e))
    response.headers["Cache-Control"] = CDN_CACHE_HEADER
    return StatsResponse(categories=categories, total=total)


@router.get("/check", response_model=CheckResponse, response_model_exclude_none=True)
def check(response: Response, domain: str = Query(..., min_length=3, max_length=253)) -> CheckResponse:
    try:
        result = service.check(domain)
    except service.UpstreamUnavailable as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Cache each domain's answer at the CDN so repeated or flooded lookups never reach the function
    response.headers["Cache-Control"] = CDN_CACHE_HEADER
    if result:
        category, match = result
        return CheckResponse(domain=domain, blocked=True, category=category, match=match)
    return CheckResponse(domain=domain, blocked=False)
