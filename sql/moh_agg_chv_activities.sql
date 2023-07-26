-------------------------------------------------------------
--- Materialized view to show table of moh aggregated chv activities.
-------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS moh_agg_chv_activities;
CREATE MATERIALIZED VIEW moh_agg_chv_activities AS
(
  SELECT
    district,
    shehia,
    reported_month,
    substring(disaggregation,'(sex|maternal_age|default)') AS disaggregation,
    substring(disaggregation_value,'((male|female)|\d+_\d+(?=years)|default)') AS disaggregation_value,
    sum(enrollments_pregnancy) AS enrollments_pregnancy,
    sum(registrations_households) AS registrations_households,
    sum(registrations_people) AS registrations_people,
    sum((strpos(disaggregation_value,'0_5month') > 0)::INT * enrollments_child) AS enrollments_child_under_6month,
    sum(visits_child) AS visits_child,
    sum((strpos(disaggregation_value,'1trimester') > 0)::INT * visits_pregnancy) AS first_trimester_visited,
    sum(group_counselling_sessions) AS group_counselling_sessions
  FROM agg_chv_activities
  GROUP BY district,shehia,reported_month,
    substring(disaggregation,'(sex|maternal_age|default)'),
    substring(disaggregation_value,'((male|female)|\d+_\d+(?=years)|default)')
);
CREATE UNIQUE INDEX IF NOT EXISTS district_month_shehia_moh_agg_chv_activities ON moh_agg_chv_activities USING btree(district,shehia,reported_month,disaggregation,disaggregation_value);
ALTER MATERIALIZED VIEW moh_agg_chv_activities OWNER TO full_access;
GRANT SELECT ON moh_agg_chv_activities TO dtree;
