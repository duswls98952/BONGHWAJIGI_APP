# Context

## Loom 코드 계약

아래 항목은 Loom 코드에 고정된 runtime 동작 계약입니다. 관련 흐름을 바꾸기 전 `loom contract show <id>`로 확인합니다.

- `task-execution`: Task 실행 전 prompt/context/previous-results에 들어가는 입력 경계입니다. 명령: `loom contract show task-execution`. Source: `loom/application/context_pack.py`, `loom/application/team_policy.py`
- `done-guardrail`: Task를 DONE으로 인정하기 전에 필요한 산출물과 상태 전이를 검증하는 계약입니다. 명령: `loom contract show done-guardrail`. Source: `loom/application/services.py`

## Project Memory

# BONGHAWJIGI_APP

Loom 프로젝트 메모리 루트입니다.

이 파일은 `loom init`으로 생성되며 `loom analyze-repo`로 보강할 수 있습니다.

## Workspace Policy

- Output language: `ko`
- Agent provider: `claude`
- Agent model: `adapter-default`
- Reasoning effort: `high`
- Required branch: `develop`
- Dirty branch switch: `blocked`
- Commit policy: `manual`
- Include `.loom` metadata in Git: `yes`
- Read-only parallel execution: `allowed`
- Validation environment: `auto`
- Previous Task result limit: `2`
- Workspace required docs: -
- Loom fixed guardrails and verified Team required policies take precedence over this Workspace Policy.

## Job

- Title: 완성 목업의 앱 구현과 실서버 통합·APK 배포
- Goal: 사용자가 완성한 HTML 목업을 개발 서버에서 전 화면 확인하고 최신 서버 계약의 공백을 대조한다. Expo 앱에 화면과 동작을 구현해 실제 서버로 기능을 검증하고 설치 가능한 Android APK와 인수 자료를 제공한다. 배포 저장소는 앱 원격을 서브모듈로 고정한다. 기존 실제 예측 제외와 Firebase 미준비 조건은 유지한다.
- Branch: develop
- Task count: `2`

## Task

- Title: 목업 디자인을 Expo 화면에 구현하고 현재 서버 계약과 인증 연결
- Description: 서버 공백 보완과 맞춰 완성 목업의 로딩·온보딩·홈·긴급3단계·프로필·수칙을 Expo에 구현하고 안전한 세션 보관·갱신, 위치·현재상태·변경 동기화·TTS·신고 화면 연결을 실제0.2 계약으로 구성한다. APK를 위한 네이티브 설정과 빌드 도구도 준비한다.
- Expected output: 목업 기반 동작하는 Expo 화면과 현재 API 계층·검증/모의자료·Android 빌드 설정
- Done condition: 목업 전 화면이 실제 서버 데이터/인증으로 동작하고 오류·만료·정정·갱신·권한 상태를 구분한다. 타입·회귀·번들 검사를 통과하며 실제 지도/푸시/예측/도로 미제공을 성공으로 표시하지 않는다.
- In scope: 앱 UI·현재 API 타입/런타임 검사; 시연 계정·세션; 위치/알림/TTS·단말 신고 화면; Android 설정·도구; 테스트·문서
- Out of scope: 서버 비밀키/토큰 내장; 학습 변경; 실제119연락; 지도계정/FCM 준비 완료 주장; 3D·실제예측·위험도 앱 자체 판단
- Validation hint: Node24 npm run check, Android/Web 번들·목업비교, 실서버 요청·실제 Android 단말(별도 통합검증과 APK Task)
- Required docs: `docs/08-live-integration-audit.md`, `docs/02-api-integration.md`, `docs/04-map-tts.md`
- Memory refs: -
- Document outputs: `docs/09-app-implementation.md`
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: foreground

## Advisor Source Prompt

No Advisor source prompt recorded for this Task.

## Inclusion Policy

