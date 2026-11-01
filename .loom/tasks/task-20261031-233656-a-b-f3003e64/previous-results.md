# Previous Results

6 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 7. A 시나리오 실기기 영상 녹화

# 결과

A 실제 단말 본편 6분18.8초와 대기 구간을 줄인 88.7초 확인본을 로컬에 저장했다. 어린이 프로필, 공통/개인 준비 카드, 경보 배너, 위급3단계와 지도, 아이 질문/TTS, 실제 STT와 Qwen 제안, 명시 확인 후 아이 동반·맞춤 행동을 촬영했다. 실제 알림음은 마이크 보충 테이크36.7초로 별도 녹화했고 사용자가 알림음1회를 확인했다.

## 검증과 한계

1080×2400 H.264/AAC 스트림과 모든 파일 전체 디코드 검증. 확인본 원속도30fps, TTS 파형·시점 일치. 서버 읽기 증거 qwen_grounded, child_present=true, 상태0→1, 정책10 위급3단계. 본편은 앱 TTS만 포함하며 사용자 발화 원음·시스템 알림음은 포함하지 않는다. 발화 인식과 상태 반영은 영상으로 확인된다. 알림음 보충은 주변 소리 포함 별도 테이크로, 본편에 임의 합성하지 않았다. 실제GPS/119/외부업로드 없음.

## 산출물과 다음 행동

docs/14-scenario-a-recording.md, docs/validation/scenario-a-recording.json, artifacts/recordings/2026-11-01-A/A-scenario-raw.mp4, A-scenario-review.mp4, A-alert-mic-pickup.mp4, edit-list.json. 영상은 Git 제외하며 원본 보존. 사용자가 A 소재를 확인한 뒤 B 역할을 준비해 촬영한다.

## 8. A 프로필 첫 9초 교체와 직접 선택 촬영 준비

# 결과

기존 A 확인본 88.7초의 앞9초를 제외한79.7초 영상과 사용자 직접 선택 재촬영을 준비·실행했다. 사용자가 첫째·둘째 테이크의 재촬영을 요청했고 세 번째42초 테이크를 촬영 완료로 확정했다. 직접 기본정보 입력, 이동·의사소통·어린이·조력자 선택과 저장했어요 표시를 영상에서 확인했다. 모든 기존 원본과 재촬영을 보존했으며 세 번째 테이크의30fps 전달본을 만들었다.

## 경계와 검증

정확한9초컷으로 기존 프로필1초가 남는다. 추가1초제거나 새 촬영본 결합은 수행하지 않았다. 오프닝·분할화면·B촬영·대신선택·서버API변경·실제GPS/119·외부업로드 없음. 단말녹화프로세스 모두종료. 해시·전체디코드·프레임경계·음성시점 검증과 문서링크·Loom strict로 마무리한다.

## 산출물

artifacts/recordings/2026-11-01-A/A-scenario-after-9s.mp4, A-profile-retake-03-raw.mp4, A-profile-retake-selected.mp4. after-9s-edit.json, retake-selected-edit.json. docs/15-scenario-a-profile-retake.md와 docs/validation/scenario-a-profile-retake.json에 인계했다. 영상은 로컬 Git제외.

## 실행한 검증 결과

- `npm run check:docs`: exit 0, 문서 20개 파일 링크 검사 통과.
- `loom validate --strict`: exit 0, 77개 Task 메타데이터 정합성 검사 통과.
- `git diff --check`: exit 0, 공백 오류 없음.
- `ffmpeg -hide_banner -v error -xerror -i A-scenario-after-9s.mp4 -f null -`: exit 0, 전체 디코드 검증 통과. 길이 79.700초, 2391프레임, 첫 프레임은 원본9초와 대응한다.
- `ffmpeg -hide_banner -v error -xerror -i A-profile-retake-selected.mp4 -f null -`: exit 0, 전체 디코드 오류·경고0개. 길이42.000초, 1260프레임, 원본AAC1955패킷 payload와PTS 일치.
- 단말 연결 device 상태 및 사용자 세 번째 테이크 완료 응답을 확인했다. 프로세스 검사에서 남은 녹화가 없었다.
- 자세한 실제 파일 해시·검증 명령·출력은 docs/validation/scenario-a-profile-retake.json에 보관했다. 모든 검증을 완료했다.
