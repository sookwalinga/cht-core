CREATE OR replace FUNCTION f_cast_dtts(TEXT) RETURNS TIMESTAMP WITHOUT TIME ZONE
    immutable
    LANGUAGE SQL
AS $$
SELECT $1::TIMESTAMP WITHOUT TIME ZONE
$$;


------------------------------------------------------------
-- Materialized view to show table of last CHV sync dates.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_sync;

CREATE MATERIALIZED VIEW useview_chv_sync AS
(
  WITH info_CTE AS
    (
      SELECT
        doc->>'doc_id' AS doc_uuid,
        f_cast_dtts(doc ->> 'latest_replication_date') AS latest_replication_date
      FROM
        couchdb
      WHERE
        doc ->> 'latest_replication_date' != 'unknown'
        AND f_cast_dtts(doc ->> 'latest_replication_date') >= (NOW() - INTERVAL '3 months')
        AND doc->>'type' = 'info'
    ),
  clinic_cte AS 
    (
      SELECT
        clinic.uuid AS doc_uuid,
        chw_area.contact_uuid AS chw_uuid
      FROM 
        contactview_metadata clinic
      LEFT JOIN 
        contactview_metadata chw_area
      ON 
        chw_area.uuid = clinic.parent_uuid
      WHERE 
        clinic.type='clinic'
    ),
  persons_cte AS 
    (
      SELECT
        person.uuid AS doc_uuid,
        clinic.chw_uuid AS chw_uuid
      FROM
        contactview_metadata person
      INNER JOIN 
        clinic_cte clinic 
      ON 
        clinic.doc_uuid = person.parent_uuid
      WHERE 
        person.type='person'
    ),
  reports_cte AS 
    (
      SELECT
        meta.uuid,
        meta.chw AS chw_uuid
      FROM
        form_metadata meta
    )
  SELECT DISTINCT 
    chw_uuid AS chv_uuid
  	, MAX(latest_replication_date) AS latest_replication_date
  FROM
    (SELECT DISTINCT ON 
      (latest_replication_date, info.doc_uuid)
      info.doc_uuid,
      docs.chw_uuid,
      latest_replication_date
    FROM
      info_CTE info
    LEFT JOIN 
    (
      SELECT * FROM 
        clinic_cte
      UNION ALL
      SELECT * FROM 
        persons_cte
      UNION ALL
      SELECT * FROM reports_cte
    ) 
    docs ON docs.doc_uuid = info.doc_uuid
    ORDER BY latest_replication_date DESC) AS all_docs 
  GROUP BY chw_uuid
  ORDER BY latest_replication_date DESC
);
-- indexes
CREATE UNIQUE INDEX useview_chv_sync_chw_uuid_latest_replication_date ON useview_chv_sync USING btree (chv_uuid,latest_replication_date);
-- permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_chv_sync TO full_access, dtree, periscope;