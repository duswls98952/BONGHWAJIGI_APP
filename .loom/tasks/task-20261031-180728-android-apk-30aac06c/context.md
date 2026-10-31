# Context

## Loom 코드 계약

아래 항목은 Loom 코드에 고정된 runtime 동작 계약입니다. 관련 흐름을 바꾸기 전 `loom contract show <id>`로 확인합니다.

- `task-execution`: Task 실행 전 prompt/context/previous-results에 들어가는 입력 경계입니다. 명령: `loom contract show task-execution`. Source: `loom/application/context_pack.py`, `loom/application/team_policy.py`
- `done-guardrail`: Task를 DONE으로 인정하기 전에 필요한 산출물과 상태 전이를 검증하는 계약입니다. 명령: `loom contract show done-guardrail`. Source: `loom/application/services.py`

## Project Memory

# BONGHAWJIGI_APP

Loom 프로젝트 메모리 루트입니다.

이 파일은 `loom init`으로 생성되며 `loom analyze-repo`로 보강할 수 있습니다.

## Workspace Policy

- Output language: `ko`
- Agent provider: `claude`
- Agent model: `adapter-default`
- Reasoning effort: `high`
- Required branch: `develop`
- Dirty branch switch: `blocked`
- Commit policy: `manual`
- Include `.loom` metadata in Git: `yes`
- Read-only parallel execution: `allowed`
- Validation environment: `auto`
- Previous Task result limit: `2`
- Workspace required docs: -
- Loom fixed guardrails and verified Team required policies take precedence over this Workspace Policy.

## Job

- Title: 완성 목업의 앱 구현과 실서버 통합·APK 배포
- Goal: 사용자가 완성한 HTML 목업을 개발 서버에서 전 화면 확인하고 최신 서버 계약의 공백을 대조한다. Expo 앱에 화면과 동작을 구현해 실제 서버로 기능을 검증하고 설치 가능한 Android APK와 인수 자료를 제공한다. 배포 저장소는 앱 원격을 서브모듈로 고정한다. 기존 실제 예측 제외와 Firebase 미준비 조건은 유지한다.
- Branch: develop
- Task count: `4`

## Task

- Title: 네이버 지도 연결과 Android APK 실기기 검증
- Description: 사용자가 Maps Client ID를 제공하고 연결을 직접 지시했다. 현재 MVP 2D 도식을 네이버 지도에 연결하고 유효한 위치와 서버 관련 영역을 표시한다. 실패·위치 없음·만료를 구분하고 동일 내부 서명 APK를 업데이트하여 휴대폰에서 검증한다.
- Expected output: 네이버 지도 MVP 컴포넌트, 키 없는 웹 도식 유지, 서명 APK와 단말 검증 문서, 원격 앱 및 메인 서브모듈 갱신
- Done condition: 등록된 Client ID로 Android 실제 도로 지도가 표시되고 최신 위치/관련 영역 및 오류/미입력 상태가 정확하다. 앱 검사와 단말 검증을 통과하고 APK·Loom·원격 고정을 기록한다.
- In scope: 현재 MVP 지도 연결; 개인 Client ID 로컬 보관과 네이티브 주입; 합성 위치/관련 범위; 인증/로딩 실패; Android 재빌드/설치/검증; 테스트/문서/Loom; 원격/서브모듈 갱신
- Out of scope: Client Secret 사용/복사; 지도 계정 설정 변경; 실제 대피 경로 계산; 실제 예측/학습 변경; Firebase; 3D; 사용자 동의 없는 실제 GPS 전송
- Validation hint: npm run check, Android/Web export, APK 서명·manifest, 실제 Android 지도 표시/좌표/오류·만료, 원격/submodule pin, Loom strict
- Required docs: `docs/04-map-tts.md`, `docs/10-android-delivery.md`, `docs/02-api-integration.md`
- Memory refs: -
- Document outputs: `docs/11-naver-map-integration.md`
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: foreground

## Advisor Source Prompt

No Advisor source prompt recorded for this Task.

## Inclusion Policy

