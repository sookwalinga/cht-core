------------------------------------------------------------
-- Materialized view to show table of pregnancy counselling forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_jna_locations;

CREATE MATERIALIZED VIEW useview_jna_locations AS
(
  WITH shehia_rows_CE AS (
    SELECT jsonb_array_elements(doc -> 'data') AS _row
    FROM couchdb
    WHERE doc ->> '_id' = 'shehia_locations'
  ),

  shehia_CTE AS (
    SELECT
      jsonb_array_element_text(_row,0) AS shehia,
      jsonb_array_element_text(_row,1) AS ward,
      jsonb_array_element_text(_row,2) AS district,
      jsonb_array_element_text(_row,3) AS region
    FROM shehia_rows_CE
  ),

  catchment_CTE AS (
    SELECT
      doc ->> '_id' AS _id,
      doc ->> 'shehia' AS shehia,
      doc -> 'parent' ->> '_id' AS supervisory_area_uuid
    FROM couchdb
    WHERE doc ->> 'type' = 'health_center'
      AND doc ->> 'name' != 'DEV_CATCHMENT_AREA'
  ),

  facility_CTE AS (
    SELECT
      doc ->> '_id' AS _id,
      doc ->> 'district' AS district,
      doc ->> 'name' AS facility
    FROM couchdb
    WHERE doc ->> 'type' = 'district_hospital'
      AND doc ->> 'name' != 'DEV_SUPERVISORY_AREA'
  )

  SELECT DISTINCT
    catchment_CTE._id AS catchment_area_uuid,
    shehia_CTE.shehia,
    facility_CTE.facility,
    shehia_CTE.ward,
    shehia_CTE.district,
    shehia_CTE.region
  FROM catchment_CTE
  INNER JOIN facility_CTE
    ON facility_CTE._id = catchment_CTE.supervisory_area_uuid
  -- Left joining to be able to see the missing shehia names for the rare cases when new catchment are created and shehia name get misspelled 
  LEFT JOIN shehia_CTE
    ON shehia_CTE.shehia = catchment_CTE.shehia
      AND (
        shehia_CTE.district = facility_CTE.district
        -- Catchments in Dodo and Pete are in different district from where there supervisory_areas are located
        --also these names are not duplicated which allows us to include them here. 
        OR catchment_CTE.shehia IN ('Dodo','Pete')
      )
);
CREATE UNIQUE INDEX IF NOT EXISTS jna_location_catchment_uuid ON useview_jna_locations USING btree(catchment_area_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_jna_locations OWNER TO full_access;
GRANT SELECT ON useview_jna_locations TO full_access, dtree, periscope;
