# 0.3.1 목업 정렬·음성 대화·시연 경로

2026-11-01 KST. Android 0.3.1 설치를 완료했다. 네이버 지도 경로선·목적지 마커와 한국어 음성 인식→상태 제안→확인 후 반영을 실제 단말에서 검증했다.

## 반영 내용

- 원본 목업 SVG와 ROKG 서체로 로고를 맞추고 화면 폭·여백·카드·하단 동작을 정렬했다.
- 홈의 행동요령/사전준비 카드 색을 더 진하게 하고 제목 탭과 본문을 하나의 연속 곡선으로 그려 이음새를 제거했다.
- 홈의 `위치와 알림 설정`은 내정보의 해당 절로 이동한다. 공통 보조 버튼은 흰 배경과 진한 테두리로 구분한다.
- `건강 및 의료 특이사항(선택)`, `건강·의료 정보 처리에 동의`로 고쳤다. 상시 연결 배너와 불필요한 부연 설명을 제거했다.
- 현재 상태는 요약하고 수정 시 펼친다. 공식 경보 원문과 출처는 접힌 영역에서 계속 확인할 수 있다.
- Android 한국어 음성 인식을 텍스트 대화 API와 연결했다. 기기 음성 서비스가 인식한 글만 서버로 전송한다. 봉화지기 앱은 녹음 파일을 보관하지 않는다. 기기 서비스는 네트워크를 사용할 수 있다.
- Qwen의 상태 제안은 실제 해석된 항목을 보여 주고 사용자가 `상태 반영`을 누른 뒤 저장한다. 확인 전에는 상태·대응 레벨을 바꾸지 않는다. 최신 정책·발화·상태 버전과 만료를 앱과 서버에서 검사한다.
- 대피로에는 서버가 제공하는 합성 시연 경로를 그린다. `시연 경로 · 실제 이동용 아님`을 표시한다. 검증된 실제 안전 경로나 지정 대피소를 제공하는 기능은 아니다.
- 시연은 합성 위치를 사용한다. 실제 GPS 공유와 119 통화·문자는 이번 검증에서 실행하지 않는다.

## API와 데이터 경계

OpenAPI 출처는 [provenance](api/mvp-provenance.json)에 기록한다. `POST /v1/me/responses/{id}/text-turns`는 텍스트와 정책·상태 기준 revision을 받는다. 동일 turn ID의 GET으로 요청 상태를 회복한다. `ContextWrite.proposal_turn_id`는 서버에 저장된 제안 전체 내용과 대조된다.

경로는 `GET /v1/me/responses/{id}/route`에서 `status=simulation`, `origin=synthetic`, `operational_use=false`, GeoJSON LineString과 유효기간·사건/위치 입력 버전을 받는다. 정책 자체는 전체 입력이 최신인지 검사하고, 경로 좌표는 계약의 사건/위치 버전을 검사한다. 위치나 정책이 만료되면 이전 경로를 숨긴다. 시연 위치 갱신 버튼으로 재확인할 수 있다.

[상호작용 fixture](api/mvp-interaction-fixtures.json)는 격리된 테스트 DB에서 얻은 합성 응답이다. Qwen 추출 stub을 사용했으므로 실모델 검증 증거가 아니다. 웹 모의 모드의 단계는 고정 서버 fixture 재생이며 현장 위험을 판단하지 않는다.

## 검증

- `npm run check`: exit 0, 타입 검사·62개 자동 테스트·17개 문서 링크 검사 통과. 초기 0.3.0의 `npm run export:web`: exit 0. 0.3.1은 Android 음성 권한 흐름과 버전 정보를 변경하고 release 번들로 확인했다.
- 웹에서 상태 제안과 확인 UI, 위치·알림 절 바로가기, 의료 문구와 버튼 대비를 확인했다. 웹 지도는 명시된 도식이며 네이티브 지도 증거로 사용하지 않는다.
- 서버 담당자는 실제 PostgreSQL 121개 테스트와 실제 Qwen HTTPS 검증을 통과했다. 배포 소스 414482274f9252056ac350c69d4687e7a1429d8b. 확인 전 상태 불변, 확인 후 경고→대피→위급, 멱등 재전송·오래된 제안 거절·시연 경로와 영역 밖 미제공을 검증했다.
- Android 0.3.0 / versionCode 4 release 빌드(5분35초)와 Samsung SM-G996N(Android15) 업데이트 설치를 완료했다. 동일 내부 서명, embedded JS, arm64, non-debuggable, 마이크 권한, LIVE Tailnet API를 확인했다.
- 실기기 로고·네이버 지도 타일·진해진 카드 색·연속 라운드·연결 배너 제거를 직접 확인했다. 설치 직후 ReactNativeJS/AndroidRuntime 오류 로그는 없었다.
- 실제 네이버 지도 경로선·목적지 마커는 사용자와 CUA가 확인했다. 말하기가 즉시 취소되는 문제를 0.3.1에서 수정하고 재검증했다.
- Android 0.3.1 / versionCode 5 release 빌드(2분24초)와 동일 단말 업데이트 설치를 완료했다. 설치된 버전과 기존 마이크 허용 상태를 읽기 확인했다. 사용자도 음성 인식과 상태 반영 모두 정상이라고 확인했다.

