# Previous Results

8 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

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

## 10. B 시나리오 실기기 촬영

# 결과

B 보조기구 프로필 직접선택부터 실제파이프라인 경보·Qwen질문·사용자STT·확인·혼자있음/이동가능·맞춤행동과경로까지 촬영했다. B-scenario-01-raw.mp4 원본262.891367초,57,166,283bytes를 보존했다. 모든 녹화가 종료됐다. docs/17-scenario-b-recording.md와 docs/validation/scenario-b-recording.json에인계한다.

## 실동작 검증

사용자와CUA준비카드·질문·제안·확정상태·행동확인. 서버긴급노출1.559초, 실제Qwen통합완료, qwen_grounded사용자확인 context1→2, 정책27→28 대피2유지, 보조기구행동포함/어린이행동없음, 경로geometry/정책입력버전일치. 실제GPS·119·외부업로드없음.

## 범위

완성된A113.7초영상에이어서B실기기·실서버통합검증인수자료를촬영한동일Job후속작업이다. B는원본이며후속컷편집또는A/B합성이남는다. 이를완성편집본으로보고하지않는다.

## 실행한 검증

- `ffprobe`: exit 0, H2641080×2400/AAC48kHz/262.891367초 통과.
- `ffmpeg -hide_banner -v warning -xerror -i B-scenario-01-raw.mp4 -fps_mode passthrough -enc_time_base:v demux -f null -`: exit 0, 전체디코드 오류·경고0개 통과.
- 실제125초·225초에대피2헤더, 질문·STT·제안·확정태그·행동 확인. TTS130.581–133.322초/164.195–172.609초 확인.
- `npm run check:docs`: exit 0, 문서22개 링크검사 통과.
- `loom validate --strict`: exit 0, 79개Task 정합성 통과.
- `git diff --check`: exit 0, 공백검사 통과.

사용자의 추가 요청에 따라 다음 Task에서 오프닝 없이 A/B좌우영상·음성교대·대기제거 합성을 진행한다.
