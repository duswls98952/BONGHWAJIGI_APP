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
- Task count: `3`

## Task

- Title: 실제 Android에서 사설 HTTPS 연동 검증과 서명 APK 배포
- Description: 사용자가 연결한 Samsung 휴대폰에 내부 릴리즈 APK를 설치하고 합성 프로필·위치·긴급 경보·정책3단계·재실행을 실서버로 검증한다. 사용자가 승인한 Tailnet HTTPS와 두 기기443 접근을 사용한다. APK와 재현 가능한 배포 인수 문서를 제공하고 앱 원격 커밋을 서버 저장소 서브모듈로 고정한다.
- Expected output: 실제 Android 검증 증거와 서명 APK·해시·접속/시연 안내, 원격 앱 커밋과 서버 서브모듈
- Done condition: 실제 기기 설치와 서버 요청·정책 갱신을 확인하고 검증한 기능과 미준비 기능을 구분해 기록한다. 서명·내장JS·non-debuggable APK와 원격 고정 서브모듈을 제공한다.
- In scope: 실서버/단말 검증; 발견한 통합 결함 수정; 서명 APK; Tailnet 승인 범위 연결; 서브모듈·원격 동기화; 문서·Loom
- Out of scope: 학습 작업 변경; 실제 예측 모델 연결; Firebase/지도 자격 생성; 실제119통화/문자; 다른 채팅 파일 덮어쓰기; 승인 범위 밖 접근 규칙 확대
- Validation hint: npm run check와 플랫폼 번들; 실제 기기 APK 설치/재실행·합성 정책3단계; HTTPS API·서명·해시; Git 원격/서브모듈 pin; Loom strict
- Required docs: `docs/09-app-implementation.md`, `docs/02-api-integration.md`
- Memory refs: -
- Document outputs: `docs/10-android-delivery.md`
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

### required-doc: docs/09-app-implementation.md

- Path: `docs/09-app-implementation.md`
- Status: present

# 목업 기반 앱 구현 기록

2026-11-01 KST. Loom Task `task-20261031-154046-expo-4e0177fb` 산출물이다. [목업·API 차이 점검](08-live-integration-audit.md)을 바탕으로 HTML 시안을 Expo Router 화면과 현재 서버0.2 계약에 연결했다. 실제 서버 배포·실기기 인수·APK 결과는 후속 통합 검증 기록에서 확정한다.

## 화면 구현

| 화면 | 현재 구현 |
| --- | --- |
| 초기 로딩 | 저장 세션 복원 상태; 고정 지연 후 성공 화면으로 넘어가지 않음 |
| 온보딩 | 필수·선택 건강 정보 동의, 프로필 입력, 설치 세션·단말·프로필 저장 후 진입 |
| 홈 | 브랜드, 2D 도식, 위치 상태, 공식 원문, 서버 수칙·준비 카드, 주변 자료 |
| 긴급 대응 | 3단계 색상/제목, 공식 원문·개인 정책 분리, 지역 도식, 최신 발화, 상태 저장, 행동 |
| 내정보 | 실제 API 조회·저장·충돌 안내·삭제, 위치 공유/삭제, 알림 권한 요청, 로그아웃 |
| 산불 수칙 | 서버 기본 수칙·회피 목록·출처 |
| 대피로 | 2D 도식과 경로 미제공 안내; 검증되지 않은 경로선 없음 |
| 119 준비 | 기기 내 수정 가능한 초안·전화 화면 확인·문자 작성 화면; 자동 발신 없음 |

시안의 예시 지역·다른 재난·기상·날짜는 LIVE 기본값으로 넣지 않았다. 앱 브랜드에는 시스템 글꼴을 사용한다. mock 버튼은 테스트 서버 합성 응답을 재생하며 앱 자체 위험도 계산을 하지 않는다.

## 주요 파일과 계약

