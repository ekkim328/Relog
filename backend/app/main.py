from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import Base, SessionLocal, engine
from .routers import ai, auth_routes, emotion_tags, logs, relationships, stats
from .seed import seed_emotion_tags


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_emotion_tags(db)
    yield


app = FastAPI(title="Relog API", version="1.0.0", lifespan=lifespan)
app.include_router(auth_routes.router)
app.include_router(relationships.router)
app.include_router(logs.router)
app.include_router(emotion_tags.router)
app.include_router(stats.router)
app.include_router(ai.router)


@app.get("/health")
def health():
    return {"status": "ok"}
