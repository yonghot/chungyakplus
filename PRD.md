# 청약메이트 (ChungYakMate) PRD

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 청약메이트 (ChungYakMate) |
| **한줄 요약** | 시행사 도메인 지식 기반 청약 자격 진단 및 당첨 확률 분석 웹서비스 |
| **해결 문제** | 연간 2만 건의 부적격 당첨 취소 — 복잡한 자격 요건, 분산된 정보, 예측 불가능한 당첨 가능성으로 청약자가 적격 판단을 스스로 하기 어려움 |
| **목표 사용자** | 청약 초보자(28~35세, 첫 내 집 마련), 재도전자(33~42세, 3회 이상 낙첨 경험) |

### KPI (MVP)

| 지표 | 목표 | 측정 방식 |
|------|------|-----------|
| MAU | 10,000명 | Supabase Auth 기반 활성 사용자 |
| 판정 정확도 | 95% (MVP) → 99% (정식) | 실제 당첨/부적격 결과 대비 판정 일치율 |
| 판정 소요 시간 | < 3초 | 서버 응답 시간 (p95) |
| 프로필 완성률 | 70% | 필수 필드 입력 완료 비율 |
| 월간 판정 횟수 | 50,000건 | 판정 API 호출 수 |

---

## 2. 핵심 사용자 페르소나

### 페르소나 A: 김민준 (청약 초보자)

| 항목 | 내용 |
|------|------|
| **나이/직업** | 30세, IT 스타트업 개발자 |
| **주거 상태** | 전세 거주, 무주택 세대주 |
| **목표** | 첫 내 집 마련을 위한 청약 자격 확인 및 최적 단지 탐색 |
| **페인포인트** | 청약 용어(가점, 공급유형) 이해 어려움, 자격 요건 자가 판단 불가, 정보가 카페/블로그에 분산 |
| **기대 행동** | 프로필 입력 → 자격 판정 결과 확인 → 추천 단지 알림 수신 → 모집공고 캘린더 확인 |

### 페르소나 B: 이수진 (재도전자)

| 항목 | 내용 |
|------|------|
| **나이/직업** | 38세, 대기업 회계팀 |
| **주거 상태** | 전세 거주, 기혼, 자녀 1명, 3회 낙첨 |
| **목표** | 가점 극대화 전략 수립, 유형별 당첨 가능성 비교, 부적격 위험 사전 차단 |
| **페인포인트** | 신혼부부/생애최초 등 복수 유형 비교 어려움, 가점 계산 실수로 낙첨 반복 |
| **기대 행동** | 복수 유형 동시 판정 → 가점 시뮬레이션 → 단지별 경쟁률 비교 → 맞춤 알림으로 적시 신청 |

---

## 3. 기능 명세

### P0 (MVP 필수)

#### F-001: 사용자 인증

| 항목 | 내용 |
|------|------|
| **설명** | 이메일/소셜 로그인 기반 회원가입 및 로그인 |
| **의존관계** | 없음 |

**사용자 스토리**: 청약 초보자로서, 간편하게 가입하여 서비스를 빠르게 이용하고 싶다.

**인수 조건 (AC)**:
1. 이메일/비밀번호 또는 카카오 소셜 로그인으로 가입할 수 있다
2. 로그인 후 JWT 기반 세션이 유지되며, 보호 라우트에 접근할 수 있다
3. 미인증 사용자가 보호 라우트 접근 시 `/login`으로 리다이렉트된다

---

#### F-002: 사용자 프로필 시스템

| 항목 | 내용 |
|------|------|
| **설명** | 청약 판정에 필요한 개인/세대 정보 입력 및 관리 |
| **의존관계** | F-001 |

**사용자 스토리**: 청약자로서, 나의 세대 정보를 한 번 입력하면 여러 단지에 반복 적용하고 싶다.

**인수 조건 (AC)**:
1. 온보딩 위자드(4단계: 기본정보 → 세대정보 → 자산정보 → 청약이력)로 프로필을 생성할 수 있다
2. 프로필 완성도가 퍼센트로 표시되며, 미입력 필드에 대한 안내가 제공된다
3. 프로필 수정 시 이전 판정 결과에 영향을 주는 필드 변경 시 재판정 안내가 표시된다
4. 입력값은 zod 스키마로 실시간 검증되며, 잘못된 입력 시 구체적 오류 메시지가 표시된다

