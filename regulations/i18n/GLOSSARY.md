# 정관·규정 번역 용어집

번역본(`en/`, `ja/`, `zh/`)은 참고용이며 한국어 원문이 우선한다. 원문이 바뀌면
같은 PR에서 세 번역본도 고친다. `zh` 는 사이트 다른 화면과 같이 번체(臺灣) 표기.

## 파일 형식 (파서가 읽는 규칙)

- 파일 이름은 한국어 원문과 같다
  (`regulations/i18n/en/01-membership-and-dues.md`).
- 머리말: `title`, `effective_note`, `status` 를 번역하고 `source`·`migrated_at`
  은 그대로 둔다. `title_en` 은 넣지 않는다.
- `#` 제목 1개, `##` 장·부칙, `###` 조. 조 제목 형식:

| 언어 | 조                      | 조의N                     | 부칙                                             |
| ---- | ----------------------- | ------------------------- | ------------------------------------------------ |
| en   | `### Article 6 (Title)` | `### Article 3-2 (Title)` | `## Addenda`, `## Addenda <No. 1, 2023. 08. 24>` |
| ja   | `### 第6条（見出し）`   | `### 第3条の2（見出し）`  | `## 附則`, `## 附則 <第1号、2023. 08. 24>`       |
| zh   | `### 第6條（標題）`     | `### 第3條之2（標題）`    | `## 附則`, `## 附則 <第1號，2023. 08. 24>`       |

- 조·표·목록의 수와 순서는 원문과 같아야 한다 (테스트가 확인한다).
- `<!-- 검토 -->` 주석은 옮기지 않는다. 링크 주소·이미지 경로는 그대로 두고
  글자만 번역한다.

## 용어

| 한국어                 | English                                             | 日本語                     | 中文(繁體)                   |
| ---------------------- | --------------------------------------------------- | -------------------------- | ---------------------------- |
| 사단법인 동양서예협회  | Asian Society of Calligraphic Arts (ASCA)           | 社団法人 東洋書芸協会      | 社團法人 東洋書藝協會        |
| 본회 / 협회            | the Society                                         | 本会 / 協会                | 本會 / 協會                  |
| 정관                   | Articles of Incorporation                           | 定款                       | 章程                         |
| 규정 / 규칙            | Regulations / Rules                                 | 規程 / 規則                | 規定 / 規則                  |
| 이사장                 | Chairperson                                         | 理事長                     | 理事長                       |
| 이사 / 이사회          | Director / Board of Directors                       | 理事 / 理事会              | 理事 / 理事會                |
| 상임이사               | Standing Director                                   | 常任理事                   | 常任理事                     |
| 감사                   | Auditor                                             | 監事                       | 監事                         |
| 임원                   | Officer                                             | 役員                       | 理監事                       |
| 총회 / 정기·임시총회   | General Assembly / Regular·Extraordinary            | 総会 / 定期・臨時総会      | 會員大會 / 定期·臨時         |
| 사무국 / 사무국장      | Secretariat / Secretary General                     | 事務局 / 事務局長          | 秘書處 / 秘書長              |
| 주무관청               | competent authority                                 | 主務官庁                   | 主管機關                     |
| 정회원                 | Full Member                                         | 正会員                     | 正式會員                     |
| 일반회원 / 평생회원    | Annual Member / Lifetime Member                     | 一般会員 / 終身会員        | 一般會員 / 終身會員          |
| 준·특별·명예회원       | Associate / Special / Honorary Member               | 準会員・特別会員・名誉会員 | 準會員·特別會員·名譽會員     |
| 청년작가 / 일반작가    | Young Artist / General Artist                       | 青年作家 / 一般作家        | 青年作家 / 一般作家          |
| 추천작가 / 초대작가    | Recommended Artist / Invited Artist                 | 推薦作家 / 招待作家        | 推薦作家 / 特邀作家          |
| 명예작가               | Honorary Artist                                     | 名誉作家                   | 名譽作家                     |
| 연회비 / 등록비        | annual dues / registration fee                      | 年会費 / 登録費            | 年費 / 註冊費                |
| 평생회비 / 발전기금    | lifetime dues / development fund                    | 終身会費 / 発展基金        | 終身會費 / 發展基金          |
| 출품비 / 표구비 / 도록 | entry fee / mounting fee / catalog                  | 出品料 / 表具代 / 図録     | 參展費 / 裝裱費 / 圖錄       |
| 대한민국 동양서예대전  | Korea Oriental Calligraphy Grand Exhibition         | 大韓民国 東洋書芸大展      | 大韓民國 東洋書藝大展        |
| 공모전 / 공모요강      | open competition / call for entries                 | 公募展 / 募集要項          | 公募展 / 徵件簡章            |
| 운영위원 / 심사위원    | Steering Committee Member / Juror                   | 運営委員 / 審査委員        | 運營委員 / 評審委員          |
| 모집위원               | Recruitment Committee Member                        | 募集委員                   | 招募委員                     |
| 자격심사위원회         | Qualification Review Committee                      | 資格審査委員会             | 資格審查委員會               |
| 감정위원회 / 보증서    | Appraisal Committee / Certificate of Authenticity   | 鑑定委員会 / 保証書        | 鑑定委員會 / 真品保證書      |
| 지부 / 지회            | Branch / Chapter                                    | 支部 / 支会                | 分會 / 支會                  |
| 제척·회피·기피         | disqualification / recusal / challenge              | 除斥・回避・忌避           | 迴避(法定)·自行迴避·聲請迴避 |
| 대상·최우수상·우수상   | Grand Prize / Top Prize / Excellence Prize          | 大賞・最優秀賞・優秀賞     | 大獎·最優秀獎·優秀獎         |
| 오체상 / 삼체상        | Five-Script Prize / Three-Script Prize              | 五体賞 / 三体賞            | 五體獎 / 三體獎              |
| 특선 / 입선            | Special Selection / Selected                        | 特選 / 入選                | 特選 / 入選                  |
| 본상 / 특별상          | Main Prizes / Special Prizes                        | 本賞 / 特別賞              | 正獎 / 特別獎                |
| 반절지 / 전지 / 국전지 | half sheet / full sheet / national-exhibition sheet | 半切 / 全紙 / 国展紙       | 半開 / 全開 / 國展紙         |
| 의결 / 시행 / 부칙     | resolution / enforcement / Addenda                  | 議決 / 施行 / 附則         | 決議 / 施行 / 附則           |

## 금액·날짜

- 금액은 원 단위를 유지한다: en `KRW 50,000`, ja `5万ウォン`, zh `5萬韓元`.
- 날짜는 원문 표기를 그대로 둔다 (`2026. 1. 1.`).
