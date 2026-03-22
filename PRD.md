# 청약플러스 (ChungYak Plus) — PRD v2.1

> **"내 청약 경쟁력에 +를 더하다"**
> 물건 가치 분석 x 경쟁률 예측 x 청약 기회 보호 통합 플랫폼

---

## 0. 프로젝트 메타

| 항목 | 값 |
|---|---|
| 서비스명 | 청약플러스 (ChungYak Plus) |
| 버전 | v2.1 |
| 최종 수정일 | 2026-03-10 |
| 상태 | MVP 완료, Phase 2 진행 중 (+가치 구현 완료) |
| 대상 플랫폼 | PWA (모바일 퍼스트) → 추후 네이티브 앱 |

---

## 1. 서비스 개요

### 1.1 핵심 가치

청약 기회는 유한하다. 가점은 리셋되고, 당첨 이력은 제한을 만들며, 1순위 자격 유지에도 시간이 든다. **청약플러스는 한정된 청약 기회를 가치 있는 곳에만 쓸 수 있도록, 내 청약 경쟁력에 +를 더하는 서비스**다.

### 1.2 3가지 플러스

| 플러스 | 기능 | 설명 |
|---|---|---|
| **+가치** | 물건 미래 가치 분석 | 분양가 적정성, 입지 환경, 5년 예상 시세 → A~F 등급 |
| **+예측** | 경쟁률 예측 엔진 | 유사 단지 패턴 + 시장 심리 + 거시경제 → 예상 경쟁률 산출 |
| **+보호** | 청약 기회 보호 시스템 | +가치 + +예측 종합 → GO / WAIT / SKIP 최종 판정 |

### 1.3 타겟 고객

| 세그먼트 | 연령 | 특성 | 핵심 니즈 |
|---|---|---|---|
| 청약 초보자 | 28~35세 | 첫 청약 도전, 자격 요건 혼란 | "내가 넣을 수 있는 건지" 확인 |
| 재도전자 | 33~42세 | 3회+ 낙첨, 기회 소진 불안 | "이번에 넣을 만한 가치가 있는지" 판단 |

### 1.4 수익 모델

| 플랜 | 월 요금 | 포함 기능 |
|---|---|---|
| **Free** | 0원 | +자격 판정(월 3회), 분양 일정 알림, 단지 기본 정보 |
| **Plus** | 9,900원 | +자격 무제한, +가치 분석(A~F 등급), 분양가 적정성, 맞춤 분양 추천 |
| **Plus Pro** | 29,900원 | +예측(경쟁률 예측), +보호(GO/WAIT/SKIP), +리포트, +비교(단지 3개), 시뮬레이션 |

---

## 2. 기술 스택

> **NOTE**: 기존 MVP에서 검증된 기술 스택을 유지한다. 새 PRD 원본에서 언급된 NextAuth.js, Drizzle ORM, Redis, Python FastAPI는 현재 단계에서 채택하지 않는다.

### 2.1 프론트엔드

| 기술 | 버전 | 선택 근거 |
|------|------|-----------|
| Next.js | 15 (App Router) | RSC로 초기 로드 최적화, 서버 액션으로 API 레이어 단순화 |
| TypeScript | 5.7 | 판정 엔진의 규칙 타입 안전성 확보 |
| Tailwind CSS | 4.x | 유틸리티 퍼스트, shadcn/ui와 네이티브 통합 |
| shadcn/ui | latest | 소스 레벨 커스터마이징, Radix UI 기반 접근성 |
| TanStack Query | 5.x | 서버 상태 캐싱/무효화, 판정 결과 캐싱 |
| react-hook-form + zod | 7.x / 3.x | 비제어 컴포넌트 성능, 런타임+정적 검증 통합 |
| Zustand | 5.x | 클라이언트 상태 관리 |
| framer-motion | 12.x | 페이지 전환, 스크롤 등장, 호버 리프트 |
| lucide-react | latest | 트리 셰이킹 지원 아이콘 |

### 2.2 백엔드 & 인프라

| 기술 | 용도 |
|------|------|
| Supabase | PostgreSQL + Auth + RLS + Storage + Realtime |
| Vercel | 호스팅 (프론트엔드 + API Routes, 서울 리전) |
| Next.js API Routes | 서버리스 API |
| Sentry + Vercel Analytics | 모니터링 |
| GitHub Actions | CI/CD |

### 2.3 외부 데이터 소스

