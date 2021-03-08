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
    TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,  
    doc ->> 'from' AS chv_phone,  
    doc #>> '{fields,client_name}' AS client_name,
    NULLIF(NULLIF(doc #>> '{fields,n_pregnancy_visits}', 'NaN'), '')::INTEGER AS n_pregnancy_visits,
    NULLIF(NULLIF(doc #>> '{fields,n_previous_anc_visits}', 'NaN'), '')::INTEGER AS n_previous_anc_visits,
    NULLIF(doc #>> '{fields,previous_hiv_status}', '')::BOOLEAN AS previous_hiv_status,
    NULLIF(doc #>> '{fields,previous_rchcard_status}', '')::BOOLEAN AS previous_rchcard_status,
    NULLIF(doc #>> '{fields,show_research_questions}', '')::BOOLEAN AS show_research_questions,
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,created_by}' AS chv_name,
    TO_DATE(NULLIF(doc #>> '{fields,date_of_birth_c}', ''), 'YYYY-MM-DD') AS date_of_birth_c,
    NULLIF(NULLIF(doc #>> '{fields,age_days}', 'NaN'), '')::INTEGER AS age_days,
    NULLIF(NULLIF(doc #>> '{fields,age_months}', 'NaN'), '')::INTEGER AS age_months,
    NULLIF(NULLIF(doc #>> '{fields,age_years}', 'NaN'), '')::INTEGER AS age_years,
    NULLIF(NULLIF(doc #>> '{fields,age_in_years}', 'NaN'), '')::INTEGER AS age_in_years,
    NULLIF(NULLIF(doc #>> '{fields,age_days_display}', 'NaN'), '')::INTEGER AS age_days_display,
    NULLIF(NULLIF(doc #>> '{fields,week}', 'NaN'), '')::INTEGER AS week,
    NULLIF(NULLIF(doc #>> '{fields,month}', 'NaN'), '')::INTEGER AS month,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    TO_TIMESTAMP((NULLIF(doc #>> '{fields,due_date}', '')::BIGINT / 1000)::DOUBLE PRECISION) AS due_date,
    doc #>> '{fields,due_date_pretty_print_english}' AS due_date_pretty_print_english,
    doc #>> '{fields,due_date_pretty_print_swahili}' AS due_date_pretty_print_swahili,
    doc #>> '{fields,client_EDD_pretty_print_english}' AS client_EDD_pretty_print_english,
    doc #>> '{fields,client_EDD_pretty_print_swahili}' AS client_EDD_pretty_print_swahili,
    TO_DATE(NULLIF(doc #>> '{fields,client_EDD_c}', ''), 'YYYY-MM-DD') AS client_EDD_c,
    NULLIF(doc #>> '{fields,currently_pregnant}', '')::BOOLEAN AS currently_pregnant,
    NULLIF(doc #>> '{fields,hide_lmp_or_months_pregnant}', '')::BOOLEAN AS hide_lmp_or_months_pregnant,
    doc #>> '{fields,visit_id}' AS visit_id,
    NULLIF(NULLIF(doc #>> '{fields,gestation_in_weeks}', 'NaN'), '')::INTEGER AS gestation_in_weeks,
    NULLIF(doc #>> '{fields,is_high_risk_pregnancy_ML_c}', '')::BOOLEAN AS is_high_risk_pregnancy_ML_c,
    NULLIF(doc #>> '{fields,high_risk_manual}', '')::BOOLEAN AS high_risk_manual,
    NULLIF(doc #>> '{fields,risk_factor_names}', '') AS risk_factor_names,
    NULLIF(doc #>> '{fields,mitigation_list}', '') AS mitigation_list,
    NULLIF(doc #>> '{fields,risk_factor_labels}', '') AS risk_factor_labels,
    NULLIF(doc #>> '{fields,risk_factor_labels_swahili}', '') AS risk_factor_labels_swahili,
     NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_vaginal_bleeding}', '')::BOOLEAN AS danger_sign_vaginal_bleeding,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_abdominal_pain}', '')::BOOLEAN AS danger_sign_abdominal_pain,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_severe_headache}', '')::BOOLEAN AS danger_sign_severe_headache,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_1,danger_sign_fever}', '')::BOOLEAN AS danger_sign_fever,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_unconsciouss}', '')::BOOLEAN AS danger_sign_unconsciouss,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_difficult_breathing}', '')::BOOLEAN AS danger_sign_difficult_breathing,
    NULLIF(doc #>> '{fields,danger_signs,danger_sign_table_2,danger_sign_convulsions}', '')::BOOLEAN AS danger_sign_convulsions,
    NULLIF(doc #>> '{fields,danger_signs,emergency_danger_sign_referral}', '')::BOOLEAN AS emergency_danger_sign_referral,
    doc #>> '{fields,pregnancy_issues_group,subgroup_pregnancy_issues,pregnancy_issues}' AS pregnancy_issues,
    NULLIF(doc #>> '{fields,pregnancy_issues_group,subgroup_pregnancy_issues,refer_pregnancy_issues}', '')::BOOLEAN AS refer_pregnancy_issues,
    NULLIF(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,baby_moving}', '')::BOOLEAN AS baby_moving,
    NULLIF(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,pallor}', '')::BOOLEAN AS pallor,
    NULLIF(doc #>> '{fields,pregnancy_issues_group,pregnancy_and_pallor,refer_pregnancy_complications}', '')::BOOLEAN AS refer_pregnancy_complications,
    NULLIF(doc #>> '{fields,target_messaging_group,risk_factors}','') AS risk_factors,
    (CASE 
         WHEN NULLIF(doc #>> '{fields,mitigation_strategy,mitigation_strategies}','') IS NULL 
         THEN NULLIF(doc #>> '{fields,mitigation_strategy_ml,mitigation_strategies}','')
         ELSE NULLIF(doc #>> '{fields,mitigation_strategy,mitigation_strategies}','')  
     END
    ) AS mitigation_strategies,
    NULLIF(doc #>> '{fields,has_referral}', '')::BOOLEAN AS has_referral,
    NULLIF(doc #>> '{fields,refer_flag_emergency_danger_sign}', '')::BOOLEAN AS refer_flag_emergency_danger_sign,
    NULLIF(doc #>> '{fields,refer_flag_pregnancy_issues}', '')::BOOLEAN AS refer_flag_pregnancy_issues,
    NULLIF(doc #>> '{fields,refer_flag_pregnancy_complications}', '')::BOOLEAN AS refer_flag_pregnancy_complications,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
    FROM 
    couchdb
  WHERE
    doc ->> 'form' = 'pregnancy_counselling'
);
CREATE UNIQUE INDEX IF NOT EXISTS pregnancy_reported_date_created_by_uuid ON useview_pregnancy_counselling USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_pregnancy_counselling TO full_access, dtree, periscope;


