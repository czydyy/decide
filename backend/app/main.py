"""
六爻决策助手 — FastAPI Backend Application.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import qigua, interpret, hexagram, history, auth, conversation


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Initialize knowledge base (non-blocking, may fail gracefully)
    try:
        from app.services.knowledge_base import get_knowledge_base
        get_knowledge_base()
    except Exception:
        pass
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="六爻决策助手",
    description="基于中国传统六爻技术的AI决策助手，支持铜钱摇卦、数字起卦、时间起卦等多种方式。",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(qigua.router)
app.include_router(interpret.router)
app.include_router(hexagram.router)
app.include_router(history.router)
app.include_router(auth.router)
app.include_router(conversation.router)


@app.get("/")
async def root():
    return {"message": "六爻决策助手 API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
