------------------------------------------------------------
-- Materialized view to show coverage indicators for pregnancy enrollment
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS coverage_pregnancy;

CREATE MATERIALIZED VIEW coverage_pregnancy AS
(

  WITH skeleton AS (
    SELECT
      reported_month::DATE AS reported_month,
      district
    FROM generate_series(
      TIMESTAMP '2019-07-01',
      current_date,
      interval '1 month') AS t(reported_month)
    INNER JOIN useview_jna_locations ON TRUE
    GROUP BY district, reported_month -- only want district, not shehias
    ORDER BY district,reported_month
  ),

  client_info AS (
    SELECT
      enrollment_start_date,
      enrollment_end_date,
      district
    FROM client_enrollment_record AS enroll
    INNER JOIN useview_person AS person
      ON enroll.patient_id = person._id
    INNER JOIN useview_jna_locations AS locs
      ON person.catchment_area_uuid = locs.catchment_area_uuid
    WHERE service = 'pregnancy'
  ),

  numerator AS (
    SELECT
      skeleton.reported_month,
      skeleton.district,
      count(enrollment_start_date) AS pregnancy_enrolled
    FROM skeleton
    LEFT JOIN client_info
      ON skeleton.district = client_info.district
        AND enrollment_start_date <= reported_month
        AND enrollment_end_date >= reported_month
    GROUP BY reported_month, skeleton.district
  ),

  total_births AS (
    -- Use number of births/year as proxy for pregnancies/year
    -- In reality, it will be an underestimate because
    -- around 5-10% of pregnancies terminate early
    SELECT sum(male) + sum(female) AS total
    FROM pop_znz_age_sex_2022
    WHERE age = 0
  ),

  denominator AS (
    SELECT
      district,
      -- Multiply by 9/12 because pregnancy lasts for 9 months
      -- So in a given month, 9/12 of all women that will be
      -- pregnant during the year will be pregnant during that month
      (proportion * 9 * total / 12)::INT AS pregnancy_population
    FROM pop_district_proportions_2018
    INNER JOIN total_births ON TRUE
  )

  SELECT
    numerator.*,
    denominator.pregnancy_population
  FROM numerator
  INNER JOIN denominator
    ON numerator.district = denominator.district

);

CREATE UNIQUE INDEX IF NOT EXISTS coverage_pregnancy_month_district ON coverage_pregnancy USING btree(reported_month, district);
ALTER MATERIALIZED VIEW coverage_pregnancy OWNER TO full_access;
GRANT SELECT ON coverage_pregnancy TO dtree, periscope;