- Mandatory execution files: `prompt.md`, `context.md`, and `previous-results.md`.
- Always included: project memory, current Job/Task metadata, and Job notes.
- Previous results: up to the latest 2 recorded results from earlier Tasks in this Job.
- Job context refs: explicit Job-scoped references selected by the controlling agent or user.
- Task required docs: mandatory Task-scoped documents; missing refs block validation and execution.
- Task memory refs: mandatory Task-scoped workflow memory references; missing or non-memory refs block validation and execution.
- Repository documents, validation documents, and skill rules: included only through explicit Job context refs, Task required docs, or Task memory refs.
- Verified Team Policy Snapshot: included before Active Memory; required policy cannot be overridden by lower-priority context.
- Active workflow memory with an `always` category is included automatically while its status is `ACTIVE`.
- `task_selected` and `reference_only` memory is included only through explicit Task memory refs.
- Consumed proposals, rejected proposals, resolved memory, superseded memory, and archived memory are excluded.
- Unreferenced repository files and results from other Jobs are not included.
- `AGENTS.md` and `CLAUDE.md` remain session-level controlling-agent entrypoints and are not treated as task context artifacts by default.

## Job Notes

# Notes

## Context References

No explicit context references recorded for this job.

## Required Documents and Memory

### required-doc: docs/08-live-integration-audit.md

- Path: `docs/08-live-integration-audit.md`
- Status: present

# 목업과 실제 서버 연결 점검

2026-11-01 KST. 앱 main ce9ebd5를 이력 손실 없이 develop으로 가져왔다. 사용자가 이 대화에서 앱 조회·수정·실제 연결·APK 배포를 명시적으로 요청했다. 이전 서버 작업의 앱 제외 범위는 이번 앱 구현 요청에 적용하지 않는다. 실제 예측 제외, 3D 제외, 서버 음성 제외와 Firebase 미준비는 유지한다.

## 목업 직접 확인

Node24.22.2로 Expo 개발 서버를 http://localhost:8081 에 띄워 public/prototype/를 브라우저에서 직접 확인했다. HTML은 디자인 기준이며 APK에 완성된 앱 화면이 이미 들어있다는 뜻이 아니다.

| 화면 | 직접 확인한 내용 | 구현 시 반영 |
| --- | --- | --- |
| 로딩 | 봉화지기 글자·색상, 2.6초 후 온보딩 전환 | 초기 복원 동안 표시, 완료 후 실제 세션에 따라 이동 |
| 온보딩 | 동의 전체 선택·개별 선택·내용 펼침, 기본/이동/추가 정보, 저장 링크 | 필수 항목 확인·정식 데이터 저장·실패 안내. 현재 링크는 저장 없이 홈으로 이동 |
| 홈 | 브랜드·내정보·지도·오늘 행동·사전준비2개·주변 재난3건 | 서버 자료로 표시. 구로동·다른 재난·날씨 예시는 실데이터 기본값으로 사용하지 않음 |
| 긴급 대응 | 경고/대피/위급 배경·제목3종, 영향 영역, 발화, 현재 상태, 행동, 하단 버튼 | 서버 단계/원문/행동/갱신을 표시. 파형은 실제 TTS 재생 때만 움직임 |
| 내정보 | 선택 상태 변경·스크롤·저장 버튼 | 현재는 “시안용 화면으로 저장 안 됨”만 표시. 전 항목과 서버 지원 필드 대조 필요 |
| 산불 수칙 | 번호별 수칙·회피 영역·뒤로가기 | DB 지침·출처·버전·빈 상태 연결 |
| 대피로 임시 | 3D 준비중 문구·미제공 상태 | 현재 결정은 2D. 실제 경로가 없으면 선을 만들지 않고 준비 상태 표시 |

목업의 119 버튼에는 실제 동작이 없다. 실제 119 연락은 테스트하지 않는다. 앱에는 사용자가 명시적으로 전화 앱을 여는 동작만 제공하고 자동 발신하지 않는다.

## API 차이와 작업 범위

서버 정본: ../BONGHWAJIGI/docs/V2/delivery/api/mvp-openapi.json 및 mvp-app-api.md. 앱의 generated.ts는 이전0.1 초안이다. 현재 서버는0.2.0-mvp이므로 단순 주소 변경으로 연결되지 않는다.