| 데이터 | 소스 | 수집 방법 | 갱신 주기 |
|---|---|---|---|
| 과거 청약 경쟁률 | 청약홈 공공데이터 | 공공 API | 일 1회 |
| 모집공고 정보 | 청약홈 | 공공 API | 일 1회 |
| 실거래가/시세 | 국토부 실거래 공개시스템 | 공공 API | 일 1회 (Phase 2) |
| 학군 데이터 | 교육부/나이스 교육정보 | 공공 API | 분기 1회 (Phase 3 검토) |
| 호재 정보 | 국토부 도시개발/교통망 고시 | 공공 API + 크롤링 | 주 1회 (Phase 3 검토) |

---

## 3. 데이터 모델

### 3.1 핵심 테이블

> **NOTE**: 기존 MVP의 테이블 구조를 기반으로 하되, 새 PRD의 확장 필드를 증분 추가한다.
> 상세 스키마 변경은 `docs/delta-analysis.md` 참조.

**기존 테이블 (유지)**:
- `profiles` — 사용자 프로필 (plan_type, region_code 등 새 필드 추가)
- `complexes` — 분양 단지 (value_grade, predicted_competition_rate 등 새 필드 추가)
- `supply_types` — 공급유형별 정보
- `eligibility_rules` — 자격 판정 규칙
- `eligibility_results` — 판정 결과
- `bookmarks` — 관심 단지
- `notifications` — 알림
- `sync_logs` — 데이터 동기화 로그

**신규 테이블**:
- `historical_competition` — 과거 청약 경쟁률 (예측 모델 학습용)
- `user_interests` — 사용자 관심 단지 & 분석 결과 통합
- `subscription_alerts` — 분양 일정 알림

### 3.2 Supabase RLS 정책

기존 RLS 정책 유지. 신규 테이블에 동일 패턴 적용:
- `user_interests`: 본인만 CRUD (`auth.uid() = user_id`)
- `subscription_alerts`: 본인만 CRUD (`auth.uid() = user_id`)
- `historical_competition`: 인증 사용자 읽기 전용
- `complexes`: 누구나 읽기

---

## 4. 기능 상세 — 유저 플로우 기준

### 4.0 STEP 0: 가입 및 프로필 생성

**트리거**: 첫 앱 접속
**완료 조건**: 청약 프로필 카드 생성 + 가점 자동 계산 완료
**구현 상태**: MVP 완료

#### 화면 구성

```
[S0-1] 온보딩 스플래시
├── 브랜드 소개
├── "+가치 +예측 +보호" 핵심 가치 설명
└── CTA: "내 청약 경쟁력 확인하기"

[S0-2] 소셜 로그인
├── 카카오 로그인 버튼 (primary)
├── 이메일 로그인 (기존 MVP)
└── 개인정보 처리방침 동의 체크박스

[S0-3] 프로필 입력 (다단계 폼)
├── Step 1: 기본 정보
├── Step 2: 세대 정보
├── Step 3: 자산 정보
├── Step 4: 청약 이력
└── 완료: 청약 프로필 카드 생성 (가점 자동 계산)

[S0-4] 청약 프로필 카드
├── 총 가점 (84점 만점 중 XX점)
├── 항목별 점수 breakdown
├── 가능한 공급 유형 뱃지
└── CTA: "내게 맞는 분양 찾기"
```

#### 가점 계산 규칙

```
무주택기간 점수: 최대 32점 (만 30세 이상부터 인정)
부양가족 수 점수: 최대 35점 (0명: 5점 ~ 6명 이상: 35점)
청약통장 가입기간 점수: 최대 17점 (6개월 미만: 1점 ~ 15년 이상: 17점)
총점: 최대 84점
```

---

### 4.1 STEP 1: +가치 — 물건 미래 가치 분석

**트리거**: 사용자가 관심 단지를 선택
**플랜 제한**: Free(비활성), Plus 이상
**완료 조건**: A~F 투자 가치 등급 산출 완료
**구현 상태**: ✅ 구현 완료 (2026-03-10 프로덕션 배포, UI 진입점 3곳 추가 완료)

#### 등급 산정 기준

| 등급 | 점수 범위 | 의미 |
|------|-----------|------|
| A | 85+ | 적극 권장 |
| B | 70~84 | 권장 |
| C | 55~69 | 보통 |
| D | 40~54 | 주의 |
| E | 25~39 | 비권장 |
| F | 0~24 | 기회 소진 경고 |

