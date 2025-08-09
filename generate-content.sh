#!/bin/bash

# ASCA 콘텐츠 생성 워크플로

echo "🎯 ASCA 콘텐츠 생성을 시작합니다..."

# 1. 배지 생성
echo "📊 프로젝트 배지 생성 중..."
node ~/Developer/Tools/scripts/generate-badges.js . project-badges.md

# 2. 에이전트 실행
echo "🤖 Claude 에이전트 활성화..."
echo "다음 명령어로 에이전트를 실행하세요:"
echo "claude-code --agent asca-content-writer"

# 3. 품질 확인
echo "✅ 품질 게이트:"
echo "- [ ] 배지가 자동 포함되었는지 확인"
echo "- [ ] SEO 키워드가 적절히 사용되었는지 확인"  
echo "- [ ] 브랜드 톤앤매너가 일관성 있는지 확인"
echo "- [ ] 기술적 정확성 검토"

echo "🎉 ASCA 워크플로 준비 완료!"
