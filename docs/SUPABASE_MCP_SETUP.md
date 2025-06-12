# Supabase MCP 서버 설정 가이드

이 가이드는 ASCA 프로젝트에서 Supabase MCP (Model Context Protocol) 서버를 설정하는 방법을 설명합니다.

## 🎯 개요

MCP 서버를 통해 AI가 Supabase 데이터베이스와 직접 상호작용할 수 있습니다. 이를 통해 다음과 같은 작업이 가능합니다:

- 데이터베이스 쿼리 실행
- 테이블 스키마 확인
- CRUD 작업 수행
- 실시간 데이터 분석

## 📦 설치된 패키지

```bash
# 전역 설치됨
npm install -g supabase-mcp
npm install -g @modelcontextprotocol/sdk
```

## ⚙️ 환경 설정

### 1. 환경변수 확인

`.env.local` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. MCP 서버 테스트

```bash
node scripts/test-mcp-server.js
```

예상 출력:
```
🧪 Supabase MCP 서버 테스트 시작...

📋 환경변수 확인:
   SUPABASE_URL: ✅ 설정됨
   SUPABASE_KEY: ✅ 설정됨

🔌 Supabase 연결 테스트...
   ✅ 연결 성공! Artists 테이블 레코드 수: 0

📊 테이블 목록 확인...
   artists: ✅ 24297개 레코드
   artworks: ✅ 0개 레코드
   exhibitions: ✅ 0개 레코드
   events: ✅ 0개 레코드
   notices: ✅ 0개 레코드

✅ MCP 서버 준비 완료!
```

## 🖥️ Claude Desktop 설정

### 1. MCP 설정 파일 위치

Claude Desktop의 MCP 설정 파일은 다음 위치에 있습니다:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. 설정 파일 내용

`claude_desktop_config.json`에 다음 내용을 추가하세요:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_service_role_key_here"
      }
    }
  }
}
```

### 3. Claude Desktop 재시작

설정 파일을 수정한 후 Claude Desktop을 완전히 종료하고 다시 시작하세요.

## 🛠️ 사용 가능한 기능

MCP 서버가 설정되면 Claude에서 다음과 같은 작업을 수행할 수 있습니다:

### 데이터베이스 쿼리
```
"artists 테이블에서 한국 작가들의 수를 알려주세요"
```

### 테이블 스키마 확인
```
"exhibitions 테이블의 구조를 보여주세요"
```

### 데이터 분석
```
"최근에 추가된 작품들을 분석해주세요"
```

### CRUD 작업
```
"새로운 전시회 정보를 추가해주세요"
```

## 📊 지원되는 테이블

- **artists**: 작가 정보 (24,297개 레코드)
- **artworks**: 작품 정보 (0개 레코드)
- **exhibitions**: 전시회 정보 (0개 레코드)
- **events**: 이벤트 정보 (0개 레코드)
- **notices**: 공지사항 정보 (0개 레코드)

## 🔒 보안 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 강력한 권한을 가지므로 안전하게 관리하세요
- 프로덕션 환경에서는 적절한 RLS (Row Level Security) 정책을 설정하세요
- MCP 설정 파일에 민감한 정보가 포함되지 않도록 주의하세요

## 🔧 문제 해결

### 연결 실패 시
1. 환경변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. Service Role Key의 권한 확인

### 명령어 인식 실패 시
```bash
# 전역 설치 확인
npm list -g supabase-mcp

# 재설치
npm uninstall -g supabase-mcp
npm install -g supabase-mcp
```

### Claude Desktop에서 MCP 서버가 보이지 않을 때
1. 설정 파일 경로 재확인
2. JSON 형식 유효성 검사
3. Claude Desktop 완전 재시작
4. 로그 파일 확인

## 📝 추가 리소스

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [Supabase MCP 서버 GitHub](https://github.com/cappahccino/supabase-mcp)
- [Claude Desktop MCP 가이드](https://docs.anthropic.com/claude/desktop/mcp)

## 🧪 테스트 스크립트

프로젝트에 포함된 테스트 스크립트:

- `scripts/test-mcp-server.js`: MCP 서버 연결 및 기능 테스트
- `mcp-config.json`: MCP 서버 설정 템플릿
- `claude-mcp-config.json`: Claude Desktop용 설정 템플릿 