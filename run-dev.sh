#!/usr/bin/env bash
set -euo pipefail

# 进入 frontend 目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "错误：未找到 frontend 目录：$FRONTEND_DIR"
  exit 1
fi

cd "$FRONTEND_DIR"

# 首次启动时复制环境变量文件
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "未发现 .env，已从 .env.example 复制"
  cp .env.example .env
fi

# 可选：如果传入 --clean，则清理 Next.js 缓存
if [[ "${1:-}" == "--clean" ]]; then
  echo "清理 .next 缓存..."
  rm -rf .next
fi

# 增强文件监听能力：
# 适合 WSL、Docker、NAS、远程挂载目录等场景
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=1000

# 避免某些环境下 Node 内存不足
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=4096"

echo "启动 Next.js 开发服务..."
echo "目录：$FRONTEND_DIR"
echo "热更新：已启用"
echo "文件监听：polling 模式已启用"
echo ""

npm run dev