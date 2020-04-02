------------------------------------------------------------
-- Materialized view to show table of peer mentor checklist forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_peer_mentor_checklist;

CREATE MATERIALIZED VIEW useview_peer_mentor_checklist AS 
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
    doc #>> '{fields,created_by}' AS chv_name,
    doc #>> '{fields,chv_information,chv_first_name}' AS chv_first_name,
    doc #>> '{fields,chv_information,chv_middle_name}' AS chv_middle_name,
    doc #>> '{fields,chv_information,chv_last_name}' AS chv_last_name,
    doc #>> '{fields,chv_information,phone}' AS phone,
    TO_DATE(NULLIF(doc #>> '{fields,chv_information,date_of_mentorship}', ''), 'YYYY-MM-DD') AS date_of_mentorship,
    doc #>> '{fields,section_1,phone_usage}' AS phone_usage,
    doc #>> '{fields,section_1,phone_usage_reason}' AS phone_usage_reason,
    doc #>> '{fields,section_1,balance_check}' AS balance_check,
    doc #>> '{fields,section_1,balance_check_reason}' AS balance_check_reason,
    doc #>> '{fields,section_1,app_navigation}' AS app_navigation,
    doc #>> '{fields,section_1,app_navigation_reason}' AS app_navigation_reason,
    doc #>> '{fields,section_1,data_toggle}' AS data_toggle,
    doc #>> '{fields,section_1,data_toggle_reason}' AS data_toggle_reason,
    doc #>> '{fields,section_1,bango_kitita_usage}' AS bango_kitita_usage,
    doc #>> '{fields,section_1,bango_kitita_usage_reason}' AS bango_kitita_usage_reason,
    doc #>> '{fields,section_1,solar_charging}' AS solar_charging,
    doc #>> '{fields,section_1,solar_charging_reason}' AS solar_charging_reason,
    doc #>> '{fields,section_2,boundary_identification}' AS boundary_identification,
    doc #>> '{fields,section_2,boundary_identification_reason}' AS boundary_identification_reason,
    doc #>> '{fields,section_2,communication}' AS communication,
    doc #>> '{fields,section_2,communication_reason}' AS communication_reason,
    doc #>> '{fields,section_2,meet_enrollment_target}' AS meet_enrollment_target, 
    doc #>> '{fields,section_2,meet_enrollment_target_reason}' AS meet_enrollment_target_reason, 
    doc #>> '{fields,section_3,chv_introduction}' AS chv_introduction,
    doc #>> '{fields,section_3,chv_introduction_reason}' AS chv_introduction_reason,
    doc #>> '{fields,section_3,ask_consent}' AS ask_consent,
    doc #>> '{fields,section_3,ask_consent_reason}' AS ask_consent_reason,
    doc #>> '{fields,section_3,fluent_conversation}' AS fluent_conversation,
    doc #>> '{fields,section_3,fluent_conversation_reason}' AS fluent_conversation_reason,
    doc #>> '{fields,section_3,answer_concerns}' AS answer_concerns,
    doc #>> '{fields,section_3,answer_concerns_reason}' AS answer_concerns_reasons,
    doc #>> '{fields,comments,chv_support_options}' AS chv_support_options,
    doc #>> '{fields,comments,tech_team_support}' AS tech_team_support,
    doc #>> '{fields,comments,chmt_support}' AS chmt_support,
    doc #>> '{fields,comments,supervisor_support}' AS supervisor_support,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	couchdb	
  WHERE 
	doc ->> 'form' = 'peer_mentor_checklist'
);

CREATE UNIQUE INDEX IF NOT EXISTS peer_mentor_checklist_reported_date_created_by_uuid ON useview_peer_mentor_checklist USING btree (reported_date, chv_uuid);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_peer_mentor_checklist TO full_access, dtree, periscope;