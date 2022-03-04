------------------------------------------------------------
-- Materialized view to show table of aggregated referrals.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_referrals;

CREATE MATERIALIZED VIEW agg_referrals AS 
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
 infant_child_referral AS (
  SELECT 
    date_trunc('month', reported_date) AS month
    ,catchment_area_uuid
    ,SUM((refer_neonatal_danger_sign_flag = 't')::INT) AS issued_referrals_neonatal_danger_sign
    ,SUM((refer_secondary_neonatal_danger_sign_flag = 't')::INT) AS issued_referrals_secondary_neonatal_danger_sign
    ,SUM((refer_child_danger_sign_flag = 't')::INT) AS issued_referrals_child_danger_sign
    ,SUM((refer_child_other_danger_sign_flag = 't')::INT) AS issued_referrals_child_other_danger_sign
    ,SUM((has_health_card = 'f' AND age_years < 2 OR vaccines_up_to_date='f')::INT) AS issued_referrals_child_missed_services  
    ,SUM((refer_muac_flag = 't')::INT) AS issued_referrals_muac
    ,SUM((refer_palm_pallor_flag = 't')::INT) AS  issued_referrals_palm_pallor
    ,SUM((refer_slow_to_learn_specifics_flag = 't')::INT) AS  issued_referrals_slow_to_learn_specifics
  FROM useview_infant_child
  GROUP BY month,catchment_area_uuid
),
pregnancy_referral AS (
  SELECT 
    date_trunc('month', reported_date) AS mwezi 
    ,catchment_area_uuid
    ,SUM((refer_flag_emergency_danger_sign = 't')::INT) issued_referrals_pregnancy_danger_sign
    ,SUM((refer_flag_pregnancy_issues = 't')::INT) issued_referrals_pregnancy_issues
    -- baby moving & palm pallor 
    ,SUM((refer_flag_pregnancy_complications = 't')::INT) issued_referrals_pregnancy_complications
  FROM useview_pregnancy
  GROUP BY mwezi,catchment_area_uuid
), 
data AS(
SELECT 
   district
  ,shehia
  ,skeleton.month AS month 
  ,SUM(issued_referrals_neonatal_danger_sign) AS issued_referrals_neonatal_danger_sign
  ,SUM(issued_referrals_secondary_neonatal_danger_sign) AS issued_referrals_secondary_neonatal_danger_sign
  ,SUM(issued_referrals_child_danger_sign) AS issued_referrals_child_danger_sign
  ,SUM(issued_referrals_child_other_danger_sign) AS issued_referrals_child_other_danger_sign
  ,SUM(issued_referrals_child_missed_services) AS issued_referrals_child_missed_services 
  ,SUM(issued_referrals_muac) as issued_referrals_muac
  ,SUM(issued_referrals_palm_pallor) as issued_referrals_palm_pallor
  ,SUM(issued_referrals_slow_to_learn_specifics) AS issued_referrals_slow_to_learn_specifics
  ,SUM(issued_referrals_pregnancy_danger_sign) AS issued_referrals_pregnancy_danger_sign
  ,SUM(issued_referrals_pregnancy_issues) AS issued_referrals_pregnancy_issues
  ,SUM(issued_referrals_pregnancy_complications) AS issued_referrals_pregnancy_complications
FROM skeleton
LEFT JOIN infant_child_referral AS i
  ON i.catchment_area_uuid=skeleton.catchment_area_uuid
  AND skeleton.month=i.month
LEFT JOIN pregnancy_referral pg
  ON pg.catchment_area_uuid=skeleton.catchment_area_uuid
  AND pg.mwezi=skeleton.month
GROUP BY shehia,district,skeleton.month)

SELECT * 
FROM data 
WHERE COALESCE(issued_referrals_neonatal_danger_sign,
               issued_referrals_secondary_neonatal_danger_sign,
               issued_referrals_child_danger_sign,issued_referrals_child_other_danger_sign,
               issued_referrals_child_missed_services,issued_referrals_muac,
               issued_referrals_palm_pallor,issued_referrals_slow_to_learn_specifics,
               issued_referrals_pregnancy_danger_sign,issued_referrals_pregnancy_issues,
               issued_referrals_pregnancy_complications) IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia ON agg_referrals USING btree (district,month,shehia);
ALTER MATERIALIZED VIEW agg_referrals OWNER TO full_access;
GRANT SELECT ON agg_referrals TO dtree;