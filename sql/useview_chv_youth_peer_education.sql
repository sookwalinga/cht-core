------------------------------------------------------------
-- Materialized view to show table of pregnancy forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_youth_peer_education;

CREATE MATERIALIZED VIEW useview_chv_youth_peer_education AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc -> 'contact' ->> '_id' AS chv_uuid,
    doc -> 'contact' -> 'parent' ->> '_id' AS catchment_area_uuid,
    doc -> 'contact' -> 'parent' -> 'parent' ->> '_id' AS supervisory_area_uuid,
    doc ->> 'from' AS "from",
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    nullif(doc -> 'fields' -> 'chv_attendance' ->> 'did_chv_attend','')::BOOLEAN AS did_chv_attend,
    doc -> 'fields' -> 'inputs' ->> 'start' AS "start",
    doc -> 'fields' -> 'inputs' ->> 'end' AS "end",
    doc -> 'fields' -> 'inputs' -> 'user' ->> 'name' AS username,
    doc -> 'fields' ->> 'meeting_challenges' AS meeting_challenges,
    doc -> 'fields' -> 'meeting_info' ->> 'meeting_topic' AS meeting_topic,
    doc -> 'fields' -> 'meeting_info' ->> 'peer_name' AS peer_name,
    doc -> 'fields' -> 'meeting_info' ->> 'peer_phone' AS peer_phone,
    doc -> 'fields' -> 'meeting_info' ->> 'shehia' AS shehia,
    doc -> 'fields' -> 'meeting_info' ->> 'visit_date' AS visit_date,
    nullif(doc -> 'fields' -> 'referral_info' ->> 'facility_referral_count','')::INTEGER AS facility_referral_count,
    nullif(doc -> 'fields' -> 'referral_info' ->> 'has_given_referral_this_month','')::BOOLEAN AS has_given_referral_this_month,
    nullif(doc -> 'fields' -> 'referral_info' ->> 'parental_referral_count','')::INTEGER AS parental_referral_count,
    nullif(doc -> 'fields' -> 'referral_info' ->> 'referral_received_per_month','')::INTEGER AS referral_received_per_month,
    doc -> 'fields' -> 'youth_count_info' ->> 'age_group' AS age_group,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'female_absentees','')::INTEGER AS female_absentees,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'female_attended','')::INTEGER AS female_attended,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'female_registered','')::INTEGER AS female_registered,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'male_absentees','')::INTEGER AS male_absentees,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'male_attended','')::INTEGER AS male_attended,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'male_registered','')::INTEGER AS male_registered,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'total_absentees','')::INTEGER AS total_absentees,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'total_attended','')::INTEGER AS total_attended,
    nullif(doc -> 'fields' -> 'youth_count_info' ->> 'total_registered','')::INTEGER AS total_registered,
    nullif(doc -> 'geolocation' ->> 'accuracy','')::DECIMAL AS accuracy,
    nullif(doc -> 'geolocation' ->> 'altitude','')::DECIMAL AS altitude,
    nullif(doc -> 'geolocation' ->> 'code','')::DECIMAL AS code,
    nullif(doc -> 'geolocation' ->> 'heading','')::DECIMAL AS heading,
    nullif(doc -> 'geolocation' ->> 'latitude','')::DECIMAL AS latitude,
    nullif(doc -> 'geolocation' ->> 'longitude','')::DECIMAL AS longitude,
    nullif(doc -> 'geolocation' ->> 'speed','')::DECIMAL AS speed,
    doc -> 'geolocation' ->> 'message' AS message,
    doc ->> 'type' AS type
  FROM couchdb
  WHERE
    doc ->> 'form' = 'chv_youth_peer_education'
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_youth_peer_education_reported_date_created_by_uuid ON useview_chv_youth_peer_education USING btree(reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_chv_youth_peer_education OWNER TO full_access;
GRANT SELECT ON useview_chv_youth_peer_education TO dtree, periscope;
