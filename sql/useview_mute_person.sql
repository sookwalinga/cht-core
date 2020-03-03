------------------------------------------------------------
-- Materialized view to show table of mute person forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_mute_person;

CREATE MATERIALIZED VIEW useview_mute_person AS 
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
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,created_by}' AS chv_name,
    doc #>> '{fields,client_name}' AS client_name,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    doc #>> '{fields,moving_reason,moving_reason}' AS moving_reason,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
    couchdb	
  WHERE 
	doc ->> 'form' = 'mute_person'
);

CREATE UNIQUE INDEX IF NOT EXISTS mute_person_reported_date_created_by_uuid ON useview_mute_person USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_mute_person TO full_access, dtree, periscope;