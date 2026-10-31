# Previous Results

4 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 5. 목업 디자인 정렬과 음성 대화·시연 대피경로 연결

# 결과

목업 로고·간격·설정 절 바로가기·문구·버튼 대비를 반영했고, 후속 요청인 카드 색과 라운드 이음새도 수정했다. 한국어 음성 인식→서버 Qwen 대화→상태 제안→사용자 확인 후 저장, 실제 네이버 지도 위 합성 시연 경로를 연결했다. 음성 권한 재요청에 따른 즉시 취소를 0.3.1에서 수정했다. 실행 소스 c0b87ea2bab3ba769ebe3bfbbc91e140d0c12f0e, 서버 배포 414482274f9252056ac350c69d4687e7a1429d8b다.

## 검증

- `npm run check`: exit 0. TypeScript, 62개 테스트, 17개 문서 링크 검사 통과.
- `npm run export:web`: exit 0. 초기 0.3.0 웹 UI/대화 검증. 0.3.1은 native 음성 권한과 버전 변경 후 release 빌드로 확인했다.
- `git diff --check`: exit 0. 최종 문서의 `npm run check:docs`: exit 0.
- `loom validate --strict`: exit 0. 메타데이터 정합성 통과.
- 브라우저에서 설정 바로가기·상태 제안·확인 UI·카드 대비·연속 곡선을 확인했다.
- 서버 담당자: PostgreSQL 121개 테스트와 실제 Qwen 2개 발화, 확인 전 상태 불변/확인 후 경고·대피·위급 갱신, 멱등 재전송·오래된 제안 거절·합성 경로 검증.
- `node --env-file=.local-private/naver-map.env scripts/build-apk.mjs --no-minify --api-url https://inno-server-011.tail2dac17.ts.net`: exit 0. 0.3.1/code5, 깨끗한 소스, arm64 release, embedded JS, 동일 내부 서명.
- `adb -s R3CR30XB7FA install -r artifacts/apk/bonghwajigi-0.3.1-private-arm64.apk`: exit 0, Success. 설치된 versionName/code와 마이크 기존 허용 확인.
- 실기기 로고·지도 타일·진한 카드·연속 라운드·배너 제거를 CUA로 확인했다. 경로선·목적지 마커는 사용자와 CUA가 확인했다.
- 기존 마이크 권한을 재사용했고, 한국어 온디바이스 native 인식 시작/종료 로그를 확인했다. CUA에서 인식 문장과 계단 이용 어려움 제안을 확인했다. 사용자가 음성 인식과 상태 반영 모두 정상임을 확인했다.

- 서버 DB 읽기 대조: 실제 단말의 Qwen 발화 기준 context 4 이후 5, 정책 revision14 경고→15 대피를 확인했다. 원문·식별자 없는 증거를 docs/validation/android-polish-server-evidence.json에 보관했다.

## 산출물

- docs/12-demo-polish-voice-route.md
- docs/validation/android-polish-build.json
- docs/validation/android-polish-verification.json
- docs/validation/android-polish-speech.png
- artifacts/apk/bonghwajigi-0.3.1-private-arm64.apk (Git 제외, 66,088,154 bytes)
- APK SHA256: c30826365bc023074bdfdc86372e47e8ae780a431ed3ac2caadc5856d79312fe

## 범위와 인계

실제 GPS/119/실제 예측/Firebase/검증된 실제 안전 경로는 포함하지 않는다. 합성 경로의 운영 불가 표시는 유지한다. 기존 TTS 청취는 이전 회차 사용자 확인이며 이번 회차 음질은 별도 재검증하지 않았다. 앱 원격 동기화 후 배포 저장소 고정은 연계 Task task-20261031-185631-apk-a4dea90a에서 최종 앱 커밋을 사용한다.

## 6. 지역 행동요령·공통 개인 준비 카드와 촬영용 앱 흐름 연결

# 결과

앱0.4.0/versionCode6을 구현·기존삼성폰설치했다. 지역행동요령, 공통위/개인아래준비카드, 확인된현재상태, 현재발화1개, 화면시연문구제거, 신규전경경보배너/로컬알림을연결했다. 실제네이버지도와지역카드·신규배너를CUA로확인했고사용자는알림음1회·위급3단계·아이질문을확인했다.

## 검증

TypeScript,78 tests,문서링크,웹번들통과. Android release 2분20초빌드·업데이트설치성공. 기존마이크/알림허용유지. 런타임오류로그없음. 웹A/B질문→명시확인→태그/행동/경로검증. 실제서버141검사및새A/B실모델파이프라인완주와API계약일치. APK SHA256 7b7f44d5f39de3c540e14bae65ea17f1cea907fcde39aa3336ec747376a4fec7.

## 산출물

docs/13-location-guidance-scenarios.md, docs/validation/android-filming-*.json/png. artifacts/apk/bonghwajigi-0.4.0-private-arm64.apk. 전체A/B음성촬영은이적용후사용자가이어간다.
