------------------------------------------------------------
-- Materialized view to show table of chv challenges reporting forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_chv_challenges_reporting;

CREATE MATERIALIZED VIEW useview_chv_challenges_reporting AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS supervisor_uuid,
    doc #>> '{contact,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS supervisor_phone,
    doc #>> '{fields,patient_id}' AS chv_uuid,
    nullif(doc #>> '{fields,chv_problem_type,problems_type}', '') AS chv_problem_type,
    nullif(doc #>> '{fields,chv_problem_type,phone_issue,phone_problem_type}', '') AS phone_problem_type,
    to_date(nullif(doc #>> '{fields,chv_problem_type,phone_issue,date_problem_happened}', ''), 'YYYY-MM-DD') AS date_incident_happened,
    nullif(doc #>> '{fields,chv_problem_type,phone_issue,loss_report_submitted}', '')::BOOLEAN AS is_loss_report_submitted,
    nullif(doc #>> '{fields,chv_problem_type,phone_issue,broken_category}', '') AS broken_phone_category,
    nullif(doc #>> '{fields,chv_problem_type,phone_issue,other}', '') AS other_phone_issue,
    nullif(doc #>> '{fields,chv_problem_type,chv_dropout,retirement_reason}', '') AS dropout_reason,
    nullif(doc #>> '{fields,chv_problem_type,month_claiming,total_paid}', '')::DECIMAL AS total_paid,
    nullif(doc #>> '{fields,chv_problem_type,month_claiming,total_deserved}', '')::DECIMAL AS total_deserved,
    to_date(nullif(doc #>> '{fields,chv_problem_type,month_claiming,month_claiming_date}', ''), 'YYYY-MM-DD') AS month_claiming_date,
    nullif(doc #>> '{fields,chv_problem_type,month_claiming,problems_description}', '') AS month_claim_explanation,
    nullif(doc #>> '{fields,chv_problem_type,jna_app_issue,app_issues}', '') AS app_issues,
    nullif(doc #>> '{fields,chv_problem_type,jna_app_issue,other}', '') AS other_app_issue,
    nullif(doc #>> '{fields,chv_problem_type,other,other_problem_type}', '') AS other_problem_type,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'chv_challenges_reporting'
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_challenges_reporting_reported_date_created_by_uuid ON useview_chv_challenges_reporting USING btree(reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_chv_challenges_reporting OWNER TO full_access;
GRANT SELECT ON useview_chv_challenges_reporting TO dtree, periscope;