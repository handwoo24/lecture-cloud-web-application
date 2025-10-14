-- 'products' 테이블에서 카테고리와 이름(선택 사항)으로 제품을 조회합니다.
SELECT
  *
FROM
  products
WHERE
  -- 1. 카테고리 필터링: $1 (카테고리)이 NULL이거나, category 값이 $1과 일치하는 경우
  ($1::text IS NULL OR category = $1)
  
  -- 2. 이름 필터링: $2 (이름)가 NULL이거나, name 값이 $2 패턴을 포함하는 경우 (대소문자 무시)
  AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%');

