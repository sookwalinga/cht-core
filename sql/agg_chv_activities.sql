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
categories AS(
  SELECT * FROM ( VALUES 
    (0,5,'0_5months','infant'),
    (6,23,'6_23months','infant'),
    (24,59,'24_59months','infant'),
    (15,19,'15_19years','woman'),
    (20,24,'20_24years','woman'),
    (25,34,'25_34years','woman'),
    (35,49,'35_49years','woman'),
    (50,200,'50_200years','woman'),
    (0,90,'1trimester','trimester'),
    (90,180,'2trimester','trimester'),
    (180,320,'3trimester','trimester'))
  AS age(low,up,category,kind)
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
    ,category
    ,child_sex AS sex
   FROM useview_infant_child AS infant
   INNER JOIN categories AS age
   ON infant.age_days/30 between age.low AND age.up 
   AND age.kind='infant'
   GROUP BY reported_month,catchment_area_uuid,category,child_sex
 ),
 pregnancy AS(
  SELECT 
    date_trunc('month', reported_date) AS mwezi
    ,catchment_area_uuid
    ,SUM((consent='t')::INT) AS enrolled 
    ,SUM((consent='t' or consent is NULL)::INT) AS visits
    ,age.category
    ,COALESCE(trimester.category,
      CASE 
        WHEN visit_id = 'pregnancy_month_5_month_7_visit' THEN '2trimester'
        WHEN visit_id = 'pregnancy_over_7_months_visit' THEN '3trimester'
      END) AS trimester_label

   FROM useview_pregnancy pregnancy
   INNER JOIN categories AS age
   ON pregnancy.age_years between age.low AND age.up 
   AND age.kind='woman'
   LEFT JOIN categories AS trimester
   --40weeks of pregnancy
   ON 40*7 - DATE_PART('day', edd - reported_date) between trimester.low and trimester.up
   AND trimester.kind='trimester'
   GROUP BY mwezi,catchment_area_uuid,age.category,trimester_label
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
  ,pg.category as pregancy_age_category
  ,pg.trimester_label as trimester
  ,i.category as infant_age_category
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
GROUP BY shehia,district,skeleton.reported_month,i.category,pg.category,pg.trimester_label
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
GRANT SELECT ON agg_chv_activities TO periscope,dtree;