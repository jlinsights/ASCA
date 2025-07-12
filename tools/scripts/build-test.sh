#!/bin/bash

# 🚀 Phase 4: 최종 빌드 테스트 및 배포 준비 스크립트

set -e

echo "🚀 Phase 4: 최종 빌드 테스트 시작"
echo "========================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 단계별 실행 함수
run_step() {
    local step_name="$1"
    local command="$2"
    
    echo -e "\n${BLUE}🔄 $step_name${NC}"
    echo "----------------------------------------"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $step_name 완료${NC}"
    else
        echo -e "${RED}❌ $step_name 실패${NC}"
        exit 1
    fi
}

# 1. 환경 확인
echo -e "${YELLOW}📋 환경 정보${NC}"
echo "Node.js 버전: $(node --version)"
echo "npm 버전: $(npm --version)"

# 2. TypeScript 타입 체크
run_step "TypeScript 타입 체크" "npx tsc --noEmit"

# 3. ESLint 검사
run_step "ESLint 코드 품질 검사" "npm run lint"

# 4. 프로덕션 빌드
echo -e "\n${BLUE}🏗️ 프로덕션 빌드 시작${NC}"
START_TIME=$(date +%s)

if npm run build; then
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))
    echo -e "${GREEN}✅ 프로덕션 빌드 완료 (${BUILD_TIME}초)${NC}"
else
    echo -e "${RED}❌ 프로덕션 빌드 실패${NC}"
    exit 1
fi

# 5. 빌드 크기 분석
echo -e "\n${BLUE}📊 빌드 크기 분석${NC}"
if [ -d ".next" ]; then
    echo "📦 .next 디렉토리 크기: $(du -sh .next | cut -f1)"
    echo -e "${GREEN}✅ 모든 테스트 통과! 배포 준비 완료${NC}"
fi

echo -e "\n${GREEN}🚀 Phase 4 완료!${NC}" 