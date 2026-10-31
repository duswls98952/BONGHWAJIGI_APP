# 모바일 화면 ↔ API 매칭 리스트

기준: [모바일 화면 기획서](봉화지기_모바일_화면_기획서.md) · [앱 API 연결 기준](../02-api-integration.md) · [서버 인계](../06-server-handoff.md) · [OpenAPI 사본](../api/upstream-openapi.yaml)

이 문서는 **화면의 어느 부분에 어떤 API 응답을 연결할지** 정리한 앱 연동 작업표다. API 25개는 **미배포 초안**이며, 예제 응답은 모의 자료다. 화면 기획의 확정 여부와 서버 API의 실제 제공 여부는 별개다. `data`는 응답 본문의 `data`를 뜻한다. 요청·응답의 경로와 필드는 OpenAPI 사본을 기준으로 확인한다.

## 화면별 핵심 호출

| 화면 | 진입 시 우선 호출 | 추가 호출·동작 |
| --- | --- | --- |
| S1 평상시 홈 | `getHome` | 위치 동의 시 `putLocation`; 개인별 사전준비 전용 응답은 현재 없음 |
| S2 긴급 재난 대응 | `getAlert` → `getResponse` | 상태 확인 후 `putCurrentContext`, 조건부 2D 경로·음성 API, 119 문자 초안 `createSupportDraft` |
| S4 프로필 | `getProfile` | 프로필 저장·초기화 API; 화면 밖 설정 데이터가 필요할 때만 `getPreferences` |
| S5 재난별 기본 수칙 | `getSafetyRules` | S2의 `disaster_type` 전달 |

현재 MVP에 별도 S3 3D 화면은 없다. 대피로는 S2의 2D 지도에서 다루며, 기존 API의 `route_3d` 기능 플래그를 2D 제공 여부로 재해석하지 않는다.

## 공통 연결 순서

1. 앱 시작 시 `getAppConfig`로 기능 플래그·위치 허용 기준·언어를 읽는다. 이 API만 공개이고, 나머지는 Bearer 토큰이 필요하다. **토큰 발급·갱신 API는 이 패키지에 없다.**
2. 알림 동의와 토큰이 있으면 `putDevice`로 설치를 등록·갱신한다. 위치 권한과 사용자 동의가 있으면 GPS 측정값을 `putLocation`으로 전송한다. OS 권한 요청과 GPS 측정은 앱 기능이다. 서버에 저장된 위치·유효성은 `getLocation`으로 확인할 수 있다.
3. `getHome`의 `active_alert_ids`, `active_response_ids`, `sync_cursor`를 보관한다. 활성 경보 목록·재접속 동기화에는 `listAlerts`, 변경 감지에는 `getUpdates`를 쓴다. 푸시는 변경 알림이며, 표시할 최종 내용은 해당 리소스를 다시 GET한다.
4. 경보가 실제로 수신·표시·열린 시점에 `postAlertReceipt`를 보낸다. 영수증은 대피·신고 완료를 의미하지 않는다. 로그아웃·알림 해제 시 `deleteDevice`, 위치 동의 철회 시 `deleteLocation`을 사용한다.

## S1 — 평상시 홈

