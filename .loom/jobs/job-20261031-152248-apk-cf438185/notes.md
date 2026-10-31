# Notes

## 2026-10-31T18:54:09+00:00

목업 UI, STT→텍스트 대화→확인 기반 상태 반영, 합성 시연 경로 구현. 사용자의 추가 카드 대비·라운드 요청도 같은 UI 범위로 반영. npm run check 58 tests 및 문서 링크, web export 통과. 실서버 실제 Qwen smoke 통과. Android 빌드/실기기 QA 진행.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `progress`, `validation`
## 2026-10-31T19:10:25+00:00

0.3.0 단말 설치와 지도 경로선/목적지 마커 확인. 말하기 직후 취소 재현: 이미 허용된 마이크의 REQUEST_PERMISSIONS Activity가 매번 열림. 권한 조회 후 필요시에만 요청하도록 0.3.1/code5 수정. npm run check 62개 통과. 재빌드·실기기 재검증 진행.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `troubleshooting`, `validation`
## 2026-10-31T19:18:12+00:00

0.3.1 마이크 권한 재요청 수정본을 깨끗한 소스 c0b87ea2에서 빌드하고 Samsung Android15에 업데이트 설치했다. versionCode5와 RECORD_AUDIO 기존 허용을 확인했다. npm run check 62개 테스트 통과, 합성 지도 경로는 사용자 확인 완료. 음성 입력·상태 반영의 사용자 재검증을 기다리며 완료 상태로 전환하지 않는다.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `android`, `speech`, `verification`
## 2026-10-31T19:20:36+00:00

사용자가 0.3.1 음성 인식과 상태 반영 모두 정상임을 확인했다. 단말 로그의 기존 권한 재사용·온디바이스 인식 시작/종료와 CUA 인식문·계단 이용 어려움 제안 화면이 일치한다. 경로선/목적지 마커도 사용자와 CUA 확인 완료. 최종 검증 문서와 APK manifest를 기록하고 원격/서브모듈 고정을 마무리한다.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `android`, `speech`, `verification`
## 2026-10-31T20:12:09+00:00

0.4.0 지역행동요령·공통/개인준비·A/B확인상태·전경알림 구현과 실폰설치완료. 78tests/웹/Android검증,사용자가알림음1회·위급3·아이질문확인. 상세 docs/13-location-guidance-scenarios.md.

- Task: `task-20261031-193008-task-33cb114d`
- Tags: `filming`, `android`
