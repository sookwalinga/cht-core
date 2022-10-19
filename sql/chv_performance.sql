------------------------------------------------------------
-- Materialized view to show table of chv performance.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_performance;

CREATE MATERIALIZED VIEW chv_performance AS
(
  WITH hh_registration AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date) AS reported_month,
      count(_id) AS num_households_registered
    FROM useview_household
    GROUP BY chv_uuid, reported_month
  ),

  pp_registration AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date) AS reported_month,
      count(_id) AS num_people_registered
    FROM useview_person
    GROUP BY chv_uuid, reported_month
  ),

  pregnancy AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date)::DATE AS reported_month,
      sum((consent IS TRUE)::INT) AS enrollments,
      sum((consent IS TRUE OR consent IS NULL)::INT) AS visits
    FROM useview_pregnancy
    GROUP BY chv_uuid, reported_month
  ),

  postpartum AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date)::DATE AS reported_month,
      count(_id) AS visits
    FROM useview_postpartum
    GROUP BY chv_uuid, reported_month
  ),

  outcome AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date)::DATE AS reported_month,
      count(_id) AS visits
    FROM useview_pregnancy_outcomes
    GROUP BY chv_uuid, reported_month
  ),

  child AS (
    SELECT
      chv_uuid,
      date_trunc('month', reported_date) AS reported_month,
      sum((child_consent_today IS TRUE)::INT) AS enrollments,
      sum((child_consent_today IS TRUE OR child_consent_today IS NULL )::INT) AS visits
    FROM useview_infant_child
    GROUP BY chv_uuid, reported_month
  ),

  skeleton AS (
    SELECT
      chv._id AS chv_uuid,
      chv.supervisory_area_uuid,
      t.reported_month::DATE AS reported_month
    FROM generate_series(
      TIMESTAMP '2019-07-01',
      current_date,
      INTERVAL '1 month') AS t(reported_month)
    INNER JOIN useview_chv AS chv
      ON t.reported_month >= chv.reported_date
    ORDER BY chv_uuid, reported_month
  )

  SELECT
    skeleton.chv_uuid AS chv_uuid,
    skeleton.supervisory_area_uuid,
    skeleton.reported_month,
    coalesce(hh_registration.num_households_registered, 0) AS num_households_registered,
    coalesce(pp_registration.num_people_registered, 0) AS num_people_registered,
    coalesce(pregnancy.enrollments, 0) AS num_pregnancy_enrollments,
    coalesce(pregnancy.visits, 0) AS num_pregnancy_visits,
    coalesce(postpartum.visits, 0) AS num_postpartum_visits,
    coalesce(outcome.visits, 0) AS num_pregnancy_outcomes_visits,
    coalesce(child.enrollments, 0) AS num_child_enrollments,
    coalesce(child.visits, 0) AS num_child_visits,
    coalesce(pregnancy.enrollments, 0)
    + coalesce(child.enrollments, 0) AS total_enrollments,
    coalesce(pregnancy.visits, 0)
    + coalesce(postpartum.visits, 0)
    + coalesce(outcome.visits, 0)
    + coalesce(child.visits, 0) AS total_visits
  FROM skeleton
  LEFT JOIN hh_registration
    ON skeleton.chv_uuid = hh_registration.chv_uuid
      AND skeleton.reported_month = hh_registration.reported_month
  LEFT JOIN pp_registration
    ON skeleton.chv_uuid = pp_registration.chv_uuid
      AND skeleton.reported_month = pp_registration.reported_month
  LEFT JOIN child
    ON skeleton.chv_uuid = child.chv_uuid
      AND skeleton.reported_month = child.reported_month
  LEFT JOIN pregnancy
    ON skeleton.chv_uuid = pregnancy.chv_uuid
      AND skeleton.reported_month = pregnancy.reported_month
  LEFT JOIN postpartum
    ON skeleton.chv_uuid = postpartum.chv_uuid
      AND skeleton.reported_month = postpartum.reported_month
  LEFT JOIN outcome
    ON skeleton.chv_uuid = outcome.chv_uuid
      AND skeleton.reported_month = outcome.reported_month

);

CREATE UNIQUE INDEX IF NOT EXISTS chv_month ON chv_performance USING btree(chv_uuid, reported_month);
ALTER MATERIALIZED VIEW chv_performance OWNER TO full_access;
GRANT SELECT ON chv_performance TO dtree;
