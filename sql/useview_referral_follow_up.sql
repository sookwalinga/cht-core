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
    to_timestamp((NULLIF(doc ->> 'reported_date', '')::bigint / 1000)::double precision) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,referral_source_form}' AS referral_source_form,
    doc #>> '{fields,referral_source_id}' AS referral_source_id,
    doc #>> '{fields,last_visit}' AS last_visit,
    doc #>> '{fields,last_visit_formatted}' AS last_visit_formatted,
    doc #>> '{fields,refer_flag_small_baby}' AS refer_flag_small_baby,
    doc #>> '{fields,refer_neonatal_danger_sign_flag}' AS refer_neonatal_danger_sign_flag,
    doc #>> '{fields,refer_child_danger_sign_flag}' AS refer_child_danger_sign_flag,
    doc #>> '{fields,refer_muac_flag}' AS refer_muac_flag,
    doc #>> '{fields,refer_palm_pallor_flag}' AS refer_palm_pallor_flag,
    doc #>> '{fields,refer_vaccines_flag}' AS refer_vaccines_flag,
    doc #>> '{fields,refer_slow_to_learn_specifics_flag}' AS refer_slow_to_learn_specifics_flag,
    doc #>> '{fields,client}' AS client,
    doc #>> '{fields,client_name}' AS client_name,
    doc #>> '{fields,client_date_of_birth}' AS client_date_of_birth,
    doc #>> '{fields,due_date}' AS due_date,
    doc #>> '{fields,due_date_pretty_print}' AS due_date_pretty_print,
    doc #>> '{fields,age_days}' AS age_days,
    doc #>> '{fields,age_months}' AS age_months,
    doc #>> '{fields,age_years}' AS age_years,
    doc #>> '{fields,age_days_display}' AS age_days_display,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    doc #>> '{fields,referral_follow_up,went_to_facility}' AS went_to_facility,
    doc #>> '{fields,referral_follow_up,did_go,got_services}' AS got_services,
    doc #>> '{fields,referral_follow_up,did_go,reasons_no_services}' AS reasons_no_services,
    doc #>> '{fields,referral_follow_up,did_not_go,reason_didnt_go}' AS reason_didnt_go,
    doc #>> '{fields,referral_follow_up,next_follow_up,complete_referral}' AS complete_referral,
    doc #>> '{fields,referral_follow_up,next_follow_up,client_name_loc}' AS client_name_loc,
    doc #>> '{fields,has_referral}' AS has_referral,
    doc #>> '{fields,referral_days}' AS referral_days,
    doc #>> '{geolocation,latitude}' AS latitude,
    doc #>> '{geolocation,longitude}' AS longitude,
    doc #>> '{geolocation,altitude}' AS altitude,
    doc #>> '{geolocation,accuracy}' AS accuracy 
  FROM  
	   couchdb	
  WHERE 
	  doc ->> 'form' = 'referral_follow_up'
);

CREATE UNIQUE INDEX IF NOT EXISTS referral_follow_up_reported_date_created_by_uuid ON useview_referral_follow_up USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_referral_follow_up TO full_access, dtree, periscope;