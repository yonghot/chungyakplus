-- ============================================================================
-- 청약플러스 (ChungYak Plus) - Seed Data
-- Created: 2026-03-04
-- Description: Realistic Korean housing complex data and eligibility rules
-- ============================================================================

-- ============================================================================
-- AUTH USERS & PROFILES (개발/테스트용 계정)
-- ============================================================================

-- 관리자 계정: admin@admin.com / admin123!
-- 원격 Supabase에서는 대시보드로 Auth 사용자를 먼저 생성한 뒤 아래 프로필만 삽입한다.
-- 로컬 Supabase에서는 auth.users + auth.identities + profiles 전부 삽입한다.

-- [로컬 전용] Auth 사용자 생성 (원격에서는 이미 대시보드로 생성됨)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'admin@admin.com',
  crypt('admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"관리자"}',
  now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider,
  identity_data, last_sign_in_at,
  created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'admin@admin.com', 'email',
  '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@admin.com"}',
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- 프로필 생성 (로컬: 위 auth.users의 UUID 사용)
INSERT INTO profiles (
  id, name, birth_date,
  is_household_head, marital_status,
  dependents_count, has_won_before,
  profile_completion
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '관리자', '1990-01-01',
  true, 'single',
  0, false,
  30
) ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- COMPLEXES (15 realistic Korean housing complexes)
-- ============================================================================

-- Seoul complexes (서울)
INSERT INTO complexes (name, region, district, address, developer, constructor, total_units, announcement_date, subscription_start, subscription_end, winner_date, status, source_url)
VALUES
  -- OPEN (currently accepting subscriptions)
  ('래미안 원펜타스', '서울특별시', '서초구', '서울특별시 서초구 반포동 1-1', '삼성물산', '삼성물산 건설부문', 641, '2026-02-15', '2026-03-01', '2026-03-10', '2026-03-20', 'open', 'https://www.applyhome.co.kr'),

  ('디에이치 퍼스티어', '서울특별시', '강남구', '서울특별시 강남구 개포동 12-3', '현대건설', '현대건설', 1957, '2026-02-20', '2026-03-03', '2026-03-12', '2026-03-25', 'open', 'https://www.applyhome.co.kr'),

  ('힐스테이트 용산 더원', '서울특별시', '용산구', '서울특별시 용산구 한남동 810', '현대엔지니어링', '현대건설', 892, '2026-02-25', '2026-03-05', '2026-03-14', '2026-03-28', 'open', 'https://www.applyhome.co.kr'),

  ('롯데캐슬 르센트 마포', '서울특별시', '마포구', '서울특별시 마포구 아현동 555', '롯데건설', '롯데건설', 1245, '2026-02-28', '2026-03-06', '2026-03-15', '2026-03-30', 'open', 'https://www.applyhome.co.kr'),

  ('e편한세상 노원 포레안', '서울특별시', '노원구', '서울특별시 노원구 상계동 320-5', 'DL이앤씨', 'DL이앤씨', 782, '2026-03-01', '2026-03-08', '2026-03-17', '2026-04-01', 'open', 'https://www.applyhome.co.kr'),

  -- UPCOMING (announced but subscription not yet started)
  ('래미안 DMC 센트럴', '서울특별시', '은평구', '서울특별시 은평구 수색동 200', '삼성물산', '삼성물산 건설부문', 1580, '2026-03-10', '2026-03-25', '2026-04-03', '2026-04-15', 'upcoming', 'https://www.applyhome.co.kr'),

  ('더샵 잠실 르엘', '서울특별시', '송파구', '서울특별시 송파구 잠실동 45-2', '포스코이앤씨', '포스코이앤씨', 2678, '2026-03-15', '2026-04-01', '2026-04-10', '2026-04-22', 'upcoming', 'https://www.applyhome.co.kr'),

  ('아크로 리버뷰 한강', '서울특별시', '동작구', '서울특별시 동작구 흑석동 100-8', 'DL이앤씨', 'DL이앤씨', 1105, '2026-03-20', '2026-04-05', '2026-04-14', '2026-04-28', 'upcoming', 'https://www.applyhome.co.kr'),

  -- Gyeonggi complexes (경기)
  ('힐스테이트 더 운정', '경기도', '파주시', '경기도 파주시 운정신도시 A-12블록', '현대엔지니어링', '현대건설', 2340, '2026-02-18', '2026-03-02', '2026-03-11', '2026-03-22', 'open', 'https://www.applyhome.co.kr'),

  ('자이 위브 동탄', '경기도', '화성시', '경기도 화성시 동탄2신도시 C-5블록', 'GS건설', 'GS건설', 1876, '2026-03-05', '2026-03-20', '2026-03-29', '2026-04-10', 'upcoming', 'https://www.applyhome.co.kr'),

  ('e편한세상 광교 더퍼스트', '경기도', '수원시', '경기도 수원시 영통구 이의동 산 94-1', 'DL이앤씨', 'DL이앤씨', 1432, '2026-03-12', '2026-03-28', '2026-04-06', '2026-04-18', 'upcoming', 'https://www.applyhome.co.kr'),

  -- Incheon complexes (인천)
  ('시티오씨엘 7단지', '인천광역시', '연수구', '인천광역시 연수구 송도동 M-3블록', 'HDC현대산업개발', 'HDC현대산업개발', 2105, '2026-02-10', '2026-02-25', '2026-03-06', '2026-03-15', 'open', 'https://www.applyhome.co.kr'),

  -- CLOSED (subscription period ended, awaiting results)
  ('래미안 라클래시', '서울특별시', '서초구', '서울특별시 서초구 방배동 2771', '삼성물산', '삼성물산 건설부문', 1097, '2026-01-20', '2026-02-05', '2026-02-14', '2026-02-28', 'closed', 'https://www.applyhome.co.kr'),

  ('푸르지오 벨라듀 위례', '경기도', '성남시', '경기도 성남시 수정구 창곡동 위례신도시 A3-11블록', '대우건설', '대우건설', 985, '2026-01-25', '2026-02-10', '2026-02-19', '2026-03-05', 'closed', 'https://www.applyhome.co.kr'),

  ('SK뷰 인천 루원시티', '인천광역시', '서구', '인천광역시 서구 가정동 루원시티 B-2블록', 'SK에코플랜트', 'SK에코플랜트', 1320, '2026-01-15', '2026-02-01', '2026-02-10', '2026-02-25', 'closed', 'https://www.applyhome.co.kr'),

  -- COMPLETED (winners announced)
  ('힐스테이트 과천 센트럴', '경기도', '과천시', '경기도 과천시 갈현동 과천지식정보타운 S-1블록', '현대건설', '현대건설', 1750, '2025-11-10', '2025-11-25', '2025-12-04', '2025-12-18', 'completed', 'https://www.applyhome.co.kr'),

  ('롯데캐슬 이스트폴 강동', '서울특별시', '강동구', '서울특별시 강동구 둔촌동 170-1', '롯데건설', '롯데건설', 3058, '2025-10-20', '2025-11-05', '2025-11-14', '2025-11-28', 'completed', 'https://www.applyhome.co.kr');


-- ============================================================================
-- SUPPLY TYPES (3-5 types per complex)
-- ============================================================================

-- Helper: We reference complexes by name using subqueries for independence

-- 래미안 원펜타스
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '래미안 원펜타스'), 'general', 192, 59.98, 890000000),
  ((SELECT id FROM complexes WHERE name = '래미안 원펜타스'), 'general', 128, 74.85, 1050000000),
  ((SELECT id FROM complexes WHERE name = '래미안 원펜타스'), 'newlywed', 96, 59.98, 890000000),
  ((SELECT id FROM complexes WHERE name = '래미안 원펜타스'), 'first_life', 64, 59.98, 890000000),
  ((SELECT id FROM complexes WHERE name = '래미안 원펜타스'), 'multi_child', 32, 84.92, 1200000000);