| 기능 | 현재 서버/앱 차이 | 조치 |
| --- | --- | --- |
| 인증 | 서버는 관리자가 JWT 발급, 앱 로그인·갱신·세션 없음. 앱 config는 public을 가정하지만 서버는 사용자 JWT 요구 | 사설망 시연 설치 계정·세션/안전한 토큰 보관·로그아웃 구현 |
| 응답 계약 | 앱은 평탄 ResponseSnapshot과0.1 envelope, 서버는 id/revision/pending_update/content와0.2 | 실제 계약 타입·검증·어댑터·모의 자료와 테스트를 함께 갱신 |
| 개인 단계 | 앱은 구형6개 UI 코드, 서버는1경고/2대피/3위급 | 서버 level/number/label 표시, 앱 자체 단계 판단 금지 |
| 갱신 | 앱 after, 서버 cursor 파라미터; Home의 필드도 다름 | 단일 갱신 루프·재접속·역전 방지·정정/해제·앱 복귀 검증 |
| 프로필 | 서버는 이동/계단/감각/보호대상 중심; 호칭·연령·연락처·생활장소·층수·선택 의료 메모 미지원 | 스키마·저장·삭제·선택 동의와 앱 폼을 함께 보완 |
| 사전준비 | 독립적인 개인별 준비 카드 계약 없음 | 검토된 기본 지침과 프로필 기반 서버 카드·버전·출처·유효시간 제공 |
| 주변 재난 | 서버 Home은 최대3개·92일 필터, 앱은 다른 feed 스키마 | 실제 서버의 관측시각·관련성·빈 상태 표시 |
| 위치·알림 | 설치 등록 후 GPS 전송 필요. 지도/FCM 설정 없음 | 사용자 동의 위치·등록/해제·실패/권한 상태 구현. 실제 푸시 성공은 미검증 유지 |
| 발화·TTS | 서버 음성/voice-turns는 비활성, 단말 TTS 기반만 있음 | 서버 정책 텍스트와 선택형 TTS를 연결. 음성 인식/서버 오디오로 표시하지 않음 |
| 예측·경로 | 서버 예측unavailable/null, 경로 도형 미제공 | 미제공을0확률/안전 경로로 위장하지 않음. 준비된 기능과 화면 구분 |

## 실제 환경과 검증

- 기존 npm run check 통과: 타입·핵심 테스트14개·문서12개 링크. 현재 검사 통과는 실서버 연동 성공을 뜻하지 않는다.
- 개발 컴퓨터는 Java21, Android SDK 미설치 상태였다. 공식 Google platform-tools와 명령 도구를 임시 경로에 설치하고 명령 도구 SHA-256을 공식 제공값과 대조했다.
- 사용자 연결 삼성 SM-G996N이 USB 디버깅 허용 후 device 상태로 인식된다. 이 기기에 APK 설치·재실행·연동 검증을 이어간다.
- 지도 Client ID·Android 앱 등록과 Firebase는 사용자 답변상 미준비다. 실제 지도·푸시는 성공으로 보고하지 않는다.
- API는 일반 서버127.0.0.1:8000에만 열려 있다. USB 검증은 제한된 연결 경로를 구성하고, 배포용 사설망 주소와 인증을 문서화해야 한다.

후속 순서는 서버 공백 보완·배포 → 목업 기반 Expo 화면·실제 계약 연결 → 실서버/단말 검증 → 고정 서브모듈·재현 가능한 APK와 배포 기록이다. 진행 중인 학습 작업은 변경하거나 중단하지 않는다.

### required-doc: docs/02-api-integration.md

- Path: `docs/02-api-integration.md`
- Status: present

# API 연결과 주의사항

## 기준과 경계

[OpenAPI 사본](api/upstream-openapi.yaml)이 경로·필드·필수값의 기준입니다. 타입은 이 사본에서 생성합니다. [provenance](api/provenance.json)에 원본 커밋과 SHA256을 기록했습니다. 예제는 모의 자료이며 배포된 서버 주소는 아직 없습니다.

API는 `src/api/client.ts`를 통해 호출합니다. 화면마다 fetch·Authorization·오류 처리를 새로 만들지 않습니다. `src/api/index.ts`가 mock/live 전환을 담당합니다. LIVE 오류가 나도 모의 성공 응답으로 자동 대체하지 않습니다.