- Mandatory execution files: `prompt.md`, `context.md`, and `previous-results.md`.
- Always included: project memory, current Job/Task metadata, and Job notes.
- Previous results: up to the latest 2 recorded results from earlier Tasks in this Job.
- Job context refs: explicit Job-scoped references selected by the controlling agent or user.
- Task required docs: mandatory Task-scoped documents; missing refs block validation and execution.
- Task memory refs: mandatory Task-scoped workflow memory references; missing or non-memory refs block validation and execution.
- Repository documents, validation documents, and skill rules: included only through explicit Job context refs, Task required docs, or Task memory refs.
- Verified Team Policy Snapshot: included before Active Memory; required policy cannot be overridden by lower-priority context.
- Active workflow memory with an `always` category is included automatically while its status is `ACTIVE`.
- `task_selected` and `reference_only` memory is included only through explicit Task memory refs.
- Consumed proposals, rejected proposals, resolved memory, superseded memory, and archived memory are excluded.
- Unreferenced repository files and results from other Jobs are not included.
- `AGENTS.md` and `CLAUDE.md` remain session-level controlling-agent entrypoints and are not treated as task context artifacts by default.

## Job Notes

# Notes

## Context References

No explicit context references recorded for this job.

## Required Documents and Memory

### required-doc: docs/04-map-tts.md

- Path: `docs/04-map-tts.md`
- Status: present

# 2D 표시·대피 경로·단말 TTS

2026-11-01 KST 기준 **3D는 MVP에서 제외**한다. 네이버 지도 Client ID와 Android 앱 등록은 사용자가 아직 준비되지 않았다고 확인했다. 실제 지도·실제 대피 경로·푸시 전달을 현재 구현 완료로 표시하지 않는다.

## 현재 지도 화면

현재 홈·긴급·대피로는 `src/mvp/Map.tsx`의 2D 도식을 사용한다. ‘지도 연결 준비 중 · 실제 도로가 아닌 도식’을 표시한다. 서버에서 받은 관련 지역 bounding box와 유효한 공유 위치가 있을 때만 범위·위치 점을 표시한다. 지역 사각형은 실제 화선이나 대피 경로가 아니다. 목업의 예시 지명·도로·날씨를 실제 기본값으로 사용하지 않는다.

의존성에는 `@mj-studio/react-native-naver-map` 2.9.1과 Client ID 조건부 네이티브 설정이 있다. 이전 `src/components/DisasterMap.native.tsx`는 구형 화면용 코드이며 현재 MVP Map을 자동으로 대체하지 않는다. **Client ID 입력만으로 현재 화면의 실지도가 완성되는 것은 아니다.**

실지도를 연결할 때는 등록된 Android package `com.bonghwajigi.app`, Client ID, 네이티브 빌드를 확인하고 현재 MVP Map에 연결해야 한다. 실제 도로·위치·입력 영역 표시, 인증 실패, 네트워크 장애를 단말에서 검증한다. Secret은 앱 코드나 EXPO_PUBLIC 변수에 넣지 않는다.

## 현재 서버의 경로 응답

```http
GET /v1/me/responses/{response_id}/route
Authorization: Bearer <user access token>
```

```json
{"status":"unavailable","route":null,"reason":"NO_VERIFIED_ROUTE_GEOMETRY"}
```

위 JSON은 envelope의 data 부분이다. 현재 서버는 검증된 대피 경로 좌표를 제공하지 않는다. `createMvpApi.route()` 함수는 준비되어 있고 화면은 경로 미제공을 명시한다. 대피로 화면은 현재 서버 경로를 반복 요청하거나 임의의 선·고도·회전 안내를 생성하지 않는다.

이전0.1의 response_revision 쿼리, 3원소 경로 좌표, route_3d 플래그, mock 경로선은 현재0.2 기능이 아니다. 이전 `EXPO_PUBLIC_ROUTE_2D_CONTRACT_ENABLED` 설정도 현재 MVP Map에 검증된 경로를 생성하지 않는다.

