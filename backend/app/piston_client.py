import httpx
import asyncio

async def execute_code(language: str, source: str, stdin: str = "") -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://emkc.org/api/v2/piston/execute",
                json={
                    "language": language,
                    "version": "*",
                    "files": [{"content": source}],
                    "stdin": stdin
                },
                timeout=10.0
            )
            response.raise_for_status()
            result = response.json()
            return {
                "output": result.get("run", {}).get("stdout", ""),
                "error": result.get("run", {}).get("stderr", "")
            }
        except httpx.HTTPError as e:
            return {"error": f"Execution failed: {str(e)}"}