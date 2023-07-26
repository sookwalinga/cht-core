-------------------------------------------------------------
--- Materialized view to show table of moh_aggregated_ecd
-------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS moh_agg_ecd;
CREATE MATERIALIZED VIEW moh_agg_ecd AS
(
  SELECT
    district,
    shehia,
    date_trunc('month', infant.reported_date) AS reported_month,
    'sex'::TEXT AS disaggregation,
    child_sex AS disaggregation_value,
    sum((days_left_alone_more_than_1h + days_in_care_of_other_child_more_than_1h > 0)::INT) AS left_alone,
    sum((coalesce(days_left_alone_more_than_1h, days_in_care_of_other_child_more_than_1h) IS NOT NULL)::INT) AS left_alone_denominator,
    sum((exclusively_breastfeeding)::INT) AS exclusively_breastfeeding,
    sum((exclusively_breastfeeding IS NOT NULL)::INT) AS exclusively_breastfeeding_denominator,
    sum((muac_color = 'yellow' OR muac_color = 'red')::INT) AS malnutrition,
    sum((refer_neonatal_danger_sign_flag OR
      refer_child_danger_sign_flag OR
      refer_secondary_neonatal_danger_sign_flag OR
      refer_child_other_danger_sign_flag)::INT) AS U5_danger_sign_referral,
    -- SUM((refer_vaccines_flag)::INT) AS U5_missed_service, --this was discontinued details in jira ticket ZN-192
    sum(((has_health_card = 'no' AND age_years < 2) OR vaccines_up_to_date = 'no')::INT) AS U5_missed_service
  FROM useview_infant_child AS infant
  INNER JOIN useview_jna_locations AS locations
    ON infant.catchment_area_uuid = locations.catchment_area_uuid
  WHERE
    infant.reported_date >= '2019-07-27'
    AND infant.reported_date < date_trunc('month', current_date)
  GROUP BY district,shehia,disaggregation_value,disaggregation,reported_month
);
CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_agg_ecd ON moh_agg_ecd USING btree(district,shehia,reported_month,disaggregation,disaggregation_value);
ALTER MATERIALIZED VIEW moh_agg_ecd OWNER TO full_access;
GRANT SELECT ON moh_agg_ecd TO dtree;