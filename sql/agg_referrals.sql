-------------------------------------------------------------
--- Materialized view to show table of aggregated referrals.
-------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_referrals;
CREATE MATERIALIZED VIEW agg_referrals AS
(
  WITH combos AS (
    SELECT t.* FROM (VALUES
      ('child_age', 'sex'),
      ('default', 'default')
    ) AS t(cat_1, cat_2)
  ),

  category_options AS (
    SELECT co.* FROM ( VALUES
      (0, 0, 'default', 'default'),
      (1, 1, 'male', 'sex'),
      (2, 2, 'female', 'sex'),
      (0, 5 * 30, '0_5months', 'child_age'),
      (6 * 30, 23 * 30, '6_23months', 'child_age'),
      (24 * 30, 59 * 30, '24_59months', 'child_age')
    )AS co(low, up, option, kind)
  ),

  category_options_combos AS (
    SELECT
      option_1.up AS cat_1_up,
      option_2.up AS cat_2_up,
      option_1.low AS cat_1_low,
      option_2.low AS cat_2_low,
      option_1.kind AS cat_1_kind,
      option_2.kind AS cat_2_kind,
      option_1.option AS cat_1_option,
      option_2.option AS cat_2_option
    FROM combos
    INNER JOIN category_options AS option_1
      ON option_1.kind = combos.cat_1
    INNER JOIN category_options AS option_2
      ON option_2.kind = combos.cat_2
  ),

  referral_cte AS (
    SELECT
      catchment_area_uuid,
      original_source_form,
      original_source_form_uuid,
      max(reported_date) AS latest_followup_date,
      min(reported_date) AS first_followup_date,
      max(went_to_facility::INT) AS went_to_facility,
      max(got_services::INT) AS got_services,
      max(complete_referral::INT) AS followup_cancelled,
      max(refer_flag_small_baby::INT) * max(went_to_facility::INT) AS small_baby_went_to_facility,
      max(refer_flag_small_baby::INT) * max(got_services::INT) AS small_baby_got_services,
      max(refer_flag_small_baby::INT) * max(complete_referral::INT) AS small_baby_cancelled_followup,
      max(refer_neonatal_danger_sign_flag::INT) * max(went_to_facility::INT) AS neonatal_danger_sign_went_to_facility,
      max(refer_neonatal_danger_sign_flag::INT) * max(got_services::INT) AS neonatal_danger_sign_got_services,
      max(refer_neonatal_danger_sign_flag::INT) * max(complete_referral::INT) AS neonatal_danger_sign_cancelled_followup,
      max(refer_secondary_neonatal_danger_sign_flag::INT) * max(went_to_facility::INT) AS secondary_neonatal_danger_sign_went_to_facility,
      max(refer_secondary_neonatal_danger_sign_flag::INT) * max(got_services::INT) AS secondary_neonatal_danger_sign_got_services,
      max(refer_secondary_neonatal_danger_sign_flag::INT) * max(complete_referral::INT) AS secondary_neonatal_danger_sign_cancelled_followup,
      max(refer_child_danger_sign_flag::INT) * max(got_services::INT) AS child_danger_sign_got_services,
      max(refer_child_danger_sign_flag::INT) * max(complete_referral::INT) AS child_danger_sign_cancelled_followup,
      max(refer_child_danger_sign_flag::INT) * max(went_to_facility::INT) AS child_danger_sign_went_to_facility,
      max(refer_child_other_danger_sign_flag::INT) * max(got_services::INT) AS child_other_danger_sign_got_services,
      max(refer_child_other_danger_sign_flag::INT) * max(complete_referral::INT) AS child_other_danger_sign_cancelled_followup,
      max(refer_child_other_danger_sign_flag::INT) * max(went_to_facility::INT) AS child_other_danger_sign_went_to_facility,
      max(refer_muac_flag::INT) * max(got_services::INT) AS muac_got_services,
      max(refer_muac_flag::INT) * max(complete_referral::INT) AS muac_cancelled_followup,
      max(refer_muac_flag::INT) * max(went_to_facility::INT) AS muac_went_to_facility,
      max(refer_palm_pallor_flag::INT) * max(got_services::INT) AS palm_pallor_got_services,
      max(refer_palm_pallor_flag::INT) * max(complete_referral::INT) AS palm_pallor_cancelled_followup,
      max(refer_palm_pallor_flag::INT) * max(went_to_facility::INT) AS palm_pallor_went_to_facility,
      max(refer_vaccines_flag::INT) * max(got_services::INT) AS vaccines_got_services,
      max(refer_vaccines_flag::INT) * max(complete_referral::INT) AS vaccines_cancelled_followup,
      max(refer_vaccines_flag::INT) * max(went_to_facility::INT) AS vaccines_went_to_facility,
      max(refer_slow_to_learn_specifics_flag::INT) * max(got_services::INT) AS slow_to_learn_specifics_got_services,
      max(refer_slow_to_learn_specifics_flag::INT) * max(complete_referral::INT) AS slow_to_learn_specifics_cancelled_followup,
      max(refer_slow_to_learn_specifics_flag::INT) * max(went_to_facility::INT) AS slow_to_learn_specifics_went_to_facility,
      max(refer_flag_postpartum_danger_signs::INT) * max(got_services::INT) AS postpartum_danger_signs_got_services,
      max(refer_flag_postpartum_danger_signs::INT) * max(complete_referral::INT) AS postpartum_danger_signs_cancelled_followup,
      max(refer_flag_postpartum_danger_signs::INT) * max(went_to_facility::INT) AS postpartum_danger_signs_went_to_facility,
      max(refer_flag_postpartum_other_signs::INT) * max(got_services::INT) AS postpartum_other_signs_got_services,
      max(refer_flag_postpartum_other_signs::INT) * max(complete_referral::INT) AS postpartum_other_signs_cancelled_followup,
      max(refer_flag_postpartum_other_signs::INT) * max(went_to_facility::INT) AS postpartum_other_signs_went_to_facility,
      max(refer_flag_postpartum_pnc_visit::INT) * max(got_services::INT) AS postpartum_pnc_visit_got_services,
      max(refer_flag_postpartum_pnc_visit::INT) * max(complete_referral::INT) AS postpartum_pnc_visit_cancelled_followup,
      max(refer_flag_postpartum_pnc_visit::INT) * max(went_to_facility::INT) AS postpartum_pnc_visit_went_to_facility,
      max(refer_flag_anc_visit::INT) * max(got_services::INT) AS anc_visit_got_services,
      max(refer_flag_anc_visit::INT) * max(complete_referral::INT) AS anc_visit_cancelled_followup,
      max(refer_flag_anc_visit::INT) * max(went_to_facility::INT) AS anc_visit_went_to_facility
    FROM useview_referral_follow_up AS r
    GROUP BY original_source_form,original_source_form_uuid,catchment_area_uuid
  )

  SELECT
    district,
    shehia,
    original_source_form,
    (combo.cat_1_kind || ',' || combo.cat_2_kind) AS disaggregation,
    (combo.cat_1_option || ',' || combo.cat_2_option) AS disaggregation_values,
    date_trunc('month',coalesce(pg.reported_date,infant.reported_date,ppt.reported_date)) AS issued_month,
    sum(went_to_facility) AS went_to_facility,
    sum(got_services) AS got_services,
    sum(followup_cancelled) AS followup_cancelled,
    sum(small_baby_went_to_facility) AS small_baby_went_to_facility,
    sum(small_baby_got_services) AS small_baby_got_services,
    sum(small_baby_cancelled_followup) AS small_baby_cancelled_followup,
    sum(neonatal_danger_sign_went_to_facility) AS neonatal_danger_sign_went_to_facility,
    sum(neonatal_danger_sign_got_services) AS neonatal_danger_sign_got_services,
    sum(neonatal_danger_sign_cancelled_followup) AS neonatal_danger_sign_cancelled_followup,
    sum(secondary_neonatal_danger_sign_went_to_facility) AS secondary_neonatal_danger_sign_went_to_facility,
    sum(secondary_neonatal_danger_sign_got_services) AS secondary_neonatal_danger_sign_got_services,
    sum(secondary_neonatal_danger_sign_cancelled_followup) AS secondary_neonatal_danger_sign_cancelled_followup,
    sum(child_danger_sign_got_services) AS child_danger_sign_got_services,
    sum(child_danger_sign_cancelled_followup) AS child_danger_sign_cancelled_followup,
    sum(child_danger_sign_went_to_facility) AS child_danger_sign_went_to_facility,
    sum(child_other_danger_sign_got_services) AS child_other_danger_sign_got_services,
    sum(child_other_danger_sign_cancelled_followup) AS child_other_danger_sign_cancelled_followup,
    sum(child_other_danger_sign_went_to_facility) AS child_other_danger_sign_went_to_facility,
    sum(muac_got_services) AS muac_got_services,
    sum(muac_cancelled_followup) AS muac_cancelled_followup,
    sum(muac_went_to_facility) AS muac_went_to_facility,
    sum(palm_pallor_got_services) AS palm_pallor_got_services,
    sum(palm_pallor_cancelled_followup) AS palm_pallor_cancelled_followup,
    sum(palm_pallor_went_to_facility) AS palm_pallor_went_to_facility,
    sum(vaccines_got_services) AS vaccines_got_services,
    sum(vaccines_cancelled_followup) AS vaccines_cancelled_followup,
    sum(vaccines_went_to_facility) AS vaccines_went_to_facility,
    sum(slow_to_learn_specifics_got_services) AS slow_to_learn_specifics_got_services,
    sum(slow_to_learn_specifics_cancelled_followup) AS slow_to_learn_specifics_cancelled_followup,
    sum(slow_to_learn_specifics_went_to_facility) AS slow_to_learn_specifics_went_to_facility,
    sum(postpartum_danger_signs_got_services) AS postpartum_danger_signs_got_services,
    sum(postpartum_danger_signs_cancelled_followup) AS postpartum_danger_signs_cancelled_followup,
    sum(postpartum_danger_signs_went_to_facility) AS postpartum_danger_signs_went_to_facility,
    sum(postpartum_other_signs_got_services) AS postpartum_other_signs_got_services,
    sum(postpartum_other_signs_cancelled_followup) AS postpartum_other_signs_cancelled_followup,
    sum(postpartum_other_signs_went_to_facility) AS postpartum_other_signs_went_to_facility,
    sum(postpartum_pnc_visit_got_services) AS postpartum_pnc_visit_got_services,
    sum(postpartum_pnc_visit_cancelled_followup) AS postpartum_pnc_visit_cancelled_followup,
    sum(postpartum_pnc_visit_went_to_facility) AS postpartum_pnc_visit_went_to_facility,
    sum(anc_visit_got_services) AS anc_visit_got_services,
    sum(anc_visit_cancelled_followup) AS anc_visit_cancelled_followup,
    sum(anc_visit_went_to_facility) AS anc_visit_went_to_facility,
    --pregnancy-issued-referrals
    sum((refer_flag_emergency_danger_sign = 't')::int) issued_referrals_pregnancy_danger_sign,
    sum((refer_flag_pregnancy_issues = 't')::int) issued_referrals_pregnancy_issues,
    sum((refer_flag_pregnancy_complications = 't')::int) issued_referrals_pregnancy_complications,
    --postpartum-issued-referrals
    sum((refer_postpartum_emergency_danger_sign_flag = 't')::INT) AS issued_refer_postpartum_emergency_danger_sign_flag,
    sum((refer_postpartum_other_danger_sign_flag = 't')::INT) AS issued_refer_postpartum_other_danger_sign_flag,
    sum((refer_postpartum_pnc_visit = 't')::INT) AS issued_refer_postpartum_pnc_visit,
    --infant-child-issued-referrals
    sum((infant.refer_neonatal_danger_sign_flag = 't')::int) AS issued_referrals_neonatal_danger_sign,
    sum((infant.refer_secondary_neonatal_danger_sign_flag = 't')::int) AS issued_referrals_secondary_neonatal_danger_sign,
    sum((infant.refer_child_danger_sign_flag = 't')::int) AS issued_referrals_child_danger_sign,
    sum((infant.refer_child_other_danger_sign_flag = 't')::int) AS issued_referrals_child_other_danger_sign,
    sum((infant.has_health_card = 'f' AND infant.age_years < 2 OR infant.vaccines_up_to_date = 'f')::int) AS issued_referrals_child_missed_services,
    sum((infant.refer_muac_flag = 't')::int) AS issued_referrals_muac,
    sum((infant.refer_palm_pallor_flag = 't')::int) AS issued_referrals_palm_pallor,
    sum((infant.refer_slow_to_learn_specifics_flag = 't')::int) AS issued_referrals_slow_to_learn_specifics,
    sum((
      date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
      AND infant.refer_neonatal_danger_sign_flag = 't'
    )::int) AS followup_within3days_neonatal_danger_sign_flag,
    sum((
      date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
      AND infant.refer_neonatal_danger_sign_flag = 't'
    )::int) AS followup_within7days_neonatal_danger_sign_flag,
    sum((
      infant.refer_secondary_neonatal_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_secondary_neonatal_danger_sign,
    sum((
      infant.refer_secondary_neonatal_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_secondary_neonatal_danger_sign,
    sum((
      infant.refer_child_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_child_danger_sign,
    sum((
      infant.refer_child_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_child_danger_sign,
    sum((
      infant.refer_child_other_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_child_other_danger_sign,
    sum((
      infant.refer_child_other_danger_sign_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_child_other_danger_sign,
    sum((
        (infant.has_health_card = 'f' AND infant.age_years <= 2 OR infant.vaccines_up_to_date = 'f')
        AND date_part('day',infant.reported_date - referral_cte.first_followup_date) < 3
    )::int) AS followup_within3days_child_missed_services,
    sum((
        (infant.has_health_card = 'f' AND infant.age_years < 2 OR infant.vaccines_up_to_date = 'f')
        AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
        AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_child_missed_services,
    sum((
      infant.refer_muac_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_muac,
    sum((
      infant.refer_muac_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_muac,
    sum((
      infant.refer_palm_pallor_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_palm_pallor,
    sum((
      infant.refer_palm_pallor_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_palm_pallor,
    sum((
      infant.refer_slow_to_learn_specifics_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 3
    )::int) AS followup_within3days_slow_to_learn_specifics,
    sum((
      infant.refer_slow_to_learn_specifics_flag = 't'
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) > 3
      AND date_part('day',infant.reported_date - referral_cte.first_followup_date) <= 7
    )::int) AS followup_within7days_slow_to_learn_specifics

  FROM referral_cte
  INNER JOIN useview_jna_locations AS loc
    ON loc.catchment_area_uuid = referral_cte.catchment_area_uuid
  LEFT JOIN useview_infant_child AS infant
    ON infant._id = referral_cte.original_source_form_uuid
  LEFT JOIN category_options_combos AS combo
    ON original_source_form = 'infant_child'
      AND infant.age_days BETWEEN combo.cat_1_low AND combo.cat_1_up
      AND infant.child_sex = combo.cat_2_option
  LEFT JOIN useview_pregnancy AS pg
    ON pg._id = referral_cte.original_source_form_uuid
  LEFT JOIN useview_postpartum AS ppt
    ON ppt._id = referral_cte.original_source_form_uuid
  GROUP BY
    district,shehia,issued_month,original_source_form,disaggregation,disaggregation_values
);
CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_agg_referrals ON agg_referrals USING btree(district,shehia,issued_month,original_source_form,disaggregation_values);
ALTER MATERIALIZED VIEW agg_referrals OWNER TO full_access;
GRANT SELECT ON agg_referrals TO dtree;