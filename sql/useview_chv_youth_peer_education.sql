------------------------------------------------------------
-- Materialized view to show table of pregnancy forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_youth_peer_education;

CREATE MATERIALIZED VIEW useview_chv_youth_peer_education AS
(
SELECT 
  doc->>'_id' AS _id
  ,doc->>'_rev' AS _rev
  ,doc->>'form' AS form
  ,doc->'contact'->>'_id' AS chv_uuid
  ,doc->'contact'->'parent'->>'_id' AS catchment_area_uuid
  ,doc->'contact'->'parent'->'parent'->>'_id' AS supervisory_area_uuid
  ,doc->>'from' AS from
  ,doc->>'content_type' AS content_type
  ,TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date
  ,NULLIF(doc->'fields'->'chv_attendance'->>'did_chv_attend','')::BOOLEAN AS did_chv_attend
  --,doc->'fields'->'inputs'->'contact'->>'_id' AS contact_id  --this seems to be just a catchment_area
  ,doc->'fields'->'inputs'->>'start' AS start
  ,doc->'fields'->'inputs'->>'end' AS end
  ,doc->'fields'->'inputs'->'user'->>'name' AS username
  ,doc->'fields'->>'meeting_challenges' AS meeting_challenges
  ,doc->'fields'->'meeting_info'->>'meeting_topic' AS meeting_topic
  ,doc->'fields'->'meeting_info'->>'peer_name' AS peer_name
  ,doc->'fields'->'meeting_info'->>'peer_phone' AS peer_phone
  ,doc->'fields'->'meeting_info'->>'shehia' AS shehia
  ,doc->'fields'->'meeting_info'->>'visit_date' AS visit_date
  ,NULLIF(doc->'fields'->'referral_info'->>'facility_referral_count','')::INTEGER AS facility_referral_count
  ,NULLIF(doc->'fields'->'referral_info'->>'has_given_referral_this_month','')::BOOLEAN AS has_given_referral_this_month
  ,NULLIF(doc->'fields'->'referral_info'->>'parental_referral_count','')::INTEGER AS parental_referral_count
  ,NULLIF(doc->'fields'->'referral_info'->>'referral_received_per_month','')::INTEGER AS referral_received_per_month
  ,doc->'fields'->'youth_count_info'->>'age_group' AS age_group
  ,NULLIF(doc->'fields'->'youth_count_info'->>'female_absentees','')::INTEGER AS female_absentees
  ,NULLIF(doc->'fields'->'youth_count_info'->>'female_attended','')::INTEGER AS female_attended
  ,NULLIF(doc->'fields'->'youth_count_info'->>'female_registered','')::INTEGER AS female_registered
  ,NULLIF(doc->'fields'->'youth_count_info'->>'male_absentees','')::INTEGER AS male_absentees
  ,NULLIF(doc->'fields'->'youth_count_info'->>'male_attended','')::INTEGER AS male_attended
  ,NULLIF(doc->'fields'->'youth_count_info'->>'male_registered','')::INTEGER AS male_registered
  ,NULLIF(doc->'fields'->'youth_count_info'->>'total_absentees','')::INTEGER AS total_absentees
  ,NULLIF(doc->'fields'->'youth_count_info'->>'total_attended','')::INTEGER AS total_attended
  ,NULLIF(doc->'fields'->'youth_count_info'->>'total_registered','')::INTEGER AS total_registered
  ,NULLIF(doc->'geolocation'->>'accuracy','')::DECIMAL AS accuracy
  ,NULLIF(doc->'geolocation'->>'altitude','')::DECIMAL AS altitude
  ,NULLIF(doc->'geolocation'->>'code','')::DECIMAL AS code
  ,NULLIF(doc->'geolocation'->>'heading','')::DECIMAL AS heading
  ,NULLIF(doc->'geolocation'->>'latitude','')::DECIMAL AS latitude
  ,NULLIF(doc->'geolocation'->>'longitude','')::DECIMAL AS longitude
  ,NULLIF(doc->'geolocation'->>'speed','')::DECIMAL AS speed
  ,doc->'geolocation'->>'message' AS message
  ,doc->>'type' AS type
FROM couchdb
WHERE
  doc->>'form'='chv_youth_peer_education'
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_youth_peer_education_reported_date_created_by_uuid ON useview_chv_youth_peer_education USING btree (reported_date, chv_uuid, patient_id);
-- Permissions
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_chv_youth_peer_education TO full_access, dtree, periscope;
