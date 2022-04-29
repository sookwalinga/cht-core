------------------------------------------------------------
-- Materialized view to show table of the first document upload date for each CHV.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_first_reported_date;

CREATE MATERIALIZED VIEW chv_first_reported_date AS
(
  SELECT DISTINCT
	  CASE 
	      WHEN doc ->> 'type' = 'data_record' THEN doc #>> '{fields,inputs,user,contact_id}'
		  WHEN doc ->> 'type' = 'person' THEN CASE
		   	WHEN doc #>> '{meta,created_by_person_uuid}' != '' THEN doc #>> '{meta,created_by_person_uuid}'
			WHEN doc #>> '{meta,created_by_person_uuid}' = '' THEN doc #>> '{meta,last_edited_by_person_uuid}' END
		  WHEN doc ->> 'type' = 'clinic' THEN doc #>> '{meta,created_by_person_uuid}' END
		  AS chv_uuid,
	  MIN(TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision)) AS first_reported_date
  FROM 
	  couchdb
  WHERE 
    doc ->> 'type' = 'data_record' OR doc ->> 'type' = 'person' OR doc ->> 'type' = 'clinic'
  GROUP BY
	  chv_uuid
);
-- indexes
CREATE UNIQUE INDEX chv_first_reported_date_index ON chv_first_reported_date USING btree (chv_uuid,first_reported_date);
-- permissions
ALTER MATERIALIZED VIEW chv_first_reported_date OWNER TO full_access;
GRANT SELECT ON chv_first_reported_date TO dtree, periscope;