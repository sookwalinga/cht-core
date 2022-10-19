------------------------------------------------------------
-- Materialized view to show table of aggregated referrals.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_referrals;

CREATE MATERIALIZED VIEW agg_referrals AS
(
  WITH skeleton AS (
    SELECT
      reported_month::DATE,
      district,
      shehia,
      catchment_area_uuid
    FROM generate_series(
      TIMESTAMP '2019-07-01',
      current_date,
      interval '1 month') AS t(reported_month)
    INNER JOIN useview_jna_locations ON TRUE
    ORDER BY district,shehia,reported_month
  ),

  infant_child_referral AS (
    SELECT
      catchment_area_uuid,
      date_trunc('month', reported_date) AS reported_month,
      sum((refer_neonatal_danger_sign_flag = 't')::INT) AS issued_referrals_neonatal_danger_sign,
      sum((refer_secondary_neonatal_danger_sign_flag = 't')::INT) AS issued_referrals_secondary_neonatal_danger_sign,
      sum((refer_child_danger_sign_flag = 't')::INT) AS issued_referrals_child_danger_sign,
      sum((refer_child_other_danger_sign_flag = 't')::INT) AS issued_referrals_child_other_danger_sign,
      sum((has_health_card = 'f' AND age_years < 2 OR vaccines_up_to_date = 'f')::INT) AS issued_referrals_child_missed_services,
      sum((refer_muac_flag = 't')::INT) AS issued_referrals_muac,
      sum((refer_palm_pallor_flag = 't')::INT) AS issued_referrals_palm_pallor,
      sum((refer_slow_to_learn_specifics_flag = 't')::INT) AS issued_referrals_slow_to_learn_specifics
    FROM useview_infant_child
    GROUP BY reported_month,catchment_area_uuid
  ),

  pregnancy_referral AS (
    SELECT
      catchment_area_uuid,
      date_trunc('month', reported_date) AS reported_month,
      sum((refer_flag_emergency_danger_sign = 't')::INT) issued_referrals_pregnancy_danger_sign,
      sum((refer_flag_pregnancy_issues = 't')::INT) issued_referrals_pregnancy_issues,
      -- baby moving & palm pallor 
      sum((refer_flag_pregnancy_complications = 't')::INT) issued_referrals_pregnancy_complications
    FROM useview_pregnancy
    GROUP BY reported_month,catchment_area_uuid
  ),

  data AS (
    SELECT
      district,
      shehia,
      skeleton.reported_month AS reported_month,
      sum(issued_referrals_neonatal_danger_sign) AS issued_referrals_neonatal_danger_sign,
      sum(issued_referrals_secondary_neonatal_danger_sign) AS issued_referrals_secondary_neonatal_danger_sign,
      sum(issued_referrals_child_danger_sign) AS issued_referrals_child_danger_sign,
      sum(issued_referrals_child_other_danger_sign) AS issued_referrals_child_other_danger_sign,
      sum(issued_referrals_child_missed_services) AS issued_referrals_child_missed_services,
      sum(issued_referrals_muac) AS issued_referrals_muac,
      sum(issued_referrals_palm_pallor) AS issued_referrals_palm_pallor,
      sum(issued_referrals_slow_to_learn_specifics) AS issued_referrals_slow_to_learn_specifics,
      sum(issued_referrals_pregnancy_danger_sign) AS issued_referrals_pregnancy_danger_sign,
      sum(issued_referrals_pregnancy_issues) AS issued_referrals_pregnancy_issues,
      sum(issued_referrals_pregnancy_complications) AS issued_referrals_pregnancy_complications
    FROM skeleton
    LEFT JOIN infant_child_referral AS i
      ON i.catchment_area_uuid = skeleton.catchment_area_uuid
        AND skeleton.reported_month = i.reported_month
    LEFT JOIN pregnancy_referral AS pg
      ON pg.catchment_area_uuid = skeleton.catchment_area_uuid
        AND pg.reported_month = skeleton.reported_month
    GROUP BY shehia,district,skeleton.reported_month
  )

  SELECT *
  FROM data
  WHERE coalesce(issued_referrals_neonatal_danger_sign,
                 issued_referrals_secondary_neonatal_danger_sign,
                 issued_referrals_child_danger_sign,issued_referrals_child_other_danger_sign,
                 issued_referrals_child_missed_services,issued_referrals_muac,
                 issued_referrals_palm_pallor,issued_referrals_slow_to_learn_specifics,
                 issued_referrals_pregnancy_danger_sign,issued_referrals_pregnancy_issues,
                 issued_referrals_pregnancy_complications) IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_agg_referrals ON agg_referrals USING btree(district,shehia,reported_month);
ALTER MATERIALIZED VIEW agg_referrals OWNER TO full_access;
GRANT SELECT ON agg_referrals TO dtree;
