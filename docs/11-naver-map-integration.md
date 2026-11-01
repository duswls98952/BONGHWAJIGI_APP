# 네이버 지도 연결과 Android 배포

2026-11-01 KST. Loom `task-20261031-180728-android-apk-30aac06c`.

## 연결 범위

Android 0.2.1(versionCode 3), `com.bonghwajigi.app`의 홈·긴급·대피로 화면에 네이버 지도 SDK를 연결했다. 데이터는 기존 사설 HTTPS 서버의 합성 시연을 사용한다. 실제 도로 배경에 유효한 공유 위치·정확도 반경·사건 관련 지역을 표시하며 안전한 대피 경로를 계산하지 않는다.

네이버 공식 [Android 시작하기](https://navermaps.github.io/android-map-sdk/guide-ko/1.html)에 따라 Maps의 Dynamic Map과 앱 패키지 등록이 필요하다. 설치된 React Native 패키지2.9.1의 Expo 플러그인은 `client_id` 값을 Android `NCP_KEY_ID`에 기록한다. SDK 기본 인증 실패 토스트와 로그를 유지한다. 초기화 콜백을 타일 로딩 완료로 간주하지 않는다.

## 데이터 표시와 실패 처리

- 서버 위치가 유효하고 최신 입력 revision 이상일 때만 마커를 표시한다. 만료·삭제·오래된 위치는 표시하지 않는다.
- 사건 bounds는 수집 자료의 관련 범위이며 실제 화선·대피 경로·안전 구역으로 표시하지 않는다. 잘못된 좌표나 역전된 bounds는 거절한다.
- 위치/영역이 바뀌면 남서쪽 기준 Region으로 카메라를 갱신한다. 전국 기본 보기는 현재 위치가 없다는 문구와 함께 제공하며 사용자 위치를 생성하지 않는다.
- 기울임·회전 제스처와 건물 높이를 비활성화하여 2D로 표시한다. 네이버 로고와 저작권 표시를 가리지 않는다.
- 지도 초기화 지연과 재시도 버튼을 제공한다. 인증 실패는 SDK 토스트, 네트워크 단절은 캐시/빈 타일일 수 있어 인터넷 연결 안내를 제공한다.
- 웹·Expo Go·키 없는 빌드는 기존 도식과 미연결 표시를 유지한다. 실제 웹 Maps 연결은 별도다.

## 키와 재현

Client ID만 `.local-private/naver-map.env`에 권한600으로 보관한다. 이 파일·SDK 생성 네이티브 설정·APK는 Git에서 제외한다. Client Secret은 사용하지 않는다. 서명은 기존 내부 release 키를 유지하므로 업데이트 설치에서 앱 데이터를 보존한다.

```sh
env PATH=/private/tmp/bonghwajigi-node24/node_modules/node/bin:$PATH \
  ANDROID_HOME=/private/tmp/bonghwa-android-sdk \
  ANDROID_SDK_ROOT=/private/tmp/bonghwa-android-sdk \
  GRADLE_USER_HOME=/private/tmp/bonghwa-gradle \
  EXPO_PUBLIC_DEMO_LATITUDE=36.4 EXPO_PUBLIC_DEMO_LONGITUDE=129.35 \
  node --env-file=.local-private/naver-map.env scripts/build-apk.mjs --no-minify \
  --api-url https://inno-server-011.tail2dac17.ts.net
```

`.env` 자동 로드가 아닌 명시적 Node env 파일로 Client ID를 주입한다. 기록에는 키 값 대신 지도 설정 여부만 남긴다. APK 파일명과 버전 기록은 실제 APK manifest에서 읽는다.

## 검증 상태

2026-11-01 03:22~03:24 KST, Samsung SM-G996N / Android15에서 업데이트 설치와 지도 표시를 확인했다.

| 항목 | 결과 |
| --- | --- |
| 자동 검사 | Node24, TypeScript, 45개 테스트(기존40+지도5), 16개 문서 링크 통과 |
| 웹 | export 성공. 네이버 native SDK를 호출하지 않는 명시된 도식 |
| native APK | release 빌드·v2 서명·arm64·내장 JS·non-debuggable·평문 통신 금지 검사 통과 |
| 기본 지도 | 위치가 없는 전국 지도에서 실제 타일·지명·NAVER/OpenStreetMap 표기 확인 |
| 위치 반영 | 사용자가 합성 위치를 저장한 뒤 홈 마커·좌표·정확도10m 문구·카메라 이동을 직접 캡처 |
| 관련 영역 | 공식 경보 상세의 붉은 관련 영역과 위치 마커 동시 표시를 사용자 직접 확인 |
| 서버 대조 | 단말 위치 revision2, 유효기간5분, 사건 bounds 유효, 정책 requested/applied14/14·error null 확인 |
| 재현 경계 | 키 오류/쿼터 오류를 주입하거나 비행기 모드·iOS를 시험하지 않음. 초기화 로그만으로 지도 성공을 판정하지 않음 |

홈은 공유한 위치를, 긴급 안내는 위치와 해당 사건의 관련 영역을 표시한다. 첫 확인에서 마커가 없던 것은 유효한 위치가 없는 전국 보기 상태였고, 시연 위치 저장 후 마커가 나타났다. 합성 좌표는 5분 후 만료되므로 다시 보려면 `내정보 → 시연 위치로 안내 확인`을 누른다. 휴대폰의 실제 GPS는 이번 검증에서 수집하지 않았다.

- APK: `artifacts/apk/bonghwajigi-0.2.1-private-arm64.apk`, 65,382,230 bytes.
- SHA256: `5d4b2cb00adead0d2f6e2e1f51c76c32819c6b7b5095189549dd8fc0079aee25`.
- 앱 실행 소스: `66c4d734287549d6403c429ca42e6fdb44d38d2b`. 빌드 도중 네 개 안내 문서만 수정되어 보고서의 `source_dirty`가 true이며 실행 소스는 해당 커밋과 동일하다.
- 기존 내부 release 서명 유지. API는 `https://inno-server-011.tail2dac17.ts.net`이며 같은 Tailnet 연결이 필요하고, 지도 타일은 네이버로 인터넷 접속한다.
- [APK 빌드 검사](validation/android-map-build.json), [단말 검증 범위](validation/android-map-verification.json).
- [위치 없는 전국 지도](validation/android-naver-overview.png), [시연 위치 마커](validation/android-naver-location.png). 붉은 영역은 사용자 직접 확인 결과이며 별도 화면 캡처로 주장하지 않는다.

Firebase 기기 푸시·실제 예측·검증된 대피 경로·백그라운드 GPS·iOS 실기기 검증은 포함하지 않는다.