---

#### F-003: 청약 자격 판정 엔진

| 항목 | 내용 |
|------|------|
| **설명** | 법령 기반 규칙 엔진으로 공급유형별 자격 적합/부적합 판정 |
| **의존관계** | F-002 |

**사용자 스토리**: 청약자로서, 특정 단지의 공급유형별 자격 여부를 정확하게 알고 싶다.

**인수 조건 (AC)**:
1. 일반공급, 신혼부부, 생애최초, 다자녀, 노부모부양, 기관추천, 이전기관 7개 유형에 대해 적격/부적격/조건부 판정을 수행한다
2. 판정 결과에 근거 법령 조항과 부적격 사유가 명시된다
3. 판정 소요 시간이 3초 이내이다 (p95)
4. 동일 입력에 대해 동일 결과를 보장한다 (멱등성)

**판정 엔진 아키텍처**:
- 1차: 주택공급에 관한 규칙, 주택법, 소득세법 등 법령/규정 기반
- 2차: 시행사 클라이언트 구두 감수 피드백 반영
- 3차: 운영 중 실제 판정 결과 축적 및 규칙 보정

---

#### F-004: 가점 자동 계산기

| 항목 | 내용 |
|------|------|
| **설명** | 무주택기간, 부양가족수, 청약통장 가입기간 기반 84점 만점 가점 자동 계산 |
| **의존관계** | F-002 |

**사용자 스토리**: 청약자로서, 나의 청약 가점을 정확하게 계산하여 경쟁력을 파악하고 싶다.

**인수 조건 (AC)**:
1. 무주택기간(32점), 부양가족수(35점), 청약통장 가입기간(17점) 항목별 점수가 자동 계산된다
2. 각 항목별 점수 산출 근거가 표시된다
3. 프로필 변경 시 가점이 실시간 재계산된다

---

#### F-005: 모집공고 데이터 수집 및 표시

| 항목 | 내용 |
|------|------|
| **설명** | 공공 데이터 기반 모집공고 수집, 단지 상세 정보 표시 |
| **의존관계** | 없음 |

**사용자 스토리**: 청약자로서, 현재 접수 중인 모집공고를 한 곳에서 확인하고 싶다.

**인수 조건 (AC)**:
1. 단지 목록이 지역/상태(접수예정, 접수중, 접수마감) 필터로 조회된다
2. 단지 상세에서 공급유형별 세대수, 면적, 가격 정보가 표시된다
3. 데이터는 1일 1회 이상 갱신되며, 마지막 갱신 시각이 표시된다

---

#### F-006: 맞춤 추천 및 알림

| 항목 | 내용 |
|------|------|
| **설명** | 사용자 프로필 기반 적격 단지 추천 및 일정 알림 |
| **의존관계** | F-002, F-003, F-005 |

**사용자 스토리**: 청약자로서, 내가 자격이 되는 단지가 나오면 놓치지 않고 알림을 받고 싶다.

**인수 조건 (AC)**:
1. 프로필 기반으로 적격 판정된 단지가 추천 목록에 표시된다
2. 추천 단지의 접수 시작 D-7, D-1, D-Day에 인앱 알림이 발송된다
3. 알림 수신 여부를 사용자가 설정할 수 있다

---

### P1 (MVP 후속)

| ID | 기능 | 설명 | 의존관계 |
|----|------|------|----------|
| F-007 | 당첨 확률 분석 (AI 베타) | 과거 경쟁률/가점 데이터 기반 확률 추정 | F-003, F-004 |
| F-008 | 구독 결제 시스템 | 무료/스탠다드(9,900)/프리미엄(29,900) 플랜 | F-001 |
| F-009 | 관리자 대시보드 | 판정 통계, 사용자 관리, 규칙 관리 | F-003 |
| F-010 | 청약 캘린더 | 월별 일정 뷰, 개인 관심 단지 일정 통합 | F-005, F-006 |

### P2 (장기)

| ID | 기능 | 설명 | 의존관계 |
|----|------|------|----------|
| F-011 | B2B 분양 광고 플랫폼 | 시행사 대상 광고 상품 | F-005 |
| F-012 | 커뮤니티 (후기/정보공유) | 당첨 후기, 질의응답 | F-001 |
| F-013 | 네이티브 앱 (PWA) | 푸시 알림, 오프라인 지원 | 전체 |

