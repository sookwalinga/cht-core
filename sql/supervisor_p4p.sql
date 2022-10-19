------------------------------------------------------------
-- Materialized view to show table of CHV P4P
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS supervisor_p4p;

CREATE MATERIALIZED VIEW supervisor_p4p AS
(
  WITH tarrifs_chart_CTE AS (
    SELECT * FROM (
      VALUES
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

  pay_CTE AS (
    SELECT
      sp.supervisor_uuid,
      sp.reported_month,
      5000 AS base_pay,
      10000 * (chv_field_visits >= 1)::INT AS chv_field_visits_pay,
      10000 * (monthly_meetings >= 1)::INT AS monthly_meetings_pay,
      5000 * (average_visits_per_chv >= 12 AND average_enrollments_per_chv >= 3)::INT AS chv_performance_pay,
      -3000 AS insurance_deduction,
      (--calculating total (the part below calculating total is an ugly query, consider using another CTE to make it pretty)
        10000 * (chv_field_visits >= 1)::INT
        + 10000 * (monthly_meetings >= 1)::INT
        + 5000 * (average_visits_per_chv >= 12 AND average_enrollments_per_chv >= 3)::INT
        + 5000 - 3000
      ) AS total
    FROM supervisor_performance AS sp
  )

  SELECT
    sup._id AS supervisor_uuid,
    reported_month,
    area.name AS facility,
    district,
    base_pay,
    monthly_meetings_pay,
    chv_field_visits_pay,
    chv_performance_pay,
    insurance_deduction,
    total AS payment,
    regexp_replace(sup.name,'[^a-zA-Z\s]','') AS name,
    '255' || substring(phone FROM 2 FOR 9) AS phone,
    coalesce(tc.amount,0) AS tarrifs,
    coalesce(tc.amount,0) + total AS payment_with_tarrifs
  FROM pay_CTE AS pay
  INNER JOIN useview_supervisor AS sup
    ON sup._id = pay.supervisor_uuid
      AND sup.retired IS NULL
  INNER JOIN useview_supervisory_area AS area
    ON area._id = sup.supervisory_area_uuid
  LEFT JOIN tarrifs_chart_CTE AS tc
    ON total BETWEEN min AND max
);

CREATE UNIQUE INDEX IF NOT EXISTS supervisor_p4p_month_uuid ON supervisor_p4p USING btree(reported_month, supervisor_uuid);
-- Permissions
ALTER MATERIALIZED VIEW supervisor_p4p OWNER TO full_access;
GRANT SELECT ON supervisor_p4p TO dtree, periscope;