가중치: 분양가 적정성 35% + 입지 환경 35% + 미래 시세 30%

> **입지 환경 세부 팩터 (Phase 3 고도화 검토)**: 교통 접근성, 학군(초·중·고 학업성취도), 호재(GTX·지하철 신설, 대규모 개발사업 고시), 편의시설 근접성. richgo.ai 레퍼런스 기준 — 9절 참조.

---

### 4.2 STEP 2: +예측 — 경쟁률 예측 엔진

**트리거**: 단지 상세 진입 시 자동 실행
**플랜 제한**: Plus Pro 전용
**구현 상태**: 미구현 (스텁)

#### 3계층 예측 모델

```
최종 예상 경쟁률 = Base x Sentiment계수 x Macro계수

Base Layer: 유사 단지 과거 경쟁률 DB
Sentiment Layer: 모델하우스 방문, 커뮤니티 버즈량
Macro Layer: 금리, 정책, 공급량, 규제
```

---

### 4.3 STEP 3: +보호 — 청약 기회 보호 시스템

**트리거**: +가치 + +예측 결과가 모두 준비되면 자동 산출
**플랜 제한**: Plus Pro 전용
**구현 상태**: 미구현 (스텁)

#### 판정 로직

- **SKIP**: 가치 등급 D~F, 또는 자격 미충족
- **WAIT**: 가치 A~B이나 경쟁률 과열 (당첨 확률 < 10%), 또는 예측 신뢰도 Low
- **GO**: 가치 A~B + 당첨 확률 > 15%, 또는 가치 A + 경쟁률 무관

---

### 4.4 STEP 4: +자격 — 청약 자격 실시간 판정

**트리거**: 관심 단지 선택 시 자동 실행
**플랜 제한**: Free(월 3회), Plus 이상(무제한)
**구현 상태**: MVP 완료

7개 공급유형별 적격/부적격/조건부 판정:
일반공급, 신혼부부, 생애최초, 다자녀, 노부모부양, 기관추천, 이전기관

---

### 4.5 STEP 5: +리포트 — 종합 의사결정 보고서

**플랜 제한**: Plus Pro 전용
**구현 상태**: 미구현 (스텁)

4페이지 PDF: 요약 → +가치 상세 → +예측/+자격 → +비교

---

## 5. 공통 기능

### 5.1 분양 일정 캘린더 & 알림
- 월별 분양 일정 표시
- 알림: D-7, D-3, D-1
- **구현 상태**: 기본 캘린더 UI 존재 (TODO)
- **Phase 3 고도화 검토**: 알림 유형 세분화 (청약 일정 / +가치 등급 변동 / 실거래가 급변 / 관심 단지 경쟁률 급등). richgo.ai UX 레퍼런스 — 9절 참조.

### 5.2 맞춤 분양 추천
- 프로필 기반 자격 충족 단지 자동 필터
- **구현 상태**: MVP 완료

### 5.3 시뮬레이션 (Plus Pro)
- 가점 변화 시뮬레이션
- **구현 상태**: 미구현 (스텁)

---

## 6. 페이지 라우팅 구조

```
/                           → 랜딩 페이지 (비로그인)
/login                      → 소셜 로그인
/signup                     → 이메일 회원가입 (기존 MVP)
/onboarding                 → 프로필 입력 (다단계 폼)
/dashboard                  → 메인 대시보드 (NEW — 스텁)
/complexes                  → 단지 목록/검색
/complexes/[id]             → 단지 상세
/complexes/[id]/value       → +가치 분석 탭 (구현 완료, UI 진입점 추가 완료)
/value                      → +가치 안내 랜딩 페이지 (구현 완료)
/complexes/[id]/prediction  → +예측 탭 (NEW — 스텁)
/complexes/[id]/protection  → +보호 탭 (NEW — 스텁)
/complexes/[id]/eligibility → +자격 판정 탭
/complexes/[id]/report      → +리포트 (NEW — 스텁)
/compare                    → +비교 (NEW — 스텁)
/calendar                   → 분양 일정 캘린더
/recommend                  → 맞춤 추천 (기존 MVP)
/simulation                 → 시뮬레이션 (NEW — 스텁)
/profile                    → 프로필 관리 (기존 MVP)
/settings                   → 설정 (NEW — 스텁)
/settings/subscription      → 구독 관리 (NEW — 스텁)
/notifications              → 알림 센터 (기존 MVP)
```

---

## 7. API 엔드포인트