---

## 4. 사용자 플로우

### 해피 패스: 첫 판정까지

```
[랜딩(/)] → 회원가입 버튼
  → [/signup] 이메일 또는 카카오 가입
  → [/onboarding] 4단계 위자드
      Step 1: 기본정보 (이름, 생년월일, 연락처)
      Step 2: 세대정보 (세대주여부, 혼인상태, 부양가족수, 무주택기간)
      Step 3: 자산정보 (총자산, 월소득, 자동차가액)
      Step 4: 청약이력 (통장유형, 가입일, 납입횟수, 당첨이력)
  → [/profile] 프로필 확인 (완성도 100%)
  → [/complexes] 단지 목록 탐색
  → [/complexes/:id] 단지 상세 확인
  → [/complexes/:id/eligibility] 자격 판정 실행
      → 7개 공급유형별 적격/부적격 결과 + 가점 표시
  → [/recommend] 맞춤 추천 단지 확인
```

### 에러 패스

| 상황 | 처리 |
|------|------|
| 프로필 미완성 상태에서 판정 시도 | 누락 필드 안내 + 프로필 편집 페이지로 유도 |
| 판정 엔진 타임아웃 (>3초) | "잠시 후 다시 시도해주세요" 토스트 + 재시도 버튼 |
| 잘못된 프로필 데이터 | zod 검증 오류 메시지 인라인 표시 |
| 미인증 상태 보호 라우트 접근 | `/login?redirect={원래경로}` 리다이렉트 |
| 네트워크 오류 | TanStack Query retry(3회) + 오프라인 안내 |

---

## 5. 기술 스택 상세

| 기술 | 버전 | 선택 근거 |
|------|------|-----------|
| **Next.js** | 15 (App Router) | RSC로 초기 로드 최적화, 서버 액션으로 API 레이어 단순화, 병렬 라우트/인터셉팅으로 복잡한 UI 지원 |
| **TypeScript** | 5.x | 판정 엔진의 규칙 타입 안전성 확보, 엔드투엔드 타입 공유 |
| **Vercel** | - | Next.js 네이티브 배포, Edge Functions, 서울 리전, 프리뷰 배포 |
| **Supabase** | - | PostgreSQL + Auth + Realtime + Storage 통합, RLS로 데이터 보안, 무료 티어로 MVP 검증 |
| **shadcn/ui** | latest | 소스 레벨 커스터마이징, Radix UI 기반 접근성, Tailwind 네이티브 스타일링 |
| **Tailwind CSS** | 4.x | 유틸리티 퍼스트, 빌드 타임 최적화, shadcn/ui와 네이티브 통합 |
| **TanStack Query** | 5.x | 서버 상태 캐싱/무효화, 판정 결과 캐싱, 낙관적 업데이트 |
| **react-hook-form** | 7.x | 비제어 컴포넌트 기반 성능, 온보딩 위자드 다단계 폼 관리 |
| **zod** | 3.x | 런타임 + 정적 타입 검증 통합, 서버/클라이언트 스키마 공유 |
| **lucide-react** | latest | 트리 셰이킹 지원, shadcn/ui 기본 아이콘 세트 |

---

## 6. 데이터 모델

### 엔티티 관계도

```
users (Supabase Auth)
  │
  ├─ 1:1 ── profiles
  │            │
  │            ├─ 1:N ── eligibility_results
  │            │            │
  │            │            └─ N:1 ── complexes
  │            │
  │            └─ 1:N ── bookmarks
  │                         │
  │                         └─ N:1 ── complexes
  │
  └─ 1:N ── notifications

complexes
  │
  ├─ 1:N ── supply_types
  │
  └─ 1:N ── eligibility_rules
```

### Supabase 스키마

#### profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 기본정보
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT,
  -- 세대정보
  is_household_head BOOLEAN NOT NULL DEFAULT false,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('single','married','divorced','widowed')),
  marriage_date DATE,
  dependents_count INTEGER NOT NULL DEFAULT 0,
  homeless_start_date DATE, -- 무주택 시작일
  -- 자산정보
  total_assets_krw BIGINT, -- 총자산 (원)
  monthly_income_krw BIGINT, -- 월소득 (원)
  car_value_krw BIGINT, -- 자동차가액 (원)
  -- 청약이력
  subscription_type TEXT CHECK (subscription_type IN ('savings','deposit','housing')),
  subscription_start_date DATE,
  deposit_count INTEGER DEFAULT 0,
  has_won_before BOOLEAN NOT NULL DEFAULT false,
  won_date DATE,
  -- 메타
  profile_completion INTEGER NOT NULL DEFAULT 0, -- 0~100
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### complexes

