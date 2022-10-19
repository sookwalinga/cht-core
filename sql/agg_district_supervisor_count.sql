------------------------------------------------------------
-- Materialized view to show table of aggregation of district chv supervisors count.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_district_supervisor_count;
CREATE MATERIALIZED VIEW agg_district_supervisor_count AS
(
  WITH chvs AS (
    SELECT
      district,
      sum((sex = 'male')::INT) AS chvs_male_all_time,
      sum((sex = 'female')::INT) AS chvs_female_all_time,
      sum((sex = 'male' AND retired IS NULL)::INT) AS chvs_male_now,
      sum((sex = 'female' AND retired IS NULL)::INT) AS chvs_female_now
    FROM useview_chv AS chv
    INNER JOIN useview_jna_locations AS location
      ON chv.catchment_area_uuid = location.catchment_area_uuid
    GROUP BY district
  ),

  supervisors AS (
    SELECT
      district,
      sum((sex = 'male')::INT) AS supervisor_male_all_time,
      sum((sex = 'female')::INT) AS supervisor_female_all_time,
      sum((sex = 'male' AND retired IS NULL)::INT) AS supervisor_male_now,
      sum((sex = 'female' AND retired IS NULL)::INT) AS supervisor_female_now
    FROM useview_supervisor AS sup
    INNER JOIN useview_supervisory_area AS area
      ON sup.supervisory_area_uuid = area._id
    GROUP BY district
  )

  SELECT
    chvs.*,
    supervisor_male_all_time,
    supervisor_female_all_time,
    supervisor_male_now,
    supervisor_female_now
  FROM chvs
  LEFT JOIN supervisors
    ON chvs.district = supervisors.district
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_district_supervisor_key ON agg_district_supervisor_count USING btree(district);
-- Permissions
ALTER MATERIALIZED VIEW agg_district_supervisor_count OWNER TO full_access;
GRANT SELECT ON agg_district_supervisor_count TO dtree, periscope;





