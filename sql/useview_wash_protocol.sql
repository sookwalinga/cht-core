------------------------------------------------------------
-- Materialized view to show table of wash protocol forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_wash_protocol;

CREATE MATERIALIZED VIEW useview_wash_protocol AS 
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
    doc #>> '{fields,created_by}' AS created_by,
    NULLIF(doc #>> '{fields,start}', '')::TIMESTAMP as start_time,
    NULLIF(doc #>> '{fields,end}', '')::TIMESTAMP as end_time,
    NULLIF(doc #>> '{fields,wash,subgroup_cleanliness,hand_wash_importance}','')::BOOLEAN  AS is_hand_wash_important,
    NULLIF(doc #>> '{fields,wash,subgroup_health_concerns,health_concerns}','') AS selected_health_concerns,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	couchdb	
  WHERE 
	doc ->> 'form' = 'wash_protocol'
);

CREATE UNIQUE INDEX IF NOT EXISTS wash_protocol_reported_date_created_by_uuid ON useview_wash_protocol USING btree (reported_date, chv_uuid);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_wash_protocol TO full_access, dtree, periscope;