------------------------------------------------------------
-- Materialized view to show table of all people.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_person;

CREATE MATERIALIZED VIEW useview_person AS 
(
  SELECT
    doc ->> '_id' AS _id
    , doc ->> '_rev' AS _rev
    , doc ->> 'first_name' AS first_name
    , doc ->> 'middle_name' AS middle_name
    , doc ->> 'last_name' AS last_name
    , doc ->> 'name' AS name
    , doc ->> 'sex' AS sex
    , NULLIF(doc ->> 'exact_dob_known', '')::BOOLEAN AS exact_dob_known
    , TO_DATE(doc ->> 'date_of_birth', 'YYYY-MM-DD') AS date_of_birth
    , doc ->> 'phone' AS phone
    , doc ->> 'alternate_phone' AS alternate_phone
    , (CASE WHEN doc ->> 'is_head_of_household' = 'yes' THEN 'yes' ELSE 'no' END)::BOOLEAN AS is_head_of_household
    , doc ->> 'temp_hh_member' AS temp_hh_member
    , doc ->> 'muted' AS muted
    , TO_TIMESTAMP((NULLIF(doc ->> 'date_of_death', '')::BIGINT / 1000)::DOUBLE PRECISION) AS date_of_death
    , CASE  
        WHEN doc #>> '{meta,created_by}' IS NOT NULL THEN doc #>> '{meta,created_by}'
        WHEN doc #>> '{meta,created_by}' IS NULL THEN doc ->> 'created_by'
      END AS created_by
    , CASE
        WHEN doc #>> '{meta,created_by_person_uuid}' IS NOT NULL THEN doc #>> '{meta,created_by_person_uuid}'
        WHEN doc #>> '{meta,created_by_person_uuid}' IS NULL THEN doc ->> 'created_by_person_uuid'
      END AS chv_uuid
    , TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date
    , doc ->> 'type' AS type
    , doc #>> '{parent,_id}' AS household_uuid
    , doc #>> '{parent,parent,_id}' AS catchment_area_uuid
    , doc #>> '{parent,parent,parent,_id}' AS supervisory_area_uuid        
  FROM 
	  couchdb	
  WHERE 
	  doc ->> 'type' = 'person' AND doc #>> '{parent,parent,parent,_id}' IS NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS person_reported_date_created_by_uuid ON useview_person USING btree (reported_date, chv_uuid, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_person TO full_access, dtree, periscope;