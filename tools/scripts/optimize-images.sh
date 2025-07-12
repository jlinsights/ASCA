#!/bin/bash

# 이미지 최적화 스크립트
echo "🖼️ 이미지 최적화 시작..."

# 1. img 태그가 있는 파일들 찾기
IMG_FILES=($(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs grep -l "<img"))

echo "📁 처리할 파일들:"
for file in "${IMG_FILES[@]}"; do
    echo "  - $file"
done

# 2. 각 파일에 Next.js Image import 추가 (중복 방지)
for file in "${IMG_FILES[@]}"; do
    if ! grep -q "import.*Image.*from.*next/image" "$file" && ! grep -q "import NextImage from 'next/image'" "$file"; then
        # Link import 다음 줄에 Image import 추가
        if grep -q "import.*from 'next/link'" "$file"; then
            sed -i '' '/import.*from .*next\/link.*/a\
import NextImage from '\''next/image'\''
' "$file"
        elif grep -q "import.*from 'next" "$file"; then
            sed -i '' '/import.*from .*next/a\
import NextImage from '\''next/image'\''
' "$file"
        else
            # 첫 번째 import 다음에 추가
            sed -i '' '1,/^import/s/$/\
import NextImage from '\''next\/image'\''/' "$file"
        fi
        echo "✅ $file: NextImage import 추가됨"
    fi
done

# 3. img 태그를 NextImage로 변환 (기본 width/height 추가)
for file in "${IMG_FILES[@]}"; do
    echo "🔄 $file 처리 중..."
    
    # <img src= 패턴을 <NextImage src= 로 변경하고 width/height 추가
    sed -i '' 's/<img/<NextImage/g' "$file"
    
    # width, height가 없는 NextImage에 기본값 추가
    # 이미 width나 height가 있으면 건드리지 않음
    while IFS= read -r line; do
        if [[ $line =~ \<NextImage[^>]*src= ]] && ! [[ $line =~ width= ]] && ! [[ $line =~ height= ]]; then
            # src 속성 뒤에 width/height 추가
            sed -i '' "s/src=\([^[:space:]]*\)/src=\1 width={400} height={300}/g" "$file"
        fi
    done < "$file"
    
    echo "✅ $file: img → NextImage 변환 완료"
done

echo "🎨 이미지 최적화 완료!"
echo "🔍 검증: ESLint 실행 중..."
npm run lint 2>&1 | grep -E "(img|Image)" | head -10 