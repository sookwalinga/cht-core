------------------------------------------------------------
-- Materialized view to show table of pregnancy counselling forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_jna_locations;

CREATE MATERIALIZED VIEW useview_jna_locations AS
(
  WITH shehia_rows_CE AS (
    SELECT 
      jsonb_array_elements(doc->'data') AS _row 
    FROM couchdb
    WHERE doc->>'_id'='shehia_locations'
  )
  ,shehia_CTE AS (
    SELECT 
      jsonb_array_element_text(_row,0) AS shehia,
      jsonb_array_element_text(_row,1) AS ward,
      jsonb_array_element_text(_row,2) AS district,
      jsonb_array_element_text(_row,3) AS region
    FROM shehia_rows_CE
  ),
  catchment_CTE AS (
    SELECT 
      doc->>'_id' AS _id,
      doc->>'shehia' AS shehia 
    FROM couchdb 
    WHERE doc->>'type'='health_center'
      AND doc->>'name'!='DEV_CATCHMENT_AREA'
  )
        
   SELECT DISTINCT
     catchment_CTE._id AS catchment_area_uuid,
     shehia_CTE.shehia,
     shehia_CTE.ward,
     shehia_CTE.district,
     shehia_CTE.region
   FROM catchment_CTE
   LEFT JOIN shehia_CTE
     ON shehia_CTE.shehia=catchment_CTE.shehia
);
CREATE UNIQUE INDEX IF NOT EXISTS jna_location_catchment_uuid ON useview_jna_locations USING btree (catchment_area_uuid);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_jna_locations TO full_access, dtree, periscope;
