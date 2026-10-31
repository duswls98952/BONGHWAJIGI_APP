# 서버 대화·대응 단계·백그라운드

## 대화 텍스트는 서버에서 제공

**채팅/대화 내용은 서버 API가 제공하고 앱은 수신한 문장을 화면에 반영합니다.** 앱에 LLM 키를 넣거나 자체 판단으로 행동 문장을 생성하지 않습니다. 기본 UI는 최신 서버 발화 한 개를 교체하며 사용자 발화·전체 채팅 이력을 누적 표시하지 않습니다. 이는 기존 S2 기획을 유지한 것으로 전체 채팅방 UI가 필요하면 별도 합의합니다.

현재 API로 가능한 전달 경로:

```text
서버가 안내·대응 단계·행동을 새 revision으로 저장
  → /me/updates 에 response.updated 발생
  → 앱이 /me/responses/{id} 재조회
  → personal_response + assistant_utterance + actions를 한 번에 교체
```

사용자 텍스트 응답은 기존 `voice-turns` API의 `transcript`에 전달합니다. 이름에 voice가 있어도 현재 요청 본문은 텍스트입니다. POST 202 이후 `voice_turn.ready` 이벤트로 결과를 조회합니다. 서버 기능이 꺼져 있으면 입력란도 제공하지 않습니다. 토큰 단위 스트리밍·WebSocket·SSE·음성 파일 업로드 API는 기존 명세에 없으므로 구현되어 있다고 가정하지 않습니다.

모든 발화는 `response_id + response_revision + utterance.id`로 구분합니다. 최신 사용자 요청이 바뀌거나 이전 턴이 취소·만료되면 늦은 응답을 버립니다. 앱 복귀 시 진행 중인 턴은 상태를 다시 조회합니다. 프로세스가 완전히 종료되면 메모리의 진행 중 턴은 사라지므로 서버가 최신 발화를 ResponseSnapshot에도 반영해야 합니다. 턴 이력/복원 API 추가 여부는 서버 인계 항목입니다.

## 대응 레벨은 즉시 화면에 반영

`personal_response.level`이 바뀌면 배지 색상·단계 설명·서버 행동 목록을 함께 갱신합니다. 색상은 강조 표현일 뿐 정책을 계산하지 않습니다. 화면별 로컬 상태에 옛 level을 복사해 고정하지 않습니다. Query cache의 동일 snapshot을 사용합니다.

공식 경보는 개인 평가와 별도 조회·표시합니다. AI·지도·TTS 실패 때문에 공식 원문을 기다리게 하지 않습니다. 해제·만료·재평가 중에는 이전 경로와 행동을 보류하며, 공식 경보 해제를 사용자의 안전 확인으로 바꾸지 않습니다.

## 전경 실시간 연결

현재 구현은 기존 계약의 **long polling**입니다. `wait_seconds=20`은 새 이벤트가 없을 때 최대 기다리는 시간입니다. 서버는 새 이벤트가 생기면 즉시 응답해야 하므로 ‘20초마다 화면을 새로고침’하는 방식과 다릅니다.

- 앱 전체에서 갱신 루프는 하나만 실행합니다.
- home의 sync_cursor에서 시작하고, 이벤트를 모두 반영한 뒤 next_cursor를 저장합니다.
- 같은 event_id는 중복 처리하지 않습니다. GET이 이벤트의 revision보다 뒤처져 있으면 재시도합니다.
- HTTP 제한시간은 35초로 서버 대기시간보다 깁니다.
- 재연결은 지수 지연·임의 지연을 두고 429의 Retry-After를 지킵니다.
- 410이나 전경 복귀 시 home → 공식 경보/현재 안내를 다시 읽습니다. 마지막 상태를 추측해 복원하지 않습니다.
- 서버와 단말을 포함한 실제 전달 지연은 별도 측정해야 합니다. ‘실시간’은 지연 0 또는 수신 보장을 뜻하지 않습니다.

## 백그라운드에서 계속 동작해야 한다는 요구의 구현

서비스 목표는 **앱을 보고 있지 않아도 알림을 받을 수 있고, 돌아오면 최신 상태를 이어받는 것**입니다. 일반 앱의 JavaScript·소켓·프로세스를 Android/iOS에서 영구 실행한다고 보장할 수 없습니다.

| 상태 | 구현 방향 / 현재 틀 |
| --- | --- |
| 앱 화면 사용 중 | long polling + 화면 갱신 + 사용자가 켠 TTS |
| 다른 앱 사용·화면 잠금 | 전경 polling을 중단. 서버 FCM/APNs 푸시 사용 |
| 알림 누름 | 허용된 ID만 읽고 공식 경보/안내를 재조회한 뒤 S2로 연결 |
| 앱으로 복귀 | cursor에만 의존하지 않고 최신 상태 전체 재조회 |
| 대피 중 위치 공유 동의 | Android foreground service / iOS background location 사용. 별도 빌드·권한 필요 |
| 강제 종료·절전·권한 철회 | OS가 수신/위치 작업을 중단할 수 있음. 실행 보장 문구 금지 |
| 네트워크 단절 | 마지막 정보·지연 상태 표시. 재연결 후 재조회 |

`src/platform/location.ts`에 최상위 TaskManager 작업과 시작/중지 함수를 마련했습니다. 기본 설정은 off입니다. 사용자가 동의한 대피 세션에서만 켜며 Android는 지속 알림이 나타납니다. 위치 실패는 시각만 기록하고 계속 성공한 것처럼 처리하지 않습니다. 재시도 큐·배터리 최적화·종료 복구·OS별 권한 철회 처리는 실기기 검증과 보강이 필요합니다.

15초/20m 위치 옵션은 초기 시험값이며 OS가 정확한 주기를 보장하지 않습니다. 재난 소스 수집 주기와 앱 위치 전송 주기는 별개입니다. 서버는 위치가 오래되면 GPS가 계속 유효하다고 가정하지 않아야 합니다.

기존 API는 FCM/APNs 토큰을 받습니다. ExpoPushToken을 FCM 토큰인 것처럼 보내지 않습니다. 토큰 회전·로그아웃 해제·영수증·운영 푸시 자격 증명 연결은 [서버 인계](06-server-handoff.md)의 후속 항목입니다. 앱이 꺼져 있을 때도 보이려면 서버 푸시의 표시용 notification/alert 영역을 구성해야 하며 data-only silent push만으로 보장하지 않습니다.

최대 볼륨·무음 우회·타 앱 위 강제 실행도 일반 권한으로 보장하지 않습니다. Android 전체 화면 알림에는 사용 범위/권한 제한이 있고 iOS Critical Alerts에는 Apple의 별도 entitlement와 사용자 허용이 필요합니다.

근거: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/), [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/), [Android 전체 화면 알림](https://developer.android.com/about/versions/14/behavior-changes-14), [Apple Critical Alerts](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions/criticalalert).