실제 경로를 추가하려면 서버가 통제 상황·보행 가능 여부·접근성·검증시각·유효기간·정책 입력 버전에 맞는 경로 계약과 공급자를 확보해야 한다. 지도 배경 표시와 대피 경로 검증은 별개다. 장소에 도착했다는 사용자 선택도 안전한 대피 완료나 기관의 구조 접수로 자동 변환하지 않는다.

## 서버 텍스트를 기기에서 읽기

서버 `content.assistant_utterance`는 검토된 정책 질문·행동 텍스트와 id, valid_until, source=reviewed_policy_text를 제공한다. `src/platform/useTts.ts`가 expo-speech로 현재 발화 한 개를 읽는다. GPU 음성 모델과 서버 오디오 파일은 사용하지 않는다.

- 음성은 기본 off다. 사용자가 긴급 화면의 읽기 버튼으로 켠다.
- 정책 ID·revision·발화 ID가 바뀌면 이전 읽기를 멈추고 새 문장을 읽는다. 같은 발화를 반복 수신해도 자동 재생을 중복하지 않는다.
- 최신 입력 버전이 반영되지 않았거나 정책이 만료·오류·unknown이면 읽지 않는다.
- 화면 이탈·백그라운드 전환 시 중단한다. 파형은 실제 TTS 재생 상태에 연결한다.
- 한국어 ko-KR, 속도0.9를 요청한다. 음성 설치·발음·오프라인·블루투스·통화 중 동작은 단말 확인이 필요하다.
- 소리 강제 증폭, 무음 우회, 앱 강제 종료 후 지속 재생은 제공하지 않는다. 푸시 알림 소리와 TTS는 별개다.

STT·마이크 입력·전체 대화 이력·서버 voice-turns UI는 현재 구현하지 않는다. 사용자는 현재 상황을 선택한 뒤 직접 확인해 저장한다.

## 119 연결 준비

`src/mvp/Support.tsx`는 사용자가 확인할 수 있는 수정 가능한 초안을 기기에서 만든다. 유효한 공유 위치와 확인된 이동·도움 상태만 참고하고 건강 메모를 자동 포함하지 않는다. 전화 앱 열기는 추가 확인을 거치며 문자도 작성 화면으로 넘긴다. 앱이 자동으로 전화하거나 메시지를 전송하지 않는다.

mock과 웹에서는 실제 전화·문자 연결을 차단한다. LIVE Android에는 사용자 선택에 따른 기기 연결 코드가 있으나 실제119 연락은 시험하지 않는다. 초안 생성·전화 화면·문자 작성 화면·전송·접수는 서로 다른 상태다.

현재 코드·회귀검사와 실제 기기 검증은 [검증 기록](07-validation.md)에서 구분한다. JS 번들 성공만으로 네이버 지도나 TTS의 실기기 동작이 확인된 것은 아니다.

### required-doc: docs/10-android-delivery.md

- Path: `docs/10-android-delivery.md`
- Status: present

# Android 내부 배포 및 실서버 검증

2026-11-01 KST. Loom `task-20261031-170037-android-https-apk-eab2688e`.

## 배포물

- APK: `artifacts/apk/bonghwajigi-0.2.0-private-arm64.apk` (Git에는 바이너리·서명키를 포함하지 않음).
- 앱: `com.bonghwajigi.app`, versionName `0.2.0`, versionCode `2`, Android arm64.
- 최종 SHA256: `fe6892591e5224f5b982d53ce0536425f4a44290182477b865b922a63b2ad5e9`.
- 고유 내부 release 서명, non-debuggable, JS/Hermes 번들 내장. Metro·Expo Go 없이 실행한다.
- [빌드·서명·권한 검사 결과](validation/android-build.json).
- 마지막 빌드는 내부 배포용 `--no-minify`를 사용했다. 코드 축소만 끄며 서명·TLS·앱 인증은 유지한다.

연결한 Samsung SM-G996N(Android 15)에 `adb install -r`로 설치하고 실행했다. 업데이트 설치에서도 기존 시연 계정을 유지했다. Play Store 공개 배포나 iOS 배포는 포함하지 않는다.

