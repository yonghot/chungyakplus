# 청약메이트 프롬프트 로그

## 기록 규칙
- 순수하게 프롬프트만 기록한다
- 과도한 결과 정리와 분류는 하지 않는다
- 제외 대상: "/init" 같은 단순 명령어, "다시 해줘"와 같은 매우 단순한 프롬프트
- 포함 대상: 기능 요청, 수정 요청, 디버깅 요청, 설계 관련 논의 등 의미 있는 프롬프트

## 기록 형식
```
[YYYY-MM-DD HH:MM] Phase/카테고리
프롬프트 원문
```

---

## 로그

[2026-03-04 22:30] Phase0/셋업
프로젝트 통합 셋업: CLAUDE.md(기본지침서), PRD.md(요구사항정의서), DESIGN.md(디자인 시스템), ALL_PROMPT.md(프롬프트 로그) 4개 기본 문서 생성 + .claude/agents/ 하위 7개 서브에이전트(prd-analyst, architect, frontend-dev, backend-dev, integrator, code-reviewer, test-writer) 팀 빌딩. 기술 스택: Next.js + Vercel + Supabase + shadcn/ui. 첨부된 ChungYakMate_PRD_v2.0 기반으로 PRD.md 작성.