```sql
CREATE TABLE complexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL, -- 시도
  district TEXT NOT NULL, -- 시군구
  address TEXT,
  developer TEXT, -- 시행사
  constructor TEXT, -- 시공사
  total_units INTEGER,
  announcement_date DATE, -- 모집공고일
  subscription_start DATE, -- 접수시작일
  subscription_end DATE, -- 접수종료일
  winner_date DATE, -- 당첨자발표일
  status TEXT NOT NULL CHECK (status IN ('upcoming','open','closed','completed'))
    DEFAULT 'upcoming',
  source_url TEXT, -- 원본 공고 링크
  raw_data JSONB, -- 원본 데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### supply_types

```sql
CREATE TABLE supply_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'general','newlywed','first_life','multi_child',
    'elderly_parent','institutional','relocation'
  )),
  unit_count INTEGER NOT NULL, -- 공급세대수
  area_sqm NUMERIC(6,2), -- 전용면적 (m2)
  price_krw BIGINT, -- 분양가 (원)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### eligibility_rules

```sql
CREATE TABLE eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_type TEXT NOT NULL,
  rule_key TEXT NOT NULL, -- 규칙 식별자 (e.g., 'min_homeless_period')
  rule_name TEXT NOT NULL, -- 규칙명
  condition JSONB NOT NULL, -- 판정 조건 (JSON 규칙)
  law_reference TEXT, -- 근거 법령 (e.g., '주택공급규칙 제25조')
  priority INTEGER NOT NULL DEFAULT 0, -- 판정 순서
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### eligibility_results

```sql
CREATE TABLE eligibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  supply_type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('eligible','ineligible','conditional')),
  score INTEGER, -- 가점 (일반공급 시)
  reasons JSONB NOT NULL DEFAULT '[]', -- 판정 근거 배열
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, complex_id, supply_type)
);
```

#### bookmarks

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, complex_id)
);
```

#### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recommendation','deadline','result','system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### RLS 정책

```sql
-- profiles: 본인만 CRUD
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_owner" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- eligibility_results: 본인 결과만 조회/생성
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_owner" ON eligibility_results
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- bookmarks: 본인만 CRUD
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_owner" ON bookmarks
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- notifications: 본인만 조회
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_owner" ON notifications
  USING (user_id = auth.uid());

-- complexes, supply_types, eligibility_rules: 인증 사용자 읽기 전용
ALTER TABLE complexes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complexes_read" ON complexes FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE supply_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supply_types_read" ON supply_types FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_read" ON eligibility_rules FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 7. API 설계

### 통일 응답 포맷

```typescript
// 성공
{ "data": T, "error": null }

// 실패
{ "data": null, "error": { "code": string, "message": string } }
```

### 인증 전략

- Supabase Auth JWT → `Authorization: Bearer <token>`
- Next.js 미들웨어에서 세션 검증
- Server Actions에서 `createServerClient`로 서버사이드 인증

### 엔드포인트

대부분 Next.js Server Actions + Supabase 직접 쿼리로 구현. 별도 REST API가 필요한 경우:

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/eligibility/evaluate` | 자격 판정 실행 | 필수 |
| GET | `/api/complexes` | 단지 목록 (필터/페이지네이션) | 필수 |
| GET | `/api/complexes/:id` | 단지 상세 | 필수 |
| GET | `/api/recommend` | 맞춤 추천 단지 | 필수 |
| GET | `/api/notifications` | 알림 목록 | 필수 |
| PATCH | `/api/notifications/:id/read` | 알림 읽음 처리 | 필수 |
| POST | `/api/cron/sync-complexes` | 모집공고 데이터 동기화 | Cron Secret |

### 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| `AUTH_REQUIRED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `PROFILE_INCOMPLETE` | 422 | 프로필 미완성 (판정 불가) |
| `COMPLEX_NOT_FOUND` | 404 | 단지 없음 |
| `EVALUATION_TIMEOUT` | 504 | 판정 타임아웃 |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `RATE_LIMIT` | 429 | 요청 횟수 초과 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## 8. 페이지/라우트 맵

