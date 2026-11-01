# Previous Results

2 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 3. 실제 Android에서 사설 HTTPS 연동 검증과 서명 APK 배포

# 결과

고유 서명·non-debuggable·내장 Hermes JS를 갖춘 arm64 APK를 Samsung SM-G996N Android15에 설치했다. 실행 소스는 0716c49이고 최종 APK SHA256은 fe6892591e5224f5b982d53ce0536425f4a44290182477b865b922a63b2ad5e9다. 사용자가 승인한 사설 Tailnet HTTPS로 연결하며 USB 포트 전달 없이 서버를 사용한다.

단말 온보딩·합성 프로필·세션 복원·공식 원문을 확인했다. 위치·상태 입력의 HTTP422는 단말이 서버보다 약0.603초 빠른 데서 발생했고 서버959ab56의 30초 이내 보정으로 해결했다. 이후 실제 단말 계정의 정책 revision2/3/4에서 경고1→대피2→위급3을 사용자 화면과 서버 DB로 대조했다. 사용자는 무음을 해제한 뒤 실제 음성 재생도 확인했다. 위치 버튼의 진행·결과 표시와 TTS 수동 재읽기도 보완했다.

검증: Node24 `npm run check`(TypeScript·40개 회귀·문서 링크), Android/Web export, 서명/권한/내장JS 검사, 실제 APK 설치·재실행, 서버104개 테스트와 HTTPS 흐름이 통과했다. 세부 근거는 docs/10-android-delivery.md 및 docs/validation/android-*.json에 있다.

Firebase 기기 푸시·네이버 지도·실제 예측은 미준비/제외 범위다. 실제 GPS·백그라운드 위치·iOS·119 발신은 검증하지 않았다. 앱 QA 커밋 ed91b1ce78554e339e9a95bbc49a4028cc957178을 원격 develop에 게시했고, 메인 eaeef8756cd066518fb50bc634ff2a701c78a9f5의 apps/mobile gitlink로 고정했다. 새 원격 recursive clone에서 해당 앱 커밋 자동 초기화, 메인/앱 clean, API·lockfile 해시 검사가 통과했다. 이후 앱 커밋은 이 연계 결과와 Loom 완료 기록만 추가하며 실행 소스와 검증된 gitlink는 바뀌지 않는다.

## 4. 네이버 지도 연결과 Android APK 실기기 검증

# 결과

Android 0.2.1/code3에 네이버 2D 지도와 유효 좌표·정확도·사건 관련 범위를 연결했다. 현재 위치 없는 전국 보기, 만료·삭제 입력 보류, 후속 카메라 이동과 지도 재시도를 구현했다. Client ID는 Git 제외·권한600 파일에서만 주입하며 Client Secret은 저장하거나 사용하지 않았다.

Node24 TypeScript·45개 테스트·문서 링크 검사와 웹/native release 빌드를 통과했다. 기존 서명으로 Samsung Android15에 업데이트 설치했고 CUA에서 실제 전국 지도·지명·저작권과 합성 위치 저장 후 마커·좌표·카메라 이동을 확인했다. 사용자는 경보 상세에서 붉은 관련 영역과 위치 마커가 함께 보임을 확인했다. 같은 단말의 위치 revision2, 사건 bounds와 정책 반영을 서버 읽기 기록으로 대조했다.

APK `artifacts/apk/bonghwajigi-0.2.1-private-arm64.apk`, SHA256 `5d4b2cb00adead0d2f6e2e1f51c76c32819c6b7b5095189549dd8fc0079aee25`, 실행 소스 `66c4d734287549d6403c429ca42e6fdb44d38d2b`. 빌드 시 dirty는 README와 안내 문서 네 개만 수정한 결과이며 실행 소스는 동일하다. 상세/화면/검증 JSON은 `docs/11-naver-map-integration.md`와 `docs/validation/android-map-*`에 기록했다.

웹·Expo Go는 명시된 도식이다. 실제 GPS·백그라운드 위치·Firebase·iOS·검증된 대피 경로·실제 예측과 119 연락은 이번 범위에 포함하지 않는다. 키 오류·비행기 모드 검증은 하지 않았다. 앱 QA 커밋 ced24463bb79a6ef5d3b532f6d2a48215ca84a56를 원격 develop에 반영했다. 메인 ad0d34dd67bf7bf21829fc1bffd291f06c35b4d2의 apps/mobile이 이 SHA를 가리키며 실제 GitHub 재귀 clone에서 main/app clean 및 API 계약·소스 검사를 통과했다.
