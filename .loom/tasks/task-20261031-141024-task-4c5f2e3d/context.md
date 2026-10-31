# Context

## Loom 코드 계약

아래 항목은 Loom 코드에 고정된 runtime 동작 계약입니다. 관련 흐름을 바꾸기 전 `loom contract show <id>`로 확인합니다.

- `task-execution`: Task 실행 전 prompt/context/previous-results에 들어가는 입력 경계입니다. 명령: `loom contract show task-execution`. Source: `loom/application/context_pack.py`, `loom/application/team_policy.py`
- `done-guardrail`: Task를 DONE으로 인정하기 전에 필요한 산출물과 상태 전이를 검증하는 계약입니다. 명령: `loom contract show done-guardrail`. Source: `loom/application/services.py`

## Project Memory

# BONGHAWJIGI_APP

Loom 프로젝트 메모리 루트입니다.

이 파일은 `loom init`으로 생성되며 `loom analyze-repo`로 보강할 수 있습니다.

## Workspace Policy

- Output language: `ko`
- Agent provider: `claude`
- Agent model: `adapter-default`
- Reasoning effort: `high`
- Required branch: `HeoNey_dev`
- Dirty branch switch: `blocked`
- Commit policy: `manual`
- Include `.loom` metadata in Git: `yes`
- Read-only parallel execution: `allowed`
- Validation environment: `auto`
- Previous Task result limit: `2`
- Workspace required docs: -
- Loom fixed guardrails and verified Team required policies take precedence over this Workspace Policy.

## Job

- Title: PNG 기반 모바일 HTML 시안
- Goal: 사용자가 제공한 다섯 모바일 PNG의 화면 항목과 순서를 따라 독립 HTML 시안을 만들고 Expo 웹 개발 서버에서 확인한다. 기본 수칙은 재난별 공통 안내로, 맞춤 행동요령은 개인 상태 기반 예시로 분리한다.
- Branch: HeoNey_dev
- Task count: `56`

## Task

- Title: 첫 실행 동의 및 프로필 입력 화면 추가
- Description: 참고 이미지의 전체 동의 카드와 개별 체크·상세 화살표 구성을 봉화지기 개인정보 항목에 맞춰 HTML 시안에 적용한다. 같은 화면 아래 스크롤에는 기존 프로필 입력 항목을 배치한다. 기본 진입은 로딩 뒤 첫 설정 화면으로, 완료 버튼은 홈으로 연결하고 직접 #onboarding 미리보기를 제공한다. 동의·입력은 실제 저장으로 오인되지 않게 시안임을 표시한다.
- Expected output: public/prototype/index.html, public/prototype/style.css, public/prototype/app.js, README.md, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Done condition: 새 첫 설정 화면에 전체 동의 카드와 분리된 봉화지기 관련 동의 행이 있고 각 행의 선택과 상세 열기가 동작한다. 그 아래 기존 프로필 정보 입력을 스크롤하며 볼 수 있다. 로딩 뒤 첫 설정이 보이고 완료로 홈 진입, #loading/#home/#onboarding 직접 주소가 동작한다. 시안은 개인정보나 동의 결과를 실제 저장했다고 표현하지 않는다.
- In scope: public/prototype/index.html, public/prototype/style.css, public/prototype/app.js, README.md, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Out of scope: 실제 개인정보 동의 법률 문안 확정, 서버 저장, OS 권한 요청, Expo 네이티브 화면, 홈·긴급 화면 개편
- Validation hint: Chrome 모바일 크기 #onboarding 상단·하단 캡처 및 체크박스/상세/완료 동작 확인; 일반 주소 로딩 뒤 첫 설정, #home 직접 진입 확인; node --check public/prototype/app.js; npm run check; git diff --check
- Required docs: -
- Memory refs: -
- Document outputs: -
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: codex

## Advisor Source Prompt

No Advisor source prompt recorded for this Task.

## Inclusion Policy

- Mandatory execution files: `prompt.md`, `context.md`, and `previous-results.md`.
- Always included: project memory, current Job/Task metadata, and Job notes.
- Previous results: up to the latest 2 recorded results from earlier Tasks in this Job.
- Job context refs: explicit Job-scoped references selected by the controlling agent or user.
- Task required docs: mandatory Task-scoped documents; missing refs block validation and execution.
- Task memory refs: mandatory Task-scoped workflow memory references; missing or non-memory refs block validation and execution.
- Repository documents, validation documents, and skill rules: included only through explicit Job context refs, Task required docs, or Task memory refs.
- Verified Team Policy Snapshot: included before Active Memory; required policy cannot be overridden by lower-priority context.
- Active workflow memory with an `always` category is included automatically while its status is `ACTIVE`.
- `task_selected` and `reference_only` memory is included only through explicit Task memory refs.
- Consumed proposals, rejected proposals, resolved memory, superseded memory, and archived memory are excluded.
- Unreferenced repository files and results from other Jobs are not included.
- `AGENTS.md` and `CLAUDE.md` remain session-level controlling-agent entrypoints and are not treated as task context artifacts by default.

## Job Notes

# Notes

## Context References

No explicit context references recorded for this job.

## Required Documents and Memory

No task-level required docs or memory refs recorded.

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
