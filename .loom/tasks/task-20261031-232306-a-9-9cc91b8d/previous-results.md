# Previous Results

5 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 6. 지역 행동요령·공통 개인 준비 카드와 촬영용 앱 흐름 연결

# 결과

앱0.4.0/versionCode6을 구현·기존삼성폰설치했다. 지역행동요령, 공통위/개인아래준비카드, 확인된현재상태, 현재발화1개, 화면시연문구제거, 신규전경경보배너/로컬알림을연결했다. 실제네이버지도와지역카드·신규배너를CUA로확인했고사용자는알림음1회·위급3단계·아이질문을확인했다.

## 검증

TypeScript,78 tests,문서링크,웹번들통과. Android release 2분20초빌드·업데이트설치성공. 기존마이크/알림허용유지. 런타임오류로그없음. 웹A/B질문→명시확인→태그/행동/경로검증. 실제서버141검사및새A/B실모델파이프라인완주와API계약일치. APK SHA256 7b7f44d5f39de3c540e14bae65ea17f1cea907fcde39aa3336ec747376a4fec7.

## 산출물

docs/13-location-guidance-scenarios.md, docs/validation/android-filming-*.json/png. artifacts/apk/bonghwajigi-0.4.0-private-arm64.apk. 전체A/B음성촬영은이적용후사용자가이어간다.

## 7. A 시나리오 실기기 영상 녹화

# 결과

A 실제 단말 본편 6분18.8초와 대기 구간을 줄인 88.7초 확인본을 로컬에 저장했다. 어린이 프로필, 공통/개인 준비 카드, 경보 배너, 위급3단계와 지도, 아이 질문/TTS, 실제 STT와 Qwen 제안, 명시 확인 후 아이 동반·맞춤 행동을 촬영했다. 실제 알림음은 마이크 보충 테이크36.7초로 별도 녹화했고 사용자가 알림음1회를 확인했다.

## 검증과 한계

1080×2400 H.264/AAC 스트림과 모든 파일 전체 디코드 검증. 확인본 원속도30fps, TTS 파형·시점 일치. 서버 읽기 증거 qwen_grounded, child_present=true, 상태0→1, 정책10 위급3단계. 본편은 앱 TTS만 포함하며 사용자 발화 원음·시스템 알림음은 포함하지 않는다. 발화 인식과 상태 반영은 영상으로 확인된다. 알림음 보충은 주변 소리 포함 별도 테이크로, 본편에 임의 합성하지 않았다. 실제GPS/119/외부업로드 없음.

## 산출물과 다음 행동

docs/14-scenario-a-recording.md, docs/validation/scenario-a-recording.json, artifacts/recordings/2026-11-01-A/A-scenario-raw.mp4, A-scenario-review.mp4, A-alert-mic-pickup.mp4, edit-list.json. 영상은 Git 제외하며 원본 보존. 사용자가 A 소재를 확인한 뒤 B 역할을 준비해 촬영한다.
