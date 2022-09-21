------------------------------------------------------------
-- Materialized view to show table of aggregation of pregnancy outcome forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_outcome_pregnancy;
CREATE MATERIALIZED VIEW agg_outcome_pregnancy AS
(
  WITH other_visits_cte AS (
    SELECT
      po.patient_id
      , po._id AS po_uuid
      , MAX(pg.reported_date) AS last_pregnancy_visit_date
      , MIN(pp.reported_date) AS first_postpartum_visit_date
    FROM useview_pregnancy_outcomes AS po
    INNER JOIN useview_pregnancy AS pg
      ON pg.patient_id = po.patient_id
      AND pg.reported_date < po.reported_date
    LEFT JOIN useview_postpartum AS pp
      ON pp.patient_id = po.patient_id
      AND pp.reported_date > po.reported_date
    GROUP BY po.patient_id, po_uuid
  )

  , categories AS (
    SELECT cat.* FROM ( VALUES
      (15, 19, '15_19years', 'woman')
      , (20, 24, '20_24years', 'woman')
      , (25, 34, '25_34years', 'woman')
      , (35, 49, '35_49years', 'woman')
      , (50, 200, '50_200years', 'woman'))
      AS cat(low, up, category, kind)
  )

  SELECT
    loc.district
    , loc.shehia
    , 'marternal_age' AS disaggregation
    , categories.category AS disaggregation_value
    , DATE_TRUNC('month', po.reported_date) AS reported_month
    , SUM(COALESCE(po.live_birth::INT, 0)) AS live_births
    , SUM(COALESCE((po.miscarriage_or_stillbirth = 'stillbirth')::INT, 0)) AS stillbirths
    , SUM(COALESCE((po.miscarriage_or_stillbirth = 'miscarriage')::INT, 0)) AS miscarriages
    , SUM(COALESCE((po.delivery_location = 'facility')::INT, 0)) AS woman_delivery_facility
    , SUM(COALESCE((po.delivery_location = 'home')::INT, 0)) AS woman_delivery_home
    , SUM(COALESCE((po.delivery_location = 'in_transit')::INT, 0)) AS woman_delivery_in_transit
    , SUM(COALESCE((pg.num_anc_visits = 0)::INT, 0)) AS anc_0
    , SUM(COALESCE((pg.num_anc_visits = 1)::INT, 0)) AS anc_1
    , SUM(COALESCE((pg.num_anc_visits = 2)::INT, 0)) AS anc_2
    , SUM(COALESCE((pg.num_anc_visits = 3)::INT, 0)) AS anc_3
    , SUM(COALESCE((pg.num_anc_visits >= 4)::INT, 0)) AS anc_4
    , SUM(COALESCE(pp.has_attended_facility_pnc_within_48hrs::INT, 0)) AS pp_care_2_days
  FROM useview_pregnancy_outcomes AS po
  INNER JOIN useview_jna_locations AS loc
    ON po.catchment_area_uuid = loc.catchment_area_uuid
  INNER JOIN other_visits_cte AS ov
    ON ov.po_uuid = po._id
  INNER JOIN useview_pregnancy AS pg
    ON pg.patient_id = ov.patient_id
    AND pg.reported_date = ov.last_pregnancy_visit_date
  INNER JOIN categories
    ON po.age_years BETWEEN categories.low AND categories.up
  LEFT JOIN useview_postpartum AS pp
    ON pp.patient_id = ov.patient_id
    AND pp.reported_date = ov.first_postpartum_visit_date
  GROUP BY reported_month, loc.shehia, loc.district, disaggregation_value
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_outcome_pregnancy_month_shehia ON agg_outcome_pregnancy USING BTREE(
  reported_month, shehia, district, disaggregation_value
);
-- Permissions
ALTER MATERIALIZED VIEW agg_outcome_pregnancy OWNER TO full_access;
GRANT SELECT ON agg_outcome_pregnancy TO dtree, periscope;
