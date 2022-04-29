------------------------------------------------------------
-- Materialized view to show table of chv performance.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_performance;

CREATE MATERIALIZED VIEW chv_performance AS 
(
WITH hh_registration AS (
SELECT 
    chv_uuid AS _id
    ,date_trunc('month',reported_date) AS month
    ,COUNT(*) AS num_households_registered
FROM useview_household
GROUP BY _id,month
),
pregnancy_enrollments AS (
SELECT 
    chv_uuid AS _id
    ,date_trunc('month',reported_date) AS month
    ,COUNT(*) AS num_pregnancy_enrollments
FROM useview_pregnancy 
WHERE consent IS TRUE
GROUP BY _id,month
),
pregnancy_visits AS (
SELECT 
    chv_uuid AS _id
    ,date_trunc('month',reported_date) AS month
    ,COUNT(*) AS num_pregnancy_visits
FROM useview_pregnancy
WHERE consent IS TRUE OR consent IS NULL 
GROUP BY _id,month
),
child_enrollments AS (
SELECT chv_uuid AS _id
      ,date_trunc('month',reported_date) AS month
      ,COUNT(*) AS num_child_enrollments
FROM useview_infant_child 
WHERE child_consent_today IS TRUE
GROUP BY _id,month
),
child_visits AS (
SELECT chv_uuid AS _id
      ,date_trunc('month',reported_date) AS month
      ,COUNT(*) AS num_child_visits
FROM useview_infant_child
WHERE child_consent_today IS TRUE OR child_consent_today IS NULL 
GROUP BY _id,month
),
skeleton AS (
SELECT 
    _id
    ,supervisory_area_uuid
    ,month::DATE
FROM generate_series(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval  '1 month') AS t(month)
JOIN useview_chv AS chv ON month >= chv.reported_date
ORDER BY _id,month
)

SELECT 
    skeleton._id AS chv_uuid 
   ,skeleton.supervisory_area_uuid
   ,skeleton.month
   ,COALESCE(hh_registration.num_households_registered, 0) AS num_households_registered
   ,COALESCE(pregnancy_enrollments.num_pregnancy_enrollments, 0) AS num_pregnancy_enrollments
   ,COALESCE(pregnancy_visits.num_pregnancy_visits, 0) AS num_pregnancy_visits
   ,COALESCE(child_enrollments.num_child_enrollments, 0) AS num_child_enrollments
   ,COALESCE(child_visits.num_child_visits, 0) AS num_child_visits
   ,COALESCE(pregnancy_enrollments.num_pregnancy_enrollments, 0) + 
    COALESCE(child_enrollments.num_child_enrollments, 0) As total_enrollments
   ,COALESCE(pregnancy_visits.num_pregnancy_visits, 0) + 
    COALESCE(child_visits.num_child_visits, 0) AS total_visits 
FROM skeleton 
LEFT JOIN hh_registration
    ON skeleton._id = hh_registration._id 
    AND skeleton.month = hh_registration.month 
LEFT JOIN pregnancy_enrollments 
  ON skeleton._id = pregnancy_enrollments._id
  AND skeleton.month = pregnancy_enrollments.month 
LEFT JOIN pregnancy_visits
  ON skeleton._id = pregnancy_visits._id
  AND skeleton.month = pregnancy_visits.month 
LEFT JOIN child_enrollments
  ON skeleton._id = child_enrollments._id
  AND skeleton.month = child_enrollments.month 
LEFT JOIN child_visits
  ON skeleton._id = child_visits._id
  AND skeleton.month = child_visits.month 
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_month ON chv_performance USING btree (chv_uuid,month);
ALTER MATERIALIZED VIEW chv_performance OWNER TO full_access;
GRANT SELECT ON chv_performance TO dtree;