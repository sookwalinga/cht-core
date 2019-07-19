------------------------------------------------------------
-- Materialized view to show table of all people.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_person;

CREATE MATERIALIZED VIEW useview_person AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'first_name' AS first_name,
    doc ->> 'middle_name' AS middle_name,
    doc ->> 'last_name' AS last_name,
    doc ->> 'name' AS name,
    doc ->> 'sex' AS sex,
    doc ->> 'exact_dob_known' AS exact_dob_known,
    doc ->> 'date_of_birth' AS date_of_birth,
    doc ->> 'phone' AS phone,
    doc ->> 'alternate_phone' AS alternate_phone,
    CASE WHEN doc ->> 'is_head_of_household' = 'yes' THEN 'yes' ELSE 'no' END AS is_head_of_household,
    doc #>> '{meta,created_by}' AS created_by,
    doc #>> '{meta,created_by_place_uuid}' AS created_by_place_uuid,
    doc #>> '{meta,created_by_person_uuid}' AS chv_uuid,
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date,
    doc ->> 'type' AS type,
    doc #>> '{parent,_id}' AS household_uuid,
    doc #>> '{parent,parent,_id}' AS catchment_area_uuid,
    doc #>> '{parent,parent,parent,_id}' AS supervisory_area_uuid        
  FROM 
	  couchdb	
  WHERE 
	  doc ->> 'type' = 'person' AND doc #>> '{parent,parent,parent,_id}' IS NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS person_reported_date_created_by_uuid ON useview_person USING btree (reported_date, chv_uuid, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_person TO full_access, dtree, periscope;