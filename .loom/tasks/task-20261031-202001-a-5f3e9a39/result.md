# 결과

A 실제 단말 본편 6분18.8초와 대기 구간을 줄인 88.7초 확인본을 로컬에 저장했다. 어린이 프로필, 공통/개인 준비 카드, 경보 배너, 위급3단계와 지도, 아이 질문/TTS, 실제 STT와 Qwen 제안, 명시 확인 후 아이 동반·맞춤 행동을 촬영했다. 실제 알림음은 마이크 보충 테이크36.7초로 별도 녹화했고 사용자가 알림음1회를 확인했다.

## 검증과 한계

1080×2400 H.264/AAC 스트림과 모든 파일 전체 디코드 검증. 확인본 원속도30fps, TTS 파형·시점 일치. 서버 읽기 증거 qwen_grounded, child_present=true, 상태0→1, 정책10 위급3단계. 본편은 앱 TTS만 포함하며 사용자 발화 원음·시스템 알림음은 포함하지 않는다. 발화 인식과 상태 반영은 영상으로 확인된다. 알림음 보충은 주변 소리 포함 별도 테이크로, 본편에 임의 합성하지 않았다. 실제GPS/119/외부업로드 없음.

## 산출물과 다음 행동

docs/14-scenario-a-recording.md, docs/validation/scenario-a-recording.json, artifacts/recordings/2026-11-01-A/A-scenario-raw.mp4, A-scenario-review.mp4, A-alert-mic-pickup.mp4, edit-list.json. 영상은 Git 제외하며 원본 보존. 사용자가 A 소재를 확인한 뒤 B 역할을 준비해 촬영한다.
