------------------------------------------------------------
-- Materialized view to show table of supervisor monthly meeting forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_monthly_meeting;

CREATE MATERIALIZED VIEW useview_monthly_meeting AS
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
    doc #>> '{fields,planned_meeting,meeting_option}' AS meeting_option,
    nullif(doc #>> '{fields,meeting_details,attended}','')::INTEGER AS num_chvs_attended,
    nullif(doc #>> '{fields,meeting_details,not_attended}','')::INTEGER AS num_chvs_not_attended,
    nullif(doc #>> '{fields,meeting_details,absent_chvs}','')::JSONB AS absent_chvs,
    nullif(doc #>> '{fields,meeting_details,topics}','') AS topics,
    nullif(doc #>> '{fields,meeting_details,challenges}','') AS challenges,
    nullif(doc #>> '{fields,meeting_details,actions}','') AS actions,
    to_date(nullif(doc #>> '{fields,next_meeting_details,next_meeting_date}', ''), 'YYYY-MM-DD') AS next_meeting_date,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'chw_monthly_meeting'
);

CREATE UNIQUE INDEX IF NOT EXISTS monthly_meeting_reported_date_created_by_uuid ON useview_monthly_meeting USING btree(_id,reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_monthly_meeting OWNER TO full_access;
GRANT SELECT ON useview_monthly_meeting TO dtree, periscope;