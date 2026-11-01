# Previous Results

9 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

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

## 11. 실서버 A/B 검증 영상 좌우 합성 완성

# 결과

오프닝 없는 A/B 좌우 동시 시연 영상을 105초로 완성했다. 4K 7,616,240bytes와1080p 3,864,982bytes를 로컬로 전달한다. 프로필·준비·경보 단계 동기화, A 대화→B 대화 순차음성, 반대 화면음영, 실제STT·명시확인·개인별행동과참고경로를 보존했다. 반복대기와이름입력·지도초기로딩을 제거했다.

## 실행한 검증

- ffprobe 두출력: exit0, 정확히105초/3150프레임/CFR30/H264·AAC48kHz stereo 통과.
- ffmpeg 전체디코드 두출력: exit0, 오류·경고0개 통과.
- faststart, 원본A/B해시불변 통과.
- root 레이아웃과위급3/대피2·지도비교프레임시각검사 통과.
- `npm run check:docs`: exit0, 23개문서링크검사 통과.
- `loom validate --strict`: exit0, 80개Task정합성 통과.

## 범위와 다음 행동

사용자발화원음은없으므로실제STT화면으로전달하며새음성·음악·효과음은생성하지않았다. 오프닝·추가촬영·서버/앱변경·외부게시없음. 원본과선행A완성본/B원본은보존했다. 사용자는완성MP4를확인해발표자료에활용할수있다.

## 최종 독립 검증

- 시각 QA 양쪽해상도 통과, 역할·음영·STT·명시확인·행동·경로 정상. 59.2초 화면왕복을수정해미해결항목없음.
- 오디오5개이벤트 시간오차0ms(1ms분해능), 파형상관0.99993이상, 중첩없음·클리핑없음 통과.
- 전환수정전후/4K/1080p AAC4923패킷 payload·PTS·DTS·duration 동일 통과. 수정scene06외4K영상패킷동일 통과.
- 최종파일해시와증거는docs/validation/scenario-ab-composite.json 및 로컬ab-edit-manifest.json에보존.

최종검증 재실행: npm run check:docs exit0/23개 통과, loom validate --strict exit0/80개 통과, git diff --check exit0 통과. 최종manifest와양쪽출력/QA모두freeze완료.
