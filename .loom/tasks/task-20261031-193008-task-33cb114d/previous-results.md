# Previous Results

3 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 4. 네이버 지도 연결과 Android APK 실기기 검증

# 결과

Android 0.2.1/code3에 네이버 2D 지도와 유효 좌표·정확도·사건 관련 범위를 연결했다. 현재 위치 없는 전국 보기, 만료·삭제 입력 보류, 후속 카메라 이동과 지도 재시도를 구현했다. Client ID는 Git 제외·권한600 파일에서만 주입하며 Client Secret은 저장하거나 사용하지 않았다.

Node24 TypeScript·45개 테스트·문서 링크 검사와 웹/native release 빌드를 통과했다. 기존 서명으로 Samsung Android15에 업데이트 설치했고 CUA에서 실제 전국 지도·지명·저작권과 합성 위치 저장 후 마커·좌표·카메라 이동을 확인했다. 사용자는 경보 상세에서 붉은 관련 영역과 위치 마커가 함께 보임을 확인했다. 같은 단말의 위치 revision2, 사건 bounds와 정책 반영을 서버 읽기 기록으로 대조했다.

APK `artifacts/apk/bonghwajigi-0.2.1-private-arm64.apk`, SHA256 `5d4b2cb00adead0d2f6e2e1f51c76c32819c6b7b5095189549dd8fc0079aee25`, 실행 소스 `66c4d734287549d6403c429ca42e6fdb44d38d2b`. 빌드 시 dirty는 README와 안내 문서 네 개만 수정한 결과이며 실행 소스는 동일하다. 상세/화면/검증 JSON은 `docs/11-naver-map-integration.md`와 `docs/validation/android-map-*`에 기록했다.

웹·Expo Go는 명시된 도식이다. 실제 GPS·백그라운드 위치·Firebase·iOS·검증된 대피 경로·실제 예측과 119 연락은 이번 범위에 포함하지 않는다. 키 오류·비행기 모드 검증은 하지 않았다. 앱 QA 커밋 ced24463bb79a6ef5d3b532f6d2a48215ca84a56를 원격 develop에 반영했다. 메인 ad0d34dd67bf7bf21829fc1bffd291f06c35b4d2의 apps/mobile이 이 SHA를 가리키며 실제 GitHub 재귀 clone에서 main/app clean 및 API 계약·소스 검사를 통과했다.

## 검증

- `npm run check`: exit 0, TypeScript 및 45 tests passed.
- `npm run export:web`: exit 0, 웹 번들 생성 성공.
- `node --env-file=.local-private/naver-map.env scripts/build-apk.mjs --no-minify --api-url https://inno-server-011.tail2dac17.ts.net`: exit 0, BUILD SUCCESSFUL 및 서명·권한 검사 통과.
- `npm run check:docs`: exit 0, 16개 문서 링크 검사 통과.
- `git diff --check`: exit 0.
- `loom validate --strict`: exit 0, 4 jobs/73 tasks 검증 통과.
- 실제 Samsung에서 지도·위치 마커 관찰 및 사용자 영역 확인, 메인 새 재귀 clone 검증 완료.

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
