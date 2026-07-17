"""Server-side Gemini API client. The API key lives only here, read from
the environment -- it is never sent to or stored in the browser."""
import json
import os
import requests
from requests import exceptions as requests_exceptions

GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_URL_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

# Primary key first, then an optional backup. If the primary key's free-tier
# quota is exhausted (429) or blocked (403), we retry the same request with
# the next key instead of failing outright. GEMINI_API_KEY_BACKUP is optional
# -- if it's not set, this just behaves like a single-key client as before.
API_KEYS = [
    key
    for key in (os.environ.get("GEMINI_API_KEY"), os.environ.get("GEMINI_API_KEY_BACKUP"))
    if key
]


class GeminiError(Exception):
    pass


def _call_with_key(api_key: str, prompt: str) -> requests.Response:
    url = GEMINI_URL_TEMPLATE.format(model=GEMINI_MODEL)
    return requests.post(
        url,
        params={"key": api_key},
        json={
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                # Deterministic-as-possible: temperature 0 removes the main
                # deliberate source of run-to-run variance in extracted
                # skills. (Full byte-for-byte reproducibility would still
                # need server-side response caching, since even temp-0
                # inference isn't a hard guarantee -- not doing that for now.)
                "temperature": 0,
            },
        },
        timeout=120,
    )


def call_gemini_json(prompt: str) -> dict:
    if not API_KEYS:
        raise GeminiError(
            "GEMINI_API_KEY is not set on the server. Add it to your .env file."
        )

    last_error: GeminiError | None = None

    for api_key in API_KEYS:
        try:
            response = _call_with_key(api_key, prompt)
        except requests_exceptions.Timeout as exc:
            last_error = GeminiError(f"Gemini request timed out: {exc}")
            continue
        except requests_exceptions.RequestException as exc:
            last_error = GeminiError(f"Gemini request failed: {exc}")
            continue

        # Quota exhausted (429) or key blocked/forbidden (403) -- try the
        # next key, if there is one, instead of failing the whole request.
        if response.status_code in (429, 403):
            last_error = GeminiError(response.text)
            continue

        if response.status_code == 400:
            # Bad request is about the prompt/payload, not the key --
            # retrying with a different key won't help, so fail fast.
            raise GeminiError(response.text)

        if not response.ok:
            last_error = GeminiError(
                f"Gemini API error ({response.status_code}): {response.text}"
            )
            continue

        # Success -- parse and return.
        try:
            data = response.json()
        except ValueError as exc:
            raise GeminiError(f"Gemini returned invalid JSON: {exc}") from exc

        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError):
            raise GeminiError(
                "Gemini returned no content. The response may have been "
                "blocked by safety filters."
            )

        if not isinstance(text, str):
            raise GeminiError("Gemini returned a non-text content payload.")

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            cleaned = text.replace("```json", "").replace("```", "").strip()
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError as exc:
                raise GeminiError(f"Gemini returned invalid JSON: {exc}") from exc

    # Every key failed (or every key was rate-limited/forbidden).
    raise last_error or GeminiError("All Gemini API keys failed.")
