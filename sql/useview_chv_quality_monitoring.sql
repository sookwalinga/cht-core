------------------------------------------------------------
-- Materialized view to show table of chv quality monitoring forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_quality_monitoring;

CREATE MATERIALIZED VIEW useview_chv_quality_monitoring AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS supervisor_uuid,
    doc #>> '{contact,parent,_id}' AS district_hospital_uuid,
    doc ->> 'from' AS supervisor_phone,
    doc #>> '{fields,contact,name}' AS chv_name,
    doc #>> '{fields,contact,sex}' AS chv_sex,
    doc #>> '{fields,patient_id}' AS chv_uuid,
    doc #>> '{fields,user,name}' AS supervisor_user_name,
    doc #>> '{fields,visit_info,name}' AS supervisor_name,
    doc #>> '{fields,visit_info,user_district}' AS supervisor_district,
    to_date(nullif(doc #>> '{fields,visit_info,visit_date_pretty_print}', ''), 'DD-MM-YYYY') AS date_of_chv_quality_monitoring,
    nullif(doc #>> '{fields,ipc,does_chv_take_precautionary_measures}', '')::BOOLEAN AS does_chv_take_precautionary_measures,
    nullif(doc #>> '{fields,ipc,does_chv_stay_one_meter}', '')::BOOLEAN AS does_chv_stay_one_meter,
    nullif(doc #>> '{fields,introduction,does_chv_introduce_themselves}', '')::BOOLEAN AS does_chv_introduce_themselves,
    nullif(doc #>> '{fields,consenting,does_chv_ask_for_consent}', '')::BOOLEAN AS does_chv_ask_for_consent,
    nullif(doc #>> '{fields,purpose_of_visit,does_chv_explain_visit_purpose}', '')::BOOLEAN AS does_chv_explain_visit_purpose,
    nullif(doc #>> '{fields,chv_attitude,does_chv_show_positive_attitude}', '')::BOOLEAN AS does_chv_show_positive_attitude,
    nullif(doc #>> '{fields,chv_attitude,was_chv_calm}', '')::BOOLEAN AS was_chv_calm,
    nullif(doc #>> '{fields,chv_attitude,was_chv_attentive}', '')::BOOLEAN AS was_chv_attentive,
    nullif(doc #>> '{fields,chv_attitude,was_chv_interruptive}', '')::BOOLEAN AS was_chv_interruptive,
    nullif(doc #>> '{fields,use_of_tools,does_chv_use_jobaids}', '')::BOOLEAN AS does_chv_use_jobaids,
    nullif(doc #>> '{fields,use_of_app,can_chv_navigate_app}', '')::BOOLEAN AS can_chv_navigate_app,
    nullif(doc #>> '{fields,communication,can_chv_refer_clients}', '')::BOOLEAN AS can_chv_refer_clients,
    nullif(doc #>> '{fields,communication,can_chv_encourage_discussion}', '')::BOOLEAN AS can_chv_encourage_discussion,
    nullif(doc #>> '{fields,data_validity,does_chv_validate_responses}', '')::BOOLEAN AS does_chv_validate_responses,
    nullif(doc #>> '{fields,data_validity,does_chv_enter_data_correctly}', '')::BOOLEAN AS does_chv_enter_data_correctly,
    nullif(doc #>> '{fields,data_validity_child,can_chv_measure_muac_correctly}', '') AS can_chv_measure_muac_correctly,
    nullif(doc #>> '{fields,data_validity_child,can_chv_measure_read_clinic_card}', '') AS can_chv_measure_read_clinic_card,
    nullif(doc #>> '{fields,referrals,does_chv_encourage_client_facility}', '') AS does_chv_encourage_client_facility,
    nullif(doc #>> '{fields,referrals,does_chv_assess_all_questions}', '') AS does_chv_assess_all_questions,
    nullif(doc #>> '{fields,group_counselling,does_chv_encourage_clients}', '')::BOOLEAN AS does_chv_encourage_clients,
    nullif(doc #>> '{fields,ecd_qi_questions,asks_child_learning}', '')::BOOLEAN AS asks_child_learning,
    nullif(doc #>> '{fields,ecd_qi_questions,asks_child_development}', '')::BOOLEAN AS asks_child_development,
    nullif(doc #>> '{fields,ecd_qi_questions,asks_caregiver_play_and_talk}', '')::BOOLEAN AS asks_caregiver_play_and_talk,
    nullif(doc #>> '{fields,ecd_qi_questions,asks_caregiver_comfort_child}', '')::BOOLEAN AS asks_caregiver_comfort_child,
    nullif(doc #>> '{fields,ecd_qi_questions,asks_caregiver_corrects_child}', '') AS asks_caregiver_corrects_child,
    nullif(doc #>> '{fields,ecd_qi_questions,praise_caregiver_child_interaction}', '')::BOOLEAN AS praise_caregiver_child_interaction,
    nullif(doc #>> '{fields,ecd_qi_questions,suggests_play_and_activity}', '')::BOOLEAN AS suggests_play_and_activity,
    nullif(doc #>> '{fields,ecd_qi_questions,suggests_communication_activity}', '')::BOOLEAN AS suggests_communication_activity,
    nullif(doc #>> '{fields,ecd_qi_questions,use_appropriate_toy}', '')::BOOLEAN AS use_appropriate_toy,
    nullif(doc #>> '{fields,ecd_qi_questions,practice_play_with_children}', '')::BOOLEAN AS practice_play_with_children,
    nullif(doc #>> '{fields,ecd_qi_questions,praise_caregiver_for_interactive_play}', '')::BOOLEAN AS praise_caregiver_for_interactive_play,
    nullif(doc #>> '{fields,ecd_qi_questions,encourage_continue_play_at_home}', '')::BOOLEAN AS encourage_continue_play_at_home,
    nullif(doc #>> '{fields,ecd_qi_questions,ask_problems_play_communication}', '')::BOOLEAN AS ask_problems_play_communication,
    nullif(doc #>> '{fields,ecd_qi_questions,discuss_solve_problems}', '')::BOOLEAN AS discuss_solve_problems,
    nullif(doc #>> '{fields,ending_conversation,does_chv_provide_visitsummary}', '')::BOOLEAN AS does_chv_provide_visitsummary,
    nullif(doc #>> '{fields,observation,areas_of_improvement}', '') AS areas_of_improvement,
    nullif(doc #>> '{fields,observation,progress_made}', '') AS progress_made,
    nullif(doc #>> '{fields,document_actions,provide_support}', '') AS provide_support,
    nullif(doc #>> '{fields,quality_monitoring_qns,count_chv_visits}', '') AS count_chv_visits,
    nullif(doc #>> '{fields,quality_monitoring_qns,questions_to_client}', '') AS questions_to_client,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'chv_quality_monitoring'
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_quality_monitoring_reported_date_created_by_uuid ON useview_chv_quality_monitoring USING btree(reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_chv_quality_monitoring OWNER TO full_access;
GRANT SELECT ON useview_chv_quality_monitoring TO dtree, periscope;