------------------------------------------------------------
-- Materialized view to show table of all CHV catchment areas.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_catchment_area;

CREATE MATERIALIZED VIEW useview_catchment_area AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'name' AS name,
    doc ->> 'type' AS type,
    doc #>> '{parent,_id}' AS supervisory_area_uuid,
    doc ->> 'shehia' AS shehia,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc ->> 'imported_date' AS imported_date,
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date
  FROM 
    couchdb	
  WHERE 
    doc ->> 'type' = 'health_center'
);

CREATE UNIQUE INDEX IF NOT EXISTS catchment_area_reported_date_chv_uuid ON useview_catchment_area USING btree (reported_date, chv_uuid, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_catchment_area TO full_access, dtree, periscope;