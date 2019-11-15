------------------------------------------------------------
-- Materialized view to show table of all CHVs.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv;

CREATE MATERIALIZED VIEW useview_chv AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'name' AS name,
    doc ->> 'type' AS type,
    doc ->> 'phone' AS phone,
    doc #>> '{parent,_id}' AS catchment_area_uuid,
    doc #>> '{parent,parent,_id}' AS supervisory_area_uuid,
    to_timestamp(doc ->> 'imported_date', 'YYYY-MM-DD HH24:MI:SS') AS imported_date,
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date,
    doc ->> 'alternate_phone' AS alternate_phone,
    doc ->> 'retired' AS retired,
    doc ->> 'retirement_reason' AS retirement_reason
  FROM 
	  couchdb	
  WHERE 
	  doc ->> 'type' = 'person' AND doc #>> '{parent,parent,_id}' IS NOT NULL AND doc #>> '{parent,parent,parent,_id}' IS NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_reported_date_uuid ON useview_chv USING btree (reported_date, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_chv TO full_access, dtree, periscope;