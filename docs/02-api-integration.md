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
