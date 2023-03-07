------------------------------------------------------------
-- Materialized view to show table of referral follow-up forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_referral_follow_up;

CREATE MATERIALIZED VIEW useview_referral_follow_up AS
(
  WITH RECURSIVE referral_follow_up AS (
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
      doc #>> '{fields,patient_id}' AS patient_id,
      doc #>> '{fields,referral_source_form}' AS referral_source_form,
      doc #>> '{fields,referral_source_id}' AS referral_source_id,
      nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
      nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
      to_timestamp(nullif(doc #>> '{fields,last_visit}', '')::DOUBLE PRECISION / 1000) AS last_visit,
      to_date(doc #>> '{fields,last_visit_formatted}', 'DD/MM/YYYY') AS last_visit_formatted,
      nullif(doc #>> '{fields,refer_flag_small_baby}', '')::BOOLEAN AS refer_flag_small_baby,
      nullif(doc #>> '{fields,refer_neonatal_danger_sign_flag}', '')::BOOLEAN AS refer_neonatal_danger_sign_flag,
      nullif(doc #>> '{fields,refer_secondary_neonatal_danger_sign_flag}', '')::BOOLEAN AS refer_secondary_neonatal_danger_sign_flag,
      nullif(doc #>> '{fields,refer_child_danger_sign_flag}', '')::BOOLEAN AS refer_child_danger_sign_flag,
      nullif(doc #>> '{fields,refer_child_other_danger_sign_flag}', '')::BOOLEAN AS refer_child_other_danger_sign_flag,
      nullif(doc #>> '{fields,refer_muac_flag}', '')::BOOLEAN AS refer_muac_flag,
      nullif(doc #>> '{fields,refer_palm_pallor_flag}', '')::BOOLEAN AS refer_palm_pallor_flag,
      nullif(doc #>> '{fields,refer_vaccines_flag}', '')::BOOLEAN AS refer_vaccines_flag,
      nullif(doc #>> '{fields,refer_slow_to_learn_specifics_flag}', '')::BOOLEAN AS refer_slow_to_learn_specifics_flag,
      nullif(doc #>> '{fields,refer_flag_postpartum_danger_signs}', '')::BOOLEAN AS refer_flag_postpartum_danger_signs,
      nullif(doc #>> '{fields,refer_flag_postpartum_other_signs}', '')::BOOLEAN AS refer_flag_postpartum_other_signs,
      nullif(doc #>> '{fields,refer_flag_postpartum_pnc_visit}', '')::BOOLEAN AS refer_flag_postpartum_pnc_visit,
      nullif(doc #>> '{fields,refer_flag_anc_visit}', '')::BOOLEAN AS refer_flag_anc_visit,
      nullif(doc #>> '{fields,refer_flag_emergency_danger_sign}', '')::BOOLEAN AS refer_flag_pregnancy_danger_sign,
      nullif(doc #>> '{fields,refer_flag_pregnancy_issues}', '')::BOOLEAN AS refer_flag_pregnancy_issues,
      nullif(doc #>> '{fields,refer_flag_pregnancy_complications}', '')::BOOLEAN AS refer_flag_pregnancy_complications,
      doc #>> '{fields,client}' AS client,
      doc #>> '{fields,client_name}' AS client_name,
      to_date(nullif(doc #>> '{fields,client_date_of_birth}',''), 'YYYY-MM-DD') AS client_date_of_birth,
      to_timestamp(nullif(doc #>> '{fields,due_date}', '')::DOUBLE PRECISION / 1000) AS due_date,
      doc #>> '{fields,due_date_pretty_print}' AS due_date_pretty_print,
      nullif(nullif(doc #>> '{fields,age_days}',''),'NaN')::INTEGER AS age_days,
      nullif(nullif(doc #>> '{fields,age_months}',''),'NaN')::INTEGER AS age_months,
      nullif(nullif(doc #>> '{fields,age_years}',''),'NaN')::INTEGER AS age_years,
      nullif(nullif(doc #>> '{fields,age_days_display}',''),'NaN')::INTEGER AS age_days_display,
      doc #>> '{fields,household_head}' AS household_head,
      doc #>> '{fields,house_number}' AS house_number,
      doc #>> '{fields,kitongoji}' AS kitongoji,
      doc #>> '{fields,phone}' AS phone,
      nullif(doc #>> '{fields,referral_follow_up,went_to_facility}', '')::BOOLEAN AS went_to_facility,
      nullif(doc #>> '{fields,referral_follow_up,went_to_facility_with_partner}', '')::BOOLEAN AS went_to_facility_with_partner,
      nullif(doc #>> '{fields,referral_follow_up,did_go,got_services}', '')::BOOLEAN AS got_services,
      doc #>> '{fields,referral_follow_up,did_go,reasons_no_services}' AS reasons_no_services,
      doc #>> '{fields,referral_follow_up,did_not_go,reason_didnt_go}' AS reason_didnt_go,
      nullif(doc #>> '{fields,referral_follow_up,next_follow_up,complete_referral}', '')::BOOLEAN AS complete_referral,
      doc #>> '{fields,referral_follow_up,next_follow_up,client_name_loc}' AS client_name_loc,
      nullif(doc #>> '{fields,has_referral}', '')::BOOLEAN AS has_referral,
      nullif(doc #>> '{fields,referral_days}', '')::INTEGER AS referral_days,
      nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
      nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
      nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
      nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
    FROM
      couchdb
    WHERE
      doc ->> 'form' = 'referral_follow_up'
  ),

  expanded AS (
    SELECT
      1 AS follow_up_depth,
      f.referral_source_id AS original_source_form_uuid,
      f.referral_source_form,
      f._id AS referral_id
    FROM
      referral_follow_up AS f
    UNION
    SELECT
      r.follow_up_depth + 1,
      c.referral_source_id,
      c.referral_source_form,
      r.referral_id
    FROM
      referral_follow_up AS c
    INNER JOIN
      expanded AS r
      ON r.original_source_form_uuid = c._id
  )

  SELECT
    r.*,
    exp.follow_up_depth,
    exp.referral_source_form AS original_source_form,
    exp.original_source_form_uuid
  FROM expanded AS exp
  INNER JOIN referral_follow_up AS r
    ON referral_id = r._id
      AND exp.referral_source_form != 'referral_follow_up'
  ORDER BY original_source_form_uuid DESC, follow_up_depth DESC
);

CREATE UNIQUE INDEX IF NOT EXISTS referral_follow_up_reported_date_created_by_uuid ON useview_referral_follow_up USING btree(reported_date, chv_uuid, patient_id);
-- Permissions
ALTER MATERIALIZED VIEW useview_referral_follow_up OWNER TO full_access;
GRANT SELECT ON useview_referral_follow_up TO dtree, periscope;