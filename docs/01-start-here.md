# 개발 시작 안내

## 실행 환경

Node 24 LTS, npm, Git, Codex를 사용합니다. Expo SDK·React Native·React 조합은 `package-lock.json`으로 고정합니다. 현재 SDK 58 / React Native 0.88.1 / React 19.3.0 / TypeScript 6입니다. 최신 버전을 각각 따로 올리지 않습니다.

```sh
npm ci
cp .env.example .env
npm run start:go
```

`cp`는 최초 1회만 합니다. 기존 `.env`를 덮어쓰지 않습니다. 화면만 확인하려면 `npm run web`도 가능합니다. 같은 Wi-Fi의 기기에서 Expo Go QR로 열거나 웹 주소를 엽니다. UI 확인용 Expo Go는 실제 앱의 권한·푸시 검증을 대신하지 않습니다.

첫 실행에서 시연 안내와 합성 프로필을 저장하고 홈의 산불이나 공식 경보를 누릅니다. 긴급 화면 하단의 **모의 시연 제어**에서 대응 단계를 바꾸면 서버 모의 이벤트 → 다시 조회 → 단계·문장·색상 갱신을 확인할 수 있습니다. 시연 모드는 실제 안내·신고에 사용하지 않습니다. 모바일 지도 키가 없으면 ‘실제 도로가 아닌 도식’이 나옵니다.

## 실제 앱 빌드

공통 기반 담당이 지도 Client ID, Android FCM 설정, 앱 식별자를 준비합니다. `.env.example`의 항목만 채우고 환경 설정이 바뀌면 다시 빌드합니다.

```sh
# Android Studio와 SDK가 설치된 컴퓨터
npm run android

# Xcode가 설치된 Mac
npm run ios

# 이미 개발용 앱을 설치한 뒤 JS 개발
npm run start:dev
```

EAS 사용 시 계정·프로젝트·서명 설정 후 `npx eas-cli build --profile development --platform android`로 빌드합니다. 초기 틀에서 EAS 계정·프로젝트를 자동 생성하거나 빌드를 제출하지 않았습니다. 배포용 시연 APK는 `preview` 프로필로 만들 수 있습니다. 앱 ID `com.bonghwajigi.app`은 초기값이며 지도·푸시·서명 설정 전에 팀 값으로 확정합니다.

## 파일별 책임

| 위치 | 역할 |
| --- | --- |
| `app/index.tsx` | S1 홈·최근 재난 목록 |
| `app/emergency.tsx` | S2 공식 경보·개인 단계·대화·상태·2D 지도·행동요령 |
| `app/profile.tsx` | S4 사전 프로필·위치·알림 설정 |
| `app/rules.tsx` | S5 기본 수칙 |
| `src/mvp/ui.tsx` | 공통 카드·버튼·글자·색상 |
| `src/mvp/Map.tsx` | 현재 2D 도식(실제 지도 키 미준비) |
| `src/api/client.ts` | API 경로·요청 형식. 화면에서 URL을 다시 작성하지 않음 |
| `src/mvp/mock.ts` | 앱 개발용 모의 서버. 실제 판단 엔진이 아님 |
| `src/runtime/Runtime.tsx` | 단일 갱신 루프·캐시·앱 복귀 처리 |
| `src/platform/` | 위치·푸시·토큰·TTS 같은 단말 기능 |

S3 3D 화면과 버튼은 없습니다. 2D 경로는 S2 지도에 겹쳐 표시합니다. 화면 번호는 하단 탭 개수가 아닙니다.

## 개발 순서

1. 모의 모드에서 이미지에 맞게 화면을 완성합니다. 데이터 필드와 호출 함수는 유지합니다.
2. 빈 값·로딩·실패·확인 중·만료 화면을 같이 만듭니다.
3. 서버 주소와 로그인 계약이 준비되면 인증 제공자에서 SecureStore의 `access_token`에 토큰을 저장하도록 연결합니다.
4. `EXPO_PUBLIC_API_MODE=live`, 접근 가능한 HTTPS 주소로 전환합니다. 인증 발급·갱신 UI는 아직 없습니다.
5. 실제 Android 기기에서 지도·알림·잠금·절전·복귀를 검증합니다. 이후 iOS를 검증합니다.

## 검사

```sh
npm run check
npm run export:android
npm run export:web
```

타입 생성은 공통 담당만 변경합니다. 생성 결과 `src/api/generated.ts`는 커밋되어 있으므로 일반 화면 작업에는 아래 명령이 필요 없습니다.

```sh
npm run api:setup
npm run api:generate
```

현재 OpenAPI 생성기의 TypeScript 5 peer 요구와 앱의 TypeScript 6을 분리하기 위해 `tools/api-generator`에 별도 잠금 파일을 두었습니다. `--force`나 `--legacy-peer-deps`로 충돌을 숨기지 않습니다.

현재 실제0.2 계약과 인증은 [API 연결](02-api-integration.md), 구현 상세는 [Expo 구현](09-app-implementation.md)를 확인합니다. 로컬 내부 릴리즈 APK는 `node scripts/build-apk.mjs --help`로 재현 옵션을 확인합니다.
