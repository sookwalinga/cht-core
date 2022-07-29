------------------------------------------------------------
-- Materialized view to show coverage indicators for child enrollment
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS coverage_child;

CREATE MATERIALIZED VIEW coverage_child AS
(

WITH skeleton AS (
  SELECT
    month::DATE
    ,district
  FROM generate_series(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval '1 month') AS t(month)
  JOIN useview_jna_locations ON TRUE
  GROUP BY district,month -- only want district, not shehias
  ORDER BY district,month
  ),

  client_info AS (
    SELECT enrollment_start_date,
      enrollment_end_date,
      district,
      date_of_birth,
      sex
    FROM client_enrollment_record enroll
    INNER JOIN useview_person person
      ON enroll.patient_id = person._id
    INNER JOIN useview_jna_locations locs
      ON person.catchment_area_uuid = locs.catchment_area_uuid
    WHERE service = 'child'
  ),

  numerator AS (
    SELECT skeleton.month,
      skeleton.district,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 0 AND (month-date_of_birth)/30 <= 5
              AND sex='male') AS enrolled_0_5_months_m,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 0 AND (month-date_of_birth)/30 <= 5
              AND sex='female') AS enrolled_0_5_months_f,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 6 AND (month-date_of_birth)/30 <= 23
              AND sex='male') AS enrolled_6_23_months_m,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 6 AND (month-date_of_birth)/30 <= 23
              AND sex='female') AS enrolled_6_23_months_f,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 24 AND (month-date_of_birth)/365 < 5
              AND sex='male') AS enrolled_2_4_years_m,
      COUNT(enrollment_start_date) filter (
        WHERE (month-date_of_birth)/30 >= 24 AND (month-date_of_birth)/365 < 5
              AND sex='female') AS enrolled_2_4_years_f
    FROM skeleton
    LEFT JOIN client_info
      ON skeleton.district = client_info.district
      AND enrollment_start_date <= month
      AND enrollment_end_date >= month
    GROUP BY month, skeleton.district
  ),

  denominator AS (
    SELECT district,
        -- Assume equal number of births each month
      (proportion * 6*male/12)::INT AS population_0_5_months_m,
      (proportion * 6*female/12)::INT AS population_0_5_months_f,
      (proportion * 18*male/12)::INT AS population_6_23_months_m,
      (proportion * 18*female/12)::INT AS population_6_23_months_f,
      (proportion * 3*male)::INT AS population_2_4_years_m,
      (proportion * 3*female)::INT AS population_2_4_years_f
    FROM pop_district_proportions_2018
    INNER JOIN pop_znz_age_sex_2022 ON TRUE
    WHERE age = 0
  )

SELECT numerator.*,
  denominator.population_0_5_months_m,
  denominator.population_0_5_months_f,
  denominator.population_6_23_months_m,
  denominator.population_6_23_months_f,
  denominator.population_2_4_years_m,
  denominator.population_2_4_years_f
FROM numerator
INNER JOIN denominator
  ON numerator.district = denominator.district

);

CREATE UNIQUE INDEX IF NOT EXISTS month_district ON coverage_child USING btree(month, district);
ALTER MATERIALIZED VIEW enrollments_child OWNER TO full_access;
GRANT SELECT ON enrollments_child TO dtree, periscope;