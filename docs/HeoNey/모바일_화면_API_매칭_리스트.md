# 모바일 화면 ↔ API 매칭 리스트

기준: [모바일 5개 화면 기획서](봉화지기_모바일_화면_기획서.md) · [API 계약 0.1.0 초안](delivery/app-api-contract.md) · [화면별 API 인계서](delivery/api-handoff.md) · [전체 경로와 예제](delivery/api-reference.md) · [OpenAPI](delivery/api/openapi.yaml)

이 문서는 **화면의 어느 부분에 어떤 API 응답을 연결할지** 정리한 앱 연동 작업표다. API 25개는 **미배포 초안**이며, 예제 응답은 모의 자료다. 화면 기획의 확정 여부와 서버 API의 실제 제공 여부는 별개다. `data`는 응답 본문의 `data`를 뜻한다. 모든 API의 요청·응답 상세는 각 operationId 링크에서 확인한다.

## 화면별 핵심 호출

| 화면 | 진입 시 우선 호출 | 추가 호출·동작 |
| --- | --- | --- |
| S1 평상시 홈 | [`getHome`](delivery/api-reference.md#getHome) | 위치 동의 시 [`putLocation`](delivery/api-reference.md#putLocation), 목록 다음 페이지 [`listDisasters`](delivery/api-reference.md#listDisasters) |
| S2 긴급 재난 대응 | [`getAlert`](delivery/api-reference.md#getAlert) → [`getResponse`](delivery/api-reference.md#getResponse) | 상태 확인 후 [`putCurrentContext`](delivery/api-reference.md#putCurrentContext), 119 문자 초안 [`createSupportDraft`](delivery/api-reference.md#createSupportDraft), 조건부 경로·음성 API |
| S3 3D 대피로 | 조건 충족 시 [`getRoute`](delivery/api-reference.md#getRoute) | 목업 이후 화면 상세 결정 |
| S4 프로필 설정 | [`getProfile`](delivery/api-reference.md#getProfile), [`getPreferences`](delivery/api-reference.md#getPreferences) | 저장·초기화 API |
| S5 재난별 기본 수칙 | [`getSafetyRules`](delivery/api-reference.md#getSafetyRules) | S2의 `disaster_type` 전달 |

## 공통 연결 순서

1. 앱 시작 시 [`getAppConfig`](delivery/api-reference.md#getAppConfig)로 기능 플래그·위치 허용 기준·언어를 읽는다. 이 API만 공개이고, 나머지는 Bearer 토큰이 필요하다. **토큰 발급·갱신 API는 이 패키지에 없다.**
2. 알림 동의와 토큰이 있으면 [`putDevice`](delivery/api-reference.md#putDevice)로 설치를 등록·갱신한다. 위치 권한과 사용자 동의가 있으면 GPS 측정값을 [`putLocation`](delivery/api-reference.md#putLocation)으로 전송한다. OS 권한 요청과 GPS 측정은 앱 기능이다. 서버에 저장된 위치·유효성은 [`getLocation`](delivery/api-reference.md#getLocation)으로 확인할 수 있다.
3. `getHome`의 `active_alert_ids`, `active_response_ids`, `sync_cursor`를 보관한다. 활성 경보 목록·재접속 동기화에는 [`listAlerts`](delivery/api-reference.md#listAlerts), 변경 감지에는 [`getUpdates`](delivery/api-reference.md#getUpdates)를 쓴다. 푸시는 변경 알림이며, 표시할 최종 내용은 해당 리소스를 다시 GET한다.
4. 경보가 실제로 수신·표시·열린 시점에 [`postAlertReceipt`](delivery/api-reference.md#postAlertReceipt)를 보낸다. 영수증은 대피·신고 완료를 의미하지 않는다. 로그아웃·알림 해제 시 [`deleteDevice`](delivery/api-reference.md#deleteDevice), 위치 동의 철회 시 [`deleteLocation`](delivery/api-reference.md#deleteLocation)을 사용한다.

## S1 — 평상시 홈

| 화면 요소·동작 | 연결 API와 응답 필드 | 호출 시점·표시 규칙 |
| --- | --- | --- |
| 현재 위치·지역 범위 | `putLocation`의 GPS 입력 → `getHome.data.location.status/fix/valid_until`; 필요 시 `getLocation` | 위치 동의 뒤 전송하고 홈 조회. 위치가 없거나 오래됐으면 현재 위치 기반 정보라고 표시하지 않는다. 선택 지역은 별도 범위다. 지도 렌더링은 앱·지도 SDK가 담당한다. |
| 오늘의 안전 행동요령 | `getHome.data.today_rules.items[].text`, `for_date`, `scope`, `status`, `sources`, `valid_until` | 홈 진입·갱신 시. 여러 항목을 표시할 수 있다. `scope=general`은 지역 특화 수칙으로 포장하지 않는다. |
| 진행 중·최근 3개월 주변 재난 | `getHome.data.feed.items[]`의 `status`, `display_title`, `region_label`, `occurred_at`, `ended_at`; `window_start/end`, `data_status` | 진행 중과 최근 3개월 과거를 한 목록에서 구분한다. **과거에는 `display_title`만 사용**하고 `original_title`로 대체하지 않는다. 목록 상세 진입은 없다. |
| 더 보기·스크롤 페이지 | `getHome.data.feed.next_cursor` → `listDisasters`의 `items`, `next_cursor` | 다음 페이지가 있을 때만 호출. 위치·조회 범위를 바꾸면 기존 cursor를 버린다. |
| 긴급 모드 진입 | `getHome.data.active_alert_ids/active_response_ids` → `getAlert` | 긴급 알림·활성 경보에서 S2로 이동한다. 주변 재난 **목록 항목 클릭으로 상세 화면을 열지 않는다.** |

홈에 아무 항목이 없으면 `data_status`와 수집 범위를 함께 확인한다. 빈 목록만으로 안전하다고 표시하지 않는다. 3개월치 자료 확보와 주변 범위는 아직 검증·합의가 필요하다.

## S2 — 긴급 재난 대응

공식 경보 `getAlert`를 먼저 표시하고 개인 안내 `getResponse`를 별도로 로딩한다. `response_id`가 아직 없으면 공식 경보와 기본 수칙·단말 연락 기능을 유지한다. 본문은 스크롤하고 하단 버튼은 고정한다.

| 기획서 순서·요소 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 1. 재난 등급 | `getAlert.data.official_severity.code/label/scheme` | **발령 기관의 공식 등급**이다. `getResponse.data.personal_response.level`과 혼동하지 않는다. 등급이 없으면 임의 수치를 만들지 않는다. |
| 2. 재난 상황 제목 | `getAlert.data.title`, `instruction_kind`, `status`, `valid_until`, `source` | 발령·갱신·해제마다 재조회. ‘홍수 대피 명령’은 시연 예시이고, 실제 표현은 공식 지시 종류에 맞춘다. |
| 3. 중앙 음성 파형 | 앱의 마이크·재생 상태; 기능 채택 시 `createVoiceTurn` → `getVoiceTurn`/`cancelVoiceTurn`의 `status` | 파형은 중앙에만 둔다. 앱 녹음·재생 상태를 실제로 반영한다. 현재 API는 실시간 양방향 스트리밍 계약이 아니다. `voice_turns`가 꺼져 있으면 음성 대화가 가능한 것처럼 표시하지 않는다. |
| 4. 영향 지역과 GPS 지도 | `getResponse.data.affected_area`, `area_source_ids`, `location.status/fix/valid_until`; 공식 지역은 `getAlert.data.target_area` | 실제 출처가 있는 영향 영역과 유효한 GPS 위치를 구분해 그린다. 위치 정확도·시각을 확인하고 미확인 영역을 임의로 확정 표시하지 않는다. 지도 SDK는 앱 측이다. |
| 5. AI 질문·응답 한 문장 | `getResponse.data.assistant_utterance.text`; 조건부 최신 `getVoiceTurn.data.utterance` | 한 번에 하나만 표시하고 새 문장으로 교체한다. 사용자 발화·대화 이력·‘AI 대화 안내’ 제목은 표시하지 않는다. 오래된 turn/revision 결과는 버린다. |
| 6. 현재 상태 태그 | `getResponse.data.context.tags[]`, `context.revision`, `input_versions.profile/context` | 처음에는 서버가 반영한 프로필 기반 태그를 표시한다. 재난 중 확인한 상태는 `putCurrentContext`가 반영된 **새 response**에서 갱신한다. ‘혼자 있음’을 기본값으로 붙이지 않는다. |
| 7. 번호별 맞춤 행동요령 | `getResponse.data.actions[]`의 `order`, `text`, `source_id`, `rule_version`; `revision`, `valid_until` | ‘맞춤 행동요령’ 제목 바로 아래 번호순으로 표시한다. 기획에서 삭제한 설명 박스·도입문을 추가하지 않는다. 출처·유효성을 보존한다. |
| 하단 왼쪽: 기본 수칙 | `getResponse.data.disaster_type` → S5 `getSafetyRules` | 해당 재난 유형을 전달한다. 개인 맞춤 행동과 기본 수칙을 구분한다. |
| 하단 가운데: 3D 대피로 | `getAppConfig.data.features.route_3d.enabled` 또는 `getHome.data.capabilities.route_3d.enabled`, `getResponse.data.route_availability.status/expires_at` → `getRoute` | **기능 enabled + 현 안내 active + 경로 available + 미만료**일 때만 버튼 표시. 미제공이면 숨기고, 진입 시 경로 버전을 다시 확인한다. |
| 하단 오른쪽: 119 신고 | `createSupportDraft.data.preview_text`, `location_status`, `phone_number`, `delivery_status`, `requires_user_confirmation` + OS 문자·전화 UI | 현재 상태·위치의 **문자 초안**을 사용자에게 확인시킨다. `delivery_status=not_sent`이며 API는 자동 전송·전화 연결·접수 확인을 제공하지 않는다. 전화 접근은 API 실패 시에도 앱에서 가능해야 한다. |

상태를 수정할 때는 `getResponse.data.context.revision`을 `putCurrentContext`의 `base_revision`으로 보내고, 성공 후 새 `getResponse.data.input_versions.context`가 반영될 때 행동요령·경로를 교체한다. 음성 결과의 `proposed_context`도 사용자 확인을 거쳐서만 확정한다. `getResponse.data.relevance`, `sources`는 영향 설명·근거 표시가 필요할 때 사용한다. `impact`와 `personal_response`는 공식 재난 등급을 대체하지 않는다.

## S3 — 3D 대피로 (상세 UI 보류)

| 요소 | 연결 API와 응답 필드 | 적용 조건 |
| --- | --- | --- |
| 진입 가능 여부 | S2의 `route_availability`, `route_3d` 기능 플래그 | 제공 지역·현재 response·유효시간을 확인한 뒤에만 버튼 표시. |
| 경로 데이터 | `getRoute.data.status`, `response_revision`, `route.geometry/altitude_reference/instructions/accessibility/checked_at/valid_until/rendering_assets`, `sources` | 진입 시 `getRoute`를 재조회하고 현재 `getResponse.revision`과 맞춰 본다. 지형·지도·3D 렌더링은 앱 측. 접근성 미상은 이용 가능으로 간주하지 않는다. |
| 변경·만료 | `getRoute`의 unavailable/stale/409, `getResponse` 변경 | 오래된 경로를 제거하고 S2의 최신 공식 정보로 돌아간다. |

3D 화면의 배치·조작·문구는 목업 이후 결정한다. 경로 API 자체도 조건부 제안이며 기본 기능 플래그는 꺼져 있다.

## S4 — 프로필 설정 (필드·배치는 제안 단계)

| 화면 요소·동작 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 사전 대피 정보 불러오기 | `getProfile.data.profile`, `revision`, `updated_at` | 현재 초안 필드는 `mobility`, `stairs`, `communication_preference`, `sensory_supports`, `dependents`. 기획서의 의료 정보·긴급 연락처·주요 장소 등은 **API 필드가 없고 미확정**이다. |
| 앱 설정 후보 | `getPreferences.data.preferences`의 `locale`, `notifications_enabled`, `nearby_radius_m`, `home_area_code` | 알림·주변 범위 등은 기획상 제안이다. OS 권한 상태와 서버 선호 설정을 분리한다. |
| 저장 | [`replaceProfile`](delivery/api-reference.md#replaceProfile), [`replacePreferences`](delivery/api-reference.md#replacePreferences) | 각각 전체 PUT이며 읽은 `revision`을 `base_revision`으로 보낸다. 화면에 없는 기존 값을 누락해 지우지 않도록 병합한다. 409 충돌 시 재조회 후 사용자에게 변경을 확인한다. |
| 초기화·권한 철회 | [`deleteProfile`](delivery/api-reference.md#deleteProfile), `deleteLocation`, `deleteDevice`/`putDevice` | 프로필 삭제, 위치 전송 중단, 알림 토큰 비활성화를 각각 따로 처리한다. OS 권한 자체는 앱이 관리한다. |

S2의 ‘현재 상태’는 S4의 상시 프로필과 다르다. 기획서의 항목·필수 여부·동의·보관 정책을 확정한 뒤 API 스키마와 맞춰야 한다.

## S5 — 재난별 기본 수칙

| 요소 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 재난 유형 전달 | S2 `getResponse.data.disaster_type` → `GET /v1/safety-rules/{disaster_type}` | 기본 수칙 버튼을 누를 때 해당 재난 유형으로 조회한다. |
| 기본 수칙 목록 | `getSafetyRules.data.items[]`의 `order`, `text`, `source_id`, `rule_version` | 번호·카드 등 상세 배치는 미확정이다. S2의 개인 맞춤 `actions[]`를 이 화면에 대신 표시하지 않는다. |
| 출처·언어·상태 | `getSafetyRules.data.sources`, `content_version`, `reviewed_at`, `locale_fallback`, `status`; `meta.data_status` | 자료가 없으면 미확보로 표시한다. 번역이 없으면 원문 언어 fallback을 알리고, 내용을 임의 생성하지 않는다. |

## 25개 API 배치 점검

아래 범위는 [screen-map.json](delivery/api/screen-map.json)의 25개 operationId 전체다. **기본 초안 21개, 조건부 4개**이며 구현·배포 완료 수를 뜻하지 않는다.

| 기능 묶음 | operationId | 쓰는 곳 |
| --- | --- | --- |
| 기능·설치 | `getAppConfig`, `putDevice`, `deleteDevice` | 공통 시작·알림 등록·해제, S4 권한 변경 |
| 위치 | `getLocation`, `putLocation`, `deleteLocation` | 공통·S1·S2 위치, S4 동의 철회 |
| 갱신·경보 | `getUpdates`, `listAlerts`, `postAlertReceipt` | 공통 재접속·푸시·경보 표시, S2 |
| 홈 | `getHome`, `listDisasters` | S1 |
| 긴급 안내 | `getAlert`, `getResponse`, `putCurrentContext`, `createSupportDraft` | S2 |
| 프로필·선호 | `getProfile`, `replaceProfile`, `deleteProfile`, `getPreferences`, `replacePreferences` | S4; 프로필 읽기는 S2 태그의 입력 근거 |
| 기본 수칙 | `getSafetyRules` | S5 |
| 조건부 3D | `getRoute` | S2 버튼 확인·S3 진입 |
| 조건부 음성 | `createVoiceTurn`, `getVoiceTurn`, `cancelVoiceTurn` | S2에서 기능 채택 시 |

## 연동 전 결정·검증할 항목

| 항목 | 현재 상태·다음 결정 |
| --- | --- |
| 실제 API 접속 | `https://api.example.invalid`는 자리표시자. 개발·운영 URL, TLS, 인증 발급·갱신, 테스트 계정이 필요하다. |
| 홈 데이터 | 주변 범위·정렬·최근 3개월 자료 확보·수칙 출처/문구를 확정하고 실제 데이터로 검증해야 한다. |
| 프로필 | 현재 API 필드와 화면의 제안 후보가 다르다. 필수 항목·개인정보 동의·삭제·119 활용 범위를 결정해야 한다. |
| 음성·TTS·3D | `voice_turns`, `guidance_tts`, `route_3d`는 기본 비활성. 실시간 양방향 음성·행동요령 음성 읽기·3D 경로 제공은 이 초안만으로 보장되지 않는다. |
| 119 | 문자 초안 API와 실제 문자·전화 실행은 분리된다. 지원 OS와 사용자 확인 흐름을 정하고 실제 신고 성공처럼 표시하지 않아야 한다. |
| 신선도·오류 | `meta.mode=simulation`은 시연 표시가 필요하다. `data_status`, `revision`, `valid_until`, `input_versions`를 확인한다. 401·409·410(cursor)·429·501(기능 비활성)·503과 오프라인 복구를 앱에서 처리해야 한다. |

모의 응답과 정적 검사 결과는 [examples.json](delivery/api/examples.json), [validation-report.json](delivery/api/validation-report.json)을 참조한다. 실서버·단말 연동 검증은 아직 수행되지 않았다.
