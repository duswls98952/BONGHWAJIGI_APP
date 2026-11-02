# Previous Results

10 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

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

## 12. 휴대폰 실행 오프닝 촬영과 두 화면 전환 완성

# 결과

사용자 직접 조작한 휴대폰 홈→앱 메뉴→봉화지기 실행→앱 홈→내정보를 촬영했다. 대기를 덜어낸 8.4초 오프닝과 1.2초 좌우 분할 전환을 기존 105초 A/B 본편 앞에 연결해 114.6초 최종 4K/1080p 영상을 만들었다. 원본 30.080896초는 보존했고 모든 녹화를 종료했다.

## 산출물

- `artifacts/recordings/2026-11-01-final/AB-scenario-final-4k.mp4`
- `artifacts/recordings/2026-11-01-final/AB-scenario-final-1080p.mp4`
- `artifacts/recordings/2026-11-01-final/final-timeline.json`
- `artifacts/recordings/2026-11-01-opening/opening-01-raw.mp4`
- `docs/19-scenario-opening-final.md`

## 실행한 검증

- 원본 `ffmpeg` 전체 디코드: exit 0, 오류·경고 0개 통과.
- 최종 두 파일 `ffprobe`: exit 0, 114.600초/3,438프레임/CFR 30/H.264·AAC 48kHz stereo 통과.
- root 전환 프레임 0/18/35 시각 검사: 중앙→좌우 이동, 최종 위치·크기·라벨 정상.
- 독립 음성 검증: 기존 AAC 4,923패킷 내용·길이 동일, PTS/DTS 정확히 +460,800샘플. 5개 가청 구간 PCM 동일, 시간 오차 0ms, 중첩 없음. 오프닝 무음·클리핑 없음·4K/1080p 음성 동일 통과.
- 원본 오프닝/A/B와 기존 본편 해시 불변 통과.
- 최종 두 파일 `ffmpeg` 전체 디코드: exit 0, 오류·경고 0개 및 faststart 통과.
- 4K 본편 영상 3,150패킷 내용 동일, PTS/DTS 정확히 +864,000ticks(1/90,000초) 통과.
- 독립 최종 시각 검사: 양쪽 해상도 메뉴 컷·내정보 진입·분할 전환·9.6초 접합부·35초 양쪽 경보·최종 3/2단계 통과. 미해결 항목 없음.
- 최종 해시 재계산으로 검증 대상과 전달 파일 동일 확인. `docs/validation/scenario-opening-final.json`에 통합 보존.
- `npm run check:docs`: exit 0, 24개 문서 링크 검사 통과.
- `loom validate --strict`: exit 0, 81개 Task 정합성 통과.
- `git diff --check`: exit 0, 공백 검사 통과.

## 범위와 다음 행동

실제 앱 조작 화면에 이동·페이드 편집 효과를 적용했다. 기존 앱·서버·사용자 데이터 변경, 실제 GPS·119 실행, 외부 업로드, 새 사용자 음성 생성은 없다. 영상은 Git 제외 로컬 폴더에 보관하고 사용자는 최종 MP4를 발표 영상으로 사용할 수 있다.
