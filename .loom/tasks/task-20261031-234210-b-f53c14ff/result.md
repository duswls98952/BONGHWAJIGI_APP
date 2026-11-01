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
