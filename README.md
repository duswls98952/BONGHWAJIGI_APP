# 봉화지기 APP

React Native + Expo + TypeScript 기반 앱 개발 시작 틀입니다. **한 대의 컴퓨터에서 Codex로 순차 작업**하는 팀을 기준으로 구성했습니다. 기본 실행은 서버나 지도 키 없이 가능한 **모의 데이터 모드**입니다.

## 바로 시작

Node **24 LTS (24.3 이상, 25 미만)**를 설치합니다. nvm 사용자는 `nvm install`과 `nvm use`로 `.nvmrc`를 적용합니다.

```sh
npm ci
cp .env.example .env
npm run start:go
```

Expo Go로 QR을 열면 화면·모의 API·대응 레벨 변경을 확인할 수 있습니다. 웹 미리보기는 `npm run web`입니다. **네이버 지도·푸시·백그라운드 위치는 개발용 앱 빌드에서 따로 검증**합니다.

```sh
npm run check
```

## 먼저 읽을 문서

- [개발 시작 안내](docs/01-start-here.md)
- [API 연결과 주의사항](docs/02-api-integration.md)
- [서버 대화·대응 레벨·백그라운드](docs/03-realtime-background.md)
- [2D 지도·경로·단말 TTS](docs/04-map-tts.md)
- [이미지로 작업하는 Codex 절차](docs/05-codex-workflow.md)
- [서버팀 연결 체크리스트](docs/06-server-handoff.md)
- [현재 검증 범위와 남은 작업](docs/07-validation.md)

Codex는 [AGENTS.md](AGENTS.md)를 먼저 읽어야 합니다. 3D는 MVP 범위에서 제외했습니다. 이미지를 받아도 API·서버의 판단을 임의로 바꾸지 않습니다.

이 저장소의 작업 브랜치는 `develop`입니다. 현재 화면은 디자인 완성본이 아닌 기능별 시작 틀이며, 실제 서버·로그인·지도 키·푸시 자격 증명은 연결 전입니다.
