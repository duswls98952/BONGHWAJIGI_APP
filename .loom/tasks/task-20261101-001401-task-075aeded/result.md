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
