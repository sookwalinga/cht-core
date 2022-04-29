------------------------------------------------------------
-- Materialized view to show table of supervisor performance.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS supervisor_performance;

CREATE MATERIALIZED VIEW supervisor_performance AS 
(
WITH daily_meetings AS (
SELECT 
    supervisory_area_uuid
    ,date_trunc('day',reported_date) AS day
    ,SUM((confirm_meeting IN('my_supervisor_is','my_supervisor_is_attending'))::INT) AS num_individual_chv_meetings
    ,MAX((confirm_meeting = 'iam_attending')::INT) AS chv_meetings 
FROM useview_confirm_meeting 
GROUP BY supervisory_area_uuid,day
),
meetings as (
 SELECT 
  supervisory_area_uuid
  ,date_trunc('month',day) AS month
  ,SUM(num_individual_chv_meetings) AS num_individual_chv_meetings
  ,SUM(chv_meetings) AS chv_meetings 
  FROM daily_meetings
  GROUP by supervisory_area_uuid,month
),
skeleton AS (
SELECT 
    _id
    ,supervisory_area_uuid
    ,month::DATE
FROM generate_series(
    TIMESTAMP '2019-07-01'
    ,current_date
    ,interval  '1 month') AS t(month)
JOIN useview_supervisor AS supervisor ON month >= supervisor.reported_date
ORDER BY _id,month
)
SELECT 
     skeleton._id AS supervisor_uuid
    ,skeleton.month
    ,COALESCE(meetings.num_individual_chv_meetings, 0) AS chv_field_visits
    ,COALESCE(meetings.chv_meetings, 0) AS monthly_meetings
    ,COALESCE(ROUND(SUM(cp.num_child_enrollments+cp.num_pregnancy_enrollments)::DECIMAL/COUNT(cp.chv_uuid),1),0) AS average_enrollments_per_chv
    ,COALESCE(ROUND(SUM(cp.num_child_visits +cp.num_pregnancy_visits)::DECIMAL/COUNT(cp.chv_uuid),1),0) AS average_visits_per_chv
FROM skeleton
LEFT JOIN chv_performance AS cp
ON skeleton.supervisory_area_uuid = cp.supervisory_area_uuid
LEFT JOIN meetings
    ON skeleton.supervisory_area_uuid = meetings.supervisory_area_uuid
    AND skeleton.month = meetings.month 
GROUP BY supervisory_area_uuid,chv_field_visits,monthly_meetings,average_enrollments_per_chv
);

CREATE UNIQUE INDEX IF NOT EXISTS supervisor_uuid_month ON supervisor_performance USING btree (supervisor_uuid,month);
ALTER MATERIALIZED VIEW supervisor_performance OWNER TO full_access;
GRANT SELECT ON supervisor_performance TO dtree;
