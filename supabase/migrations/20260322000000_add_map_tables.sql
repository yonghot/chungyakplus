-- 지도 기반 부동산 분석 UI를 위한 테이블 및 PostGIS 함수
-- apartment_complexes: 지도용 단지 좌표/메타데이터
-- price_data: 시세 데이터 (실거래/호가/전세)
-- ai_predictions: AI 가격 예측 데이터

-- PostGIS 확장 활성화 (Supabase에서 기본 제공)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 아파트 단지 마스터 ───
CREATE TABLE apartment_complexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  dong TEXT NOT NULL,
  location GEOMETRY(POINT, 4326),
  total_units INTEGER,
  total_buildings INTEGER,
  built_year INTEGER,
  developer TEXT,
  complex_type TEXT DEFAULT 'apartment',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 시세 데이터 ───
CREATE TABLE price_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complex_id UUID REFERENCES apartment_complexes(id) ON DELETE CASCADE,
  area_sqm NUMERIC NOT NULL,
  price BIGINT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('trade', 'asking', 'jeonse')),
  recorded_at DATE NOT NULL,
  floor INTEGER,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── AI 예측 데이터 ───
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complex_id UUID REFERENCES apartment_complexes(id) ON DELETE CASCADE,
  current_price BIGINT NOT NULL,
  predicted_price BIGINT NOT NULL,
  prediction_period_months INTEGER DEFAULT 24,
  change_rate NUMERIC,
  confidence NUMERIC,
  model_version TEXT,
  predicted_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 인덱스 ───
CREATE INDEX idx_apt_complexes_location ON apartment_complexes USING GIST(location);
CREATE INDEX idx_apt_complexes_district ON apartment_complexes(district);
CREATE INDEX idx_price_data_complex ON price_data(complex_id, recorded_at DESC);
CREATE INDEX idx_ai_predictions_complex ON ai_predictions(complex_id, predicted_at DESC);

-- ─── RLS 정책 (공개 읽기) ───
ALTER TABLE apartment_complexes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apartment_complexes_public_read"
  ON apartment_complexes FOR SELECT USING (true);

ALTER TABLE price_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_data_public_read"
  ON price_data FOR SELECT USING (true);

ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_predictions_public_read"
  ON ai_predictions FOR SELECT USING (true);

-- ─── 뷰포트 내 아파트 조회 RPC 함수 ───
CREATE OR REPLACE FUNCTION apartments_in_bounds(
  sw_lng DOUBLE PRECISION,
  sw_lat DOUBLE PRECISION,
  ne_lng DOUBLE PRECISION,
  ne_lat DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  district TEXT,
  dong TEXT,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  total_units INTEGER,
  built_year INTEGER,
  latest_price BIGINT,
  price_change_rate NUMERIC,
  predicted_price BIGINT,
  prediction_change_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.name,
    ac.address,
    ac.district,
    ac.dong,
    ST_X(ac.location)::DOUBLE PRECISION AS lng,
    ST_Y(ac.location)::DOUBLE PRECISION AS lat,
    ac.total_units,
    ac.built_year,
    latest_pd.price AS latest_price,
    latest_pd.change_rate AS price_change_rate,
    latest_ap.predicted_price,
    latest_ap.change_rate AS prediction_change_rate
  FROM apartment_complexes ac
  LEFT JOIN LATERAL (
    SELECT
      p.price,
      ROUND(
        CASE
          WHEN prev.price > 0
          THEN ((p.price - prev.price)::NUMERIC / prev.price * 100)
          ELSE 0
        END, 1
      ) AS change_rate
    FROM price_data p
    LEFT JOIN LATERAL (
      SELECT p2.price
      FROM price_data p2
      WHERE p2.complex_id = ac.id
        AND p2.price_type = 'trade'
        AND p2.recorded_at < p.recorded_at
      ORDER BY p2.recorded_at DESC
      LIMIT 1
    ) prev ON true
    WHERE p.complex_id = ac.id AND p.price_type = 'trade'
    ORDER BY p.recorded_at DESC
    LIMIT 1
  ) latest_pd ON true
  LEFT JOIN LATERAL (
    SELECT ap2.predicted_price, ap2.change_rate
    FROM ai_predictions ap2
    WHERE ap2.complex_id = ac.id
    ORDER BY ap2.predicted_at DESC
    LIMIT 1
  ) latest_ap ON true
  WHERE ST_Within(
    ac.location,
    ST_MakeEnvelope(sw_lng, sw_lat, ne_lng, ne_lat, 4326)
  );
END;
$$ LANGUAGE plpgsql STABLE;
