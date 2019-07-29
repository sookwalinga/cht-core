------------------------------------------------------------
-- Materialized view to show table of referral follow-up forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_referral_follow_up;

CREATE MATERIALIZED VIEW useview_referral_follow_up AS 
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
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,referral_source_form}' AS referral_source_form,
    doc #>> '{fields,referral_source_id}' AS referral_source_id,
    TO_TIMESTAMP((NULLIF(doc #>> '{fields,last_visit}', '')::BIGINT / 1000)::DOUBLE PRECISION) AS last_visit,
    TO_DATE(doc #>> '{fields,last_visit_formatted}', 'DD/MM/YYYY') AS last_visit_formatted,
    NULLIF(doc #>> '{fields,refer_flag_small_baby}', '')::BOOLEAN AS refer_flag_small_baby,
    NULLIF(doc #>> '{fields,refer_neonatal_danger_sign_flag}', '')::BOOLEAN AS refer_neonatal_danger_sign_flag,
    NULLIF(doc #>> '{fields,refer_child_danger_sign_flag}', '')::BOOLEAN AS refer_child_danger_sign_flag,
    NULLIF(doc #>> '{fields,refer_muac_flag}', '')::BOOLEAN AS refer_muac_flag,
    NULLIF(doc #>> '{fields,refer_palm_pallor_flag}', '')::BOOLEAN AS refer_palm_pallor_flag,
    NULLIF(doc #>> '{fields,refer_vaccines_flag}', '')::BOOLEAN AS refer_vaccines_flag,
    NULLIF(doc #>> '{fields,refer_slow_to_learn_specifics_flag}', '')::BOOLEAN AS refer_slow_to_learn_specifics_flag,
    doc #>> '{fields,client}' AS client,
    doc #>> '{fields,client_name}' AS client_name,
    TO_DATE(doc #>> '{fields,client_date_of_birth}', 'YYYY-MM-DD') AS client_date_of_birth,
    TO_TIMESTAMP((NULLIF(doc #>> '{fields,due_date}', '')::BIGINT / 1000)::DOUBLE PRECISION) AS due_date,
    doc #>> '{fields,due_date_pretty_print}' AS due_date_pretty_print,
    NULLIF(doc #>> '{fields,age_days}', '')::INTEGER AS age_days,
    NULLIF(doc #>> '{fields,age_months}', '')::INTEGER AS age_months,
    NULLIF(doc #>> '{fields,age_years}', '')::INTEGER AS age_years,
    NULLIF(doc #>> '{fields,age_days_display}', '')::INTEGER AS age_days_display,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    NULLIF(doc #>> '{fields,referral_follow_up,went_to_facility}', '')::BOOLEAN AS went_to_facility,
    NULLIF(doc #>> '{fields,referral_follow_up,did_go,got_services}', '')::BOOLEAN AS got_services,
    doc #>> '{fields,referral_follow_up,did_go,reasons_no_services}' AS reasons_no_services,
    doc #>> '{fields,referral_follow_up,did_not_go,reason_didnt_go}' AS reason_didnt_go,
    NULLIF(doc #>> '{fields,referral_follow_up,next_follow_up,complete_referral}', '')::BOOLEAN AS complete_referral,
    doc #>> '{fields,referral_follow_up,next_follow_up,client_name_loc}' AS client_name_loc,
    NULLIF(doc #>> '{fields,has_referral}', '')::BOOLEAN AS has_referral,
    NULLIF(doc #>> '{fields,referral_days}', '')::INTEGER AS referral_days,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	   couchdb	
  WHERE 
	  doc ->> 'form' = 'referral_follow_up'
);

CREATE UNIQUE INDEX IF NOT EXISTS referral_follow_up_reported_date_created_by_uuid ON useview_referral_follow_up USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_referral_follow_up TO full_access, dtree, periscope;