#!/bin/bash

# Console.log 일괄 제거 스크립트
echo "🧹 Console.log 일괄 제거 시작..."

# .ts, .tsx 파일에서 console.log, console.error, console.warn 제거
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' 's/console\.log([^;]*);*//g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' 's/console\.error([^;]*);*//g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' 's/console\.warn([^;]*);*//g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' 's/console\.info([^;]*);*//g'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' 's/console\.debug([^;]*);*//g'

# 빈 줄 정리
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' '/^[[:space:]]*$/N;/^\n$/d'

echo "✅ Console.log 일괄 제거 완료!"
echo "🔍 검증: ESLint 실행 중..."
npm run lint:check 