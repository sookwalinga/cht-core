------------------------------------------------------------
-- Materialized view to show table of the most recent document upload date for each CHV.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_latest_reported_date;

CREATE MATERIALIZED VIEW useview_chv_latest_reported_date AS
(
  SELECT DISTINCT
    CASE
      WHEN doc ->> 'type' = 'data_record' THEN doc #>> '{fields,inputs,user,contact_id}'
      WHEN doc ->> 'type' = 'person' THEN CASE
        WHEN doc #>> '{meta,created_by_person_uuid}' != '' THEN doc #>> '{meta,created_by_person_uuid}'
        WHEN doc #>> '{meta,created_by_person_uuid}' = '' THEN doc #>> '{meta,last_edited_by_person_uuid}' END
      WHEN doc ->> 'type' = 'clinic' THEN doc #>> '{meta,created_by_person_uuid}' END
    AS chv_uuid,
    max(to_timestamp(nullif(doc ->> 'reported_date', '')::double precision / 1000)) AS latest_reported_date
  FROM
    couchdb
  WHERE
    doc ->> 'type' = 'data_record' OR doc ->> 'type' = 'person' OR doc ->> 'type' = 'clinic'
  GROUP BY
    chv_uuid
);
-- indexes
CREATE UNIQUE INDEX useview_chv_latest_reported_date_index ON useview_chv_latest_reported_date USING btree(chv_uuid,latest_reported_date);
-- permissions
ALTER MATERIALIZED VIEW useview_chv_latest_reported_date OWNER TO full_access;
GRANT SELECT ON useview_chv_latest_reported_date TO dtree, periscope;