| 앱 동작 | 기존 API | 주요 데이터 |
| --- | --- | --- |
| 시작·기능 확인 | GET `/v1/app-config` | 기능 사용 여부·위치 최신성 기준 |
| 홈 | GET `/v1/home` | 오늘 수칙·주변 목록·활성 ID·sync_cursor |
| 공식 정보 먼저 표시 | GET `/v1/me/alerts/{alert_id}` | 공식 원문·기관 등급·발령/해제 상태 |
| 개인 안내 | GET `/v1/me/responses/{response_id}` | personal_response·assistant_utterance·actions·지도 |
| 실시간 변경 통지 | GET `/v1/me/updates?after={cursor}&wait_seconds=20` | 변경 종류·리소스 ID·revision·다음 cursor |
| 사전 프로필 | GET/PUT `/v1/me/profile` | profile, revision, base_revision |
| 실제 위치 전송 | PUT `/v1/me/location` | 위도·경도·정확도·측정시각·설치 ID |
| 현재 상태 확인 | PUT `/v1/me/responses/{response_id}/context` | 확인된 상태, base_revision |
| 서버 대화 요청 | POST `/v1/me/responses/{response_id}/voice-turns` | transcript(텍스트), client_turn_id, response_revision |
| 서버 대화 결과 | GET/DELETE `/v1/me/responses/{response_id}/voice-turns/{turn_id}` | 서버 발화·처리/취소 상태 |
| 경로 | GET `/v1/me/responses/{response_id}/route?response_revision={revision}` | 경로 좌표·안내·검증/만료 시각 |
| 기본 수칙 | GET `/v1/safety-rules/{disaster_type}?locale=ko-KR` | 수칙·출처·버전 |
| 푸시 등록/해제 | PUT/DELETE `/v1/me/devices/{installation_id}` | FCM/APNs 토큰·권한 상태 |
| 알림 수신·표시·열기 기록 | POST `/v1/me/alerts/{alert_id}/receipts` | 실제 발생한 단계별 영수증 |
| 신고 초안 | POST `/v1/me/responses/{response_id}/support-drafts` | 사용자 확인용 초안. 전송 완료가 아님 |

25개 전체 API 중 앱 틀에서 사용하는 연결 함수를 우선 작성했습니다. 페이지 이동, 계정 탈퇴, 전체 로그인/갱신, 영수증 실제 전송, 119 전화·문자 연결은 후속 구현입니다. 화면 목록 배열의 alert_id와 response_id를 같은 인덱스라고 가정하지 않습니다. Alert의 response_id로 관계를 확인합니다.

## 응답을 읽는 방법

성공은 `{ meta, data }`, 오류는 RFC 9457 기반 문제 객체입니다. 204는 JSON 파싱하지 않습니다.

```ts
const result = await api.response(responseId);
const level = result.data.personal_response.level;
const label = result.data.personal_response.label;
const utterance = result.data.assistant_utterance?.text;
```

`meta.mode=simulation`이면 항상 시연 표시를 유지합니다. `data_status=stale/partial/unavailable`, null, 빈 배열을 ‘안전’ 또는 확률 0으로 바꾸지 않습니다. 확률·등급·경로를 앱에서 생성하지 않습니다.

| 구분 | 필드 | 의미 |
| --- | --- | --- |
| 공식 등급 | `official_alert.official_severity` | 기관이 발표한 원래 등급 |
| 개인 대응 | `personal_response.level/label` | 서버 정책이 정한 개인별 행동 단계 |
| 영향 확률 | `impact` | 검증 모델의 별도 평가. unavailable은 null |
| 행동 목록 | `actions` | 정책과 근거에 따라 서버가 선택한 안내 |

`information / attention / prepare / act / request_assistance / unknown`은 UI 매핑 코드입니다. **순서 비교로 승급·하향을 계산하지 않습니다.** `request_assistance`를 단순히 최고 위험 단계로 해석하지 않습니다. `unknown`은 안전 단계가 아닙니다.

## 인증·쓰기·갱신

- API 주소는 `.env`의 `EXPO_PUBLIC_API_BASE_URL`, 토큰은 SecureStore에서 읽습니다. `EXPO_PUBLIC_*`는 앱에 포함되는 공개 값입니다. 비밀번호·서버 키·토큰·지도 Secret을 넣지 않습니다.
- 화면은 로그인 토큰을 로그에 출력하지 않습니다. 웹 미리보기의 저장소는 메모리 전용입니다. 실제 인증 연결은 미구현입니다.
- PUT 프로필은 전체 교체입니다. 기존 항목과 사용자가 고친 항목을 합쳐 보내고 `base_revision`을 유지합니다.
- 현재 상태는 사용자 확인 후 `confirmation=user_confirmed`로 저장합니다. 모델의 `proposed_context`를 확인 없이 저장하지 않습니다.
- 변경 요청을 무조건 재시도하지 않습니다. POST 재시도는 같은 사용자 동작의 동일 `Idempotency-Key`를 유지해야 합니다.
- revision은 같은 리소스에서만 비교합니다. 오래된 응답은 버립니다. `input_versions`와 현재 프로필·위치·상태가 맞아야 새 안내로 표시합니다.
- 프로필·위치·상태 수정이 반영되는 동안 옛 행동·경로를 보류합니다. 화면 틀은 수정 후 stale로 표시하며, 서버의 새 revision과 수락된 쓰기 버전 이상인 input_versions를 기다립니다.
- 원본 좌표는 GeoJSON `[경도, 위도]`; 지도 SDK에는 `{latitude, longitude}`로 변환합니다. API 시각은 UTC, 표시 시 지역 시간대로 바꿉니다.

