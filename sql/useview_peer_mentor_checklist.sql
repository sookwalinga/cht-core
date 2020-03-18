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
    doc #>> '{fields,chv_information,name}' AS name,
    doc #>> '{fields,chv_information,shehia}' AS shehia,
    TO_DATE(NULLIF(doc #>> '{fields,chv_information,date_of_mentorship}', ''), 'YYYY-MM-DD') AS date_of_mentorship,
    doc #>> '{fields,section_1,phone_usage}' AS phone_usage,
    doc #>> '{fields,section_1,balance_check}' AS balance_check,
    doc #>> '{fields,section_1,app_navigation}' AS app_navigation,
    doc #>> '{fields,section_1,data_toggle}' AS data_toggle,
    doc #>> '{fields,section_1,bango_kitita_usage}' AS bango_kitita_usage,
    doc #>> '{fields,section_1,solar_charging}' AS solar_charging,
    doc #>> '{fields,section_2,boundary_identification}' AS boundary_identification,
    doc #>> '{fields,section_2,communication}' AS communication,
    doc #>> '{fields,section_2,meet_enrollment_target}' AS meet_enrollment_target, 
    doc #>> '{fields,section_3,chv_introduction}' AS chv_introduction,
    doc #>> '{fields,section_3,ask_consent}' AS ask_consent,
    doc #>> '{fields,section_3,fluent_conversation}' AS fluent_conversation,
    doc #>> '{fields,section_3,answer_concerns}' AS answer_concerns,
    doc #>> '{fields,comments,mentor_comments}' AS mentor_comments,
    doc #>> '{fields,comments,chmt_comments}' AS chmt_comments,
    doc #>> '{fields,comments,dtree_comments}' AS dtree_comments,
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