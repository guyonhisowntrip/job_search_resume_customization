from threading import Lock

_portfolio_lock = Lock()
_portfolios_by_username: dict[str, dict] = {}


def deploy_portfolio(username: str, template: str, resume_json: dict) -> dict:
    normalized_username = username.lower()
    record = {
        "username": normalized_username,
        "template": template,
        "resume_json": resume_json,
        "is_public": True,
    }

    with _portfolio_lock:
        _portfolios_by_username[normalized_username] = record

    return record


def get_portfolio(username: str) -> dict | None:
    normalized_username = username.lower()
    with _portfolio_lock:
        portfolio = _portfolios_by_username.get(normalized_username)
        if not portfolio or not portfolio.get("is_public"):
            return None
        return portfolio
