#!/bin/sh
set -e

echo "🚀 Starting Auto Repair Shop Application..."

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed..."
npx tsx ./prisma/seed-production.ts

echo "✅ Database setup complete!"

echo "🔥 Starting application..."
exec "$@"
