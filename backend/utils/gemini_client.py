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


class GeminiError(Exception):
    pass


def call_gemini_json(prompt: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiError(
            "GEMINI_API_KEY is not set on the server. Add it to your .env file."
        )

    url = GEMINI_URL_TEMPLATE.format(model=GEMINI_MODEL)

    try:
        response = requests.post(
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
    except requests_exceptions.Timeout as exc:
        raise GeminiError(f"Gemini request timed out: {exc}") from exc
    except requests_exceptions.RequestException as exc:
        raise GeminiError(f"Gemini request failed: {exc}") from exc

    if response.status_code == 429:
        raise GeminiError(response.text)
    if response.status_code in (400, 403):
        raise GeminiError(response.text)
    if not response.ok:
        raise GeminiError(f"Gemini API error ({response.status_code}): {response.text}")

    try:
        data = response.json()
    except ValueError as exc:
        raise GeminiError(f"Gemini returned invalid JSON: {exc}") from exc

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise GeminiError(
            "Gemini returned no content. The response may have been blocked "
            "by safety filters."
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