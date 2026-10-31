# 2D 지도·서버 경로·단말 TTS

## 지도 선택

**3D는 MVP에서 제외합니다.** 2D 지도는 국내 도로·건물명·지형지물 확인을 위한 **네이버 지도 Mobile SDK**를 우선 선택했습니다. React Native에서는 커뮤니티 래퍼 `@mj-studio/react-native-naver-map`를 사용합니다. 네이버가 공식 제공하는 React Native 라이브러리라는 뜻은 아닙니다.

‘길을 가장 잘 보여준다’는 것은 시연 지역의 골목·횡단보도·입구 표기와 실제 기기에서 검증할 기준입니다. 이번에 지도 품질을 현장 비교하거나 안전 경로 정확도를 입증한 것은 아닙니다. 지도 컴포넌트를 분리했으므로 선정 지역에서 부족하면 교체할 수 있습니다.

1. 네이버 Cloud의 현재 Maps 상품에서 Mobile Dynamic Map 사용 권한·과금·약관을 확인합니다.
2. Android package / iOS bundle ID를 실제 앱과 동일하게 등록합니다.
3. `.env`에 공개 식별자인 Client ID만 넣습니다. Secret은 앱에 넣지 않습니다.
4. 네이티브 설정이 추가되므로 개발용 앱을 다시 빌드합니다.
5. 실제 지도·위험 구역·사용자 위치·경로 겹침과 확대 조작을 단말에서 확인합니다.

키가 없거나 Expo Go/웹 미리보기에서는 도식이 표시됩니다. 이 도식은 실제 도로나 대피 경로로 사용하지 않습니다. 지도 인증 실패·네트워크 장애·SDK 충돌의 단말 처리는 실기기 검증이 남아 있습니다.

## 서버 경로 API는 이미 존재하므로 재사용

```http
GET /v1/me/responses/{response_id}/route?response_revision=7
Authorization: Bearer <token>
```

| 필드 | 앱 사용법 |
| --- | --- |
| `data.status` | available일 때만 경로 표시. pending/unavailable이면 선을 표시하지 않음 |
| `data.response_revision` | 현재 개인 안내 revision과 일치해야 함 |
| `data.route.geometry` | GeoJSON LineString 좌표를 경로선으로 표시 |
| `data.route.instructions` | 서버가 준 번호별 안내를 그대로 표시 |
| `checked_at / valid_until` | 검증 시각 표시, 만료되면 제거 |
| `accessibility` | 계단 여부·무장애 검증 상태. unknown을 접근 가능으로 바꾸지 않음 |
| `source_ids / sources` | 근거 출처 연결 |

기존 0.1 계약의 좌표는 `[longitude, latitude, altitude]`입니다. 앱은 앞의 경도·위도로 **2D 투영**하여 표시할 수 있습니다. `rendering_assets`의 3D 타일은 사용하지 않습니다. 고도가 없는 실제 2D 경로를 서버가 제공하려면 2원소 좌표 허용과 고도 필드 선택화를 API 버전에 반영해야 하며, 앱이 고도를 임의로 0으로 채우지 않습니다.

기존 feature 이름은 `route_3d`라 최신 요구와 맞지 않습니다. 앱은 이것을 2D 기능 플래그로 재해석하지 않습니다. 서버와 2D 제공을 합의하기 전 LIVE의 `EXPO_PUBLIC_ROUTE_2D_CONTRACT_ENABLED`는 false입니다. 합의 뒤 임시 연결용으로 true를 사용할 수 있고, 후속 정식 계약에서는 `route_2d` capability를 정의해야 합니다. mock은 별도 시연 플래그로 경로를 시험합니다.

경로가 늦게 도착하거나 위치·프로필·상태·통제가 달라지면 이전 선을 보류합니다. 새 response revision과 일치하는 route를 다시 조회합니다. 새 경로를 앱이 직접 최단거리로 재계산하지 않습니다.

**지도 표시와 보행 경로 생성은 별개입니다.** 네이버 Directions 5는 자동차 경로 API입니다. 이것을 어르신의 보행 대피 경로로 대체하지 않습니다. 보행 그래프·통제·위험 구역·접근성을 결합하는 경로 제공자는 서버팀이 확보해야 합니다. 기존 계약에는 회전별 거리·음성 내비게이션·도로 이탈 재탐색 요청이 완성되어 있지 않으므로 현재 틀을 완전한 턴바이턴 내비게이션으로 설명하지 않습니다.

## 서버는 텍스트, 앱은 TTS

**가능합니다.** 서버가 준 `assistant_utterance.text` 또는 ready turn의 `utterance.text`를 앱의 `expo-speech`로 읽도록 시작 틀을 구현했습니다. 서버 TTS 파일이나 GPU 음성 합성이 필수는 아닙니다.

- 기본은 음성 off. 사용자가 현재 화면의 ‘음성 읽기 켜기’를 선택합니다.
- 새 문장이 오면 이전 재생을 중단하고 최신 문장을 읽습니다. 같은 문장 ID를 반복 수신해도 중복 재생하지 않습니다.
- 최신 response revision과 유효시간을 확인합니다. 화면 이탈·백그라운드·안내 만료 시 재생을 중단합니다.
- 실시간 대화 문장과 행동요령 전체 낭독은 별도입니다. 현재 틀은 현재 서버 발화 한 개만 읽습니다.
- 언어는 우선 ko-KR입니다. 실제 한국어 음성 설치 여부·발음·속도·오프라인 사용·블루투스·통화 중 동작을 단말에서 검증합니다.
- iOS 실제 기기의 무음 모드에서는 expo-speech 소리가 나지 않을 수 있습니다. 강제 최대 볼륨·무음 우회 기능으로 취급하지 않습니다.
- 화면이 꺼졌을 때는 푸시 알림 소리와 TTS를 구분합니다. OS가 앱을 중단한 상태에서 임의 문장을 계속 TTS로 읽는 기능은 제공하지 않습니다.
- 음성 인식(STT)은 별개이며 미구현입니다. 현재 사용자의 상황 입력은 텍스트입니다.

기존 `guidance_tts`는 서버 계약의 조건부 기능이고 `audio_url`도 존재하지만, 최신 결정은 단말 TTS입니다. 현재 사용자 선택형 단말 읽기는 앱 기능으로 분리했으며 서버 오디오 재생은 사용하지 않습니다. 서버와 `client_tts` 등 capability 의미를 정식 합의할 항목입니다.

근거: [네이버 지도 Expo 설정](https://rnnavermap.mjstudio.net/docs/installation/expo), [Ncloud 지도 개요](https://guide.ncloud-docs.com/application-maps-overview), [Directions 5의 자동차 경로 범위](https://guide.ncloud-docs.com/docs/maps-direction5-api), [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/).
