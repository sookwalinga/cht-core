------------------------------------------------------------
-- Materialized view to show table of aggregation of district chv supervisors count.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_district_supervisor_count;
CREATE MATERIALIZED VIEW agg_district_supervisor_count AS
(
WITH chvs AS(
  SELECT 
    district
    ,SUM((sex = 'male')::INT) as chvs_male_all_time
    ,SUM((sex = 'female')::INT) as chvs_female_all_time
    ,SUM((sex = 'male' AND retired IS NULL)::INT) as chvs_male_now
    ,SUM((sex = 'female' AND retired IS NULL)::INT) as chvs_female_now
  FROM useview_chv chv
  INNER JOIN useview_jna_locations location
  ON chv.catchment_area_uuid=location.catchment_area_uuid
  GROUP BY district
),
supervisors AS(
SELECT 
    district
    ,SUM((sex='male')::INT) as supervisor_male_all_time
    ,SUM((sex='female')::INT) as supervisor_female_all_time
    ,SUM((sex='male' AND retired IS NULL)::INT) as supervisor_male_now
    ,SUM((sex='female' AND retired IS NULL)::INT) as supervisor_female_now
  FROM useview_supervisor AS sup
  INNER JOIN useview_supervisory_area area
  ON sup.supervisory_area_uuid=area._id
  GROUP BY district
)

SELECT chvs.*
    ,supervisor_male_all_time
    ,supervisor_female_all_time
    ,supervisor_male_now
    ,supervisor_female_now
 FROM chvs 
 LEFT JOIN supervisors
 ON chvs.district=supervisors.district
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_district_supervisor_key ON agg_district_supervisor_count USING btree (district);
-- Permissions
ALTER MATERIALIZED VIEW agg_district_supervisor_count OWNER TO full_access;
GRANT SELECT ON agg_district_supervisor_count TO dtree, periscope;