| 화면 요소·동작 | 연결 API와 응답 필드 | 호출 시점·표시 규칙 |
| --- | --- | --- |
| 지도·현재 위치 | `putLocation`의 GPS 입력 → `getHome.data.location.status/fix/valid_until`; 필요 시 `getLocation` | 홈 본문은 제목 없이 지도부터 시작하고 지역명은 지도 아래에 둔다. 위치 동의 뒤 전송하고 홈을 조회한다. 위치가 없거나 오래됐으면 현재 위치 기반 정보라고 표시하지 않는다. 지도 렌더링은 앱·지도 SDK가 담당한다. |
| 오늘의 행동요령 | `getHome.data.today_rules.items[].title/text`, `for_date`, `scope`, `status`, `sources`, `valid_until` | 홈 진입·갱신 시. 여러 항목을 표시할 수 있다. `scope=general`은 지역 특화 수칙으로 포장하지 않는다. |
| 나의 사전준비 | **현재 전용 API·응답 필드 없음.** `getHome.data`에는 준비 카드 목록이 없고 `getProfile.data.profile`은 일부 입력 상태만 제공한다. | 사용자가 직접 입력한 프로필과 확인된 재난 상황에 따라 최대 2개를 서버가 선정·제공해야 한다. 현 HTML의 생수·손전등·보조기구 문구는 정적 시안이며 LIVE 추천 결과가 아니다. `today_rules.items[]`나 긴급 대응 `actions[]`를 사전준비 데이터로 바꾸어 쓰지 않는다. |
| 주변 재난 사항 | `getHome.data.feed.items[]`의 `status`, `display_title`, `region_label`, `occurred_at`, `ended_at`; `window_start/end`, `data_status` | 기획 목표는 조회 시점 기준 3개월 이내만 최신순 최대 3건이며 진행 중·종료 모두 같은 기간 규칙이다. 현재 계약은 진행 중 재난을 발생 시각과 관계없이 포함하며 최대 3건도 보장하지 않아 서버와 기준을 맞춰야 한다. **과거 항목에는 `display_title`을 사용**하고 목록 상세 진입은 없다. |
| 추가 목록 API(현재 홈 미사용) | `getHome.data.feed.next_cursor` → `listDisasters`의 `items`, `next_cursor` | API는 존재하지만 현재 홈 시안에 더 보기·페이지 이동 UI는 없다. 후속 기능을 채택하면 조회 범위가 바뀔 때 기존 cursor를 버린다. |
| 긴급 모드 진입 | `getHome.data.active_alert_ids/active_response_ids` → `getAlert` | 긴급 알림·활성 경보에서 S2로 이동한다. 주변 재난 **목록 항목 클릭으로 상세 화면을 열지 않는다.** |

홈에 아무 항목이 없으면 `data_status`와 수집 범위를 함께 확인한다. 빈 목록만으로 안전하다고 표시하지 않는다. 사전준비 카드의 출처·선정 기준·유효시간·프로필 변경 반영 방식과 주변 재난의 3개월 경계·최대 3건 보장은 아직 서버와 합의해야 한다.

## S2 — 긴급 재난 대응

공식 경보 `getAlert`를 먼저 표시하고 개인 안내 `getResponse`를 별도로 로딩한다. `response_id`가 아직 없으면 공식 경보와 기본 수칙·단말 연락 기능을 유지한다. 본문은 스크롤하고 하단 버튼은 고정한다.

