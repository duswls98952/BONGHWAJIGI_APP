# Previous Results

## 1. Expo 앱 실행 틀과 실시간 API 연동 및 Codex 개발 지침 작성

# 결과

Expo SDK 58 / React Native 0.88.1 / TypeScript 기반 앱 시작 틀과 Codex 인계 문서를 develop에 구현했다. 모의 모드에서 홈·긴급 안내·프로필·수칙, 서버 단계·발화 갱신을 바로 시험할 수 있다. V2 OpenAPI와 예제를 출처/해시와 함께 복사하고 생성 타입·live 어댑터·모의 서버·long polling을 연결했다.

3D를 제외하고 네이버 2D 지도 연결 지점과 기존 route 재사용을 문서화했다. 앱 TTS, 권한·푸시·백그라운드 위치 연결 지점 및 OS 제약을 구현/기록했다. AGENTS.md는 이미지 기반 UI 요청에서도 API·서버 판단·유효시간을 보존하도록 규정한다.

검증: npm run check (타입·14개 핵심 테스트·10개 문서 링크) 통과, Expo Doctor 20/20 통과, Android JS/Hermes·웹 번들 생성 성공, 웹에서 단계·서버 문장·상태 저장·프로필 저장·수칙 이동 확인. 상위 계약 사본 SHA256 확인, git diff --check 통과. 실제 네이티브 빌드·지도·푸시·TTS·백그라운드 실행은 검증 전이며 docs/07-validation.md에 구분했다.

서버 저장소·실제 서버·계정·외부 배포는 변경하지 않았다. 실제 로그인·지도 키·FCM/APNs·2D capability 합의 및 운영 검증은 후속 범위다. 의존성 audit 13개(높음3/보통8/낮음2)는 Expo 개발 도구 계열이며 호환 수정 릴리스 확인이 필요하다.
