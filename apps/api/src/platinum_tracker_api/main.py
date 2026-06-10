from fastapi import FastAPI

app = FastAPI(
    title="Platinum Tracker API",
    version="0.1.0",
)


@app.get("/api/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
