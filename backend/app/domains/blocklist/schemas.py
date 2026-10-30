from pydantic import BaseModel


class BlocklistResponse(BaseModel):
    category: str
    count: int
    domains: list[str]


class CheckResponse(BaseModel):
    domain: str
    blocked: bool
    category: str | None = None
    match: str | None = None
