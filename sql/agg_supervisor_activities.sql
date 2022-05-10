--*think of removing facility level altogether
--*assumption here is that no more than one meeting will happen in a single day
 
------------------------------------------------------------
-- Materialized view to show table of aggregation of district chv supervisors count.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_supervisor_activities;
CREATE MATERIALIZED VIEW agg_supervisor_activities AS
(
WITH daily_meet AS (
  SELECT
   date_trunc('day',cm.reported_date) AS reported_day
   ,district
   ,sa.name as facility
   ,MAX((confirm_meeting = 'iam_attending')::INT) AS chv_meetings
   ,SUM((confirm_meeting IN ('my_supervisor_is','my_supervisor_is_attending'))::INT) AS shadowing_meetings
  FROM useview_supervisory_area AS sa
   LEFT JOIN useview_confirm_meeting AS cm
   ON sa._id=cm.supervisory_area_uuid
  GROUP BY district,supervisory_area_uuid,facility,reported_day
)

SELECT 
  date_trunc('month', reported_day) AS reported_month
  ,district
  -- ,facility
  ,SUM(chv_meetings) AS chv_meetings
  ,SUM(shadowing_meetings) AS chv_shadowing_meetings
FROM daily_meet
GROUP BY district,reported_month--,facility
);

CREATE UNIQUE INDEX IF NOT EXISTS agg_district_chv_supervisor_activities ON agg_supervisor_activities USING btree (reported_month,district);--,facility);
-- Permissions
ALTER MATERIALIZED VIEW agg_supervisor_activities OWNER TO full_access;
GRANT SELECT ON agg_supervisor_activities TO dtree, periscope;




