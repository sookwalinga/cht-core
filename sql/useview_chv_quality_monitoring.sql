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
    TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date,
    doc #>> '{contact,_id}' AS supervisor_uuid,
    doc #>> '{contact,parent,_id}' AS district_hospital_uuid,
    doc ->> 'from' AS supervisor_phone,
    doc #>> '{fields,contact,name}' AS chv_name,
    doc #>> '{fields,contact,sex}' AS chv_sex,
    doc #>> '{fields,patient_id}' AS chv_uuid,
    doc #>> '{fields,user,name}' AS supervisor_user_name,
    doc #>> '{fields,visit_info,name}' AS supervisor_name,
    doc #>> '{fields,visit_info,user_district}' AS supervisor_district,
    TO_DATE(NULLIF(doc #>> '{fields,visit_info,visit_date_pretty_print}', ''), 'YYYY-MM-DD') AS date_of_chv_quality_monitoring,
    NULLIF(doc #>> '{fields,ipc,does_chv_take_precautionary_measures}', '')::BOOLEAN AS  does_chv_take_precautionary_measures,
    NULLIF(doc #>>'{fields,ipc,does_chv_stay_one_meter}', '')::BOOLEAN AS  does_chv_stay_one_meter,  
    NULLIF(doc #>> '{fields,introduction,does_chv_introduce_themselves}', '')::BOOLEAN AS does_chv_introduce_themselves,
    NULLIF(doc #>> '{fields,consenting,does_chv_ask_for_consent}', '')::BOOLEAN AS does_chv_ask_for_consent,
    NULLIF(doc #>> '{fields,purpose_of_visit,does_chv_explain_visit_purpose}', '')::BOOLEAN AS does_chv_explain_visit_purpose,
    NULLIF(doc #>> '{fields,chv_attitude,does_chv_show_positive_attitude}', '')::BOOLEAN AS does_chv_show_positive_attitude,
    NULLIF(doc #>> '{fields,chv_attitude,was_chv_calm}', '')::BOOLEAN AS was_chv_calm,
    NULLIF(doc #>> '{fields,chv_attitude,was_chv_attentive}', '')::BOOLEAN AS was_chv_attentive,
    NULLIF(doc #>> '{fields,chv_attitude,was_chv_interruptive}', '')::BOOLEAN AS was_chv_interruptive,
    NULLIF(doc #>> '{fields,use_of_tools,does_chv_use_jobaids}', '')::BOOLEAN AS does_chv_use_jobaids,
    NULLIF(doc #>> '{fields,use_of_app,can_chv_navigate_app}', '')::BOOLEAN AS can_chv_navigate_app,
    NULLIF(doc #>> '{fields,communication,can_chv_refer_clients}', '')::BOOLEAN AS can_chv_refer_clients,
    NULLIF(doc #>> '{fields,communication,can_chv_encourage_discussion}', '')::BOOLEAN AS can_chv_encourage_discussion,
    NULLIF(doc #>> '{fields,data_validity,does_chv_validate_responses}', '')::BOOLEAN AS does_chv_validate_responses,
    NULLIF(doc #>> '{fields,data_validity,does_chv_enter_data_correctly}', '')::BOOLEAN AS does_chv_enter_data_correctly,
    NULLIF(doc #>> '{fields,data_validity_child,can_chv_measure_muac_correctly}', '') AS can_chv_measure_muac_correctly,
    NULLIF(doc #>> '{fields,data_validity_child,can_chv_measure_read_clinic_card}', '') AS can_chv_measure_read_clinic_card,
    NULLIF(doc #>> '{fields,referrals,does_chv_encourage_client_facility}', '')::BOOLEAN AS does_chv_encourage_client_facility,
    NULLIF(doc #>> '{fields,referrals,does_chv_assess_all_questions}', '')::BOOLEAN AS does_chv_assess_all_questions,
    NULLIF(doc #>> '{fields,group_counselling,does_chv_encourage_clients}', '')::BOOLEAN AS does_chv_encourage_clients,
    NULLIF(doc #>> '{fields,ending_conversation,does_chv_provide_visitsummary}', '')::BOOLEAN AS does_chv_provide_visitsummary,
    NULLIF(doc #>> '{fields,observation,areas_of_improvement}', '') AS areas_of_improvement,
    NULLIF(doc #>> '{fields,observation,progress_made}', '') AS progress_made,
    NULLIF(doc #>> '{fields,document_actions,provide_support}', '') AS provide_support,
    NULLIF(doc #>> '{fields,quality_monitoring_qns,count_chv_visits}', '') AS count_chv_visits,
    NULLIF(doc #>> '{fields,quality_monitoring_qns,questions_to_client}', '') AS questions_to_client,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	couchdb	
  WHERE 
	doc ->> 'form' = 'chv_quality_monitoring'
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_quality_monitoring_reported_date_created_by_uuid ON useview_chv_quality_monitoring USING btree (reported_date, chv_uuid);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_chv_quality_monitoring TO full_access, dtree, periscope;