| 기획서 순서·요소 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 1. 재난 경보 제목 | `getAlert.data.title`, `instruction_kind`, `status`, `valid_until`, `source`; 별도 공식 정보 `official_severity.code/label/scheme` | 경보 제목과 위험 아이콘을 가운데 표시하고 별도의 `심각` 문구는 두지 않는다. 발령·갱신·해제마다 재조회한다. 공식 등급을 `getResponse.data.personal_response.level`과 혼동하지 않는다. |
| 2. 영향 지역과 GPS 지도 | `getResponse.data.affected_area`, `area_source_ids`, `location.status/fix/valid_until`; 공식 지역은 `getAlert.data.target_area` | 실제 출처가 있는 영향 영역과 유효한 GPS 위치를 2D 지도에 구분해 그린다. 위치 정확도·시각을 확인하고 미확인 영역을 임의로 확정 표시하지 않는다. 지도 SDK는 앱 측이다. |
| 3. 실시간 음성 대화 | `getResponse.data.assistant_utterance.text`; 조건부 `createVoiceTurn` → `getVoiceTurn`/`cancelVoiceTurn`의 상태와 최신 `utterance` | 중앙 파형과 서버 발화 한 문장만 표시하고 새 발화로 교체한다. 파형은 실제 앱 녹음·재생 상태를 반영해야 한다. 현재 API는 실시간 양방향 스트리밍 계약이 아니며 기능이 꺼져 있으면 대화가 가능한 것처럼 표시하지 않는다. 오래된 turn/revision 결과는 버린다. |
| 4. 내 현재 상태 | `getResponse.data.context.tags[]`, `context.revision`, `input_versions.profile/context` | 처음에는 서버가 반영한 프로필 기반 태그를 표시한다. 재난 중 확인한 상태는 `putCurrentContext`가 반영된 **새 response**에서 갱신한다. ‘혼자 있음’을 기본값으로 붙이지 않는다. |
| 5. 맞춤 행동요령 | `getResponse.data.actions[]`의 `order`, `text`, `source_id`, `rule_version`; `revision`, `valid_until` | 제목 바로 아래 번호순으로 표시한다. 기획에서 삭제한 설명 박스·도입문을 추가하지 않는다. 출처·유효성을 보존한다. |
| 하단 왼쪽: 기본 수칙 | `getResponse.data.disaster_type` → S5 `getSafetyRules` | 해당 재난 유형을 전달한다. 개인 맞춤 행동과 기본 수칙을 구분한다. |
| 하단 가운데: 대피로 | `getResponse.data.route_availability.status/expires_at` → 기존 `getRoute` | S2의 2D 지도에 경로를 겹쳐 표시한다. 현재 API의 `route_3d` 플래그는 2D 제공을 뜻하지 않는다. 서버와 2D 제공 계약이 합의되기 전 LIVE 경로를 제공된 것처럼 표시하지 않는다. |
| 하단 오른쪽: 119 신고 | `createSupportDraft.data.preview_text`, `location_status`, `phone_number`, `delivery_status`, `requires_user_confirmation` + OS 문자·전화 UI | 현재 상태·위치의 **문자 초안**을 사용자에게 확인시킨다. `delivery_status=not_sent`이며 API는 자동 전송·전화 연결·접수 확인을 제공하지 않는다. 전화 접근은 API 실패 시에도 앱에서 가능해야 한다. |

상태를 수정할 때는 `getResponse.data.context.revision`을 `putCurrentContext`의 `base_revision`으로 보내고, 성공 후 새 `getResponse.data.input_versions.context`가 반영될 때 행동요령·경로를 교체한다. 음성 결과의 `proposed_context`도 사용자 확인을 거쳐서만 확정한다. `getResponse.data.relevance`, `sources`는 영향 설명·근거 표시가 필요할 때 사용한다. `impact`와 `personal_response`는 공식 재난 등급을 대체하지 않는다.

## S2의 2D 대피로 연결

| 요소 | 연결 API와 응답 필드 | 적용 조건 |
| --- | --- | --- |
| 진입 가능 여부 | S2의 `route_availability`; 기존 `getAppConfig`/`getHome`에는 `route_3d`만 있음 | 기존 플래그를 2D로 재해석하지 않는다. 서버가 2D 제공 여부와 유효기간을 계약에 명시해야 LIVE 경로를 연결할 수 있다. |
| 경로 데이터 | `getRoute.data.status`, `response_revision`, `route.geometry/instructions/accessibility/checked_at/valid_until`, `sources` | 기존 경로 URL을 재사용하고 3D 좌표의 경도·위도만 2D 지도에 투영한다. 가짜 고도를 채우거나 경로를 앱에서 계산하지 않는다. 현재 response revision·출처·접근성·유효시간을 확인한다. |
| 변경·만료 | `getRoute`의 unavailable/stale/409, `getResponse` 변경 | 오래된 경로를 S2 지도에서 제거하고 최신 안내와 경로를 다시 조회한다. |

