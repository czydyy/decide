import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class DivinationRecord(Base):
    __tablename__ = "divinations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    question: Mapped[str | None] = mapped_column(String(512), nullable=True)
    method: Mapped[str] = mapped_column(String(16), nullable=False)
    method_params: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    ben_gua_id: Mapped[int] = mapped_column(Integer, ForeignKey("hexagrams.id"), nullable=False)
    hu_gua_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hexagrams.id"), nullable=True)
    bian_gua_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hexagrams.id"), nullable=True)
    zong_gua_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hexagrams.id"), nullable=True)
    dong_yao: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    paipan_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ai_interpretation: Mapped[str | None] = mapped_column(String(4096), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