### App Router 구조

```
app/
├── layout.tsx              # 루트 레이아웃 (Providers, 글로벌 네비게이션)
├── page.tsx                # / — 랜딩 페이지 (공개)
├── (auth)/
│   ├── layout.tsx          # 인증 레이아웃 (로고 중앙)
│   ├── login/page.tsx      # /login
│   └── signup/page.tsx     # /signup
├── (main)/
│   ├── layout.tsx          # 메인 레이아웃 (사이드바/탭바, 보호)
│   ├── onboarding/page.tsx # /onboarding — 4단계 위자드
│   ├── profile/page.tsx    # /profile — 프로필 관리
│   ├── complexes/
│   │   ├── page.tsx        # /complexes — 단지 목록
│   │   └── [id]/
│   │       ├── page.tsx    # /complexes/:id — 단지 상세
│   │       └── eligibility/
│   │           └── page.tsx # /complexes/:id/eligibility — 판정 결과
│   ├── recommend/page.tsx  # /recommend — 맞춤 추천
│   ├── calendar/page.tsx   # /calendar — 청약 캘린더 [PROD-TODO]
│   └── notifications/page.tsx # /notifications — 알림 센터
└── api/
    ├── eligibility/evaluate/route.ts
    └── cron/sync-complexes/route.ts
```

### 라우트 보호

| 라우트 | 접근 | 비고 |
|--------|------|------|
| `/` | 공개 | 랜딩 |
| `/login`, `/signup` | 공개 | 인증 사용자는 `/complexes`로 리다이렉트 |
| `/onboarding` | 인증 | 프로필 미생성 시만 접근 |
| `/profile`, `/complexes/**`, `/recommend`, `/notifications` | 인증 | 프로필 필수 |
| `/calendar` | 인증 | [PROD-TODO] |
| `/admin/**` | 인증 + 관리자 | [PROD-TODO] |

### 레이아웃 계층

```
RootLayout (Providers: Supabase, TanStack Query, Theme)
├── (auth) Layout — 최소 UI, 중앙 정렬
└── (main) Layout — 헤더 + 사이드바(데스크톱) / 하단탭(모바일)
```

---

## 9. 디렉토리 구조

```
chungyakmate/
├── .env.local                    # 환경변수 (Supabase URL/키)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts                  # 인증 미들웨어 (세션 검증, 리다이렉트)
│
├── app/                          # App Router 페이지 (위 라우트 맵 참조)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   ├── (main)/
│   └── api/
│
├── components/                   # 공유 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트 (Button, Card, Dialog 등)
│   ├── forms/                    # 폼 컴포넌트 (ProfileForm, OnboardingWizard)
│   ├── layout/                   # 레이아웃 (Header, Sidebar, MobileNav)
│   └── features/                 # 도메인 컴포넌트
│       ├── eligibility/          # 판정 결과 카드, 유형별 배지
│       ├── complexes/            # 단지 카드, 필터, 목록
│       ├── recommendation/       # 추천 카드, 알림 설정
│       └── profile/              # 프로필 뷰, 가점 차트
│
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/
│   │   ├── client.ts             # 브라우저 클라이언트
│   │   ├── server.ts             # 서버 클라이언트
│   │   ├── middleware.ts         # 미들웨어 클라이언트
│   │   └── types.ts              # Database 타입 (supabase gen types)
│   ├── eligibility/
│   │   ├── engine.ts             # 판정 엔진 코어
│   │   ├── rules/                # 공급유형별 규칙 모듈
│   │   │   ├── general.ts        # 일반공급
│   │   │   ├── newlywed.ts       # 신혼부부
│   │   │   ├── first-life.ts     # 생애최초
│   │   │   ├── multi-child.ts    # 다자녀
│   │   │   ├── elderly-parent.ts # 노부모부양
│   │   │   ├── institutional.ts  # 기관추천
│   │   │   └── relocation.ts     # 이전기관
│   │   ├── scoring.ts            # 가점 계산 (84점)
│   │   └── types.ts              # 판정 관련 타입
│   ├── validations/              # zod 스키마
│   │   ├── profile.ts
│   │   └── eligibility.ts
│   └── utils/                    # 공통 유틸리티
│       ├── format.ts             # 날짜, 금액 포매팅
│       └── constants.ts          # 상수 (지역 목록, 공급유형 등)
│
├── hooks/                        # 커스텀 훅
│   ├── use-profile.ts            # 프로필 CRUD (TanStack Query)
│   ├── use-eligibility.ts        # 판정 실행/결과 조회
│   ├── use-complexes.ts          # 단지 목록/상세
│   └── use-notifications.ts      # 알림 목록/읽음 처리
│
├── stores/                       # 클라이언트 상태 (필요 시)
│   └── onboarding-store.ts       # 온보딩 위자드 임시 상태
│
├── types/                        # 전역 타입 정의
│   └── index.ts
│
└── supabase/                     # Supabase 로컬 개발
    ├── migrations/               # SQL 마이그레이션 파일
    ├── seed.sql                  # 시드 데이터
    └── config.toml
```

