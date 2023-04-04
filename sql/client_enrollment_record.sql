------------------------------------------------------------
-- Materialized view to show table of pregnancy and child enrollments.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS client_enrollment_record;
CREATE MATERIALIZED VIEW client_enrollment_record AS
(
  WITH pregnancy_consent_visits AS (
    SELECT
      patient_id,
      date_trunc('month', reported_date) AS reported_month,
      min(reported_date) AS reported_date
    FROM useview_pregnancy
    WHERE visit_id = 'pregnancy_consent_visit'
      AND consent IS TRUE
    GROUP BY patient_id, reported_month
  ),

  pregnancy_enrollments AS (
    SELECT
      preg.catchment_area_uuid,
      preg.supervisory_area_uuid,
      visits.patient_id,
      visits.reported_date AS enrollment_start_date,
      'pregnancy'::TEXT AS service,
      'edd'::TEXT AS enrollment_end,
      coalesce(death.date_of_death_maternal,min(preg.EDD))::date AS enrollment_end_date
    FROM pregnancy_consent_visits AS visits
    INNER JOIN useview_pregnancy AS preg
      ON visits.patient_id = preg.patient_id
        AND visits.reported_date = preg.reported_date
    LEFT JOIN useview_death_report AS death
      ON death.patient_id = visits.patient_id
    GROUP BY preg.catchment_area_uuid,preg.supervisory_area_uuid,visits.patient_id, service, enrollment_start_date, enrollment_end,death.date_of_death_maternal
  ),

  child_consent_visits AS (
    SELECT
      patient_id,
      date_trunc('month', reported_date) AS reported_month,
      min(reported_date) AS reported_date
    FROM useview_infant_child
    WHERE child_consent_today IS TRUE
    GROUP BY patient_id, reported_month
  ),

  child_enrollments AS (
    SELECT
      person.catchment_area_uuid,
      person.supervisory_area_uuid,
      visits.patient_id,
      visits.reported_date AS enrollment_start_date,
      'child'::TEXT AS service,
      'fifth birthday'::TEXT AS enrollment_end,
      least((person.date_of_birth + interval '5 years')::date, coalesce(person.date_of_death::date, '2100-01-01'::date)) AS enrollment_end_date
    FROM child_consent_visits AS visits
    INNER JOIN useview_person AS person
      ON visits.patient_id = person._id
  )

  SELECT * FROM pregnancy_enrollments
  UNION ALL
  SELECT * FROM child_enrollments
);
CREATE UNIQUE INDEX IF NOT EXISTS patientid_service_enrollment ON client_enrollment_record USING btree(patient_id,service,enrollment_start_date,enrollment_end_date);
ALTER MATERIALIZED VIEW client_enrollment_record OWNER TO full_access;
GRANT SELECT ON client_enrollment_record TO dtree;
