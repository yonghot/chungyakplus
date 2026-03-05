-- ============================================================================
-- ChungYakMate (청약메이트) - Initial Database Migration
-- Created: 2026-03-04
-- Description: Core schema for housing subscription eligibility platform
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed');
CREATE TYPE subscription_type AS ENUM ('savings', 'deposit', 'housing');
CREATE TYPE complex_status AS ENUM ('upcoming', 'open', 'closed', 'completed');
CREATE TYPE supply_type AS ENUM ('general', 'newlywed', 'first_life', 'multi_child', 'elderly_parent', 'institutional', 'relocation');
CREATE TYPE eligibility_status AS ENUM ('eligible', 'ineligible', 'conditional');
CREATE TYPE notification_type AS ENUM ('recommendation', 'deadline', 'result', 'system');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: User subscription profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT,
  is_household_head BOOLEAN NOT NULL DEFAULT false,
  marital_status marital_status NOT NULL DEFAULT 'single',
  marriage_date DATE,
  dependents_count INTEGER NOT NULL DEFAULT 0,
  homeless_start_date DATE,
  total_assets_krw BIGINT,
  monthly_income_krw BIGINT,
  car_value_krw BIGINT,
  subscription_type subscription_type,
  subscription_start_date DATE,
  deposit_count INTEGER,
  has_won_before BOOLEAN NOT NULL DEFAULT false,
  won_date DATE,
  profile_completion INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS '사용자 청약 프로필 (auth.users와 1:1)';
COMMENT ON COLUMN profiles.homeless_start_date IS '무주택 시작일';
COMMENT ON COLUMN profiles.total_assets_krw IS '총 자산 (원)';
COMMENT ON COLUMN profiles.monthly_income_krw IS '월 소득 (원)';
COMMENT ON COLUMN profiles.car_value_krw IS '자동차 가액 (원)';
COMMENT ON COLUMN profiles.deposit_count IS '청약통장 납입 횟수';
COMMENT ON COLUMN profiles.has_won_before IS '과거 당첨 이력';

-- ----------------------------------------------------------------------------
-- complexes: Housing complex announcements
-- ----------------------------------------------------------------------------
CREATE TABLE complexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  developer TEXT,
  constructor TEXT,
  total_units INTEGER,
  announcement_date DATE,
  subscription_start DATE,
  subscription_end DATE,
  winner_date DATE,
  status complex_status NOT NULL DEFAULT 'upcoming',
  source_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE complexes IS '아파트 단지 공고 정보';
COMMENT ON COLUMN complexes.region IS '시/도';
COMMENT ON COLUMN complexes.district IS '구/군';
COMMENT ON COLUMN complexes.raw_data IS '원본 공고 데이터 (JSON)';

-- ----------------------------------------------------------------------------
-- supply_types: Supply type details per complex
-- ----------------------------------------------------------------------------
CREATE TABLE supply_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  type supply_type NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 0,
  area_sqm NUMERIC(10, 2),
  price_krw BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE supply_types IS '공급유형별 세부사항';
COMMENT ON COLUMN supply_types.area_sqm IS '전용면적 (제곱미터)';
COMMENT ON COLUMN supply_types.price_krw IS '분양가 (원)';

-- ----------------------------------------------------------------------------
-- eligibility_rules: Rule parameters (DB-driven, adjustable without code deploy)
-- ----------------------------------------------------------------------------
CREATE TABLE eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_type supply_type NOT NULL,
  rule_key TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  condition JSONB NOT NULL DEFAULT '{}',
  law_reference TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE eligibility_rules IS '청약 자격 조건 규칙 (코드 배포 없이 조정 가능)';
COMMENT ON COLUMN eligibility_rules.rule_key IS '규칙 식별 키';
COMMENT ON COLUMN eligibility_rules.condition IS '조건 파라미터 (JSON)';
COMMENT ON COLUMN eligibility_rules.law_reference IS '관련 법령 조항';

-- ----------------------------------------------------------------------------
-- eligibility_results: Evaluation results
-- ----------------------------------------------------------------------------
CREATE TABLE eligibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  supply_type supply_type NOT NULL,
  result eligibility_status NOT NULL,
  score INTEGER,
  reasons JSONB NOT NULL DEFAULT '[]',
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, complex_id, supply_type)
);

COMMENT ON TABLE eligibility_results IS '청약 자격 평가 결과';
COMMENT ON COLUMN eligibility_results.score IS '가점 점수';
COMMENT ON COLUMN eligibility_results.reasons IS '판정 사유 목록 (JSON 배열)';

-- ----------------------------------------------------------------------------
-- bookmarks: User bookmarked complexes
-- ----------------------------------------------------------------------------
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complex_id UUID NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, complex_id)
);

COMMENT ON TABLE bookmarks IS '사용자 관심 단지 북마크';

-- ----------------------------------------------------------------------------
-- notifications: In-app notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS '인앱 알림';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_completion ON profiles(profile_completion);

-- complexes
CREATE INDEX idx_complexes_region ON complexes(region);
CREATE INDEX idx_complexes_status ON complexes(status);
CREATE INDEX idx_complexes_region_status ON complexes(region, status);

-- supply_types
CREATE INDEX idx_supply_types_complex ON supply_types(complex_id);
CREATE INDEX idx_supply_types_type ON supply_types(type);

-- eligibility_rules
CREATE INDEX idx_eligibility_rules_supply_type ON eligibility_rules(supply_type);
CREATE INDEX idx_eligibility_rules_active ON eligibility_rules(is_active);

-- eligibility_results
CREATE INDEX idx_eligibility_results_profile ON eligibility_results(profile_id);
CREATE INDEX idx_eligibility_results_complex ON eligibility_results(complex_id);
CREATE INDEX idx_eligibility_results_profile_complex ON eligibility_results(profile_id, complex_id);

-- bookmarks
CREATE INDEX idx_bookmarks_profile ON bookmarks(profile_id);
CREATE INDEX idx_bookmarks_complex ON bookmarks(complex_id);

-- notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER complexes_updated_at
  BEFORE UPDATE ON complexes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER eligibility_rules_updated_at
  BEFORE UPDATE ON eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles: owner CRUD
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- complexes: authenticated read
CREATE POLICY "complexes_select_auth" ON complexes
  FOR SELECT TO authenticated USING (true);

-- supply_types: authenticated read
CREATE POLICY "supply_types_select_auth" ON supply_types
  FOR SELECT TO authenticated USING (true);

-- eligibility_rules: authenticated read
CREATE POLICY "eligibility_rules_select_auth" ON eligibility_rules
  FOR SELECT TO authenticated USING (true);

-- eligibility_results: owner CRUD
CREATE POLICY "results_select_own" ON eligibility_results
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "results_insert_own" ON eligibility_results
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "results_update_own" ON eligibility_results
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "results_delete_own" ON eligibility_results
  FOR DELETE USING (auth.uid() = profile_id);

-- bookmarks: owner CRUD
CREATE POLICY "bookmarks_select_own" ON bookmarks
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "bookmarks_insert_own" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "bookmarks_delete_own" ON bookmarks
  FOR DELETE USING (auth.uid() = profile_id);

-- notifications: owner read + update, system insert
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (true);