### 7.1 기존 API (MVP 구현 완료)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/health | 서버 상태 확인 |
| POST | /api/eligibility/evaluate | 자격 판정 실행 |
| GET | /api/complexes | 단지 목록 |
| GET | /api/complexes/[id] | 단지 상세 |
| GET | /api/recommend | 맞춤 추천 |
| GET | /api/notifications | 알림 목록 |
| POST | /api/notifications/[id]/read | 알림 읽음 |
| POST | /api/cron/sync-complexes | 데이터 동기화 |

### 7.2 신규 API

| 메서드 | 경로 | 설명 | 플랜 | 상태 |
|--------|------|------|------|------|
| GET | /api/complexes/[id]/value | +가치 분석 | Plus+ | ✅ 구현 |
| GET | /api/complexes/[id]/prediction | +예측 경쟁률 | Plus Pro | 🔲 스텁 |
| GET | /api/complexes/[id]/protection | +보호 시그널 | Plus Pro | 🔲 스텁 |
| GET | /api/complexes/[id]/report | +리포트 PDF | Plus Pro | 🔲 스텁 |
| POST | /api/interests | 관심 단지 추가 | 전체 | 🔲 스텁 |
| GET | /api/interests | 관심 단지 목록 | 전체 | 🔲 스텁 |
| POST | /api/compare | 단지 비교 | Plus Pro | 🔲 스텁 |
| GET | /api/subscription | 구독 상태 | 전체 | 🔲 스텁 |
| POST | /api/simulation/points | 가점 시뮬레이션 | Plus Pro | 🔲 스텁 |

---

## 8. 개발 단계 & 우선순위

### Phase 1: MVP (완료)

| 우선순위 | 기능 | 상태 |
|---|---|---|
| P0 | 소셜 로그인 (이메일/카카오) | ✅ |
| P0 | 프로필 입력 + 가점 자동 계산 | ✅ |
| P0 | +자격 판정 (7개 공급유형) | ✅ |
| P0 | 단지 목록/검색/상세 | ✅ |
| P0 | 맞춤 분양 추천 | ✅ |
| P0 | 인앱 알림 | ✅ |
| P0 | 청약홈 API 동기화 | ✅ |
| P0 | Vercel 배포 | ✅ |

### Phase 2: 베타 (예정)

| 우선순위 | 기능 | 상태 |
|---|---|---|
| P0 | +가치 분석 기본 (분양가 적정성 + 입지 점수) | ✅ 완료 |
| P0 | +예측 엔진 (Base Layer) | 🔲 스텁 |
| P0 | +보호 시스템 (GO/WAIT/SKIP) | 🔲 스텁 |
| P0 | 유료 구독 결제 (Plus / Plus Pro) | 🔲 스텁 |
| P1 | +가치 고도화 (5년 예상 시세) | 🔲 |
| P1 | +리포트 PDF 생성 | 🔲 스텁 |
| P1 | +비교 (단지 3개) | 🔲 스텁 |
| P2 | 시뮬레이션 기능 | 🔲 스텁 |

### Phase 3: 정식출시 (예정)

| 우선순위 | 기능 | 상태 |
|---|---|---|
| P0 | +예측 실시간 신청 추이 분석 | 🔲 |
| P0 | +예측 Sentiment + Macro Layer | 🔲 |
| P1 | 네이티브 앱 (PWA) | 🔲 |
| P1 | B2B 분양대행사 마케팅 도구 | 🔲 |

---

## 9. 레퍼런스 & 경쟁사 분석

### 9.1 경쟁사 포지셔닝

| 서비스 | 핵심 포지션 | 주요 강점 | 청약플러스 차별점 |
|---|---|---|---|
| **리치고 (richgo.ai)** | 부동산 투자 분석 종합 플랫폼 | 실거래가·시세, 호재·학군 통합 분석, 경매·오피스텔 포괄 | 청약 특화 자격 판정 + GO/WAIT/SKIP 기회 보호 |
| **청약홈** | 공식 청약 접수 창구 | 공식 데이터, 신청 처리 | 분석·예측·의사결정 지원 (청약홈은 접수만 제공) |
| **호갱노노** | 아파트 시세/실거래 조회 | 지도 기반 UX, 실거래 시각화 | 청약 자격 판정 + 투자가치 등급 통합 제공 |

### 9.2 리치고 (richgo.ai) 심층 분석