별도 S3 화면과 3D 렌더링은 MVP 범위에서 제외한다. 현재 계약의 좌표·capability 차이는 [2D 지도·TTS](../04-map-tts.md)와 [서버 인계](../06-server-handoff.md)에 기록한다.

## S4 — 프로필

| 화면 요소·동작 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 사전 프로필 불러오기 | `getProfile.data.profile`, `revision`, `updated_at` | 현재 계약 필드는 `mobility`, `stairs`, `communication_preference`, `sensory_supports`, `dependents`다. 기획서의 정기 복용약 등 의료 정보·긴급 연락처·주요 장소·층수는 **현재 API 필드가 없다.** 저장 가능하다고 표시하지 않는다. |
| 화면 밖 앱 선호 설정 | `getPreferences.data.preferences`의 `locale`, `notifications_enabled`, `nearby_radius_m`, `home_area_code` | 이 API는 존재하지만 현재 프로필 시안에 주변 반경·GPS 조작 화면을 추가하는 근거가 아니다. OS 권한 상태와 서버 선호 설정을 분리한다. |
| 저장 | `replaceProfile`, `replacePreferences` | 각각 전체 PUT이며 읽은 `revision`을 `base_revision`으로 보낸다. 화면에 없는 기존 값을 누락해 지우지 않도록 병합한다. 409 충돌 시 재조회 후 사용자에게 변경을 확인한다. |
| 초기화·권한 철회 | `deleteProfile`, `deleteLocation`, `deleteDevice`/`putDevice` | 프로필 삭제, 위치 전송 중단, 알림 토큰 비활성화를 각각 따로 처리한다. OS 권한 자체는 앱이 관리한다. |

S2의 ‘현재 상태’는 S4의 상시 프로필과 다르다. 기획서의 항목·필수 여부·동의·보관 정책을 확정한 뒤 API 스키마와 맞춰야 한다.

## S5 — 재난별 기본 수칙

| 요소 | 연결 API와 응답 필드 | 호출·표시 규칙 |
| --- | --- | --- |
| 재난 유형 전달 | S2 `getResponse.data.disaster_type` → `GET /v1/safety-rules/{disaster_type}` | 기본 수칙 버튼을 누를 때 해당 재난 유형으로 조회한다. |
| 기본 수칙 목록 | `getSafetyRules.data.items[]`의 `order`, `text`, `source_id`, `rule_version` | 현재 시안은 번호별 수칙과 피해야 할 행동·장소를 표시한다. 실제 수칙 문구는 공식 출처 검증이 필요하며 S2의 개인 맞춤 `actions[]`를 대신 표시하지 않는다. |
| 피해야 할 행동·장소 | 현재 `getSafetyRules.data.items[]`에는 별도 회피 항목 구분 필드가 없음 | HTML의 회피 목록은 정적 예시다. 공식 기본 수칙에서 이 영역을 별도로 제공하려면 서버와 분류·표시 계약을 확인한다. |
| 출처·언어·상태 | `getSafetyRules.data.sources`, `content_version`, `reviewed_at`, `locale_fallback`, `status`; `meta.data_status` | 자료가 없으면 미확보로 표시한다. 번역이 없으면 원문 언어 fallback을 알리고, 내용을 임의 생성하지 않는다. |

## 25개 API 배치 점검

아래 범위는 [OpenAPI 사본](../api/upstream-openapi.yaml)의 25개 operationId 전체다. **기본 초안 21개, 조건부 4개**이며 구현·배포 완료 수를 뜻하지 않는다.

