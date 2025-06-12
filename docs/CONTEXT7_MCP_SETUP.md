# Context7 MCP 서버 설정 가이드

이 가이드는 ASCA 프로젝트에서 Context7 MCP (Model Context Protocol) 서버를 설정하는 방법을 설명합니다.

## 🎯 개요

Context7 MCP 서버는 AI 컨텍스트 관리 및 문서화를 위한 도구입니다. 다음과 같은 기능을 제공합니다:

- 📝 대화 컨텍스트 관리 및 유지
- 🔍 지식 베이스 검색 및 관리
- 📚 문서화 자동화
- 🧠 AI 메모리 관리
- 🔗 컨텍스트 연결 및 추적

## 📦 설치된 패키지

```bash
# 전역 설치됨
npm install -g @upstash/context7-mcp
```

## ⚙️ 환경 설정

### 1. 설치 확인

```bash
# 설치 확인
npm list -g @upstash/context7-mcp

# 테스트 실행
node scripts/test-context7-mcp.js
```

### 2. MCP 서버 실행 테스트

```bash
# Context7 MCP 서버 직접 실행 (stdio 모드)
npx @upstash/context7-mcp
```

## 🖥️ Claude Desktop 설정

### 1. 설정 파일 내용

`claude_desktop_config.json`에 다음 내용을 추가하세요:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@upstash/context7-mcp"]
    }
  }
}
```

### 2. 완전한 설정 예시 (Supabase와 함께)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_service_role_key_here"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["@upstash/context7-mcp"]
    }
  }
}
```

## 🛠️ 사용 가능한 기능

Context7 MCP 서버가 설정되면 Claude에서 다음과 같은 작업을 수행할 수 있습니다:

### 컨텍스트 관리
```
"이전 대화 내용을 기억해주세요"
"프로젝트 진행 상황을 요약해주세요"
```

### 지식 베이스 검색
```
"ASCA 프로젝트 관련 문서를 찾아주세요"
"이전에 논의한 마이그레이션 내용을 알려주세요"
```

### 문서화 지원
```
"현재까지의 작업을 문서화해주세요"
"프로젝트 히스토리를 정리해주세요"
```

## 🔧 특징

### 1. Stdio 모드 실행
- Context7 MCP는 stdio 모드로 실행됩니다
- 명령행 도구로 직접 상호작용하지 않음
- Claude Desktop을 통해서만 사용 가능

### 2. 메모리 관리
- 대화 컨텍스트 자동 저장
- 장기 메모리 유지
- 프로젝트별 컨텍스트 분리

### 3. 검색 기능
- 과거 대화 검색
- 문서 내용 검색
- 컨텍스트 연결 추적

## 🧪 테스트 방법

### 1. 개별 테스트
```bash
node scripts/test-context7-mcp.js
```

### 2. 통합 테스트
```bash
node scripts/test-all-mcp-servers.js
```

### 3. Claude Desktop에서 테스트
Context7 MCP가 활성화되면 Claude에서 다음과 같이 테스트할 수 있습니다:

```
"이 대화를 기억해주세요: ASCA 프로젝트 마이그레이션 완료"
"방금 저장한 내용을 불러와주세요"
```

## 🔧 문제 해결

### Context7 MCP 서버가 응답하지 않을 때

1. **설치 재확인**
   ```bash
   npm uninstall -g @upstash/context7-mcp
   npm install -g @upstash/context7-mcp
   ```

2. **Node.js 버전 확인**
   ```bash
   node --version  # v18 이상 권장
   ```

3. **권한 확인**
   ```bash
   # 전역 패키지 설치 권한 확인
   npm config get prefix
   ```

### Claude Desktop에서 인식되지 않을 때

1. **설정 파일 문법 확인**
   - JSON 형식이 올바른지 확인
   - 쉼표와 괄호 위치 확인

2. **Claude Desktop 재시작**
   - 완전히 종료 후 재시작
   - 시스템 재부팅 고려

3. **로그 확인**
   - Claude Desktop 로그 파일 확인
   - 오류 메시지 분석

## 📊 비교: Supabase vs Context7 MCP

| 기능 | Supabase MCP | Context7 MCP |
|------|-------------|-------------|
| 주요 용도 | 데이터베이스 연동 | 컨텍스트 관리 |
| 데이터 소스 | PostgreSQL | AI 메모리 |
| 실시간 기능 | ✅ | ✅ |
| 검색 기능 | SQL 쿼리 | 자연어 검색 |
| 환경변수 필요 | ✅ (URL, Key) | ❌ |

## 📝 모범 사례

### 1. 함께 사용하기
Supabase MCP와 Context7 MCP를 함께 사용하면 강력한 시너지 효과를 얻을 수 있습니다:

```
"데이터베이스에서 artists 테이블 정보를 조회하고, 
이 정보를 Context7에 저장해주세요"
```

### 2. 프로젝트 컨텍스트 관리
```
"ASCA 프로젝트의 마이그레이션 진행 상황을 
Context7에 기록해주세요"
```

### 3. 지속적인 메모리 활용
```
"이전에 논의한 Events 테이블 구조를 
다시 불러와주세요"
```

## 🔗 추가 리소스

- [Context7 공식 문서](https://context7.ai/)
- [Upstash Context7 MCP GitHub](https://github.com/upstash/context7-mcp)
- [MCP 프로토콜 문서](https://modelcontextprotocol.io/)

## 🚀 다음 단계

1. **Claude Desktop 설정 완료**
2. **두 MCP 서버 동시 사용 테스트**
3. **프로젝트별 컨텍스트 설정**
4. **워크플로우 최적화**

---

**Note**: Context7 MCP는 stdio 모드로 실행되므로 직접적인 명령행 상호작용은 제한적입니다. 주로 Claude Desktop을 통해 사용하는 것이 권장됩니다. 