| 오류 | 앱 처리 |
| --- | --- |
| 401 | 갱신 루프 중단, 인증 연결 필요 표시. 인증 완료 후 재시작 |
| 404 | 없는/접근 불가 리소스. 다른 사용자 데이터로 우회하지 않음 |
| 409 | 최신 revision 재조회·사용자 변경 재확인. 강제 덮어쓰기 금지 |
| 410 | cursor 폐기, home과 활성 리소스 전체 재조회 |
| 429 | Retry-After 준수 |
| 5xx·통신 실패 | 지연 표시, 점진 재연결. 오래된 경로를 최신처럼 표시하지 않음 |
| 501·기능 off | 미제공 기능 숨김/대체 안내. 존재하지 않는 API 생성 금지 |

실제 데이터 전체에 대한 JSON Schema 검사는 서버 통합 시험에서 수행합니다. 앱 틀의 런타임 검사는 주요 안전 관련 필드와 푸시 형식을 우선 확인하며 OpenAPI 전체 검증기를 대체하지 않습니다.

### required-doc: docs/04-map-tts.md

- Path: `docs/04-map-tts.md`
- Status: present

# 2D 지도·서버 경로·단말 TTS

## 지도 선택

**3D는 MVP에서 제외합니다.** 2D 지도는 국내 도로·건물명·지형지물 확인을 위한 **네이버 지도 Mobile SDK**를 우선 선택했습니다. React Native에서는 커뮤니티 래퍼 `@mj-studio/react-native-naver-map`를 사용합니다. 네이버가 공식 제공하는 React Native 라이브러리라는 뜻은 아닙니다.

‘길을 가장 잘 보여준다’는 것은 시연 지역의 골목·횡단보도·입구 표기와 실제 기기에서 검증할 기준입니다. 이번에 지도 품질을 현장 비교하거나 안전 경로 정확도를 입증한 것은 아닙니다. 지도 컴포넌트를 분리했으므로 선정 지역에서 부족하면 교체할 수 있습니다.

1. 네이버 Cloud의 현재 Maps 상품에서 Mobile Dynamic Map 사용 권한·과금·약관을 확인합니다.
2. Android package / iOS bundle ID를 실제 앱과 동일하게 등록합니다.
3. `.env`에 공개 식별자인 Client ID만 넣습니다. Secret은 앱에 넣지 않습니다.
4. 네이티브 설정이 추가되므로 개발용 앱을 다시 빌드합니다.
5. 실제 지도·위험 구역·사용자 위치·경로 겹침과 확대 조작을 단말에서 확인합니다.

키가 없거나 Expo Go/웹 미리보기에서는 도식이 표시됩니다. 이 도식은 실제 도로나 대피 경로로 사용하지 않습니다. 지도 인증 실패·네트워크 장애·SDK 충돌의 단말 처리는 실기기 검증이 남아 있습니다.

## 서버 경로 API는 이미 존재하므로 재사용

```http
GET /v1/me/responses/{response_id}/route?response_revision=7
Authorization: Bearer <token>
```

| 필드 | 앱 사용법 |
| --- | --- |
| `data.status` | available일 때만 경로 표시. pending/unavailable이면 선을 표시하지 않음 |
| `data.response_revision` | 현재 개인 안내 revision과 일치해야 함 |
| `data.route.geometry` | GeoJSON LineString 좌표를 경로선으로 표시 |
| `data.route.instructions` | 서버가 준 번호별 안내를 그대로 표시 |
| `checked_at / valid_until` | 검증 시각 표시, 만료되면 제거 |
| `accessibility` | 계단 여부·무장애 검증 상태. unknown을 접근 가능으로 바꾸지 않음 |
| `source_ids / sources` | 근거 출처 연결 |

