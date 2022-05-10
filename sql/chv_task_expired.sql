DROP MATERIALIZED VIEW IF EXISTS chv_task_expired;
CREATE MATERIALIZED VIEW chv_task_expired AS 
(
SELECT 
  chv._id AS chv_uuid
  ,date_trunc('month',task.end_date) AS reported_month
  ,SUM((action_form='infant_child')::INT) AS infant_tasks_expired
  ,SUM((action_form='pregnancy' )::INT) AS pregnancy_tasks_expired
  ,SUM((action_form='postpartum')::INT) AS postpartum_tasks_expired
  ,SUM((action_form='referral_follow_up')::INT) AS referral_follow_up_tasks_expired
FROM useview_chv AS chv
  LEFT JOIN useview_person as person
  ON person.catchment_area_uuid=chv.catchment_area_uuid
  LEFT JOIN useview_task as task
  ON person._id=task.patient_uuid
WHERE 
  state='Failed'
GROUP BY chv._id,reported_month
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_uuid_reported_month ON chv_task_expired USING btree (chv_uuid,reported_month);
ALTER MATERIALIZED VIEW chv_task_expired OWNER TO full_access;
GRANT SELECT ON chv_task_expired TO dtree;