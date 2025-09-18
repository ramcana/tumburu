
import asyncio
import logging
from typing import Any, Dict, Optional, Callable, AsyncGenerator
import httpx

logger = logging.getLogger(__name__)

class StableAudioAPIError(Exception):
    pass

class RateLimitError(StableAudioAPIError):
    pass

class StableAudioClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.stableaudio.com/v1",
        max_retries: int = 5,
        backoff_factor: float = 0.5,
        timeout: float = 30.0,
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)

    async def _request(
        self,
        method: str,
        endpoint: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        files: Optional[Any] = None,
        stream: bool = False,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Any:
        url = f"{self.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        attempt = 0
        while attempt <= self.max_retries:
            try:
                logger.info(f"StableAudio API {method} {url}")
                response = await self._client.request(
                    method,
                    url,
                    params=params,
                    data=data,
                    json=json,
                    files=files,
                    headers=headers,
                    follow_redirects=True,
                    stream=stream,
                )
                logger.info(f"StableAudio API response: {response.status_code}")
                if response.status_code == 429:
                    logger.warning("StableAudio API rate limited. Retrying...")
                    raise RateLimitError("Rate limit exceeded")
                if response.is_error:
                    logger.error(f"StableAudio API error: {response.text}")
                    raise StableAudioAPIError(response.text)
                if stream:
                    return self._stream_response(response, progress_callback)
                return response.json()
            except (httpx.RequestError, RateLimitError) as e:
                attempt += 1
                if attempt > self.max_retries:
                    logger.error(f"StableAudio API request failed after {attempt} attempts: {e}")
                    raise
                sleep_time = self.backoff_factor * (2 ** (attempt - 1))
                logger.info(f"Retrying in {sleep_time:.2f}s...")
                await asyncio.sleep(sleep_time)

    async def _stream_response(self, response: httpx.Response, progress_callback: Optional[Callable[[int, int], None]] = None) -> AsyncGenerator[bytes, None]:
        total = int(response.headers.get("content-length", 0))
        downloaded = 0
        async for chunk in response.aiter_bytes():
            downloaded += len(chunk)
            if progress_callback:
                progress_callback(downloaded, total)
            yield chunk

    async def generate_audio(self, payload: Dict[str, Any], progress_callback: Optional[Callable[[int, int], None]] = None) -> str:
        # 1. Submit generation request
        result = await self._request("POST", "/generate", json=payload)
        job_id = result["id"]
        return job_id

    async def poll_status(self, job_id: str) -> Dict[str, Any]:
        # 2. Poll for completion
        while True:
            status = await self._request("GET", f"/generate/{job_id}")
            if status["status"] in ("completed", "failed"):
                return status
            await asyncio.sleep(2)

    async def download_audio(self, url: str, dest_path: str, progress_callback: Optional[Callable[[int, int], None]] = None) -> None:
        # 3. Download audio file with streaming
        async with self._client.stream("GET", url, follow_redirects=True) as response:
            if response.status_code != 200:
                logger.error(f"Failed to download audio: {response.status_code}")
                raise StableAudioAPIError(f"Failed to download audio: {response.status_code}")
            total = int(response.headers.get("content-length", 0))
            downloaded = 0
            with open(dest_path, "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)
                    downloaded += len(chunk)
                    if progress_callback:
                        progress_callback(downloaded, total)
        logger.info(f"Audio downloaded to {dest_path}")

    async def close(self):
        await self._client.aclose()
