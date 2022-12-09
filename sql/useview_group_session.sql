------------------------------------------------------------
-- Materialized view to show table of supervisor group session forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_group_session;

CREATE MATERIALIZED VIEW useview_group_session AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS supervisor_uuid,
    doc #>> '{contact,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS supervisor_phone,
    doc #>> '{fields,patient_id}' AS chv_uuid,
    to_date(nullif(doc #>> '{fields,meeting_details,meeting_date}', ''), 'YYYY-MM-DD') AS meeting_date,
    doc #>> '{fields,meeting_details,topics}' AS topics,
    doc #>> '{fields,meeting_details,challenges}' AS challenges,
    doc #>> '{fields,meeting_details,actions}' AS actions,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'group_session'
);

CREATE UNIQUE INDEX IF NOT EXISTS group_session_reported_date_created_by_uuid ON useview_group_session USING btree(_id,reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_group_session OWNER TO full_access;
GRANT SELECT ON useview_group_session TO dtree, periscope;