| 위치 | 역할 |
| --- | --- |
| app/_layout.tsx, app/*.tsx | 현재 Provider·화면 라우팅·알림 선택 |
| src/mvp/Runtime.tsx | 세션 복원, 전경 갱신 루프, 입력 버전, 변경 후 재조회 |
| src/mvp/session.ts | origin별 저장, 단일 refresh, 로그아웃/갱신 경쟁 방지 |
| src/mvp/core.ts | snapshot·revision·유효기간·입력 버전 검사 |
| src/api/client.ts, http.ts | API 호출·인증·versioned envelope·오류·취소 |
| src/api/mvp-generated.ts | 현재 OpenAPI 생성 타입 |
| src/mvp/mock.ts | 테스트 서버 합성0.2 응답 재생 |
| src/mvp/Home.tsx, Emergency.tsx, Profile.tsx, Rules.tsx | 목업 디자인과 데이터·저장·오류 상태 연결 |
| src/mvp/Map.tsx, Route.tsx, Support.tsx | 2D 도식·경로 미제공·기기 신고 준비 |
| src/platform/ | 설치 ID, SecureStore, 위치, 알림, 단말 TTS |

이전 src/runtime, src/core, src/api/generated.ts 일부는 기존 검사와 이력 때문에 남아 있다. 현재 화면은 src/mvp 경로를 사용한다. 이전0.1 로그인 미구현·after 쿼리·voice-turns·3D 경로 설명을 현재 상태로 적용하지 않는다.

## 일관성 조건

실제 예측은 연결하지 않았다. unavailable/null을 유지하고 대응 단계는 personal_response만 표시한다. 공식 등급은 별도 원문 카드에 표시한다.

세션 갱신은 동시에 한 번만 실행하며 로그아웃·새 계정 연결 중 늦게 도착한 refresh가 이전 토큰을 복원하지 못하도록 한다. HTTP 개발 예외는 명시적으로 켠 loopback 주소로 제한한다.

정책 ID·revision·생성시각·만료·입력 버전을 검사한다. 수락한 프로필·위치·상태보다 오래된 입력으로 만든 행동은 보류한다. 긴급 화면 대상이 바뀌면 이전 사건의 미저장 상태를 재사용하지 않고 다른 경보 원문도 섞지 않는다.

mock은 상태 저장 시 정책 입력 버전을 올리고 시연 단계가 바뀌어도 context revision을 되돌리지 않는다. FCM 파서는 잘못된 타입을 revision0으로 강제 변환하지 않는다. mock에서 실제 GPS·전화·문자를 사용하지 않는다.

## 자동 검사 근거

Node **24.22.2** 환경에서 다음 명령을 실행했다.

```sh
npm run check
```

- TypeScript 검사 통과.
- 전체 **40개 테스트 통과**: 기존14개와 신규 MVP26개.
- 문서 링크 검사 통과. 이번 문서 갱신 후 14개 문서 파일의 링크를 확인했다.
- loom validate --strict 통과. workflow 결과·완료 기록과 커밋은 통제 에이전트가 함께 정리한다.

신규 테스트는 `tests/mvp-session.test.ts`, `mvp-snapshot.test.ts`, `mvp-http.test.ts`, `mvp-mock.test.ts`, `mvp-push.test.ts`다. refresh 동시 실행·로그아웃 경쟁·origin 변경, ID/revision/만료/입력 버전, 0.2 envelope·loopback HTTP, mock3단계·프로필 충돌·현재 상태·cursor, FCM payload를 검사한다.

후속 읽기 검토로 쓰기 응답의 세션 변경 검사, 원격 로그아웃 실패 후 로컬 삭제 경로, 경보 ID 일치 검사, 긴급 화면 대상별 초기화를 보완했다. React 화면·native 동작은 단위 테스트40개만으로 검증됐다고 취급하지 않는다.

FCM 공식 경보의 내부 ID·사용자 공개 ID 불일치는 서버 커밋 `dcbc62e`에서 보완했다. delivery worker가 발송용 ID를 인증된 API와 동일한 사용자별 HMAC opaque ID로 변환하며 서버 회귀검사 93개가 통과했다. 실제 Firebase 전달 검증은 포함하지 않는다.

## 남은 검증 경계

이 문서 작성 시점에는 실제 휴대폰 설치·TTS·GPS·서버 갱신 성공을 여기서 확정하지 않는다. 브라우저 화면, Android/Web JS 번들, native APK 빌드, 실제 단말 검사는 서로 다른 증거다. 완료 항목과 APK 경로는 [검증 기록](07-validation.md)에 추가한다.

네이버 지도와 Firebase는 미준비다. 실제 대피 경로는 unavailable이며 3D·실제 예측·서버 음성·STT·정식 본인인증·계정 탈퇴는 제공하지 않는다. 내부 시연 동의 문구는 정식 공개 서비스의 약관·개인정보 처리방침 확정으로 해석하지 않는다. 남은 연결은 [통합 인계](06-server-handoff.md)를 따른다.

### required-doc: docs/02-api-integration.md

- Path: `docs/02-api-integration.md`
- Status: present

# 현재 MVP API 연결

2026-11-01 KST 기준 앱은 **0.2.0-mvp** 서버 계약을 사용한다. [현재 OpenAPI](api/mvp-openapi.json), [원본 커밋·SHA256](api/mvp-provenance.json), [합성 응답 캡처](api/mvp-fixtures.json)가 기준이다. 이전 `upstream-openapi.yaml`, `generated.ts`, `createApi`와 구형 테스트는 이력으로 남아 있으며 현재 화면의 계약이 아니다.

현재 호출 경로는 `app/*` → `src/mvp/*` → `src/api/client.ts`의 `createMvpApi`다. `src/mvp/api.ts`가 mock/live와 인증을 연결한다. LIVE 오류를 mock 응답으로 자동 대체하지 않는다. `live`는 실제 서버에 HTTP 요청한다는 앱 설정이며, 현재 서버 응답의 `meta.mode`와 정책의 `content.mode`는 계속 `simulation`이다.

## 경로와 화면 연결

| 기능 | 현재 API | 주요 사용처·상태 |
| --- | --- | --- |
| 설치 등록 가능 여부 | GET `/v1/auth/config` | 공개 조회 함수 제공; 설치 시연 활성 여부·동의 버전 |
| 설치 계정 발급 | POST `/v1/auth/installations` | 온보딩에서 설치 ID와 필수 동의 제출 |
| 세션 갱신 | POST `/v1/auth/refresh` | 인증 실패 시 refresh token을 교체하고 원 요청을 한 번 재시도 |
| 기능 설정 | GET `/v1/app-config` | **사용자 인증 필요**; 기능·알림 제공자 확인 |
| 홈 | GET `/v1/home` | `nearby_disasters`, `basic_rules`, `location`, `features`, `preparations`, `alerts` |
| 공식 원문 | GET `/v1/me/alerts/{alert_id}` | 소유권이 확인된 경보·기관 등급·수정/해제 상태 |
| 개인 안내 | GET `/v1/me/responses/{response_id}` | `id`, `revision`, `pending_update`, `content`, `user_context` |
| 변경 통지 | GET `/v1/me/updates?wait_seconds=25&cursor={cursor}` | 최초에는 cursor 없이 `wait_seconds=0`; 이후 반환된 `next_cursor` 사용 |
| 사전 정보 | GET/PUT/DELETE `/v1/me/profile` | 프로필 폼·저장·삭제; `revision`, `input_revision` |
| 사전준비 카드 | GET `/v1/me/preparations` | 서버 선정 카드 최대2개. 홈에도 동일 구조 포함 |
| 위치 | GET/PUT/DELETE `/v1/me/location` | 측정 좌표·정확도·측정시각·설치 ID; 현재 위치 공유와 삭제 |
| 확인한 현재 상태 | PUT `/v1/me/responses/{response_id}/context` | 사용자 확인과 기준 revision을 제출; 202 이후 새 정책 대기 |
| 알림 선호 | GET/PUT `/v1/me/preferences` | 호출 함수 제공. 현재 UI의 알림 권한 등록은 devices API 사용 |
| 단말 등록·해제 | PUT/DELETE `/v1/me/devices/{installation_id}` | 설치 정보·OS 알림 권한·준비된 경우 native FCM 토큰 |
| 경보 표시·열기 기록 | POST `/v1/me/alerts/{alert_id}/receipts` | 전경 긴급 화면에서 실제 표시/열기 기록; 중복키 사용 |
| 로그아웃 | POST `/v1/me/logout` | 서버 세션 해제 요청과 기기 세션 삭제 |
| 산불 수칙 | GET `/v1/safety-rules/wildfire` | 검토된 `items`, `avoid`, 출처·버전 |
| 대피 경로 | GET `/v1/me/responses/{response_id}/route` | 현재 `{status:"unavailable",route:null,reason}`. 호출 함수만 제공하며 화면은 미제공 안내 |

현재 앱은 `voice-turns`나 서버 `support-drafts`를 호출하지 않는다. 서버 음성·채팅 및 서버 신고 초안 기능은 현재 범위에서 비활성이다. 119 초안은 기기에서 사용자가 확인·수정하고 전화/문자 앱으로 넘긴다. [지도·TTS](04-map-tts.md), [남은 서버·단말 연결](06-server-handoff.md)을 함께 참고한다.

## 응답과 대응 단계

성공 응답은 `{meta,data}`다. HTTP 계층은 `meta.schema_version="0.2.0-mvp"`, mode, data 존재 여부를 검사하고 204는 JSON으로 파싱하지 않는다. 서버 오류의 `code` 또는 문자열 `detail`, 상태 코드, `Retry-After`를 `ApiError`로 전달한다. 화면별 런타임 검사는 OpenAPI 전체 JSON Schema 검증을 대신하지 않는다.

```ts
const result = await mvpApi.snapshot(responseId);
const content = result.data.content; // 재평가·미제공 시 null 가능
const level = content?.personal_response.level;
const label = content?.personal_response.label;
const text = content?.assistant_utterance?.text;
```

| 구분 | 현재 필드 | 의미 |
| --- | --- | --- |
| 공식 기관 등급 | `AlertData.official_severity` | 발령기관 원래 등급; 개인 단계와 별도 표시 |
| 개인1단계 | `prepare / 1 / 경고` | 서버가 확정한 준비·확인 안내 |
| 개인2단계 | `act / 2 / 대피` | 서버가 확정한 대피 안내 |
| 개인3단계 | `request_assistance / 3 / 위급` | 서버가 확정한 도움 요청 안내; 자동 신고 아님 |
| 기타 상태 | `information` 또는 `unknown`, number=null | 단계 번호를 임의로 부여하지 않음; unknown은 안전이 아님 |
| 예측 | `content.prediction` | 현재 unavailable, probability=null, used_for_response_level=false |
| 행동·발화 | `content.actions`, `content.assistant_utterance` | 검토된 서버 행동과 reviewed_policy_text |

색상은 서버 단계의 표시 수단이다. 앱이 확률·거리·사용자 프로필로 위험도를 계산하거나 단계 변경을 결정하지 않는다. 공식 경보 해제도 사용자가 안전하다는 뜻으로 바꾸지 않는다.

## 설치 세션과 개인정보

온보딩은 `internal-demo-v1` 필수 동의, 설치 계정 발급, 단말 등록, 프로필 저장을 완료한 뒤 홈으로 이동한다. 공개 시연 등록은 서버 설정으로 활성화해야 하며 일반 회원가입·휴대폰 본인 인증 기능이 아니다. 서버 토큰을 앱에 내장하지 않는다.

- Android/iOS는 SecureStore에 origin과 세션 묶음을 저장한다. 웹 개발 화면은 메모리 저장이며 새로고침하면 연결 정보가 사라진다.
- 401이면 동시에 실패한 요청들이 하나의 refresh 작업을 공유한다. 토큰 교체 중 로그아웃·다른 계정 연결이 발생하면 이전 결과를 폐기한다.
- API 주소가 달라지면 저장된 다른 origin의 자격 정보를 사용하지 않는다. EXPO_PUBLIC 변수에는 공개 주소·기능 설정만 둔다.
- 기본은 HTTPS다. USB 개발용 `EXPO_PUBLIC_ALLOW_LOOPBACK_HTTP=true`는 localhost, 127.0.0.1, ::1, Android emulator의 10.0.2.2에만 HTTP를 허용한다. 사설망 IP 전체를 HTTP로 허용하는 설정이 아니다.
- 건강 메모는 선택 동의 후 입력한다. 동의 해제 시 앱 입력을 지우고 서버도 관련 저장·캐시 삭제 규칙을 적용한다. 프로필 삭제와 계정 탈퇴는 별개이며 계정 탈퇴 UI는 제공하지 않는다.
- 로그아웃은 서버 해제 요청과 로컬 세션 삭제를 수행한다. 서버 해제가 확인되지 않으면 해당 한계를 알린다.

## 쓰기·갱신 규칙

프로필은 `base_revision`과 전체 profile을 PUT한다. 폼을 읽었던 revision을 유지하며 409가 나면 최신 자료를 다시 읽고 사용자가 변경을 확인한다. 최신 revision을 덧씌워 강제 저장하지 않는다.

현재 상태는 `observed_at`, `confirmation:"user_confirmed"`, `base_revision`, `overrides`, `state`를 보낸다. 서버나 모델의 제안만으로 확인 상태를 자동 저장하지 않는다.

프로필·위치의 표시용 `revision`과 정책 입력용 `input_revision`은 구분한다. 수락한 입력 버전 이상이 `content.input_versions`에 반영될 때까지 이전 개인 행동·음성 안내를 보류한다. 현재 상태 키는 `state:{incident_id}/{user_id}`이므로 다른 사건의 상태 변경이 현재 사건을 막지 않는다. 응답 ID 불일치, 낮은 revision, 동일 revision의 더 오래된 생성시각도 적용하지 않는다.

| 오류·상태 | 처리 |
| --- | --- |
| 401 | 단일 갱신 후 한 번 재시도; 갱신 실패 시 연결 종료·온보딩 안내 |
| 404 | 리소스 미존재·접근 불가 표시; 다른 사용자 데이터로 대체하지 않음 |
| 409 | 최신 정보 불러오기·사용자 재확인 |
| 400/410 cursor 오류 | cursor 초기화 후 전체 재조회 |
| 429 | Retry-After 대기 |
| 통신 실패·5xx | 지연 상태·재연결; LIVE 실패를 모의 성공으로 바꾸지 않음 |
| pending/expired/unknown | 이전 개인 행동·TTS 보류; 공식 원문은 별도로 확인 가능 |

현재 타입을 갱신할 때는 서버 OpenAPI 사본과 provenance를 함께 갱신한 뒤 `npm run api:generate:mvp`를 실행한다. `--default-non-nullable false`는 서버의 빈 초기 프로필처럼 기본값 필드가 실제 응답에서 생략될 수 있는 계약을 보존한다. 생성 타입을 직접 수정하지 않는다.

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
