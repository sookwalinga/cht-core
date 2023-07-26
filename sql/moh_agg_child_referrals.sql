DROP MATERIALIZED VIEW IF EXISTS moh_agg_child_referrals;
CREATE MATERIALIZED VIEW moh_agg_child_referrals AS (
  SELECT
    district,
    shehia,
    issued_month,
    sum(issued_referrals_muac) AS issued_referrals_muac,
    sum(followup_within3days_muac) AS followup_within3days_muac,
    sum(issued_referrals_palm_pallor) AS issued_referrals_palm_pallor,
    sum(followup_within3days_palm_pallor) AS followup_within3days_palm_pallor,
    sum(issued_referrals_child_other_danger_sign) AS issued_referrals_child_other_danger_sign,
    sum(followup_within3days_child_other_danger_sign) AS followup_within3days_child_other_danger_sign,
    sum(child_other_danger_sign_got_services) AS child_other_danger_sign_got_services,
    sum(child_danger_sign_got_services) AS child_danger_sign_got_services,
    sum(child_danger_sign_cancelled_followup) AS child_danger_sign_cancelled_followup,
    sum(child_danger_sign_went_to_facility) - sum(child_danger_sign_got_services) AS child_danger_signs_facility_no_services,
    sum(child_danger_sign_went_to_facility) AS child_danger_sign_went_to_facility,
    sum(child_danger_sign_didnt_go_facility) AS child_danger_sign_didnt_go_facility,
    sum(issued_referrals_child_missed_services) AS issued_referrals_child_missed_services,
    'sex' AS disaggregation,
    substring(disaggregation_value,'(female|male)') AS disaggregation_value
  FROM agg_child_referrals
  GROUP BY district,shehia,issued_month,disaggregation,disaggregation_value
);
CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_moh_agg_child_referrals ON moh_agg_child_referrals USING btree(district,shehia,issued_month,disaggregation,disaggregation_value);
ALTER MATERIALIZED VIEW moh_agg_child_referrals OWNER TO full_access;
GRANT SELECT ON moh_agg_child_referrals TO dtree;