**포지션**: "부동산 투자 분석 No.1 앱" — 실거래가·시세, 오피스텔, 경매, 청약, 토지/건물, 호재, 학군을 단일 플랫폼에서 제공하는 종합 투자 정보 서비스

**핵심 기능 목록**:

| 기능 영역 | 리치고 제공 내용 | 청약플러스 적용 가능성 |
|---|---|---|
| 아파트 시세·실거래가 | 단지별 실거래 이력, 평형별 시세 추이 | +가치 분석의 미래 시세 산출 기준 데이터 (Phase 2) |
| 호재 분석 | GTX·지하철·대규모 개발 사업 고시 지도 레이어 | 입지 환경 팩터 고도화 — 호재 유형별 가점 반영 (Phase 3) |
| 학군 데이터 | 초·중·고 학업성취도, 학군 경계 표시 | 입지 환경 팩터 — 학군 점수 서브팩터 (Phase 3) |
| 청약 정보 | 분양 일정, 공고 정보 (기본 제공) | 청약플러스는 자격 판정·경쟁률 예측으로 차별화 |
| 경매 정보 | 경매 물건 조회, 입찰 분석 | 청약플러스 범위 외 (현재 로드맵 없음) |
| 찜 목록 | 단지·오피스텔·경매·필지 카테고리별 분리 저장 | 관심 단지(bookmarks) 카테고리 분리 UX 검토 (Phase 3) |
| 알림 세분화 | 청약 일정, 시세 변동, 호재 등록 등 유형별 알림 | 알림 유형 세분화 로드맵 반영 (5.1 참조) |
| 미래가격 예측 | AI 기반 미래 시세 예측 | +가치의 "5년 예상 시세" 팩터와 동일 목적, 방법론 차별화 필요 |

**리치고 브랜드 포지셔닝 시사점**:
- "투자 정보의 통합 플랫폼"을 지향하며 데이터 신뢰성을 전면에 내세운다
- 다양한 부동산 유형(아파트·오피스텔·경매·토지)을 포괄하여 폭넓은 사용자를 확보
- 청약플러스는 "청약 특화"를 강점으로 유지하되, 입지 분석 깊이는 리치고 수준을 지향

### 9.3 리치고 UX 패턴 — 청약플러스 적용 인사이트

**찜 목록 카테고리화**
- 리치고: 단지 / 오피스텔 / 경매 / 필지 탭 분리
- 청약플러스 적용 방향: 현재 단일 bookmarks 테이블을 추후 category 컬럼(분양 청약 / 입주 예정 / 분석 완료)으로 필터링 UX 제공 (Phase 3, P2 우선순위)

**알림 유형 세분화**
- 리치고: 청약 일정·시세 변동·호재 등록 등 유형별 ON/OFF
- 청약플러스 적용 방향: 5.1에 기술된 Phase 3 알림 세분화 계획과 일치. notifications 테이블에 type 컬럼 세분화로 구현 가능

**데이터 신뢰성 시각화**
- 리치고: 공공 API 출처 명시, 데이터 기준일 표시
- 청약플러스 적용 방향: +가치 분석 리포트, 경쟁률 예측 결과에 "데이터 출처 및 기준일" 배지 표시 (사용자 신뢰도 제고)

### 9.4 데이터 소스 참고 — 리치고 대비 청약플러스 현황

| 데이터 유형 | 리치고 활용 여부 | 청약플러스 현황 | 도입 검토 시점 |
|---|---|---|---|
| 국토부 실거래 공개시스템 | 활용 | Phase 2 예정 | Phase 2 (진행 중) |
| 교육부/나이스 학군 데이터 | 활용 | 미도입 | Phase 3 검토 |
| 국토부 도시개발 고시 (호재) | 활용 | 미도입 | Phase 3 검토 |
| 청약홈 공공 API | 공통 활용 | MVP 완료 | 완료 |

---

## 10. 필수 면책 문구

```
본 분석은 공공 데이터 및 AI 모델 기반 예측 결과이며, 투자 조언이 아닙니다.
실제 경쟁률, 시세 변동, 자격 요건은 변경될 수 있으며,
최종 의사결정은 반드시 본인의 판단으로 이루어져야 합니다.
청약플러스는 분석 결과의 정확성을 보증하지 않습니다.
```

---

## 11. 사용자 정의 (User Personas)

### 11.1 주요 사용자 유형

