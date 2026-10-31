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

현재 구현 검사와 APK 빌드·실제 단말 검증을 진행 중이다. 최종 APK SHA256, 단말 화면 증거와 검증 결과는 완료 후 이 절에 기록한다.

Firebase 기기 푸시·실제 예측·검증된 대피 경로·백그라운드 GPS·iOS 실기기 검증은 포함하지 않는다.
