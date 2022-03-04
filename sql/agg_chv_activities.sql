------------------------------------------------------------
-- Materialized view to show table of aggregated chv activities.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_chv_activities;

CREATE MATERIALIZED VIEW agg_chv_activities AS 
(
WITH skeleton AS (
  SELECT 
    month::DATE
    ,district
    ,shehia
    ,catchment_area_uuid 
  FROM generate_series(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval  '1 month') AS t(month)
  JOIN useview_jna_locations ON TRUE
  ORDER BY district,shehia,month
),
 houses AS (
  SELECT 
    date_trunc('month', reported_date) AS month
    ,catchment_area_uuid
    ,COUNT(_id) houses 
  FROM useview_household
  GROUP BY month,catchment_area_uuid
),
people AS (
  SELECT 
    date_trunc('month', reported_date) AS month
    ,catchment_area_uuid
    ,COUNT(_id) people 
  FROM useview_person
  GROUP BY month,catchment_area_uuid
),
 infants AS(
  SELECT 
    date_trunc('month', reported_date) AS month
    ,catchment_area_uuid
    ,SUM((child_consent_today='t')::INT) AS enrolled 
    ,SUM((child_consent_today='t' or child_consent_today is NULL)::INT) AS visits
   FROM useview_infant_child
   GROUP BY month,catchment_area_uuid
 ),
 pregnancy AS(
  SELECT 
    date_trunc('month', reported_date) AS mwezi
    ,catchment_area_uuid
    ,SUM((consent='t')::INT) AS enrolled 
    ,SUM((consent='t' or consent is NULL)::INT) AS visits
   FROM useview_pregnancy
   GROUP BY mwezi,catchment_area_uuid
  ), 
  group_counselling AS(
   SELECT
      date_trunc('month', reported_date) as month
      ,catchment_area_uuid
      ,COUNT(_id) as sessions
    FROM useview_group_counseling
    GROUP BY month, catchment_area_uuid
  ),
data AS(
SELECT 
  skeleton.month AS month 
  ,district
  ,shehia
  ,SUM(houses) AS registrations_households
  ,SUM(people) as registrations_people
  ,SUM(i.enrolled) AS enrollments_child
  ,SUM(pg.enrolled) AS enrollments_pregnancy
  ,SUM(i.visits) AS visits_child
  ,SUM(pg.visits) AS visits_pregnancy
  ,SUM(gc.sessions) AS group_counselling_sessions
FROM skeleton
LEFT JOIN houses AS h
  ON h.catchment_area_uuid=skeleton.catchment_area_uuid
  AND skeleton.month=h.month
LEFT JOIN people p
  ON p.catchment_area_uuid=skeleton.catchment_area_uuid
  AND p.month=skeleton.month
LEFT JOIN infants i
  ON i.catchment_area_uuid=skeleton.catchment_area_uuid
  AND i.month=skeleton.month
LEFT JOIN pregnancy pg
  ON pg.catchment_area_uuid=skeleton.catchment_area_uuid
  AND pg.mwezi=skeleton.month
LEFT JOIN group_counselling gc
  ON gc.catchment_area_uuid=skeleton.catchment_area_uuid
  AND gc.month=skeleton.month
GROUP BY shehia,district,skeleton.month
)
SELECT * 
FROM data 
WHERE COALESCE(registrations_households,  
               registrations_people,
               enrollments_child,visits_child,
               visits_pregnancy,group_counselling_sessions) IS NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia ON agg_chv_activities USING btree (district,month,shehia);
ALTER MATERIALIZED VIEW agg_chv_activities OWNER TO full_access;
GRANT SELECT ON agg_chv_activities TO dtree;