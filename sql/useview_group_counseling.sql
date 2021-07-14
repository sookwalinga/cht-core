------------------------------------------------------------
-- Materialized view to show table of group counseling forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_group_counseling;

CREATE MATERIALIZED VIEW useview_group_counseling AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,created_by}' AS chv_name,
    NULLIF(doc #>> '{fields,start}', '')::TIMESTAMP as start_time,
    NULLIF(doc #>> '{fields,end}', '')::TIMESTAMP as end_time,
    doc #>> '{fields,chv_group_counseling,district}' AS district,
    doc #>> '{fields,chv_group_counseling,shehia}' AS shehia,
    doc #>> '{fields,chv_group_counseling,village}' AS village,
    TO_DATE(NULLIF(doc #>> '{fields,chv_group_counseling,date_of_group_counseling}', ''), 'YYYY-MM-DD') AS date_of_group_counseling,
    doc #>> '{fields,chv_group_counseling,session_title}' AS session_title,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_sex,sex_number_male}', 'NaN'), '')::INTEGER AS sex_number_male,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_sex,sex_number_female}', 'NaN'), '')::INTEGER AS sex_number_female,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_age,age_below_20}', 'NaN'), '')::INTEGER AS age_below_20,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_age,age_above_20}', 'NaN'), '')::INTEGER AS age_above_20,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_participant,number_pregnant_women}', 'NaN'), '')::INTEGER AS number_pregnant_women,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_participant,number_caregivers}', 'NaN'), '')::INTEGER AS number_caregivers,
    NULLIF(NULLIF(doc #>> '{fields,chv_group_counseling,subgroup_participant,number_influential_people}', 'NaN'), '')::INTEGER AS number_influential_people,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	couchdb	
  WHERE 
	doc ->> 'form' = 'group_counseling'
);

CREATE UNIQUE INDEX IF NOT EXISTS group_counseling_reported_date_created_by_uuid ON useview_group_counseling USING btree (reported_date, chv_uuid);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_group_counseling TO full_access, dtree, periscope;