## 접속 조건

API 주소는 `https://inno-server-011.tail2dac17.ts.net`이다. 휴대폰에서 같은 Tailnet에 연결해야 한다. 일반 인터넷에서 공개 접속하는 주소가 아니다.

사용자가 승인한 두 기기(Mac `100.109.205.75`, 휴대폰 `100.83.238.120`)에서 일반 서버 `100.116.5.9`의 TCP 443으로만 접근을 추가했다. Tailscale Serve가 서버 loopback API로 전달하고 앱 세션 인증을 유지한다. Funnel이나 DB 공개 포트는 추가하지 않았다. 이 APK는 USB 포트 전달을 사용하지 않는다.

서버는 실제 API/DB/큐를 사용하지만 데이터 모드는 `simulation`이다. 앱의 LIVE는 서버와 실제 통신한다는 뜻이며 재난 실운영 전환을 뜻하지 않는다. 합성 시나리오 `mobile-demo` / `mobile-fire`는 원격 서버의 별도 시연 입력이다.

## 휴대폰에서 시연하기

1. Tailscale을 켜고 봉화지기 앱을 연다. 최초 실행에서 합성 정보로 시연 동의·프로필을 저장한다.
2. 기본 비교 프로필은 독립 보행·계단 가능이다. 이름·연락처·건강 메모 등 실제 개인정보는 시연에 필요하지 않다.
3. 내정보 아래 `합성 시연 위치 → 시연 위치로 안내 확인`을 누른다. GPS 대신 합성 좌표 `36.4, 129.35`를 보낸다. 좌표는 5분 후 만료되므로 필요할 때 다시 누른다.
4. 홈의 공식 경보 또는 주변 시연 산불을 열어 공식 원문과 개인 안내를 확인한다.
5. 기본 조건에서는 경고(1단계), `지금 계단 이용이 어려워요`를 선택하고 상태를 저장하면 대피(2단계), `빠져나가기 어려워요`를 선택하고 저장하면 위급(3단계)으로 평가되는 시나리오다. 단계는 서버가 결정한다.
6. 휴대폰 무음 설정과 미디어 음량을 확인한 뒤 `이 안내 음성으로 읽기`로 최신 검토 문장을 읽는다. 끄고 다시 켜면 같은 안내를 재생할 수 있다.
7. 119 버튼은 사용자가 수정할 초안과 연락 준비 화면이다. 시연에서 실제 전화·문자 전송을 실행하지 않는다.

새 상태를 저장한 직후에는 서버가 해당 입력 버전을 반영할 때까지 이전 행동 안내를 보류한다. 화면을 벗어나거나 앱이 백그라운드로 가면 TTS를 중단하며 복귀 시 최신 자료를 재조회한다. 위급 표시가 자동 신고 완료를 의미하지 않는다.

## 검증 결과

| 대상 | 결과 |
| --- | --- |
| TypeScript·앱 회귀·문서 | `npm run check` 통과, 40개 테스트 |
| Web / Android JS | 양쪽 export 성공, 최종 native 빌드에서 변경된 Hermes 번들 재생성 |
| Android native | release 빌드 성공, 서명·arm64·내장 JS·non-debuggable 검사 통과 |
| 권한·통신 설정 | 평문 통신 false, loopback 예외 없음, 직접 통화/SMS·저장소·오버레이 권한 없음 |
| 서명 실패 경로 | 서명키 환경 없이 release dry-run은 의도대로 실패, debug 키 대체 없음 |
| 일반 서버 | 104개 테스트 통과. HTTPS 등록·세션·프로필·위치·공식 경보·3단계·cursor·로그아웃 검증. 시계 보정 배포 후 위치·상태 +0.6초 수용과 +40초 거절을 실서버에서 대조 |
| 실제 Samsung | 설치, 합성 프로필 저장, 세션 발급, 공식 원문, 수칙·사전준비, 강제 종료 후 세션 복원·재접속 확인 |
| 단말 단계별 갱신 | 사용자 직접 조작과 같은 단말 계정의 서버 기록을 대조해 경고1 → 대피2 → 위급3 확인 |
| TTS 실제 소리 | 사용자가 휴대폰 무음을 해제한 뒤 정상 청취 확인. 서버 텍스트를 단말 TTS로 재생 |

