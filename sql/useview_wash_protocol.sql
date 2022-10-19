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
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,created_by}' AS created_by,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    nullif(doc #>> '{fields,wash,subgroup_cleanliness,hand_wash_importance}','')::BOOLEAN AS is_hand_wash_important,
    nullif(doc #>> '{fields,wash,subgroup_health_concerns,health_concerns}','') AS selected_health_concerns,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'wash_protocol'
);

CREATE UNIQUE INDEX IF NOT EXISTS wash_protocol_reported_date_created_by_uuid ON useview_wash_protocol USING btree(reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_wash_protocol OWNER TO full_access;
GRANT SELECT ON useview_wash_protocol TO dtree, periscope;