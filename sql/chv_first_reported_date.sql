------------------------------------------------------------
-- Materialized view to show table of the first document upload date for each CHV.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_first_reported_date;

CREATE MATERIALIZED VIEW chv_first_reported_date AS
(
  WITH contact_CTE AS (
    SELECT
      chv._id AS chv_uuid,
      min(cm.reported) AS first_reported_date
    FROM useview_household AS hh
    INNER JOIN useview_chv AS chv
      ON hh.catchment_area_uuid = chv.catchment_area_uuid
        AND chv.retired IS NULL
    LEFT JOIN contactview_metadata AS cm
      ON hh._id = cm.parent_uuid
    GROUP BY chv._id
  )

  SELECT
    chv._id AS chv_uuid,
    CASE WHEN min(fm.reported) > min(cte.first_reported_date) THEN min(cte.first_reported_date) ELSE min(fm.reported) END AS first_reported_date
  FROM useview_chv AS chv
  LEFT JOIN form_metadata AS fm
    ON fm.chw = chv._id
  LEFT JOIN contact_CTE AS cte
    ON cte.chv_uuid = chv._id
  GROUP BY chv._id
);
-- indexes
CREATE UNIQUE INDEX chv_first_reported_date_index ON chv_first_reported_date USING btree(chv_uuid,first_reported_date);
-- permissions
ALTER MATERIALIZED VIEW chv_first_reported_date OWNER TO full_access;
GRANT SELECT ON chv_first_reported_date TO dtree, periscope;