-- 디에이치 퍼스티어
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '디에이치 퍼스티어'), 'general', 586, 59.96, 950000000),
  ((SELECT id FROM complexes WHERE name = '디에이치 퍼스티어'), 'general', 392, 74.99, 1120000000),
  ((SELECT id FROM complexes WHERE name = '디에이치 퍼스티어'), 'newlywed', 294, 59.96, 950000000),
  ((SELECT id FROM complexes WHERE name = '디에이치 퍼스티어'), 'first_life', 196, 59.96, 950000000),
  ((SELECT id FROM complexes WHERE name = '디에이치 퍼스티어'), 'multi_child', 98, 84.98, 1180000000);

-- 힐스테이트 용산 더원
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '힐스테이트 용산 더원'), 'general', 268, 59.91, 880000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 용산 더원'), 'general', 178, 74.88, 1030000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 용산 더원'), 'newlywed', 134, 59.91, 880000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 용산 더원'), 'first_life', 89, 59.91, 880000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 용산 더원'), 'elderly_parent', 45, 84.95, 1150000000);

-- 롯데캐슬 르센트 마포
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 르센트 마포'), 'general', 374, 59.87, 720000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 르센트 마포'), 'general', 249, 74.93, 860000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 르센트 마포'), 'newlywed', 187, 59.87, 720000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 르센트 마포'), 'first_life', 125, 59.87, 720000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 르센트 마포'), 'multi_child', 62, 84.90, 980000000);

