#!/bin/bash
set -e

echo "========================================="
echo "  爻爻 - 六爻决策助手 一键启动"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Start database services
echo -e "\n${YELLOW}[1/4] 启动 PostgreSQL + Redis...${NC}"
docker-compose up -d postgres redis 2>/dev/null || {
    echo "Docker 不可用，请手动启动 PostgreSQL 和 Redis"
    echo "或者修改 backend/.env 使用 SQLite:"
    echo "  DATABASE_URL=sqlite+aiosqlite:///./liuyao.db"
}

# Wait for PostgreSQL
echo "等待 PostgreSQL 就绪..."
sleep 3

# 2. Install backend deps
echo -e "\n${YELLOW}[2/4] 安装后端依赖...${NC}"
cd backend
pip install -r requirements.txt -q

# 3. Seed database
echo -e "\n${YELLOW}[3/4] 初始化数据库 + 导入64卦...${NC}"
python -m app.seed

# 4. Start backend
echo -e "\n${YELLOW}[4/4] 启动后端服务...${NC}"
echo -e "${GREEN}后端: http://localhost:8000${NC}"
echo -e "${GREEN}API文档: http://localhost:8000/docs${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

BACKEND_PID=$!

# 5. Start frontend
echo -e "\n${YELLOW}启动前端...${NC}"
cd ../frontend
npm install --silent 2>/dev/null || npm install
echo -e "${GREEN}前端 (H5): http://localhost:10086${NC}"
npm run dev:h5 &
FRONTEND_PID=$!

echo -e "\n${GREEN}========================================="
echo "  全部启动完成！"
echo "  后端 API:  http://localhost:8000/docs"
echo "  前端 H5:   http://localhost:10086"
echo "=========================================${NC}"
echo ""
echo "按 Ctrl+C 停止所有服务"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose stop 2>/dev/null" EXIT
wait
