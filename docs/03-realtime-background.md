# 정책 갱신·앱 복귀·백그라운드

2026-11-01 KST 기준 실행 경로는 `src/mvp/Runtime.tsx`의 단일 전경 갱신 루프다. 현재 계약은 [0.2.0-mvp API](02-api-integration.md)이며 이전0.1의 after, Home의 sync_cursor, voice turn 흐름을 사용하지 않는다.

## 서버 정책이 화면에 도착하는 과정

```text
새 재난 자료 또는 사용자 프로필·위치·확인 상태
  → 서버의 사용자별 재평가와 정책 저장
  → /v1/me/updates의 response.updated
  → 앱이 해당 response_id로 snapshot 재조회
  → 같은 정책의 단계·행동·발화·입력 버전을 함께 교체
```

단계는 서버가 확정한다. 앱은 1경고·2대피·3위급의 제목·색상·행동을 표시한다. 실제 예측 모델은 현재 연결 제외이며 확률이 없는 상태를 0으로 표시하지 않는다.

초기 연결 또는 앱 복귀 시 cursor 없이 `GET /v1/me/updates?wait_seconds=0`으로 시작 위치를 얻고 Home·프로필·기능 설정과 관련 snapshot을 읽는다. 이후 `cursor={next_cursor}&wait_seconds=25`로 대기한다. Home의 공식 경보는 개인 snapshot 조회 완료보다 먼저 반영한다.

25초는 변경이 없을 때의 최대 대기시간이다. 새 이벤트는 서버가 응답하는 시점에 수신한다. 수신 지연0이나 항상 수신을 보장한다는 뜻은 아니다. HTTP 제한시간은 35초다.

## 갱신·만료·읽기 경쟁

- 전경에서 하나의 루프만 실행한다. 백그라운드 전환 시 대기 요청을 abort하고 돌아오면 재조회한다.
- response ID, revision, 같은 revision의 생성시각으로 오래된 snapshot 적용을 막는다.
- 프로필·위치·현재 상태 쓰기가 수락되면 입력 버전을 기억한다. 새 snapshot의 input_versions가 해당 값 이상일 때만 개인 안내를 사용한다.
- pending_update, 오류, stale 데이터, 만료, unknown, 범위 밖 상태에서는 개인 행동과 TTS를 보류한다. 원문 경보 해제를 개인 안전 확정으로 해석하지 않는다.
- 세션·화면 생명주기가 바뀐 뒤 도착한 읽기·쓰기 결과가 새 사용자의 화면을 덮지 않도록 구분한다. 긴급 화면 대상이 바뀌면 이전 사건의 미저장 상태를 초기화한다.
- 400/410이면 cursor를 다시 얻는다. 일반 실패는 점진적으로 재연결하고 429의 Retry-After를 따른다. 최종 인증 실패 시 저장 세션·캐시를 정리하고 재연결을 안내한다.

중복 이벤트가 다시 오더라도 snapshot revision 검사가 오래된 정책 적용을 막는다. 이벤트별 처리 이력을 영구 저장하거나 서버 이벤트 전달을 정확히 한 번으로 보장하지는 않는다. 이벤트 revision보다 GET이 뒤처지는 경우는 서버·단말 통합 검사에 포함한다.

## 최신 발화와 단말 음성

서버는 `content.assistant_utterance`에 검토된 정책 텍스트 한 개를 제공한다. Qwen의 미검토 요약을 즉시 행동 명령으로 재생하지 않는다. 앱은 최신 발화를 교체해 표시하고 사용자가 켠 경우 expo-speech로 읽는다.

response ID·revision·utterance ID로 읽었던 발화를 구분한다. 새 발화가 오면 이전 재생을 중단하고, 화면 이탈·백그라운드·개인 안내 만료 시 멈춘다. 파형은 TTS의 실제 시작/종료 콜백에 따라 움직인다. 사용자의 현재 상태는 선택 후 명시적으로 저장한다.

STT, 마이크 녹음, 전체 채팅 이력, 토큰 스트리밍, voice-turns 요청 UI는 없다. 서버가 음성 파일을 만들어 전송하지 않는다. 단말별 한국어 TTS 확인 결과는 [검증 기록](07-validation.md)에서 확인한다.

