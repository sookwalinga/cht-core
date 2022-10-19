------------------------------------------------------------
-- Materialized view to show table of pregnancy counselling forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_pregnancy_counselling;

CREATE MATERIALIZED VIEW useview_pregnancy_counselling AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,client_name}' AS client_name,
    nullif(nullif(doc #>> '{fields,n_pregnancy_visits}', 'NaN'), '')::INTEGER AS n_pregnancy_visits,
    nullif(nullif(doc #>> '{fields,n_previous_anc_visits}', 'NaN'), '')::INTEGER AS n_previous_anc_visits,
    nullif(doc #>> '{fields,previous_hiv_status}', '')::BOOLEAN AS previous_hiv_status,
    nullif(doc #>> '{fields,previous_rchcard_status}', '')::BOOLEAN AS previous_rchcard_status,
    nullif(doc #>> '{fields,show_research_questions}', '')::BOOLEAN AS show_research_questions,
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,created_by}' AS chv_name,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    to_date(nullif(doc #>> '{fields,date_of_birth_c}', ''), 'YYYY-MM-DD') AS date_of_birth_c,
    nullif(nullif(doc #>> '{fields,age_days}', 'NaN'), '')::INTEGER AS age_days,
    nullif(nullif(doc #>> '{fields,age_months}', 'NaN'), '')::INTEGER AS age_months,
    nullif(nullif(doc #>> '{fields,age_years}', 'NaN'), '')::INTEGER AS age_years,
    nullif(nullif(doc #>> '{fields,age_in_years}', 'NaN'), '')::INTEGER AS age_in_years,
    nullif(nullif(doc #>> '{fields,age_days_display}', 'NaN'), '')::INTEGER AS age_days_display,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    to_timestamp(nullif(doc #>> '{fields,due_date}', '')::DOUBLE PRECISION / 1000) AS due_date,
    doc #>> '{fields,due_date_pretty_print_english}' AS due_date_pretty_print_english,
    doc #>> '{fields,due_date_pretty_print_swahili}' AS due_date_pretty_print_swahili,
    doc #>> '{fields,client_EDD_pretty_print_english}' AS client_EDD_pretty_print_english,
    doc #>> '{fields,client_EDD_pretty_print_swahili}' AS client_EDD_pretty_print_swahili,
    to_date(nullif(doc #>> '{fields,client_EDD_c}', ''), 'YYYY-MM-DD') AS client_EDD_c,
    nullif(doc #>> '{fields,currently_pregnant}', '')::BOOLEAN AS currently_pregnant,
    nullif(doc #>> '{fields,hide_lmp_or_months_pregnant}', '')::BOOLEAN AS hide_lmp_or_months_pregnant,
    doc #>> '{fields,visit_id}' AS visit_id,
    nullif(nullif(doc #>> '{fields,gestation_in_weeks}', 'NaN'), '')::INTEGER AS gestation_in_weeks,
    nullif(doc #>> '{fields,is_high_risk_pregnancy_ML_c}', '')::BOOLEAN AS is_high_risk_pregnancy_ML_c,
    nullif(doc #>> '{fields,high_risk_manual}', '')::BOOLEAN AS high_risk_manual,
    nullif(doc #>> '{fields,risk_factor_names}', '') AS risk_factor_names,
    nullif(doc #>> '{fields,mitigation_list}', '') AS mitigation_list,
    nullif(doc #>> '{fields,risk_factor_labels}', '') AS risk_factor_labels,
    nullif(doc #>> '{fields,risk_factor_labels_swahili}', '') AS risk_factor_labels_swahili,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_vaginal_bleeding}', '')::BOOLEAN AS danger_sign_vaginal_bleeding,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_abdominal_pain}', '')::BOOLEAN AS danger_sign_abdominal_pain,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_severe_headache}', '')::BOOLEAN AS danger_sign_severe_headache,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_fever}', '')::BOOLEAN AS danger_sign_fever,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_unconsciouss}', '')::BOOLEAN AS danger_sign_unconsciouss,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_difficult_breathing}', '')::BOOLEAN AS danger_sign_difficult_breathing,
    nullif(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_convulsions}', '')::BOOLEAN AS danger_sign_convulsions,
    nullif(doc #>> '{fields,danger_signs,emergency_danger_sign_referral}', '')::BOOLEAN AS emergency_danger_sign_referral,
    doc #>> '{fields,pregnancy_issues_group,subgroup_pregnancy_issues,pregnancy_issues}' AS pregnancy_issues,
    nullif(doc #>> '{fields,pregnancy_issues_group,subgroup_pregnancy_issues,refer_pregnancy_issues}', '')::BOOLEAN AS refer_pregnancy_issues,
    nullif(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,baby_moving}', '')::BOOLEAN AS baby_moving,
    nullif(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,pallor}', '')::BOOLEAN AS pallor,
    nullif(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,refer_pregnancy_complications}', '')::BOOLEAN AS refer_pregnancy_complications,
    nullif(doc #>> '{fields,target_messaging_group,risk_factors}','') AS risk_factors,
    (CASE
      WHEN nullif(doc #>> '{fields,mitigation_strategy,mitigation_strategies}','') IS NULL
        THEN nullif(doc #>> '{fields,mitigation_strategy_ml,mitigation_strategies}','')
      ELSE nullif(doc #>> '{fields,mitigation_strategy,mitigation_strategies}','')
      END
    ) AS mitigation_strategies,
    nullif(doc #>> '{fields,has_referral}', '')::BOOLEAN AS has_referral,
    nullif(doc #>> '{fields,refer_flag_emergency_danger_sign}', '')::BOOLEAN AS refer_flag_emergency_danger_sign,
    nullif(doc #>> '{fields,refer_flag_pregnancy_issues}', '')::BOOLEAN AS refer_flag_pregnancy_issues,
    nullif(doc #>> '{fields,refer_flag_pregnancy_complications}', '')::BOOLEAN AS refer_flag_pregnancy_complications,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'pregnancy_counselling'
);
CREATE UNIQUE INDEX IF NOT EXISTS pregnancy_couselling_reported_date_created_by_uuid ON useview_pregnancy_counselling USING btree(reported_date, chv_uuid, patient_id);
-- Permissions
ALTER MATERIALIZED VIEW useview_pregnancy_counselling OWNER TO full_access;
GRANT SELECT ON useview_pregnancy_counselling TO full_access, dtree, periscope;


