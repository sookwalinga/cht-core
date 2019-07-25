------------------------------------------------------------
-- Materialized view to show table of all registered households.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_household;

CREATE MATERIALIZED VIEW useview_household AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc #>> '{parent,_id}' AS catchment_area_uuid,
    doc #>> '{parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'name' AS name,
    doc ->> 'geolocation' AS geolocation,
    doc #>> '{contact,_id}' AS contact_id,
    doc ->> 'kitongoji' AS kitongoji,
    doc ->> 'house_number' AS house_number,
    doc ->> 'travel_time' AS travel_time,
    doc ->> 'means_of_travel' AS means_of_travel,
    doc ->> 'means_of_travel_other' AS means_of_travel_other,
    doc ->> 'number_hh_members' AS number_hh_members,
    doc #>> '{meta,created_by}' AS created_by,
    doc #>> '{meta,created_by_person_uuid}' AS chv_uuid,
    doc ->> 'type' AS type,
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date
  FROM 
    couchdb	
  WHERE 
    doc ->> 'type' = 'clinic'
);

CREATE UNIQUE INDEX IF NOT EXISTS household_reported_date_created_by_uuid ON useview_household USING btree (reported_date, chv_uuid, _id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_household TO full_access, dtree, periscope;