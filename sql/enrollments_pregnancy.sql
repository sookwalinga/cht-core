------------------------------------------------------------
-- Materialized view to show coverage indicators for pregnancy enrollment
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS coverage_pregnancy;

CREATE MATERIALIZED VIEW coverage_pregnancy AS
(

WITH skeleton AS (
  SELECT
    month::DATE,
    district
  FROM generate_series(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval  '1 month') AS t(month)
  JOIN useview_jna_locations ON TRUE
  GROUP BY district, month -- only want district, not shehias
  ORDER BY district,month
  ),

  client_info AS (
    SELECT enrollment_start_date,
      enrollment_end_date,
      district
    FROM client_enrollment_record enroll
    INNER JOIN useview_person person
      ON enroll.patient_id = person._id
    INNER JOIN useview_jna_locations locs
      ON person.catchment_area_uuid = locs.catchment_area_uuid
    WHERE service = 'pregnancy'
  ),

  numerator AS (
    SELECT skeleton.month,
      skeleton.district,
      COUNT(enrollment_start_date) AS enrolled
    FROM skeleton
    LEFT JOIN client_info
      ON skeleton.district = client_info.district
      AND enrollment_start_date <= month
      AND enrollment_end_date >= month
    GROUP BY month, skeleton.district
    ),

  total_births AS (
    -- Use number of births/year as proxy for pregnancies/year
    -- In reality, it will be an underestimate because
    -- around 5-10% of pregnancies terminate early
    SELECT SUM(male)+SUM(female) AS total
    FROM pop_znz_age_sex_2022
    WHERE age = 0
  ),

  denominator AS (
    SELECT district,
      -- Multiply by 9/12 because pregnancy lasts for 9 months
      -- So in a given month, 9/12 of all women that will be
      -- pregnant during the year will be pregnant during that month
      (proportion * 9*total/12)::INT AS population_pregnant
    FROM pop_district_proportions_2018
    INNER JOIN total_births ON TRUE
  )

SELECT numerator.*
  , denominator.population_pregnant
FROM numerator
INNER JOIN denominator
  ON numerator.district = denominator.district

);

CREATE UNIQUE INDEX IF NOT EXISTS month_district ON coverage_pregnancy USING btree(month, district);
ALTER MATERIALIZED VIEW enrollments_pregnancy OWNER TO full_access;
GRANT SELECT ON enrollments_pregnancy TO dtree, periscope;