## 푸시와 실제 준비 상태

Firebase 프로젝트·자격·테스트용 발신 연결은 아직 준비되지 않았다. **권한 등록 코드와 수신 처리 코드가 있어도 실제 원격 푸시 수신 완료를 의미하지 않는다.** 화면 밖에서 새 안내를 받는 기능은 Firebase 연결 후 검증해야 한다.

| 상태 | 코드 동작·제약 |
| --- | --- |
| 전경 | HTTP long polling으로 재조회·화면 갱신 |
| 화면 잠금·다른 앱 | 전경 polling 중단. 원격 알림은 준비된 FCM 필요 |
| 앱 복귀 | 새 cursor와 Home·snapshot 재조회 |
| Android 알림 등록 | OS 권한·재난 채널 설정. 서버 features.push_provider=fcm일 때 native 토큰 획득 시도 |
| Firebase 미준비 | push_token=null로 단말·권한만 등록; 수신 성공으로 표시하지 않음 |
| 푸시 선택 | resource 종류·ID·revision 파싱 후 인증된 Home에서 관계 확인·화면 이동 |
| 강제 종료·절전·권한 철회 | OS에 따라 수신·위치 공유 중단 가능; 영구 실행 보장 없음 |

현재 서버 FCM data 예시다. 합성 ID이며 원문·정밀 위치·건강 메모를 넣지 않는다.

```json
{"mode":"simulation","resource_type":"response","resource_id":"synthetic-incident-id","revision":"3"}
```

현재 서버의 response 푸시 resource_id는 **incident ID**다. 반면 `/me/updates`는 해당 사용자에게 공개한 **response ID**로 변환해 보낸다. 앱은 Home의 incident와 response 관계를 찾는다. 임의 URL을 라우팅 명령으로 사용하지 않으며 잘못된 revision 타입을 0으로 강제 변환하지 않는다.

alert 푸시는 서버 커밋 `dcbc62e`에서 ID 불일치를 보완했다. delivery worker가 발송 직전에 내부 경보 entity ID를 Home·사용자 경보 API와 같은 사용자별 HMAC opaque ID로 변환한다. DB 내부 ID는 만료·중복 판정용으로 유지한다. 서버 회귀검사 93개 통과 근거가 있으며 실제 Firebase 전달·알림 선택은 설정 준비 후 단말에서 별도로 검증한다.

긴급 화면에서는 실제 전경 표시·열기에 대해 displayed/opened 영수증을 보낸다. 기기 보고 기록이며 사용자의 이해·대피 완료·구조 접수 증명이 아니다. 백그라운드 수신 영수증, 토큰 회전 등록, 종료·잠금 상태 전달은 Firebase 준비 후 단말 검증 항목이다.

## 위치 공유

기본 빌드는 사용자가 현재 위치 공유를 눌렀을 때 전경 권한을 요청하고 측정값을 보낸다. 서버의 현재 위치는 5분 유효기간을 사용하며 앱은 만료 후 현재 위치로 표시하지 않는다. 앱이 켜져 있다는 이유만으로 GPS를 자동 전송하는 주기는 현재 제공하지 않는다. mock에서는 실제 위치 권한을 요청하지 않고 합성 위치만 사용한다.

`EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION=true`와 명시적 시작 동의가 있어야 백그라운드 위치 요청을 시작할 수 있다. TaskManager 작업은 모듈 최상위에 정의되며 권한·동의 상태를 확인한다. Android foreground service 안내와 중지 기능을 제공한다. 초기 요청 옵션15초/20m는 OS에 전달하는 설정이며 정확한 주기를 보장하지 않는다.

백그라운드 위치는 기본 off다. 지속 실행·절전·재부팅·권한 철회·서버 장애는 실기기 인수 검사가 남아 있다. 서버 위치 삭제와 OS 위치 공유 중지는 별도 동작이다. 지속 공유가 켜져 있다면 먼저 중지한 뒤 서버 위치를 삭제한다.
