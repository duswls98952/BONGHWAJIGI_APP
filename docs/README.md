# 앱팀 문서

2026-10-31 KST. 사용자 최신 결정: Expo/React Native/TypeScript, 1대 컴퓨터의 Codex 개발, **3D 제외·2D 지도**, 서버 대화 텍스트 수신, 단말 TTS 검토, 대응 단계 실시간 반영, 백그라운드 알림·복구.

| 순서 | 문서 | 읽는 사람 |
| --- | --- | --- |
| 1 | [시작하기](01-start-here.md) | 모든 개발자 |
| 2 | [API 연결](02-api-integration.md) | 모든 Codex 에이전트와 공통 기반 담당 |
| 3 | [실시간·백그라운드](03-realtime-background.md) | 긴급 화면·알림 담당 |
| 4 | [2D 지도·TTS](04-map-tts.md) | 지도·음성 담당 |
| 5 | [Codex 작업 규칙](05-codex-workflow.md) | 이미지를 주고 구현을 요청하는 사람과 에이전트 |
| 6 | [서버 인계](06-server-handoff.md) | 서버·앱 공동 |
| 7 | [검증 범위](07-validation.md) | 시연·인수 담당 |

[상위 API 사본](api/upstream-openapi.yaml), [예제 48개](api/upstream-examples.json), [원본 커밋·해시](api/provenance.json)는 기준 자료입니다. 원본은 `develsvai/BONGHWAJIGI`의 V2 계약 `0.1.0-draft`이며 서버 구현 완료를 의미하지 않습니다.

최신 사용자 결정과 구버전 자료가 충돌하면 이번 앱 문서의 변경 사항을 따르되, **서버 wire 형식은 협의 없이 바꾸지 않습니다**. 특히 3D 제외가 기존 route 응답의 필드를 임의로 삭제할 근거는 아닙니다.
