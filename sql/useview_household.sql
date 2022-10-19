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
    nullif(nullif(split_part((doc ->> 'geolocation'), ' ', 1), ''), ',')::DECIMAL AS latitude,
    nullif(nullif(split_part((doc ->> 'geolocation'), ' ', 2), ''), ',')::DECIMAL AS longitude,
    nullif(nullif(split_part((doc ->> 'geolocation'), ' ', 3), ''), ',')::DECIMAL AS alititude,
    nullif(nullif(split_part((doc ->> 'geolocation'), ' ', 4), ''), ',')::DECIMAL AS accuracy,
    doc #>> '{contact,_id}' AS contact_id,
    doc ->> 'kitongoji' AS kitongoji,
    doc ->> 'house_number' AS house_number,
    nullif(doc ->> 'travel_time', '')::INTEGER AS travel_time,
    doc ->> 'means_of_travel' AS means_of_travel,
    doc ->> 'means_of_travel_other' AS means_of_travel_other,
    nullif(doc ->> 'number_hh_members', '')::INTEGER AS number_hh_members,
    doc #>> '{meta,created_by}' AS created_by,
    doc #>> '{meta,created_by_person_uuid}' AS chv_uuid,
    doc ->> 'type' AS type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date
  FROM
    couchdb
  WHERE
    doc ->> 'type' = 'clinic'
);

CREATE UNIQUE INDEX IF NOT EXISTS household_reported_date_created_by_uuid ON useview_household USING btree(reported_date, chv_uuid, _id);
-- Permissions
ALTER MATERIALIZED VIEW useview_household OWNER TO full_access;
GRANT SELECT ON useview_household TO dtree, periscope;