# 앱팀 문서 안내

화면을 이해하려면 현재 [모바일 HTML 시안](../public/prototype/index.html)을 먼저 보고, 아래 UI 문서에서 화면별 목적과 표시 규칙을 확인합니다. HTML 시안은 디자인 기준이고 현재 Expo 구현과 실서버 연결은 [구현 문서](09-app-implementation.md)를 확인합니다.

## UI 문서

| 문서 | 확인할 내용 |
| --- | --- |
| [모바일 화면 기획서](HeoNey/봉화지기_모바일_화면_기획서.md) | 홈·긴급 대응·프로필·재난별 기본 수칙의 순서, 문구, 화면 이동, `나의 사전준비` 예시 |
| [모바일 화면 ↔ API 매칭 리스트](HeoNey/모바일_화면_API_매칭_리스트.md) | 각 화면의 데이터 출처, 현재 API로 제공할 수 없는 내용, 서버와 결정할 항목 |
| [원본 PNG 모음](HeoNey/assert/) | 초기 화면 참고 자료. 최신 수정은 HTML 시안과 기획서를 우선 확인 |

현재 MVP의 지도·대피 경로는 **2D**입니다. HTML에 남은 3D 임시 화면은 현재 화면 목록에 포함되지 않습니다. 재난별 기본 수칙과 개인 상태에 따른 맞춤 행동요령은 각각 다른 화면·데이터입니다.

## 개발 문서

| 순서 | 문서 | 읽는 사람 |
| --- | --- | --- |
| 1 | [시작하기](01-start-here.md) | 실행·개발 환경을 확인하는 사람 |
| 2 | [API 연결](02-api-integration.md) | 화면·서버 데이터 연결 담당 |
| 3 | [실시간·백그라운드](03-realtime-background.md) | 긴급 화면·알림 담당 |
| 4 | [2D 지도·TTS](04-map-tts.md) | 지도·음성 담당 |
| 5 | [Codex 작업 규칙](05-codex-workflow.md) | 화면 구현을 요청하거나 작업하는 사람 |
| 6 | [서버 인계](06-server-handoff.md) | 서버·앱 공동 담당 |
| 7 | [검증 범위](07-validation.md) | 시연·인수 담당 |

[현재 OpenAPI 사본](api/mvp-openapi.json), [합성 응답 예제](api/mvp-fixtures.json), [원본 커밋·해시](api/mvp-provenance.json)는 서버 계약을 확인할 때 사용합니다. 화면 시안이 바뀌어도 API 경로·필드는 서버와 합의하기 전까지 임의로 바꾸지 않습니다.

- [목업과 API 차이 검토](08-live-integration-audit.md)
- [Expo 구현](09-app-implementation.md)

- [Android 내부 배포·실기기 검증](10-android-delivery.md)

- [네이버 지도 연결·Android 배포](11-naver-map-integration.md)

- [0.4.0 지역 안내·A/B 촬영 흐름](13-location-guidance-scenarios.md)
