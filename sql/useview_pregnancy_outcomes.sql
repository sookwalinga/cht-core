------------------------------------------------------------
-- Materialized view to show table of pregnancy_outcomes forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_pregnancy_outcomes;

CREATE MATERIALIZED VIEW useview_pregnancy_outcomes AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,created_by}' AS chv_name,
    doc #>> '{fields,household_uuid}' AS household_uuid,
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,client_name}' AS client_name,
    to_date(nullif(doc #>> '{fields,client_date_of_birth}', ''), 'YYYY-MM-DD') AS client_date_of_birth,
    nullif(nullif(doc #>> '{fields,age_days}', 'NaN'), '')::INTEGER AS age_days,
    nullif(nullif(doc #>> '{fields,age_months}', 'NaN'), '')::INTEGER AS age_months,
    nullif(nullif(doc #>> '{fields,age_years}', 'NaN'), '')::INTEGER AS age_years,
    nullif(nullif(doc #>> '{fields,age_days_display}', 'NaN'), '')::INTEGER AS age_days_display,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    to_date(nullif(doc #>> '{fields,client_EDD}', ''), 'YYYY-MM-DD') AS client_EDD,
    doc #>> '{fields,confirm_delivery,pregnancy_outcome}' AS pregnancy_outcome,
    to_date(nullif(doc #>> '{fields,confirm_delivery,date_of_delivery}', ''), 'YYYY-MM-DD') AS date_of_delivery,
    to_date(nullif(doc #>> '{fields,confirm_delivery,date_of_pregnancy_loss}', ''), 'YYYY-MM-DD') AS date_of_pregnancy_loss,
    doc #>> '{fields,confirm_delivery,miscarriage_or_stillbirth}' AS miscarriage_or_stillbirth,
    nullif(doc #>> '{fields,confirm_delivery,stillbirth_location}','') AS stillbirth_location,
    doc #>> '{fields,delivery_location_assessment,delivery_location}' AS delivery_location,
    doc #>> '{fields,delivery_location_assessment,facility_island}' AS facility_island,
    doc #>> '{fields,delivery_location_assessment,pnc_visit_island_other}' AS pnc_visit_island_other,
    doc #>> '{fields,delivery_location_assessment,facility_district}' AS facility_district,
    doc #>> '{fields,delivery_location_assessment,delivery_facility}' AS delivery_facility,
    doc #>> '{fields,delivery_location_assessment,pnc_visit_facility_other}' AS pnc_visit_facility_other,
    doc #>> '{fields,delivery_information,facility_delivery_method}' AS facility_delivery_method,
    doc #>> '{fields,delivery_information,home_delivery_helper}' AS home_delivery_helper,
    nullif(doc #>> '{fields,delivery_information,got_facility_pnc}', '')::BOOLEAN AS got_facility_pnc,
    nullif(doc #>> '{fields,delivery_information,refer_flag_no_facility_pnc}', '')::BOOLEAN AS refer_flag_no_facility_pnc,
    nullif(doc #>> '{fields,delivery_information,born_early}', '')::BOOLEAN AS born_early,
    nullif(doc #>> '{fields,delivery_information,immediate_cry}', '')::BOOLEAN AS immediate_cry,
    nullif(doc #>> '{fields,delivery_information,admitted_after_birth}', '')::BOOLEAN AS admitted_after_birth,
    doc #>> '{fields,delivery_information,major_complications}' AS major_complications,
    doc #>> '{fields,number_deliveries,check_multiple_deliveries}' AS check_multiple_deliveries,
    nullif(nullif(doc #>> '{fields,number_deliveries,num_babies_delivered}', 'NaN'), '')::INTEGER AS num_babies_delivered,
    nullif(doc #>> '{fields,number_deliveries,live_birth}', '')::BOOLEAN AS live_birth,
    nullif(nullif(doc #>> '{fields,number_deliveries,num_live_births}', 'NaN'), '')::INTEGER AS num_live_births,
    nullif(nullif(doc #>> '{fields,child_death_count}', 'NaN'), '')::INTEGER AS child_death_count,
    doc #>> '{fields,child_death_data}' AS child_death_data,
    nullif(nullif(doc #>> '{fields,child_repeat_count}', 'NaN'), '')::INTEGER AS child_repeat_count,
    nullif(doc #>> '{fields,quality_of_care_survey,quality_of_care_consent}', '')::BOOLEAN AS quality_of_care_consent,
    doc #>> '{fields,quality_of_care_survey,how_handled_facility}' AS how_handled_facility,
    doc #>> '{fields,quality_of_care_survey,why_feel_handled_badly}' AS why_feel_handled_badly,
    nullif(doc #>> '{fields,quality_of_care_survey,paid_delivery_fees}', '')::BOOLEAN AS paid_delivery_fees,
    nullif(doc #>> '{fields,quality_of_care_survey,purchased_supplies}', '')::BOOLEAN AS purchased_supplies,
    doc #>> '{fields,quality_of_care_survey,what_supplies_purchased}' AS what_supplies_purchased,
    nullif(doc #>> '{fields,quality_of_care_survey,would_recommend_facility}', '')::BOOLEAN AS would_recommend_facility,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'pregnancy_outcomes'
);

CREATE UNIQUE INDEX IF NOT EXISTS pregnancy_outcomes_reported_date_created_by_uuid ON useview_pregnancy_outcomes USING btree(reported_date, chv_uuid, patient_id);
-- Permissions
ALTER MATERIALIZED VIEW useview_pregnancy_outcomes OWNER TO full_access;
GRANT SELECT ON useview_pregnancy_outcomes TO dtree, periscope;