[실제 단말 홈 화면](validation/android-home.png)은 실서버의 합성 경보를 표시한 증거다. 웹 mock 화면 증거와 구분한다. 미러링 자동 조작 중 화면 전환과 창 캡처 오류가 반복되어 추가 단말 검증은 사용자 직접 터치 결과와 서버 저장 결과를 대조한다.

### 단말에서 발견한 입력 시간 오류

위치 버튼을 눌렀을 때 `입력 내용과 동의 항목을 다시 확인해 주세요`가 나타났고 위치가 저장되지 않았다. 같은 시각에 측정한 휴대폰 시계가 서버보다 약 0.603초 빠른 반면, 서버는 미래 시각을 모두 거절하고 있었다. 서버 커밋 `959ab56`에서 위치·현재 상태 입력의 30초 이내 미래 시각을 수신 시각으로 보정했다. 5분 유효기간은 서버 시각을 기준으로 제한하며, 범위를 넘는 시각과 오래된 위치 재전송은 계속 거절한다. 실제 서버에서 +0.6초 입력으로 경고→대피→위급 갱신을 확인했고, 사용자 단말의 동일 흐름도 별도로 확인했다.

앱은 시연 위치 버튼 바로 아래 진행·성공·오류를 표시하도록 개선했다. 허용 범위를 넘는 시계 오류는 날짜·시간 자동 설정 안내로 구분한다. 최종 APK 실행 소스는 `0716c49`이며 서버 수정 때문에 APK를 다시 설치할 필요는 없다.

### 최종 단말 대조 결과

2026-11-01 KST 사용자 직접 조작으로 확인했다. 서버의 같은 단말 계정에서는 위치 revision 1과 현재 상태 revision 2가 저장됐고, 정책 기록은 다음 순서로 갱신됐다. 계정 ID와 인증 토큰은 검증 산출물에 포함하지 않는다.

| 서버 기록 시각(KST) | 정책 revision | 단말 표시 |
| --- | --- | --- |
| 02:43:08.895844 | 2 | 경고 / 나의 대응 1단계 |
| 02:43:26.102004 | 3 | 대피 / 나의 대응 2단계 |
| 02:43:34.242662 | 4 | 위급 / 나의 대응 3단계 |

사용자가 단계 갱신을 확인했고, 음성은 추가 점검 후 “내가 무음 해놔서 그랬음 소리잘남 확인”으로 최종 청취를 확인했다. 음성 엔진의 로그나 파형만으로 청취 성공을 판단하지 않았다. 실제 119 통화·문자는 실행하지 않았다. [단말 검증 기록](validation/android-native-verification.json)에 검증 방법과 범위를 남겼다.

## 현재 미제공 또는 미검증

- Firebase 미준비: 원격 푸시 연결 코드·모의 발송은 있으며 실제 기기 푸시 수신은 미검증. 전경 갱신과 앱 복귀 재조회는 별도다.
- 네이버 지도 Client ID 미준비: 실제 도로 지도 대신 명시된 2D 도식. 실제 대피 경로는 서버 `unavailable`이다.
- 실제 XGBoost 추론은 사용자 요청에 따라 연결 제외. 확률은 unavailable/null로 유지한다.
- 실제 GPS·OS 위치 권한·백그라운드 위치·절전/잠금 수신·iOS는 이번 합성 단말 검증에 포함하지 않았다. 현재 빌드는 백그라운드 위치를 기본 비활성화한다.
- 내부 시연 등록은 정식 본인인증·공개 서비스 약관 확정·계정 탈퇴 기능을 대신하지 않는다.

## 같은 APK 재빌드

Node 24, JDK 21, Android SDK/NDK와 Gradle 캐시를 준비한 뒤 다음을 실행한다. 아래 임시 도구 경로는 이번 Mac의 검증 환경이다.

