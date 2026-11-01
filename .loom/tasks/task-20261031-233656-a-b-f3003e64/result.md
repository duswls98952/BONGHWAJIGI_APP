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
