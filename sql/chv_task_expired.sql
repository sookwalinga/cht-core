SELECT 
  chv._id AS chv_uuid
  ,date_trunc('month',task.end_date) AS month
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
GROUP BY 1,month