- 실기기와 연결된 합성 계정의 DB를 읽기 대조했다. Qwen 완료 발화의 기준 context revision 4 뒤에 5가 적용됐고, 정책 revision 14 경고에서 15 대피로 갱신됐다. [익명화한 서버 증거](validation/android-polish-server-evidence.json)에 원문·ID·토큰 없이 기록했다.

## 검토 중 수정한 문제

- React Native View의 불필요한 텍스트 공백을 제거했다.
- 경로에 정책의 profile/state 버전까지 요구하여 좌표가 항상 숨겨지던 문제를 수정하고 회귀 테스트를 추가했다.
- 계정·화면·전경 상태가 바뀌면 늦게 완료된 음성/대화/위치 요청을 새 화면에 반영하지 않도록 했다.
- 수동 상태 수정 시 기존 이동 능력 override를 보존한다.

## 별도 준비 사항

Firebase 실제 푸시, 실제 예측 모델 연결, 검증된 실제 대피 경로, 실사용자 GPS 시연은 이번 패치에 포함하지 않는다. 기존 내부 서명을 유지한 Tailnet 전용 APK로 배포한다.

## APK

- 파일: `artifacts/apk/bonghwajigi-0.3.1-private-arm64.apk`
- 소스: `c0b87ea2bab3ba769ebe3bfbbc91e140d0c12f0e`
- SHA256: `c30826365bc023074bdfdc86372e47e8ae780a431ed3ac2caadc5856d79312fe`
- 66,088,154 bytes. 기존 내부 서명으로 설치해 저장된 세션을 유지했다.
- [빌드 보고서](validation/android-polish-build.json), [실기기 홈](validation/android-polish-home.png), [웹 카드](validation/web-polish-home.png), [설정 바로가기](validation/web-polish-settings.png), [상태 확인 UI](validation/web-polish-conversation.png), [실기기 음성 인식·제안](validation/android-polish-speech.png).
- 빌드 시 작업 트리는 깨끗했으며 실행 소스와 설정은 위 소스 커밋과 일치한다. 최초 0.3.0 빌드는 [이전 보고서](validation/android-polish-build-initial.json)에 보존했다.

## 0.3.1 음성 시작 수정

0.3.0 실기기에서 말하기가 약0.1초 뒤 취소됐다. 실제 로그에서 각 버튼 입력마다 `REQUEST_PERMISSIONS` Activity가 다시 열렸고 `RECORD_AUDIO`는 이미 granted=true였다. native 인식 start 이전에 앱이 비활성화되어 준비 세션이 취소되는 흐름을 확인했다.

0.3.1은 먼저 getPermissionsAsync로 허용 상태를 확인해 허용된 마이크의 권한 창을 다시 열지 않는다. 첫 허용은 녹음 세션 생성 전에 처리하고, 허용 후 다시 누르도록 안내한다. 화면/계정 이탈 시 자동으로 녹음을 재시작하지 않는다. 상태·오류 코드만 진단 로그에 남기며 음성 원문·사용자 ID·위치·토큰을 추가 기록하지 않는다.

`npm run check`: exit 0, 62개 테스트와 타입·문서 검사 통과. 새 APK 빌드·설치 후 단말 로그에서 기존 권한 재사용과 한국어 온디바이스 인식 시작/종료를 확인했다. CUA에서 합성 테스트 발화의 인식 텍스트와 계단 이용 어려움 제안을 확인했고, 사용자가 음성 인식과 상태 반영 모두 정상임을 확인했다. 이 회차의 TTS 음질·청취는 별도로 재확인하지 않았다.
