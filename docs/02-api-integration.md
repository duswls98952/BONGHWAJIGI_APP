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
