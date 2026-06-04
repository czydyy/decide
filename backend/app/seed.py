"""
Seed the database with 64 hexagram data.
"""
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session, engine, Base
from app.models.hexagram import Hexagram
from app.data.hexagram_seed import HEXAGRAMS


async def seed_hexagrams():
    async with async_session() as session:
        # Check if already seeded
        result = await session.execute(select(Hexagram).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        for h in HEXAGRAMS:
            hexagram = Hexagram(
                gua_index=h["gua_index"],
                name=h["name"],
                upper_gua=h["upper_gua"],
                lower_gua=h["lower_gua"],
                symbol=h["symbol"],
                gua_ci=h["gua_ci"],
                yao_ci=h["yao_ci"],
                tuan_ci=h.get("tuan_ci"),
                xiang_ci=h.get("xiang_ci"),
                yao_xiang=h.get("yao_xiang"),
                interpretation=h.get("interpretation"),
            )
            session.add(hexagram)

        await session.commit()
        print(f"Seeded {len(HEXAGRAMS)} hexagrams.")


async def main():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_hexagrams()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