-- e편한세상 노원 포레안
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = 'e편한세상 노원 포레안'), 'general', 234, 59.94, 580000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 노원 포레안'), 'general', 156, 74.91, 690000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 노원 포레안'), 'newlywed', 117, 59.94, 580000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 노원 포레안'), 'first_life', 78, 59.94, 580000000);

-- 래미안 DMC 센트럴
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '래미안 DMC 센트럴'), 'general', 474, 59.99, 650000000),
  ((SELECT id FROM complexes WHERE name = '래미안 DMC 센트럴'), 'general', 316, 74.82, 780000000),
  ((SELECT id FROM complexes WHERE name = '래미안 DMC 센트럴'), 'newlywed', 237, 59.99, 650000000),
  ((SELECT id FROM complexes WHERE name = '래미안 DMC 센트럴'), 'first_life', 158, 59.99, 650000000),
  ((SELECT id FROM complexes WHERE name = '래미안 DMC 센트럴'), 'multi_child', 79, 84.88, 920000000);

-- 더샵 잠실 르엘
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '더샵 잠실 르엘'), 'general', 803, 59.95, 980000000),
  ((SELECT id FROM complexes WHERE name = '더샵 잠실 르엘'), 'general', 536, 74.97, 1150000000),
  ((SELECT id FROM complexes WHERE name = '더샵 잠실 르엘'), 'newlywed', 402, 59.95, 980000000),
  ((SELECT id FROM complexes WHERE name = '더샵 잠실 르엘'), 'first_life', 268, 59.95, 980000000),
  ((SELECT id FROM complexes WHERE name = '더샵 잠실 르엘'), 'multi_child', 134, 84.96, 1200000000);

-- 아크로 리버뷰 한강
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '아크로 리버뷰 한강'), 'general', 332, 59.90, 750000000),
  ((SELECT id FROM complexes WHERE name = '아크로 리버뷰 한강'), 'general', 221, 74.86, 890000000),
  ((SELECT id FROM complexes WHERE name = '아크로 리버뷰 한강'), 'newlywed', 166, 59.90, 750000000),
  ((SELECT id FROM complexes WHERE name = '아크로 리버뷰 한강'), 'first_life', 110, 59.90, 750000000);

-- 힐스테이트 더 운정
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '힐스테이트 더 운정'), 'general', 702, 59.93, 420000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 더 운정'), 'general', 468, 74.89, 510000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 더 운정'), 'newlywed', 351, 59.93, 420000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 더 운정'), 'first_life', 234, 59.93, 420000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 더 운정'), 'multi_child', 117, 84.91, 620000000);

