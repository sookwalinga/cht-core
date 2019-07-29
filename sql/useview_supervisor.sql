------------------------------------------------------------
-- Materialized view to show table of all supervisor.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_supervisor;

CREATE MATERIALIZED VIEW useview_supervisor AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'name' AS name,
    doc ->> 'type' AS type,
    doc ->> 'phone' AS phone,
    doc #>> '{parent,_id}' AS supervisory_area_uuid,
    TO_TIMESTAMP(doc ->> 'imported_date', 'YYYY-MM-DD HH24:MI:SS') AS imported_date,
    TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date,
    doc ->> 'retired' AS retired
  FROM 
	  couchdb	
  WHERE 
	  doc ->> 'type' = 'person' AND doc #>> '{parent,_id}' IS NOT NULL AND doc #>> '{parent,parent,_id}' IS NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS supervisor_reported_date_uuid ON useview_supervisor USING btree (reported_date, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_supervisor TO full_access, dtree, periscope;