```sh
env PATH=/private/tmp/bonghwajigi-node24/node_modules/node/bin:$PATH \
  ANDROID_HOME=/private/tmp/bonghwa-android-sdk \
  ANDROID_SDK_ROOT=/private/tmp/bonghwa-android-sdk \
  GRADLE_USER_HOME=/private/tmp/bonghwa-gradle \
  EXPO_PUBLIC_DEMO_LATITUDE=36.4 EXPO_PUBLIC_DEMO_LONGITUDE=129.35 \
  node scripts/build-apk.mjs --no-minify \
  --api-url https://inno-server-011.tail2dac17.ts.net
```

스크립트는 네이티브 설정이 달라지면 재생성하고, 같으면 Gradle 입력 검증을 거쳐 캐시를 사용한다. API URL·모드·시연 좌표 변경도 번들을 다시 만든다. 환경의 `.env`를 자동 로드하지 않는다.

서명 파일은 `.local-private/android-signing/release.p12`와 `store-password.txt`에만 있다(디렉터리700, 파일600). 동일 키를 보존해야 기존 앱 위에 업데이트할 수 있다. Git·앱·문서에 비밀번호를 포함하지 않는다. 정식 배포 전에 팀이 이 두 파일의 비공개 백업과 관리자를 정해야 한다.

## 저장소 배포 연결

서버 저장소는 `apps/mobile`에 앱 원격을 서브모듈로 고정한다. 일반 서버 Python 이미지 빌드에는 앱 소스를 넣지 않는다. 서버 저장소의 `docs/V2/delivery/mobile-submodule-deployment.md`가 초기화·고정 커밋 검증 절차의 정본이다. 최종 커밋과 원격 동기화 결과는 Loom 결과에 기록한다.

### required-doc: docs/02-api-integration.md

- Path: `docs/02-api-integration.md`
- Status: present

# 현재 MVP API 연결

2026-11-01 KST 기준 앱은 **0.2.0-mvp** 서버 계약을 사용한다. [현재 OpenAPI](api/mvp-openapi.json), [원본 커밋·SHA256](api/mvp-provenance.json), [합성 응답 캡처](api/mvp-fixtures.json)가 기준이다. 이전 `upstream-openapi.yaml`, `generated.ts`, `createApi`와 구형 테스트는 이력으로 남아 있으며 현재 화면의 계약이 아니다.

현재 호출 경로는 `app/*` → `src/mvp/*` → `src/api/client.ts`의 `createMvpApi`다. `src/mvp/api.ts`가 mock/live와 인증을 연결한다. LIVE 오류를 mock 응답으로 자동 대체하지 않는다. `live`는 실제 서버에 HTTP 요청한다는 앱 설정이며, 현재 서버 응답의 `meta.mode`와 정책의 `content.mode`는 계속 `simulation`이다.

## 경로와 화면 연결

