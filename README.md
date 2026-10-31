# 봉화지기 Android 앱

산불 공식 경보와 서버가 갱신하는 개인별 대응 안내를 확인하는 내부 시연 앱입니다. 앱 **0.3.1**은 완성 HTML 목업과 같은 로고·화면 구성에 음성 대화와 합성 시연 경로를 연결합니다. 서버 계약은 `0.2.0-mvp`를 유지합니다. 단계는 **1 경고 · 2 대피 · 3 위급**이며 앱은 서버가 정한 단계와 행동을 표시합니다.

## 실행

Node24 (24.3 이상, 25 미만)를 사용합니다. 기존 `.env`가 있으면 덮어쓰지 않습니다.

```sh
npm ci
cp .env.example .env
npm run web
npm run check
```

기본은 합성 응답을 재생하는 mock 모드입니다. 웹의 `/prototype/`는 디자인 참고용 HTML이고 `/`는 실제 앱 구현입니다. LIVE는 설치 계정·세션 갱신·프로필/위치/현재 상태 쓰기·공식 경보·개인 정책 갱신을 실제 API로 처리합니다. 웹 세션은 메모리, Android 세션은 SecureStore에 보관합니다.

## 구현 범위

| 화면 | 연결된 기능 |
| --- | --- |
| 온보딩 | 시연 안내·동의, 설치 계정 생성, 프로필 저장 |
| 홈 | 목업 SVG·서체 로고, 기본 행동·개인 준비 카드, 공식 경보와 최근 산불 목록 |
| 내정보 | 프로필 수정·삭제, 위치와 알림 절 바로가기, 현재 위치 공유/삭제, 시연 위치 저장, 알림 설정, 로그아웃 |
| 긴급 대응 | 서버3단계, Android 한국어 STT·문자 대화, Qwen 상태 제안 확인·재평가, 최신 행동과 단말 TTS |
| 기본 수칙 | 서버 지침·회피 항목·출처 |
| 지도·대피로·119 | Android 네이버 2D 지도·공유 위치·관련 영역·서버 합성 경로, 사용자 확인용 신고 초안·단말 연결 버튼 |

Android 0.2.1의 지도·마커·영역과 기존 정책3단계·TTS는 단말에서 확인했습니다. **0.3.0에서 실제 지도 경로선과 목적지 마커를 확인했습니다. 말하기 직후 취소되는 권한 재요청 문제를 0.3.1에서 수정했으며 음성 입력→대화→상태 반영은 재검증 중입니다.** 음성은 `expo-speech-recognition` 58.0.1(MIT)로 글로 바꿔 서버에 보내고, 상태 변경은 사용자 확인 후 반영합니다.

대피로는 서버가 제공하는 `simulation / synthetic / operational_use=false` 합성 fixture만 표시합니다. 화면의 **시연 경로 · 실제 이동용 아님**을 유지하며 실제 검증 경로·지정 대피소를 보장하지 않습니다. 이번 시연에서는 실제 GPS를 사용하지 않고 시연 위치 버튼을 이용합니다. 웹·Expo Go는 도식과 문자 대화를 사용합니다. Firebase 원격 푸시·실제 예측 모델은 미준비/제외 범위이며 실제119 연락은 시험하지 않습니다.

## 문서

- [구현 내용](docs/09-app-implementation.md)
- [현재 API 계약](docs/02-api-integration.md)
- [실시간 갱신·백그라운드](docs/03-realtime-background.md)
- [지도·음성 대화·상태 확인](docs/04-map-tts.md)
- [0.3.1 디자인·음성·시연 경로 검증](docs/12-demo-polish-voice-route.md)
- [네이버 지도 연결·0.2.1 APK 검증](docs/11-naver-map-integration.md)
- [검증 기록](docs/07-validation.md)
- [목업 감사와 API 공백](docs/08-live-integration-audit.md)
- [문서 안내](docs/README.md)

서명 키와 서비스 비밀값은 Git과 앱 공개 환경변수에 넣지 않습니다. 개발·실단말·APK 배포 검증을 구분해 기록합니다. Codex 작업은 [AGENTS.md](AGENTS.md)를 따릅니다.

사설 HTTPS 접속은 [Android 배포 문서](docs/10-android-delivery.md), 지도 키 주입 방식과 검증된0.2.1 APK 이력은 [네이버 지도 배포](docs/11-naver-map-integration.md)를 따릅니다. 0.3.1 APK·해시·실제 검증 결과는 [이번 패치 문서](docs/12-demo-polish-voice-route.md)에 기록합니다.