기존 0.1 계약의 좌표는 `[longitude, latitude, altitude]`입니다. 앱은 앞의 경도·위도로 **2D 투영**하여 표시할 수 있습니다. `rendering_assets`의 3D 타일은 사용하지 않습니다. 고도가 없는 실제 2D 경로를 서버가 제공하려면 2원소 좌표 허용과 고도 필드 선택화를 API 버전에 반영해야 하며, 앱이 고도를 임의로 0으로 채우지 않습니다.

기존 feature 이름은 `route_3d`라 최신 요구와 맞지 않습니다. 앱은 이것을 2D 기능 플래그로 재해석하지 않습니다. 서버와 2D 제공을 합의하기 전 LIVE의 `EXPO_PUBLIC_ROUTE_2D_CONTRACT_ENABLED`는 false입니다. 합의 뒤 임시 연결용으로 true를 사용할 수 있고, 후속 정식 계약에서는 `route_2d` capability를 정의해야 합니다. mock은 별도 시연 플래그로 경로를 시험합니다.

경로가 늦게 도착하거나 위치·프로필·상태·통제가 달라지면 이전 선을 보류합니다. 새 response revision과 일치하는 route를 다시 조회합니다. 새 경로를 앱이 직접 최단거리로 재계산하지 않습니다.

**지도 표시와 보행 경로 생성은 별개입니다.** 네이버 Directions 5는 자동차 경로 API입니다. 이것을 어르신의 보행 대피 경로로 대체하지 않습니다. 보행 그래프·통제·위험 구역·접근성을 결합하는 경로 제공자는 서버팀이 확보해야 합니다. 기존 계약에는 회전별 거리·음성 내비게이션·도로 이탈 재탐색 요청이 완성되어 있지 않으므로 현재 틀을 완전한 턴바이턴 내비게이션으로 설명하지 않습니다.

## 서버는 텍스트, 앱은 TTS

**가능합니다.** 서버가 준 `assistant_utterance.text` 또는 ready turn의 `utterance.text`를 앱의 `expo-speech`로 읽도록 시작 틀을 구현했습니다. 서버 TTS 파일이나 GPU 음성 합성이 필수는 아닙니다.

- 기본은 음성 off. 사용자가 현재 화면의 ‘음성 읽기 켜기’를 선택합니다.
- 새 문장이 오면 이전 재생을 중단하고 최신 문장을 읽습니다. 같은 문장 ID를 반복 수신해도 중복 재생하지 않습니다.
- 최신 response revision과 유효시간을 확인합니다. 화면 이탈·백그라운드·안내 만료 시 재생을 중단합니다.
- 실시간 대화 문장과 행동요령 전체 낭독은 별도입니다. 현재 틀은 현재 서버 발화 한 개만 읽습니다.
- 언어는 우선 ko-KR입니다. 실제 한국어 음성 설치 여부·발음·속도·오프라인 사용·블루투스·통화 중 동작을 단말에서 검증합니다.
- iOS 실제 기기의 무음 모드에서는 expo-speech 소리가 나지 않을 수 있습니다. 강제 최대 볼륨·무음 우회 기능으로 취급하지 않습니다.
- 화면이 꺼졌을 때는 푸시 알림 소리와 TTS를 구분합니다. OS가 앱을 중단한 상태에서 임의 문장을 계속 TTS로 읽는 기능은 제공하지 않습니다.
- 음성 인식(STT)은 별개이며 미구현입니다. 현재 사용자의 상황 입력은 텍스트입니다.

기존 `guidance_tts`는 서버 계약의 조건부 기능이고 `audio_url`도 존재하지만, 최신 결정은 단말 TTS입니다. 현재 사용자 선택형 단말 읽기는 앱 기능으로 분리했으며 서버 오디오 재생은 사용하지 않습니다. 서버와 `client_tts` 등 capability 의미를 정식 합의할 항목입니다.

근거: [네이버 지도 Expo 설정](https://rnnavermap.mjstudio.net/docs/installation/expo), [Ncloud 지도 개요](https://guide.ncloud-docs.com/application-maps-overview), [Directions 5의 자동차 경로 범위](https://guide.ncloud-docs.com/docs/maps-direction5-api), [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/).

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