| 유형 | 설명 | 핵심 니즈 | 주요 사용 기능 |
|------|------|-----------|----------------|
| **청약 초보자** | 28~35세, 첫 청약 도전자. 자격 요건과 공급 유형이 혼란스럽다. | "내가 신청할 수 있는 건지" 자격 확인 | +자격 판정, 맞춤 추천, 온보딩 프로필 카드 |
| **재도전자** | 33~42세, 3회 이상 낙첨 경험자. 기회 소진에 대한 불안이 크다. | "이번 청약이 넣을 만한 가치가 있는지" 판단 | +가치 분석(A~F 등급), +보호(GO/WAIT/SKIP), +리포트 |
| **실수요 투자자** | 35~50세, 청약 경험이 있고 수익성까지 고려한다. | "분양가 대비 5년 후 시세 상승 가능성" 예측 | +가치 분석, +예측 경쟁률, +비교(단지 3개) |
| **정보 수집자** | 25~45세, 아직 청약 계획이 없지만 시장 동향을 파악하고 싶다. | 분양 일정 파악 및 조건 변동 알림 수신 | 분양 일정 캘린더, 알림 센터, 단지 검색/조회 |

### 11.2 사용자 시나리오

**시나리오 A — 청약 초보자의 첫 자격 확인**

```
1. 앱 첫 접속 → 온보딩 스플래시 (/onboarding)
2. 이메일 로그인 후 4단계 프로필 입력
   (기본 정보 → 세대 정보 → 자산 정보 → 청약 이력)
3. 청약 프로필 카드 생성 — 총 가점 자동 계산 (84점 만점)
4. 맞춤 추천 (/recommend) — 자격 충족 단지 자동 필터링
5. 관심 단지 선택 → /complexes/[id]/eligibility — 7개 공급유형별 판정 확인
```

**시나리오 B — 재도전자의 가치 분석 기반 의사결정**

```
1. 로그인 후 /complexes — 단지 목록 검색
2. 관심 단지 선택 → /complexes/[id]/value — +가치 분석 탭
3. 분양가 적정성 35% + 입지 환경 35% + 미래 시세 30% 종합 → A~F 등급 확인
4. (Phase 2 완료 후) /complexes/[id]/protection — GO/WAIT/SKIP 최종 판정 확인
5. Plus Pro 플랜 가입 → +리포트 PDF 다운로드
```

**시나리오 C — 분양 일정 알림 수신**

```
1. /calendar — 월별 분양 일정 확인
2. 관심 단지 북마크 등록
3. 알림 설정 — D-7, D-3, D-1 푸시 알림 수신 (notifications 테이블)
4. /notifications — 알림 센터에서 읽음 처리
```

---

## 12. 비기능 요구사항 (Non-Functional Requirements)

### 12.1 성능

- 페이지 초기 로드: 3G 기준 3초 이내 (Next.js RSC + Vercel Edge Network 활용)
- API 응답 시간: 95 퍼센타일 500ms 이내 (Supabase 서울 리전 + Vercel ICN1)
- +가치 분석 API (`/api/complexes/[id]/value`): 첫 계산 1초 이내, TanStack Query 캐시 재사용 시 즉시 반환
- Lighthouse 점수 목표: Performance 90+, Accessibility 90+, Best Practices 90+
- Core Web Vitals 목표: LCP < 2.5s, FID < 100ms, CLS < 0.1
- 번들 크기: 초기 로드 500KB 이내, 전체 2MB 이내

### 12.2 보안

**인증 및 세션**
- Supabase Auth 기반 JWT 세션 관리 (`@supabase/ssr` 쿠키 방식)
- 미들웨어(`middleware.ts`)에서 모든 보호 라우트 사전 차단: 미인증 사용자 → `/login?redirect=` 리다이렉트
- 인증된 사용자의 로그인/회원가입 접근 → `/complexes` 자동 리다이렉트
- 오픈 리다이렉트 방지: `redirect` 파라미터는 `/`로 시작하는 상대 경로만 허용 (CLAUDE.md 9.1)

**데이터 접근 제어**
- Supabase Row Level Security(RLS) 전 테이블 적용:
  - `profiles`, `eligibility_results`, `notifications`, `bookmarks`: `auth.uid() = user_id` 조건의 본인만 CRUD
  - `complexes`, `eligibility_rules`: 인증 여부 무관 읽기 허용
  - `sync_logs`: 서비스 롤(`service_role`)만 쓰기 허용
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 — 클라이언트 노출 금지, API Routes에서만 사용

