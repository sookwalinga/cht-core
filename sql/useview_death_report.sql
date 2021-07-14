------------------------------------------------------------
-- Materialized view to show table of death_report forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_death_report;

CREATE MATERIALIZED VIEW useview_death_report AS
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
    doc #>> '{fields,client_name}' AS client_name,
    doc #>> '{fields,patient_id}' AS patient_id,
    NULLIF(doc #>> '{fields,start}', '')::TIMESTAMP as start_time,
    NULLIF(doc #>> '{fields,end}', '')::TIMESTAMP as end_time,
    TO_DATE(NULLIF(doc #>> '{fields,date_of_birth_c}', ''), 'YYYY-MM-DD') AS date_of_birth_c,
    doc #>> '{fields,sex_c}' AS sex_c,
    doc #>> '{fields,created_by}' AS chv_name,
    NULLIF(NULLIF(doc #>> '{fields,age_days}', 'NaN'), '')::INTEGER AS age_days,
    NULLIF(NULLIF(doc #>> '{fields,age_months}', 'NaN'), '')::INTEGER AS age_months,
    NULLIF(NULLIF(doc #>> '{fields,age_years}', 'NaN'), '')::INTEGER AS age_years,
    NULLIF(NULLIF(doc #>> '{fields,age_in_years}', 'NaN'), '')::INTEGER AS age_in_years,
    NULLIF(NULLIF(doc #>> '{fields,age_days_display}', 'NaN'), '')::INTEGER AS age_days_display,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    doc #>> '{fields,death_report_intro,reason_death}' AS reason_death,
    TO_DATE(NULLIF(doc #>> '{fields,suspected_maternal_death,date_of_death_maternal}', ''), 'YYYY-MM-DD') AS date_of_death_maternal,
    doc #>> '{fields,suspected_maternal_death,where_death}' AS where_death,
    doc #>> '{fields,suspected_maternal_death,was_pregnant}' AS was_pregnant,
    NULLIF(doc #>> '{fields,suspected_maternal_death,during_childbirth}', '')::BOOLEAN AS during_childbirth,
    NULLIF(doc #>> '{fields,suspected_maternal_death,two_to_three_mo_after_pregnancy_childbirth}', '')::BOOLEAN AS two_to_three_mo_after_pregnancy_childbirth,
    doc #>> '{fields,next_of_kin,next_of_kin_name}' AS next_of_kin_name,
    doc #>> '{fields,next_of_kin,next_of_kin_rel_w_deceased}' AS next_of_kin_rel_w_deceased,
    doc #>> '{fields,next_of_kin,next_of_kin_street_shehia}' AS next_of_kin_street_shehia,
    doc #>> '{fields,next_of_kin,next_of_kin_district}' AS next_of_kin_district,
    doc #>> '{fields,next_of_kin,next_of_kin_phone}' AS next_of_kin_phone,
    TO_DATE(NULLIF(doc #>> '{fields,other,date_of_death_other}', ''), 'YYYY-MM-DD') AS date_of_death_other,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM 
    couchdb
  WHERE
    doc ->> 'form' = 'death_report'
);

CREATE UNIQUE INDEX IF NOT EXISTS death_report ON useview_death_report USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_death_report TO full_access, dtree, periscope;