------------------------------------------------------------
-- Materialized view to show coverage indicators for child enrollment
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS coverage_child;

CREATE MATERIALIZED VIEW coverage_child AS
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
    GROUP BY district,reported_month -- only want district, not shehias
    ORDER BY district,reported_month
  ),

  categories AS (
    SELECT * FROM ( VALUES
      (0,5,'0_5months'),
      (6,23,'6_23months'),
      (24,59,'24_59months')
    )
    AS age(low,up,category)
  ),

  client_info AS (
    SELECT
      enrollment_start_date,
      enrollment_end_date,
      district,
      date_of_birth,
      sex
    FROM client_enrollment_record AS enroll
    INNER JOIN useview_person AS person
      ON enroll.patient_id = person._id
    INNER JOIN useview_jna_locations AS locs
      ON person.catchment_area_uuid = locs.catchment_area_uuid
    WHERE service = 'child'
  ),

  numerator AS (
    SELECT
      skeleton.reported_month,
      skeleton.district,
      age.category AS child_age,
      client.sex,
      count(*) AS children_enrolled
    FROM skeleton
    LEFT JOIN client_info AS client
      ON skeleton.district = client.district
        AND enrollment_start_date <= reported_month
        AND enrollment_end_date >= reported_month
    INNER JOIN categories AS age
      ON (reported_month - date_of_birth) / 30 BETWEEN age.low AND age.up
    GROUP BY reported_month, skeleton.district, child_age, client.sex
  ),

  denominator AS (
    SELECT
      district,
      -- Assume equal number of births each month
      (proportion * 6 * male / 12)::INT AS population_0_5_months_m,
      (proportion * 6 * female / 12)::INT AS population_0_5_months_f,
      (proportion * 18 * male / 12)::INT AS population_6_23_months_m,
      (proportion * 18 * female / 12)::INT AS population_6_23_months_f,
      (proportion * 3 * male)::INT AS population_2_4_years_m,
      (proportion * 3 * female)::INT AS population_2_4_years_f
    FROM pop_district_proportions_2018
    INNER JOIN pop_znz_age_sex_2022 ON TRUE
    WHERE age = 0
  )

  SELECT
    numerator.reported_month,
    numerator.district,
    'child_age,sex' AS disaggregation,
    numerator.children_enrolled,
    numerator.child_age || ',' || sex AS disaggregation_value,
    CASE WHEN child_age = '0_5months' AND sex = 'male' THEN population_0_5_months_m
      WHEN child_age = '0_5months' AND sex = 'female' THEN population_0_5_months_f
      WHEN child_age = '6_23months' AND sex = 'male' THEN population_6_23_months_m
      WHEN child_age = '6_23months' AND sex = 'female' THEN population_6_23_months_f
      WHEN child_age = '24_59months' AND sex = 'male' THEN population_2_4_years_m
      WHEN child_age = '24_59months' AND sex = 'female' THEN population_2_4_years_f
    END AS children_population
  FROM numerator
  INNER JOIN denominator
    ON numerator.district = denominator.district
);

CREATE UNIQUE INDEX IF NOT EXISTS month_district ON coverage_child USING btree(reported_month, district);
ALTER MATERIALIZED VIEW enrollments_child OWNER TO full_access;
GRANT SELECT ON enrollments_child TO dtree, periscope;