-- 자이 위브 동탄
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '자이 위브 동탄'), 'general', 563, 59.88, 480000000),
  ((SELECT id FROM complexes WHERE name = '자이 위브 동탄'), 'general', 375, 74.94, 580000000),
  ((SELECT id FROM complexes WHERE name = '자이 위브 동탄'), 'newlywed', 281, 59.88, 480000000),
  ((SELECT id FROM complexes WHERE name = '자이 위브 동탄'), 'first_life', 188, 59.88, 480000000),
  ((SELECT id FROM complexes WHERE name = '자이 위브 동탄'), 'multi_child', 94, 84.87, 680000000);

-- e편한세상 광교 더퍼스트
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = 'e편한세상 광교 더퍼스트'), 'general', 430, 59.92, 620000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 광교 더퍼스트'), 'general', 286, 74.90, 740000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 광교 더퍼스트'), 'newlywed', 215, 59.92, 620000000),
  ((SELECT id FROM complexes WHERE name = 'e편한세상 광교 더퍼스트'), 'first_life', 143, 59.92, 620000000);

-- 시티오씨엘 7단지
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '시티오씨엘 7단지'), 'general', 631, 59.97, 450000000),
  ((SELECT id FROM complexes WHERE name = '시티오씨엘 7단지'), 'general', 421, 74.84, 540000000),
  ((SELECT id FROM complexes WHERE name = '시티오씨엘 7단지'), 'newlywed', 316, 59.97, 450000000),
  ((SELECT id FROM complexes WHERE name = '시티오씨엘 7단지'), 'first_life', 210, 59.97, 450000000),
  ((SELECT id FROM complexes WHERE name = '시티오씨엘 7단지'), 'multi_child', 105, 84.93, 650000000);

-- 래미안 라클래시
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '래미안 라클래시'), 'general', 329, 59.96, 830000000),
  ((SELECT id FROM complexes WHERE name = '래미안 라클래시'), 'general', 219, 74.87, 980000000),
  ((SELECT id FROM complexes WHERE name = '래미안 라클래시'), 'newlywed', 165, 59.96, 830000000),
  ((SELECT id FROM complexes WHERE name = '래미안 라클래시'), 'first_life', 110, 59.96, 830000000);

-- 푸르지오 벨라듀 위례
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '푸르지오 벨라듀 위례'), 'general', 296, 59.89, 560000000),
  ((SELECT id FROM complexes WHERE name = '푸르지오 벨라듀 위례'), 'general', 197, 74.95, 670000000),
  ((SELECT id FROM complexes WHERE name = '푸르지오 벨라듀 위례'), 'newlywed', 148, 59.89, 560000000),
  ((SELECT id FROM complexes WHERE name = '푸르지오 벨라듀 위례'), 'first_life', 98, 59.89, 560000000);

-- SK뷰 인천 루원시티
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = 'SK뷰 인천 루원시티'), 'general', 396, 59.85, 380000000),
  ((SELECT id FROM complexes WHERE name = 'SK뷰 인천 루원시티'), 'general', 264, 74.92, 460000000),
  ((SELECT id FROM complexes WHERE name = 'SK뷰 인천 루원시티'), 'newlywed', 198, 59.85, 380000000),
  ((SELECT id FROM complexes WHERE name = 'SK뷰 인천 루원시티'), 'first_life', 132, 59.85, 380000000);

-- 힐스테이트 과천 센트럴
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '힐스테이트 과천 센트럴'), 'general', 525, 59.94, 750000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 과천 센트럴'), 'general', 350, 74.88, 890000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 과천 센트럴'), 'newlywed', 262, 59.94, 750000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 과천 센트럴'), 'first_life', 175, 59.94, 750000000),
  ((SELECT id FROM complexes WHERE name = '힐스테이트 과천 센트럴'), 'multi_child', 88, 84.94, 1050000000);

