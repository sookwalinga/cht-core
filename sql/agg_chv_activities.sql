------------------------------------------------------------
-- Materialized view to show table of aggregated chv activities.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_chv_activities;

CREATE MATERIALIZED VIEW agg_chv_activities AS 
(
WITH skeleton AS (
  SELECT 
    reported_month::DATE
    ,district
    ,shehia
    ,catchment_area_uuid 
  FROM GENERATE_SERIES(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval  '1 month') AS t(reported_month)
  JOIN useview_jna_locations ON TRUE
  ORDER BY district,shehia,reported_month
),
 houses AS (
  SELECT 
    date_trunc('month', reported_date) AS reported_month
    ,catchment_area_uuid
    ,COUNT(_id) houses 
  FROM useview_household
  GROUP BY reported_month,catchment_area_uuid
),
people AS (
  SELECT 
    date_trunc('month', reported_date) AS reported_month
    ,catchment_area_uuid
    ,COUNT(_id) people 
  FROM useview_person
  GROUP BY reported_month,catchment_area_uuid
),
 infants AS(
  SELECT 
    date_trunc('month', reported_date) AS reported_month
    ,catchment_area_uuid
    ,SUM((child_consent_today='t')::INT) AS enrolled 
    ,SUM((child_consent_today='t' or child_consent_today is NULL)::INT) AS visits
   FROM useview_infant_child
   GROUP BY reported_month,catchment_area_uuid
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
      date_trunc('month', reported_date) AS reported_month
      ,catchment_area_uuid
      ,COUNT(_id) as sessions
    FROM useview_group_counseling
    GROUP BY reported_month, catchment_area_uuid
  ),
data AS(
SELECT 
  skeleton.reported_month AS reported_month 
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
  AND skeleton.reported_month=h.reported_month
LEFT JOIN people p
  ON p.catchment_area_uuid=skeleton.catchment_area_uuid
  AND p.reported_month=skeleton.reported_month
LEFT JOIN infants i
  ON i.catchment_area_uuid=skeleton.catchment_area_uuid
  AND i.reported_month=skeleton.reported_month
LEFT JOIN pregnancy pg
  ON pg.catchment_area_uuid=skeleton.catchment_area_uuid
  AND pg.mwezi=skeleton.reported_month
LEFT JOIN group_counselling gc
  ON gc.catchment_area_uuid=skeleton.catchment_area_uuid
  AND gc.reported_month=skeleton.reported_month
GROUP BY shehia,district,skeleton.reported_month
)
SELECT * 
FROM data 
WHERE COALESCE(registrations_households,  
               registrations_people,
               enrollments_child,visits_child,
               visits_pregnancy,group_counselling_sessions) IS NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia ON agg_chv_activities USING btree (district,reported_month,shehia);
ALTER MATERIALIZED VIEW agg_chv_activities OWNER TO full_access;
GRANT SELECT ON agg_chv_activities TO dtree;