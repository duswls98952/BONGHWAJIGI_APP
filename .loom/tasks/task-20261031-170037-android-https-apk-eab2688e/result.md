# 결과

고유 서명·non-debuggable·내장 Hermes JS를 갖춘 arm64 APK를 Samsung SM-G996N Android15에 설치했다. 실행 소스는 0716c49이고 최종 APK SHA256은 fe6892591e5224f5b982d53ce0536425f4a44290182477b865b922a63b2ad5e9다. 사용자가 승인한 사설 Tailnet HTTPS로 연결하며 USB 포트 전달 없이 서버를 사용한다.

단말 온보딩·합성 프로필·세션 복원·공식 원문을 확인했다. 위치·상태 입력의 HTTP422는 단말이 서버보다 약0.603초 빠른 데서 발생했고 서버959ab56의 30초 이내 보정으로 해결했다. 이후 실제 단말 계정의 정책 revision2/3/4에서 경고1→대피2→위급3을 사용자 화면과 서버 DB로 대조했다. 사용자는 무음을 해제한 뒤 실제 음성 재생도 확인했다. 위치 버튼의 진행·결과 표시와 TTS 수동 재읽기도 보완했다.

검증: Node24 `npm run check`(TypeScript·40개 회귀·문서 링크), Android/Web export, 서명/권한/내장JS 검사, 실제 APK 설치·재실행, 서버104개 테스트와 HTTPS 흐름이 통과했다. 세부 근거는 docs/10-android-delivery.md 및 docs/validation/android-*.json에 있다.

Firebase 기기 푸시·네이버 지도·실제 예측은 미준비/제외 범위다. 실제 GPS·백그라운드 위치·iOS·119 발신은 검증하지 않았다. 원격 앱 QA 커밋과 메인 서브모듈 고정은 이 검증 문서 커밋을 전송한 뒤 마감 기록에 추가한다.