| 기능 | 현재 API | 주요 사용처·상태 |
| --- | --- | --- |
| 설치 등록 가능 여부 | GET `/v1/auth/config` | 공개 조회 함수 제공; 설치 시연 활성 여부·동의 버전 |
| 설치 계정 발급 | POST `/v1/auth/installations` | 온보딩에서 설치 ID와 필수 동의 제출 |
| 세션 갱신 | POST `/v1/auth/refresh` | 인증 실패 시 refresh token을 교체하고 원 요청을 한 번 재시도 |
| 기능 설정 | GET `/v1/app-config` | **사용자 인증 필요**; 기능·알림 제공자 확인 |
| 홈 | GET `/v1/home` | `nearby_disasters`, `basic_rules`, `location`, `features`, `preparations`, `alerts` |
| 공식 원문 | GET `/v1/me/alerts/{alert_id}` | 소유권이 확인된 경보·기관 등급·수정/해제 상태 |
| 개인 안내 | GET `/v1/me/responses/{response_id}` | `id`, `revision`, `pending_update`, `content`, `user_context` |
| 변경 통지 | GET `/v1/me/updates?wait_seconds=25&cursor={cursor}` | 최초에는 cursor 없이 `wait_seconds=0`; 이후 반환된 `next_cursor` 사용 |
| 사전 정보 | GET/PUT/DELETE `/v1/me/profile` | 프로필 폼·저장·삭제; `revision`, `input_revision` |
| 사전준비 카드 | GET `/v1/me/preparations` | 서버 선정 카드 최대2개. 홈에도 동일 구조 포함 |
| 위치 | GET/PUT/DELETE `/v1/me/location` | 측정 좌표·정확도·측정시각·설치 ID; 현재 위치 공유와 삭제 |
| 확인한 현재 상태 | PUT `/v1/me/responses/{response_id}/context` | 사용자 확인과 기준 revision을 제출; 202 이후 새 정책 대기 |
| 알림 선호 | GET/PUT `/v1/me/preferences` | 호출 함수 제공. 현재 UI의 알림 권한 등록은 devices API 사용 |
| 단말 등록·해제 | PUT/DELETE `/v1/me/devices/{installation_id}` | 설치 정보·OS 알림 권한·준비된 경우 native FCM 토큰 |
| 경보 표시·열기 기록 | POST `/v1/me/alerts/{alert_id}/receipts` | 전경 긴급 화면에서 실제 표시/열기 기록; 중복키 사용 |
| 로그아웃 | POST `/v1/me/logout` | 서버 세션 해제 요청과 기기 세션 삭제 |
| 산불 수칙 | GET `/v1/safety-rules/wildfire` | 검토된 `items`, `avoid`, 출처·버전 |
| 대피 경로 | GET `/v1/me/responses/{response_id}/route` | 현재 `{status:"unavailable",route:null,reason}`. 호출 함수만 제공하며 화면은 미제공 안내 |

현재 앱은 `voice-turns`나 서버 `support-drafts`를 호출하지 않는다. 서버 음성·채팅 및 서버 신고 초안 기능은 현재 범위에서 비활성이다. 119 초안은 기기에서 사용자가 확인·수정하고 전화/문자 앱으로 넘긴다. [지도·TTS](04-map-tts.md), [남은 서버·단말 연결](06-server-handoff.md)을 함께 참고한다.

## 응답과 대응 단계

성공 응답은 `{meta,data}`다. HTTP 계층은 `meta.schema_version="0.2.0-mvp"`, mode, data 존재 여부를 검사하고 204는 JSON으로 파싱하지 않는다. 서버 오류의 `code` 또는 문자열 `detail`, 상태 코드, `Retry-After`를 `ApiError`로 전달한다. 화면별 런타임 검사는 OpenAPI 전체 JSON Schema 검증을 대신하지 않는다.

```ts
const result = await mvpApi.snapshot(responseId);
const content = result.data.content; // 재평가·미제공 시 null 가능
const level = content?.personal_response.level;
const label = content?.personal_response.label;
const text = content?.assistant_utterance?.text;
```

| 구분 | 현재 필드 | 의미 |
| --- | --- | --- |
| 공식 기관 등급 | `AlertData.official_severity` | 발령기관 원래 등급; 개인 단계와 별도 표시 |
| 개인1단계 | `prepare / 1 / 경고` | 서버가 확정한 준비·확인 안내 |
| 개인2단계 | `act / 2 / 대피` | 서버가 확정한 대피 안내 |
| 개인3단계 | `request_assistance / 3 / 위급` | 서버가 확정한 도움 요청 안내; 자동 신고 아님 |
| 기타 상태 | `information` 또는 `unknown`, number=null | 단계 번호를 임의로 부여하지 않음; unknown은 안전이 아님 |
| 예측 | `content.prediction` | 현재 unavailable, probability=null, used_for_response_level=false |
| 행동·발화 | `content.actions`, `content.assistant_utterance` | 검토된 서버 행동과 reviewed_policy_text |

색상은 서버 단계의 표시 수단이다. 앱이 확률·거리·사용자 프로필로 위험도를 계산하거나 단계 변경을 결정하지 않는다. 공식 경보 해제도 사용자가 안전하다는 뜻으로 바꾸지 않는다.

