-------------------------------------------------------------
--- Materialized view to show table of moh aggregated pregnancy referrals.
-------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS moh_agg_pregnancy_referrlas;
CREATE MATERIALIZED VIEW moh_agg_pregnancy_referrlas AS
(
  SELECT
    district,
    shehia,
    issued_month,
    'default'::TEXT AS disaggregation,
    'default'::TEXT AS disaggregation_value,
    sum(issued_refer_postpartum_pnc_visit) AS issued_refer_postpartum_pnc_visit,
    sum(issued_referrals_pregnancy_danger_sign) AS issued_referrals_pregnancy_danger_sign,
    sum(pregnancy_danger_signs_didnt_go_facility) AS pregnancy_danger_signs_didnt_go_facility,
    sum(pregnancy_danger_signs_got_services) AS pregnancy_danger_signs_got_services,
    sum(pregnancy_danger_signs_went_to_facility) - sum(pregnancy_danger_signs_got_services) AS pregnancy_danger_signs_facility_no_services

  FROM agg_pregnancy_referrals
  GROUP BY district,shehia,issued_month,
    'default'::text,
    'default'::text
);
CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_moh_agg_pregnancy_referrals ON moh_agg_pregnancy_referrlas USING btree(district,shehia,issued_month,original_source_form,disaggregation_value);
ALTER MATERIALIZED VIEW moh_agg_pregnancy_referrlas OWNER TO full_access;
GRANT SELECT ON moh_agg_pregnancy_referrlas TO dtree;
