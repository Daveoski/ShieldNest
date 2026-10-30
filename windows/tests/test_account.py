import pytest

from shieldnest_windows import account


@pytest.fixture
def account_file(tmp_path, monkeypatch):
    path = tmp_path / "account.bin"
    monkeypatch.setattr(account, "ACCOUNT_FILE", path)
    return path


def test_token_is_encrypted_at_rest_and_round_trips(account_file):
    account._save({"token": "secret-token-123", "name": "Ada", "email": "ada@example.com"})
    assert b"secret-token-123" not in account_file.read_bytes()
    assert account.current_user() == account.User("Ada", "ada@example.com")


def test_no_user_when_file_missing_or_corrupt(account_file):
    assert account.current_user() is None
    account_file.write_bytes(b"not encrypted")
    assert account.current_user() is None


def test_display_code_matches_website_format():
    assert account.DeviceCode("d", "4RKUH57R", "https://x", 5).display_code == "4RKU-H57R"


def test_await_approval_polls_until_approved(account_file, monkeypatch):
    responses = iter([
        (400, {"error": "authorization_pending"}),
        (200, {"access_token": "tok"}),
        (200, {"user": {"name": "Ada", "email": "ada@example.com"}}),
    ])
    monkeypatch.setattr(account, "_request", lambda *a, **k: next(responses))
    monkeypatch.setattr(account.time, "sleep", lambda s: None)

    user = account.await_approval(account.DeviceCode("d", "ABCD1234", "https://x", 0))
    assert user.email == "ada@example.com"
    assert account.current_user() == user


def test_await_approval_reports_denial(account_file, monkeypatch):
    monkeypatch.setattr(account, "_request", lambda *a, **k: (400, {"error": "access_denied"}))
    monkeypatch.setattr(account.time, "sleep", lambda s: None)
    with pytest.raises(account.SignInError, match="denied"):
        account.await_approval(account.DeviceCode("d", "ABCD1234", "https://x", 0))
