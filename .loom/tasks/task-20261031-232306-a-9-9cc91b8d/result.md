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