-- 롯데캐슬 이스트폴 강동
INSERT INTO supply_types (complex_id, type, unit_count, area_sqm, price_krw) VALUES
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 이스트폴 강동'), 'general', 917, 59.86, 680000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 이스트폴 강동'), 'general', 612, 74.91, 810000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 이스트폴 강동'), 'newlywed', 458, 59.86, 680000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 이스트폴 강동'), 'first_life', 306, 59.86, 680000000),
  ((SELECT id FROM complexes WHERE name = '롯데캐슬 이스트폴 강동'), 'multi_child', 153, 84.89, 950000000);


-- ============================================================================
-- ELIGIBILITY RULES (base rules for each supply type)
-- ============================================================================

-- ----------------------------------------------------------------
-- 일반공급 (General Supply) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

-- 무주택 요건
('general', 'homeless_requirement', '무주택세대구성원 요건', '{
  "type": "boolean_check",
  "field": "homeless_start_date",
  "operator": "is_not_null",
  "description": "입주자모집공고일 현재 무주택세대구성원이어야 함"
}', '주택공급에 관한 규칙 제25조', 10, true),

-- 청약통장 가입기간 요건 (서울/수도권)
('general', 'subscription_period_metro', '청약통장 가입기간 (수도권)', '{
  "type": "date_diff",
  "field": "subscription_start_date",
  "operator": "gte",
  "value_months": 24,
  "region_filter": ["서울특별시", "경기도", "인천광역시"],
  "description": "수도권 기준 청약통장 가입기간 24개월 이상"
}', '주택공급에 관한 규칙 제25조 제3항', 20, true),

-- 납입 횟수 요건 (수도권)
('general', 'deposit_count_metro', '납입 횟수 (수도권)', '{
  "type": "numeric_compare",
  "field": "deposit_count",
  "operator": "gte",
  "value": 24,
  "region_filter": ["서울특별시", "경기도", "인천광역시"],
  "description": "수도권 기준 납입 횟수 24회 이상"
}', '주택공급에 관한 규칙 제25조 제3항', 30, true);


-- ----------------------------------------------------------------
-- 신혼부부 특별공급 (Newlywed Special Supply) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

-- 혼인기간 요건
('newlywed', 'marriage_period', '혼인기간 요건', '{
  "type": "date_diff",
  "field": "marriage_date",
  "operator": "lte",
  "value_years": 7,
  "description": "입주자모집공고일 기준 혼인기간 7년 이내"
}', '주택공급에 관한 규칙 제35조 제1항', 10, true),

-- 소득 요건 (맞벌이 기준)
('newlywed', 'income_limit_dual', '소득 요건 (맞벌이)', '{
  "type": "numeric_compare",
  "field": "monthly_income_krw",
  "operator": "lte",
  "value": 9160000,
  "description": "도시근로자 가구당 월평균 소득의 140% 이하 (맞벌이 기준)",
  "note": "2026년 기준 3인가구 도시근로자 월평균 소득 6,543,000원의 140%"
}', '주택공급에 관한 규칙 제35조 제1항 제3호', 20, true),

-- 무주택 요건
('newlywed', 'homeless_requirement', '무주택세대구성원 요건', '{
  "type": "boolean_check",
  "field": "homeless_start_date",
  "operator": "is_not_null",
  "description": "혼인 중 주택을 소유한 사실이 없는 무주택세대구성원"
}', '주택공급에 관한 규칙 제35조 제1항 제1호', 5, true);


-- ----------------------------------------------------------------
-- 생애최초 특별공급 (First Life Special Supply) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

-- 당첨이력 요건
('first_life', 'no_prior_win', '과거 당첨이력 없음', '{
  "type": "boolean_check",
  "field": "has_won_before",
  "operator": "equals",
  "value": false,
  "description": "과거 주택 당첨 사실이 없어야 함"
}', '주택공급에 관한 규칙 제36조 제1항 제1호', 10, true),

