--*think of removing facility level altogether
--*assumption here is that no more than one meeting will happen in a single day

------------------------------------------------------------
-- Materialized view to show table of aggregation of district chv supervisors count.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_supervisor_activities;
CREATE MATERIALIZED VIEW agg_supervisor_activities AS
(
  SELECT
    district,
    reported_month,
    sum(num_group_sessions) AS num_group_sessions,
    sum(monthly_meetings) AS monthly_meetings,
    sum(chv_field_visits) AS chv_field_visits
  FROM supervisor_performance AS sp
  INNER JOIN useview_supervisory_area AS sa
    ON sa.supervisor_uuid = sp.supervisor_uuid
  GROUP BY district,reported_month--,facility
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_district_chv_supervisor_activities ON agg_supervisor_activities USING btree(reported_month,district);--,facility);
-- Permissions
ALTER MATERIALIZED VIEW agg_supervisor_activities OWNER TO full_access;
GRANT SELECT ON agg_supervisor_activities TO dtree, periscope;




