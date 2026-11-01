# Previous Results

1 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 2. 목업 디자인을 Expo 화면에 구현하고 현재 서버 계약과 인증 연결

# 결과

완성 목업을 기반으로 온보딩·홈·프로필·긴급3단계·수칙·대피로 미제공·119연결 준비 화면을 Expo에 구현했다. 실제0.2.0-mvp 타입과 설치세션 회전·SecureStore·사용자 입력revision·단일longpoll·단말TTS·공식원문을 연결했다. 프로필/상태 변경 후 재평가까지 옛 행동을 보류하며 계정/사건 전환의 늦은 응답을 차단했다. 별도 준비카드·선택 의료동의·기타보호대상과 합성시연위치 입력을 반영했다. 고유 릴리즈 서명과재현가능한 Android 빌드스크립트를 준비했다.

## 검증

- Node24.22.2 `npm run check`: TypeScript와40개 테스트 및14개 문서 링크 통과.
- `npm run export:android`: Hermes1466모듈 번들 생성 성공.
- `npm run export:web`:1015모듈 번들 생성 성공.
- CUA 개발브라우저: 합성프로필 저장→홈→공식경보원문→경고/대피/위급 단계와행동교체→기본수칙·119초안 표시 확인. 증거 docs/validation/web-critical.png.
- 일반서버 API는별도서버Task에서93개테스트와실제HTTPS 등록/세션/3단계갱신을검증했다.

실제APK설치·휴대폰 UI·TTS·재실행 검증과서브모듈/배포는후속Task task-20261031-170037-android-https-apk-eab2688e에서이어진다. 이Task의완료를실푸시/지도/예측완료로해석하지않는다.

## 3. 실제 Android에서 사설 HTTPS 연동 검증과 서명 APK 배포

# 결과

고유 서명·non-debuggable·내장 Hermes JS를 갖춘 arm64 APK를 Samsung SM-G996N Android15에 설치했다. 실행 소스는 0716c49이고 최종 APK SHA256은 fe6892591e5224f5b982d53ce0536425f4a44290182477b865b922a63b2ad5e9다. 사용자가 승인한 사설 Tailnet HTTPS로 연결하며 USB 포트 전달 없이 서버를 사용한다.

단말 온보딩·합성 프로필·세션 복원·공식 원문을 확인했다. 위치·상태 입력의 HTTP422는 단말이 서버보다 약0.603초 빠른 데서 발생했고 서버959ab56의 30초 이내 보정으로 해결했다. 이후 실제 단말 계정의 정책 revision2/3/4에서 경고1→대피2→위급3을 사용자 화면과 서버 DB로 대조했다. 사용자는 무음을 해제한 뒤 실제 음성 재생도 확인했다. 위치 버튼의 진행·결과 표시와 TTS 수동 재읽기도 보완했다.

검증: Node24 `npm run check`(TypeScript·40개 회귀·문서 링크), Android/Web export, 서명/권한/내장JS 검사, 실제 APK 설치·재실행, 서버104개 테스트와 HTTPS 흐름이 통과했다. 세부 근거는 docs/10-android-delivery.md 및 docs/validation/android-*.json에 있다.

Firebase 기기 푸시·네이버 지도·실제 예측은 미준비/제외 범위다. 실제 GPS·백그라운드 위치·iOS·119 발신은 검증하지 않았다. 앱 QA 커밋 ed91b1ce78554e339e9a95bbc49a4028cc957178을 원격 develop에 게시했고, 메인 eaeef8756cd066518fb50bc634ff2a701c78a9f5의 apps/mobile gitlink로 고정했다. 새 원격 recursive clone에서 해당 앱 커밋 자동 초기화, 메인/앱 clean, API·lockfile 해시 검사가 통과했다. 이후 앱 커밋은 이 연계 결과와 Loom 완료 기록만 추가하며 실행 소스와 검증된 gitlink는 바뀌지 않는다.
