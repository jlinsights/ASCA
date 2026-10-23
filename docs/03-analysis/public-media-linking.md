# public 이미지 연결

`public/images/gallery`와 Webflow 원본 이미지는 Git 배포에서 제외된다. 따라서
로컬에 파일이 있어도 운영 화면의 `/images/gallery/...` 주소에는 존재하지 않을 수
있다.

## 연결 원칙

- 원본은 변경하거나 삭제하지 않는다. 해상도별 사본은 같은 사진으로 식별한다.
- 갤러리는 기존 분류·행사 정보를 재사용하고, 업로드가 확인된 항목만 Storage
  경로로 연결한다.
- 작품은 DB의 작가명(한글/한자)과 작품명이 모두 일치하고 원본과 DB 행의 대응이
  유일할 때만 연결한다. 제목만 같거나 후보가 여럿인 경우 보류한다.
- 공개 버킷에는 업로드 시 생성한 웹용·썸네일만 넣는다. Supabase 이미지 변환
  서비스는 사용하지 않는다.
- Storage 객체는 원본 내용 해시가 포함된 경로에 저장한다. 기존 객체를 덮어쓰지
  않으며 공개 읽기를 확인한다.
- 갤러리 매핑과 새 작품 이미지 정보에는 버킷과 경로를 저장한다. 화면 URL의
  앞부분은 `NEXT_PUBLIC_SUPABASE_URL`에서 가져온다.
- 작품의 기존 JSON은 저장소 밖에 백업하고, 조회 이후 이미지 정보가 바뀐 행은
  덮어쓰지 않는다. 게시 상태·인증·소유권은 바꾸지 않는다.

## 실행

`scripts/connect-public-media.mjs`의 기본 동작은 대조만 하는 미리 보기다.
`--source`에는 원본이 있는 public 폴더의 절대 경로를 준다.

```sh
node scripts/connect-public-media.mjs --source /absolute/path/to/public
node scripts/connect-public-media.mjs --source /absolute/path/to/public --apply
```

ASCA-2026의 서버 키를 `ASCA_SUPABASE_SERVICE_ROLE_KEY` 환경 변수로 제공한다. 옛
프로젝트를 가리키는 `.env.local`은 자동으로 읽지 않는다. 키와 DB 백업은
커밋하거나 채팅에 붙여 넣지 않는다.

인증 전 로컬 미리 보기는 `--artworks-snapshot`, `--artists-snapshot`에 저장소
밖의 읽기 전용 조회 결과를 지정할 수 있다. `--apply`는 스냅샷 대신 최신 DB를
다시 읽는다. `--report`는 일치/보류 목록을 지정한 경로에 기록한다.

실제 업로드를 모두 완료하고 공개 읽기를 확인한 뒤
`lib/data/gallery-media.json`이 갱신된다. 그 전의 빈 매핑은 기존 동작을
유지한다. 이후 변경 코드를 검증·커밋·배포해야 운영 갤러리에 새 경로가 적용된다.
