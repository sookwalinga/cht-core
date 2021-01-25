WITH hhvisit AS (
   WITH
  useview_patient_record AS (
    SELECT
      TO_TIMESTAMP(
        (doc#>>'{reported_date}' )::double precision / 1000 )::timestamp AS reported
      , doc#>>'{fields,patient_id}' AS patient_id
      , doc->>'form' AS form
      , doc#>>'{contact,_id}' AS reported_by
      , doc#>>'{contact,parent,_id}' AS reported_by_parent
    FROM
      couchdb
    WHERE
      doc#>'{fields}' ? 'patient_id'
      AND doc#>>'{type}' = 'data_record'
      AND doc#>>'{fields,patient_id}' <> ''
  )
SELECT
    DATE_TRUNC('month',upr.reported)::date AS reported
    ,COUNT(DISTINCT up.household_uuid) AS count_hh_visit
from
  useview_patient_record upr 
  INNER JOIN useview_person up ON (upr.patient_id=up._id)
GROUP BY
    reported
)
SELECT
    reported
    ,SUM(count_hh_visit) AS count_hh_visited
FROM 
    hhvisit
GROUP BY 
    reported
ORDER BY
    reported;