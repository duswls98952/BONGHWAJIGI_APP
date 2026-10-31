# Previous Results

7 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

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

## 9. A 완성 영상 편집 및 B 촬영 준비

# 결과

A 완성영상 113.7초를 만들었다. 세 번째 프로필 선택 촬영본7초부터35초와 기존 확인본10초부터78.7초를 연결했다. 실제 알림음을 한 번 맞추고 질문·안내 TTS를 유지했다. 원본 보존, 로컬만 저장했다. 문서는 docs/16-scenario-a-final-and-b-recording.md, 검증은 docs/validation/scenario-a-final.json이다.

## 실행한 검증

- ffprobe: exit 0, 1080×2400 H264 30fps, AAC48kHz stereo, 영상·음성113.7초, 3411프레임 통과.
- ffmpeg 전체 디코드: exit 0, 오류·경고0개 통과.
- 경계프레임 SSIM0.999406/0.999928/0.999743, TTS 파형 유사도0.999996/0.999994 통과. 최종 오디오 피크-3.04035dB, 추가클리핑없음.
- root가 최종 장면표를 확인했다.

## B 인계

사용자 홈 준비와 USB device 상태 확인, 서버 SSH 연결 복원 및 A 상태 만료 읽기 확인. B 사용자 직접 선택을 보존하도록 prepare의 프로필 자동수정을 피하는 절차를 점검했다. B 서버준비변경 및 실촬영은 후속Task에서 진행한다.

## 한계

A 단독 영상이며 오프닝·A/B합성은 포함하지 않는다. 사용자 원음은 없고 STT결과가 화면에 보인다. 실제GPS·119·외부업로드를 실행하지 않았다.

- `npm run check:docs`: exit 0, 문서21개링크검사 통과.
- `loom validate --strict`: exit 0, 78개Task 메타데이터검사 통과.
- `git diff --check`: exit 0, 공백검사 통과.
