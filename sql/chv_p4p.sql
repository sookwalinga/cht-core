------------------------------------------------------------
-- Materialized view to show table of CHV P4P
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_p4p;

CREATE MATERIALIZED VIEW chv_p4p AS 
(
WITH pay_chart_CTE AS(
  SELECT * FROM (
    VALUES 
      (16,10000,35000,'visit'),
      (12,15,20000,'visit'),
      (5,11,10000,'visit'),
      (4,10000,10000,'enrollment'),
      (3,3,7500,'enrollment'),
      (2,2,5000,'enrollment'),
      (1,1,2500,'enrollment'),
      (2000,2999,311,'tarrifs'),
      (3000,3999,419,'tarrifs'),
      (4000,4999,539,'tarrifs'),
      (5000,6999,850,'tarrifs'),
      (7000,9999,868,'tarrifs'),
      (10000,14999,1424,'tarrifs'),
      (15000,19999,1627,'tarrifs'),
      (20000,29999,2172,'tarrifs'),
      (30000,39999,2370,'tarrifs'),
      (40000,49999,3150,'tarrifs'),
      (50000,99999,3935,'tarrifs')
  ) AS t(min,max,amount,type)
),
pay_CTE AS(
  SELECT chv_uuid 
  ,reported_month
  ,total_visits
  ,total_enrollments
  ,COALESCE(v.amount,0) as visits_pay
  ,COALESCE(e.amount,0) as enrollments_pay
  ,5000 as base_pay
  ,3000 as insurance_deduction
  ,COALESCE(v.amount,0)+ COALESCE(e.amount,0) + 5000 - 3000 as payment 
  ,COALESCE(t.amount,0) as tarrifs
  ,COALESCE(v.amount,0)+ COALESCE(e.amount,0) + 5000 - 3000 + COALESCE(t.amount,0) as payment_with_tarrifs
  FROM chv_performance AS cp
  LEFT JOIN pay_chart_CTE e
  ON e.type='enrollment'
  AND cp.total_enrollments BETWEEN e.min and e.max
  LEFT JOIN pay_chart_CTE v 
  ON v.type='visit'
  AND cp.total_enrollments BETWEEN v.min and v.max 
  LEFT JOIN pay_chart_CTE t 
  ON t.type='tarrifs'
  AND (COALESCE(v.amount,0)+ COALESCE(e.amount,0) + 5000 - 3000) BETWEEN t.min and t.max 
)

SELECT
  pay.chv_uuid
  ,reported_month 
  ,REGEXP_REPLACE(chv.name,'[^a-zA-Z\s]','') AS name
  ,'255' || SUBSTRING(phone FROM 2 FOR 9) AS phone
  ,shehia
  ,district 
  ,latest_sync_date
  ,current_date-latest_sync_date AS days_since_last_sync
  ,still_in_training
  ,payment_group
  ,base_pay 
  ,total_enrollments 
  ,enrollments_pay
  ,total_visits
  ,visits_pay
  ,insurance_deduction
  ,payment
  ,tarrifs
  ,payment_with_tarrifs
FROM pay_CTE AS pay
INNER JOIN useview_chv chv
ON chv._id=pay.chv_uuid
INNER JOIN useview_jna_locations loc
ON loc.catchment_area_uuid=chv.catchment_area_uuid
INNER JOIN chv_status
ON pay.chv_uuid=chv_status.chv_uuid 
AND chv_status.retired IS NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_p4p_month_uuid ON chv_p4p USING btree (reported_month, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW chv_p4p OWNER TO full_access;
GRANT SELECT ON chv_p4p TO dtree, periscope;