-- 소득 요건
('first_life', 'income_limit', '소득 요건', '{
  "type": "numeric_compare",
  "field": "monthly_income_krw",
  "operator": "lte",
  "value": 7828000,
  "description": "도시근로자 가구당 월평균 소득의 130% 이하",
  "note": "2026년 기준 3인가구 도시근로자 월평균 소득 6,022,000원의 130%"
}', '주택공급에 관한 규칙 제36조 제1항 제3호', 20, true),

-- 납입 횟수 요건
('first_life', 'deposit_count', '납입 횟수 요건', '{
  "type": "numeric_compare",
  "field": "deposit_count",
  "operator": "gte",
  "value": 60,
  "description": "청약통장 60회 이상 납입"
}', '주택공급에 관한 규칙 제36조 제1항 제2호', 30, true);


-- ----------------------------------------------------------------
-- 다자녀 특별공급 (Multi-Child Special Supply) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

-- 미성년 자녀 수 요건
('multi_child', 'min_dependents', '미성년 자녀 수 요건', '{
  "type": "numeric_compare",
  "field": "dependents_count",
  "operator": "gte",
  "value": 3,
  "description": "미성년 자녀 3명 이상"
}', '주택공급에 관한 규칙 제37조 제1항', 10, true),

-- 무주택 요건
('multi_child', 'homeless_requirement', '무주택세대구성원 요건', '{
  "type": "boolean_check",
  "field": "homeless_start_date",
  "operator": "is_not_null",
  "description": "무주택세대구성원이어야 함"
}', '주택공급에 관한 규칙 제37조 제1항 제1호', 5, true),

-- 자산 요건
('multi_child', 'asset_limit', '자산 요건', '{
  "type": "numeric_compare",
  "field": "total_assets_krw",
  "operator": "lte",
  "value": 362000000,
  "description": "부동산, 자동차 등 총자산 3억 6,200만원 이하",
  "note": "2026년 기준 자산 보유 기준"
}', '주택공급에 관한 규칙 제37조 제1항 제3호', 20, true);


-- ----------------------------------------------------------------
-- 노부모부양 특별공급 (Elderly Parent Special Supply) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

-- 세대주 요건
('elderly_parent', 'household_head', '세대주 요건', '{
  "type": "boolean_check",
  "field": "is_household_head",
  "operator": "equals",
  "value": true,
  "description": "만 65세 이상 직계존속을 3년 이상 부양하는 세대주"
}', '주택공급에 관한 규칙 제38조 제1항', 10, true),

-- 무주택 요건
('elderly_parent', 'homeless_requirement', '무주택세대구성원 요건', '{
  "type": "boolean_check",
  "field": "homeless_start_date",
  "operator": "is_not_null",
  "description": "무주택세대구성원이어야 함"
}', '주택공급에 관한 규칙 제38조 제1항 제1호', 5, true);


-- ----------------------------------------------------------------
-- 기관추천 특별공급 (Institutional Recommendation) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

('institutional', 'institutional_recommendation', '기관추천 요건', '{
  "type": "meta_rule",
  "description": "국가유공자, 장애인, 철거민 등 관련 기관의 추천을 받은 자",
  "sub_categories": ["국가유공자", "장애인", "북한이탈주민", "철거민", "군인"],
  "note": "세부 요건은 해당 기관별 기준에 따름"
}', '주택공급에 관한 규칙 제34조', 10, true);


-- ----------------------------------------------------------------
-- 이주자용 특별공급 (Relocation) Rules
-- ----------------------------------------------------------------
INSERT INTO eligibility_rules (supply_type, rule_key, rule_name, condition, law_reference, priority, is_active) VALUES

('relocation', 'relocation_requirement', '이주대책 대상자 요건', '{
  "type": "meta_rule",
  "description": "택지개발사업, 도시개발사업 등에 따른 이주대책 대상자",
  "note": "사업시행자가 인정하는 이주대책 대상자에 한함"
}', '주택공급에 관한 규칙 제33조', 10, true);