---

## 10. 비기능 요구사항

### 성능

| 지표 | 목표 | 측정 |
|------|------|------|
| LCP | < 2.5초 | Vercel Analytics |
| FID | < 100ms | Vercel Analytics |
| CLS | < 0.1 | Vercel Analytics |
| 판정 API 응답 | < 3초 (p95) | Supabase Logs |
| 단지 목록 로드 | < 1초 | TanStack Query devtools |

### 보안

- Supabase RLS로 모든 테이블 행 수준 접근 제어
- 서버 액션에서 `auth.uid()` 기반 권한 확인
- 환경변수로 API 키 관리 (`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용)
- CSRF: Next.js Server Actions 기본 보호
- XSS: React 기본 이스케이프 + CSP 헤더
- Rate Limiting: Vercel Edge Middleware 또는 Supabase pg_rate_limiter [PROD-TODO]

### 접근성

- WCAG 2.1 AA 준수 목표
- shadcn/ui (Radix UI) 기반 키보드 네비게이션 및 스크린 리더 지원
- 색상 대비율 4.5:1 이상
- 폼 필드에 `aria-label`, `aria-describedby` 오류 연결

### 반응형

- 모바일 퍼스트 (360px~)
- 브레이크포인트: sm(640), md(768), lg(1024), xl(1280)
- 모바일: 하단 탭 네비게이션
- 데스크톱: 좌측 사이드바 네비게이션

### SEO

- 랜딩 페이지 SSG (정적 생성)
- 단지 상세 페이지 ISR (증분 정적 재생성, revalidate: 3600)
- `metadata` API로 페이지별 메타 태그
- `robots.txt`, `sitemap.xml` 자동 생성

---

## 11. 프로토타입 범위

### MVP 포함

- [x] 이메일/카카오 소셜 로그인 (Supabase Auth)
- [x] 4단계 온보딩 위자드 + 프로필 CRUD
- [x] 7개 공급유형 자격 판정 엔진
- [x] 84점 가점 자동 계산기
- [x] 모집공고 데이터 표시 (수동 시드 데이터)
- [x] 맞춤 추천 단지 목록
- [x] 인앱 알림 (DB 기반)
- [x] 반응형 UI (모바일/데스크톱)

### MVP 제외 [PROD-TODO]

- [ ] AI 당첨 확률 분석 (F-007)
- [ ] 결제/구독 시스템 (F-008)
- [ ] 관리자 대시보드 (F-009)
- [ ] 청약 캘린더 (F-010)
- [ ] B2B 분양 광고 플랫폼 (F-011)
- [ ] 커뮤니티 기능 (F-012)
- [ ] 네이티브 앱/PWA (F-013)
- [ ] 공공데이터 API 자동 연동 (Cron 기반 크롤링)
- [ ] Rate Limiting 고도화
- [ ] 이메일/SMS 외부 알림
- [ ] 판정 정확도 모니터링 대시보드

### 수익 모델 (정식 출시 시)

| 플랜 | 월 요금 | 주요 기능 |
|------|---------|-----------|
| 무료 | 0원 | 기본 판정 월 3회, 단지 열람 |
| 스탠다드 | 9,900원 | 무제한 판정, 맞춤 추천, 알림 |
| 프리미엄 | 29,900원 | AI 확률분석, 가점 시뮬레이션, 우선 지원 |
