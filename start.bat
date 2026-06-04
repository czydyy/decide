@echo off
chcp 65001 > nul
echo =========================================
echo   爻爻 - 六爻决策助手 一键启动
echo =========================================

set ROOT_DIR=%cd%

echo.
echo [1/4] 启动 PostgreSQL + Redis...
docker compose up -d postgres redis
echo 等待 PostgreSQL 就绪...
timeout /t 3 /nobreak > nul

echo.
echo [2/4] 安装后端依赖...
cd /d "%ROOT_DIR%\backend"
pip install -r requirements.txt

echo.
echo [3/4] 初始化数据库 + 导入64卦...
python -m app.seed

echo.
echo [4/4] 启动服务...
echo 启动后端: http://localhost:8000
start "liuyao-backend" cmd /c "cd /d %ROOT_DIR%\backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo.
echo 安装前端依赖...
cd /d "%ROOT_DIR%\frontend"
call npm install

echo.
echo 启动前端: http://localhost:10086
echo =========================================
echo   后端 API:  http://localhost:8000/docs
echo   前端 H5:   http://localhost:10086
echo =========================================
call npm run dev:h5

pause