**API 보안**
- Cron 엔드포인트(`/api/cron/*`)는 `CRON_SECRET` 헤더 검증으로 보호
- 시크릿 비교는 `crypto.timingSafeEqual()` 사용 — 타이밍 공격 방지 (CLAUDE.md 9.2)
- 모든 API 입력값은 zod 스키마로 서버 사이드 검증
- 공공 데이터 API 키(`APPLYHOME_API_KEY`)는 서버 전용 환경변수 — `NEXT_PUBLIC_` 접두사 없음

**기타**
- 환경변수 non-null 단언(`!`) 금지 — 런타임 명시적 null 체크 후 에러 throw (CLAUDE.md 9.4)
- 사용자 노출 에러 메시지는 내부 구현 상세를 포함하지 않음
- `NEXT_PUBLIC_ENV` 변수로 개발/스테이징/프로덕션 환경 구분

### 12.3 가용성

| 구성 요소 | 제공사 SLA | 목표 가용성 |
|-----------|-----------|------------|
| 프론트엔드 + API Routes | Vercel (ICN1 서울 리전) | 99.9% (월 43분 이내 다운) |
| 데이터베이스 + Auth | Supabase (PostgreSQL) | 99.9% |
| 스태틱 자산 CDN | Vercel Edge Network | 99.99% |
| 외부 데이터 동기화 (Cron) | 청약홈 공공 API 의존 | 일 1회 재시도 포함 |

- Cron 동기화 실패 시 재시도 없이 `sync_logs` 테이블에 실패 기록 → 다음 스케줄 자동 재실행
- 공공 API 장애 시 기존 DB 데이터로 서비스 정상 제공 (읽기 전용 degraded mode)
- `/api/health` 엔드포인트를 통한 외부 모니터링 헬스체크 지원

### 12.4 확장성

**수평 확장**
- Next.js API Routes는 Vercel 서버리스 함수로 배포 — 요청량에 따라 자동 스케일링
- Supabase Postgres는 커넥션 풀링으로 동시 접속 처리; 트래픽 급증 시 Supabase Pro 플랜으로 인스턴스 업그레이드

**아키텍처 확장 포인트**
- 리포지토리 레이어(`lib/repositories/`) 분리로 Supabase → 다른 DB 전환 시 서비스 레이어 무변경
- 서비스 레이어(`lib/services/`) 독립성으로 API Routes → Server Actions 전환 용이
- 판정 엔진(`lib/eligibility/`)은 순수 함수 구조로 외부 서비스(Edge Function 등) 이식 가능
- `lib/value-analysis/` 엔진은 순수 함수 11팩터 분리 구조 — 신규 팩터 추가 시 기존 로직 무변경

**데이터 확장**
- Supabase Storage: 사용자 첨부 파일(향후 +리포트 PDF) 저장
- Supabase Realtime: 경쟁률 실시간 추이(Phase 3) 구현 시 웹소켓 채널 활용 가능
- `historical_competition` 테이블은 과거 경쟁률 누적 → +예측 Base Layer 학습 데이터로 활용

---

## 13. 배포 및 인프라

### 13.1 배포 환경

**프로덕션**

| 구성 요소 | 서비스 | 상세 |
|-----------|--------|------|
| 프론트엔드 + API | Vercel | ICN1 서울 리전, 자동 HTTPS |
| 데이터베이스 | Supabase | PostgreSQL 15, 서울 리전 |
| Auth | Supabase Auth (GoTrue) | 이메일 + OAuth 소셜 로그인 |
| 스토리지 | Supabase Storage | 향후 리포트 파일 저장용 |
| CDN | Vercel Edge Network | 정적 자산 전 세계 배포 |
| 도메인 | chungyakplus.vercel.app | Vercel 기본 도메인 (추후 커스텀 도메인 전환 검토) |

**로컬 개발**

```
Supabase 로컬 스택 (supabase/config.toml):
  - API:       http://localhost:54321
  - Database:  localhost:54322 (PostgreSQL 15)
  - Studio:    http://localhost:54323
  - Inbucket:  http://localhost:54324 (이메일 테스트)

Next.js 개발 서버: http://localhost:3000
환경변수: .env.local (cp .env.example .env.local)
```

**마이그레이션 파일**

```
supabase/migrations/
  20260304000000_init.sql           → 초기 스키마 (profiles, complexes 등 핵심 테이블)
  20260305000000_add_sync_fields.sql → 동기화 필드 추가
```

### 13.2 CI/CD