## 설치 세션과 개인정보

온보딩은 `internal-demo-v1` 필수 동의, 설치 계정 발급, 단말 등록, 프로필 저장을 완료한 뒤 홈으로 이동한다. 공개 시연 등록은 서버 설정으로 활성화해야 하며 일반 회원가입·휴대폰 본인 인증 기능이 아니다. 서버 토큰을 앱에 내장하지 않는다.

- Android/iOS는 SecureStore에 origin과 세션 묶음을 저장한다. 웹 개발 화면은 메모리 저장이며 새로고침하면 연결 정보가 사라진다.
- 401이면 동시에 실패한 요청들이 하나의 refresh 작업을 공유한다. 토큰 교체 중 로그아웃·다른 계정 연결이 발생하면 이전 결과를 폐기한다.
- API 주소가 달라지면 저장된 다른 origin의 자격 정보를 사용하지 않는다. EXPO_PUBLIC 변수에는 공개 주소·기능 설정만 둔다.
- 기본은 HTTPS다. USB 개발용 `EXPO_PUBLIC_ALLOW_LOOPBACK_HTTP=true`는 localhost, 127.0.0.1, ::1, Android emulator의 10.0.2.2에만 HTTP를 허용한다. 사설망 IP 전체를 HTTP로 허용하는 설정이 아니다.
- 건강 메모는 선택 동의 후 입력한다. 동의 해제 시 앱 입력을 지우고 서버도 관련 저장·캐시 삭제 규칙을 적용한다. 프로필 삭제와 계정 탈퇴는 별개이며 계정 탈퇴 UI는 제공하지 않는다.
- 로그아웃은 서버 해제 요청과 로컬 세션 삭제를 수행한다. 서버 해제가 확인되지 않으면 해당 한계를 알린다.

## 쓰기·갱신 규칙

프로필은 `base_revision`과 전체 profile을 PUT한다. 폼을 읽었던 revision을 유지하며 409가 나면 최신 자료를 다시 읽고 사용자가 변경을 확인한다. 최신 revision을 덧씌워 강제 저장하지 않는다.

현재 상태는 `observed_at`, `confirmation:"user_confirmed"`, `base_revision`, `overrides`, `state`를 보낸다. 서버나 모델의 제안만으로 확인 상태를 자동 저장하지 않는다.

프로필·위치의 표시용 `revision`과 정책 입력용 `input_revision`은 구분한다. 수락한 입력 버전 이상이 `content.input_versions`에 반영될 때까지 이전 개인 행동·음성 안내를 보류한다. 현재 상태 키는 `state:{incident_id}/{user_id}`이므로 다른 사건의 상태 변경이 현재 사건을 막지 않는다. 응답 ID 불일치, 낮은 revision, 동일 revision의 더 오래된 생성시각도 적용하지 않는다.

| 오류·상태 | 처리 |
| --- | --- |
| 401 | 단일 갱신 후 한 번 재시도; 갱신 실패 시 연결 종료·온보딩 안내 |
| 404 | 리소스 미존재·접근 불가 표시; 다른 사용자 데이터로 대체하지 않음 |
| 409 | 최신 정보 불러오기·사용자 재확인 |
| 400/410 cursor 오류 | cursor 초기화 후 전체 재조회 |
| 429 | Retry-After 대기 |
| 통신 실패·5xx | 지연 상태·재연결; LIVE 실패를 모의 성공으로 바꾸지 않음 |
| pending/expired/unknown | 이전 개인 행동·TTS 보류; 공식 원문은 별도로 확인 가능 |

현재 타입을 갱신할 때는 서버 OpenAPI 사본과 provenance를 함께 갱신한 뒤 `npm run api:generate:mvp`를 실행한다. `--default-non-nullable false`는 서버의 빈 초기 프로필처럼 기본값 필드가 실제 응답에서 생략될 수 있는 계약을 보존한다. 생성 타입을 직접 수정하지 않는다.

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
