from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Hexagram(Base):
    __tablename__ = "hexagrams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    gua_index: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, comment="卦序 1-64")
    name: Mapped[str] = mapped_column(String(16), nullable=False, comment="卦名")
    upper_gua: Mapped[str] = mapped_column(String(8), nullable=False, comment="上卦(八卦名)")
    lower_gua: Mapped[str] = mapped_column(String(8), nullable=False, comment="下卦(八卦名)")
    symbol: Mapped[str] = mapped_column(String(12), nullable=False, comment="卦象符号(如 ䷀)")
    gua_ci: Mapped[str] = mapped_column(Text, nullable=False, comment="卦辞")
    yao_ci: Mapped[dict] = mapped_column(JSONB, nullable=False, comment="爻辞 {position: text}")
    tuan_ci: Mapped[str | None] = mapped_column(Text, nullable=True, comment="彖辞(彖传)")
    xiang_ci: Mapped[str | None] = mapped_column(Text, nullable=True, comment="大象传辞")
    yao_xiang: Mapped[dict | None] = mapped_column(JSONB, nullable=True, comment="小象传 {position: text}")
    interpretation: Mapped[str | None] = mapped_column(Text, nullable=True, comment="现代解读")