| 기능 묶음 | operationId | 쓰는 곳 |
| --- | --- | --- |
| 기능·설치 | `getAppConfig`, `putDevice`, `deleteDevice` | 공통 시작·알림 등록·해제, S4 권한 변경 |
| 위치 | `getLocation`, `putLocation`, `deleteLocation` | 공통·S1·S2 위치, S4 동의 철회 |
| 갱신·경보 | `getUpdates`, `listAlerts`, `postAlertReceipt` | 공통 재접속·푸시·경보 표시, S2 |
| 홈 | `getHome`, `listDisasters` | S1; `listDisasters`는 현재 홈 시안에서 사용하지 않는 추가 목록 API |
| 긴급 안내 | `getAlert`, `getResponse`, `putCurrentContext`, `createSupportDraft` | S2 |
| 프로필·선호 | `getProfile`, `replaceProfile`, `deleteProfile`, `getPreferences`, `replacePreferences` | S4; 프로필 읽기는 S1 사전준비 후보와 S2 태그의 입력 근거이나 추천 카드 응답은 아님 |
| 기본 수칙 | `getSafetyRules` | S5 |
| 경로 | `getRoute` | 기존 URL을 S2 2D 지도에 활용하려면 서버의 2D capability 계약 확인 필요 |
| 조건부 음성 | `createVoiceTurn`, `getVoiceTurn`, `cancelVoiceTurn` | S2에서 기능 채택 시 |

## 연동 전 결정·검증할 항목

| 항목 | 현재 상태·다음 결정 |
| --- | --- |
| 실제 API 접속 | `https://api.example.invalid`는 자리표시자. 개발·운영 URL, TLS, 인증 발급·갱신, 테스트 계정이 필요하다. |
| 홈 데이터 | `today_rules`의 출처·문구와 주변 범위·정렬을 검증한다. 주변 재난은 진행 중·종료 모두 조회 시점 기준 3개월 이내 최신순 최대 3건이 기획 목표이나, 현재 `listDisasters` 계약은 진행 중 재난을 발생 시각과 관계없이 포함하고 `getHome.feed.items[]`에는 최대 3건 보장이 없다. 기간 경계와 건수 선정 위치를 서버와 확정한다. |
| 나의 사전준비 | `getHome`에는 준비 카드 응답이 없고 `getProfile`은 보조기구 사용·계단 이용·보호 대상 등 일부 상태만 제공한다. 카드 1~2개의 선정 주체, 공식 근거, 재난·프로필 입력 버전, 유효시간, 갱신·미제공 상태를 서버와 정해야 한다. 기존 `today_rules`나 긴급 `actions`를 임의로 전용 데이터처럼 사용하지 않는다. |
| 프로필 | 정기 복용약 등 선택 의료 정보, 긴급 연락처, 주요 장소·층수는 현재 `ProfileInput`에 없다. 민감정보의 입력·동의·보관·삭제 및 119 활용 범위를 먼저 결정한 뒤 API 계약을 개정해야 한다. |
| 음성·TTS·2D 경로 | `voice_turns`, `guidance_tts`, 기존 `route_3d`는 기본 비활성이다. 실시간 양방향 음성·단말 TTS·2D 경로 제공을 혼동하지 않는다. 현재 `route_3d`를 2D 기능 플래그로 바꾸어 해석하지 않고 별도 서버 계약을 확정한다. |
| 기본 수칙의 회피 목록 | 현재 `getSafetyRules.items[]`에 피해야 할 행동·장소의 별도 구분 필드가 없다. 정적 시안의 회피 영역을 실제로 채울 서버 분류·공식 출처를 확인한다. |
| 119 | 문자 초안 API와 실제 문자·전화 실행은 분리된다. 지원 OS와 사용자 확인 흐름을 정하고 실제 신고 성공처럼 표시하지 않아야 한다. |
| 신선도·오류 | `meta.mode=simulation`은 시연 표시가 필요하다. `data_status`, `revision`, `valid_until`, `input_versions`를 확인한다. 401·409·410(cursor)·429·501(기능 비활성)·503과 오프라인 복구를 앱에서 처리해야 한다. |

모의 응답 예시는 [OpenAPI 예제](../api/upstream-examples.json)를, 계약 사본의 원본은 [provenance](../api/provenance.json)를 참조한다. 실서버·단말 연동 검증은 아직 수행되지 않았다.
