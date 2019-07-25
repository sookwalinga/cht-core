------------------------------------------------------------
-- Materialized view to show table of all supervisory areas.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_supervisory_area;

CREATE MATERIALIZED VIEW useview_supervisory_area AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'name' AS name,
    doc ->> 'type' AS type,
    doc #>> '{contact,_id}' AS supervisor_uuid,
    doc #>> '{contact,name}' AS supervisor_name,
    doc #>> '{contact,type}' AS supervisor_type,
    doc #>> '{contact,phone}' AS supervisor_phone,
    to_timestamp((NULLIF(doc #>> '{contact,reported_date}', '')::bigint / 1000)::double precision) AS supervisor_reported_date,
    doc ->> 'district' AS district,
    to_timestamp(doc ->> 'imported_date', 'YYYY-MM-DD HH24:MI:SS') AS imported_date,
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date
  FROM 
    couchdb	
  WHERE 
    doc ->> 'type' = 'district_hospital'
);

CREATE UNIQUE INDEX IF NOT EXISTS supervisory_area_reported_date_chv_uuid ON useview_supervisory_area USING btree (reported_date, supervisor_uuid, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_supervisory_area TO full_access, dtree, periscope;