**현재 배포 방식**
- GitHub `master` 브랜치 푸시 → Vercel 자동 빌드 및 프로덕션 배포 (Vercel GitHub 통합)
- Pull Request → Vercel Preview 배포 자동 생성 (PR별 고유 URL)
- GitHub Actions 워크플로우 파일 미구성 상태 — 별도 CI 파이프라인 없음

**배포 전 수동 검증 절차 (CLAUDE.md 8절)**
```
1. npm run type-check   → TypeScript 오류 확인
2. npm run lint         → ESLint 규칙 위반 확인
3. npm run test         → Vitest 단위 테스트 실행
4. npm run build        → Next.js 프로덕션 빌드 성공 확인
5. git push origin master → Vercel 자동 배포 트리거
```

**Cron 스케줄 (`/api/cron/sync-complexes`)**
- Vercel Cron Jobs 또는 외부 스케줄러에서 `CRON_SECRET` 헤더와 함께 일 1회 호출
- 청약홈 공공 API에서 분양 단지 정보 동기화 → `complexes`, `sync_logs` 테이블 갱신

**향후 개선 계획**
- GitHub Actions 워크플로우 추가: PR 시 자동 lint + type-check + test 실행
- Supabase 마이그레이션 자동 적용 파이프라인 구성

### 13.3 모니터링

**현재 구성**

| 항목 | 도구 | 상태 |
|------|------|------|
| 프론트엔드 에러 추적 | Sentry | 설정 예정 (package.json 미포함, PRD 2.2 명시) |
| 웹 성능 분석 | Vercel Analytics | Vercel 대시보드 자동 수집 |
| 서버 헬스체크 | GET /api/health | 운영 중 — `{ status: "ok", timestamp, version }` 반환 |
| 데이터 동기화 이력 | sync_logs 테이블 | DB에 성공/실패 기록 |
| 로컬 개발 로그 | lib/utils/logger.ts | 환경별 로그 레벨 제어 (`no-console` 규칙 준수) |

**모니터링 개선 계획 (Phase 2)**
- Sentry 연동: 런타임 에러 캡처, 사용자 컨텍스트 포함 (GDPR 고려하여 PII 제외)
- Vercel Analytics 대시보드를 통한 Core Web Vitals 상시 모니터링
- `/api/health` 엔드포인트를 외부 업타임 모니터 (예: Better Uptime)에 등록

---

## 14. 성공 지표 (KPI)

### 14.1 비즈니스 지표

| 지표 | 목표 (Phase 2 베타 출시 시점) | 측정 방법 |
|------|------------------------------|-----------|
| 가입자 수 | 1,000명 | Supabase Auth 사용자 수 |
| 월간 활성 사용자 (MAU) | 가입자의 40% 이상 | Vercel Analytics 세션 기준 |
| Plus 이상 유료 전환율 | 가입자의 5% 이상 | subscription 플랜 필드 (`profiles.plan_type`) 집계 |
| +가치 분석 실행 횟수 | MAU당 월 2회 이상 | `/api/complexes/[id]/value` 호출 로그 |
| 자격 판정 실행 횟수 | MAU당 월 3회 이상 | `eligibility_results` 테이블 신규 레코드 수 |
| 알림 오픈율 | 30% 이상 | `notifications` 테이블 read 전환 비율 |
| 사용자 이탈률 (온보딩) | 프로필 완성까지 50% 이상 완료 | `profiles.is_complete` 필드 완성 비율 |

### 14.2 기술 지표

| 지표 | 목표 | 현재 (2026-03-15 기준) |
|------|------|------------------------|
| 빌드 성공 여부 | 항상 GREEN | GREEN (npm run build 통과) |
| 테스트 통과 수 | 500개 이상 | 505개 통과 (21개 파일, 1개 파일 jsdom 의존성 오류) |
| TypeScript 타입 에러 | 0개 | 0개 (any 타입 전면 금지) |
| API 평균 응답 시간 | 500ms 이하 | 측정 미구성 (Vercel Analytics 통해 확인 예정) |
| 프로덕션 에러율 | 0.1% 이하 | 측정 미구성 (Sentry 연동 전) |
| Lighthouse Performance | 90+ | 측정 예정 |
| DB 마이그레이션 파일 수 | 변경 시 증분 관리 | 2개 (타임스탬프 기반 관리) |
| 코드 파일 크기 | 파일당 300줄 이하 | CLAUDE.md 2절 규칙 준수 중 |
