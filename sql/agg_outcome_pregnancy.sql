------------------------------------------------------------
-- Materialized view to show table of aggregation of pregnancy outcome forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_outcome_pregnancy;
CREATE MATERIALIZED VIEW agg_outcome_pregnancy AS
(
WITH other_visits_CTE AS (
  SELECT 
    po.patient_id
    ,po._id as po_uuid
    ,MAX(pg.reported_date) AS last_pregnancy_visit_date 
    ,MIN(pp.reported_date) AS first_postpartum_visit_date 
  FROM useview_pregnancy_outcomes po
  INNER JOIN useview_pregnancy pg
    ON pg.patient_id=po.patient_id
    AND pg.reported_date<po.reported_date
  LEFT JOIN useview_postpartum pp
    ON pp.patient_id=po.patient_id
    AND pp.reported_date>po.reported_date
  GROUP BY po.patient_id,po_uuid
),
categories AS(
  SELECT * FROM ( VALUES 
    (15,19,'15_19years','woman'),
    (20,24,'20_24years','woman'),
    (25,34,'25_34years','woman'),
    (35,49,'35_49years','woman'),
    (50,200,'50_200years','woman'))
  AS age(low,up,category,kind)
)
SELECT 
  date_trunc('month',pg.reported_date) AS reported_month
  ,district
  ,shehia
  ,SUM(COALESCE(po.live_birth::INT,0)) AS live_births
  ,SUM(COALESCE((po.miscarriage_or_stillbirth='stillbirth')::INT,0)) AS stillbirths
  ,SUM(COALESCE((po.miscarriage_or_stillbirth='miscarriage')::INT,0)) AS miscarriages
  ,SUM(COALESCE((po.delivery_location='facility')::INT,0)) AS women_delivery_facility
  ,SUM(COALESCE((po.delivery_location='home')::INT,0)) AS women_delivery_home
  ,SUM(COALESCE((po.delivery_location='in_transit')::INT,0)) AS women_delivery_in_transit
  ,SUM(COALESCE((pg.num_anc_visits=0)::INT,0)) AS anc_0
  ,SUM(COALESCE((pg.num_anc_visits=1)::INT,0)) AS anc_1
  ,SUM(COALESCE((pg.num_anc_visits=2)::INT,0)) AS anc_2
  ,SUM(COALESCE((pg.num_anc_visits=3)::INT,0)) AS anc_3
  ,SUM(COALESCE((pg.num_anc_visits>=4)::INT,0)) AS anc_4
  ,SUM(COALESCE(pp.has_attended_facility_pnc_within_48hrs::INT,0)) AS pp_care_2_days
  ,category
FROM useview_pregnancy_outcomes AS po
  INNER JOIN useview_jna_locations AS location 
    ON po.catchment_area_uuid=location.catchment_area_uuid
  INNER JOIN other_visits_CTE AS ov
    ON ov.po_uuid=po._id
  INNER JOIN useview_pregnancy AS pg
    ON pg.patient_id=ov.patient_id
    AND pg.reported_date=ov.last_pregnancy_visit_date
  INNER JOIN categories
    ON po.age_years between categories.low and categories.up
  LEFT JOIN useview_postpartum AS pp
    ON pp.patient_id=ov.patient_id
    AND pp.reported_date=ov.first_postpartum_visit_date
GROUP BY reported_month,shehia,district,category
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_outcome_pregnancy_month_shehia ON agg_outcome_pregnancy USING btree (reported_month, shehia,district);
-- Permissions
ALTER MATERIALIZED VIEW agg_outcome_pregnancy OWNER TO full_access;
GRANT SELECT ON agg_outcome_pregnancy TO dtree, periscope;
