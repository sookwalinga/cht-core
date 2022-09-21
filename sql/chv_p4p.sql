------------------------------------------------------------
-- Materialized view to show table of CHV P4P
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS chv_p4p;

CREATE MATERIALIZED VIEW chv_p4p AS
(
  WITH pay_chart_cte AS (
    SELECT t.* FROM (
      VALUES
      (16, 10000, 35000, 'visit')
      , (12, 15, 20000, 'visit')
      , (5, 11, 10000, 'visit')
      , (4, 10000, 10000, 'enrollment')
      , (3, 3, 7500, 'enrollment')
      , (2, 2, 5000, 'enrollment')
      , (1, 1, 2500, 'enrollment')
      , (2000, 2999, 311, 'tarrifs')
      , (3000, 3999, 419, 'tarrifs')
      , (4000, 4999, 539, 'tarrifs')
      , (5000, 6999, 850, 'tarrifs')
      , (7000, 9999, 868, 'tarrifs')
      , (10000, 14999, 1424, 'tarrifs')
      , (15000, 19999, 1627, 'tarrifs')
      , (20000, 29999, 2172, 'tarrifs')
      , (30000, 39999, 2370, 'tarrifs')
      , (40000, 49999, 3150, 'tarrifs')
      , (50000, 99999, 3935, 'tarrifs')
    ) AS t(min, max, amount, type)
  )

  , pay_cte AS (
    SELECT
      cp.chv_uuid
      , cp.reported_month
      , cp.total_visits
      , cp.total_enrollments
      , 5000 AS base_pay
      , 3000 AS insurance_deduction
      , coalesce(v.amount, 0) AS visits_pay
      , coalesce(e.amount, 0) AS enrollments_pay
      , coalesce(v.amount, 0) + coalesce(e.amount, 0) + 5000 - 3000 AS payment
      , coalesce(t.amount, 0) AS tarrifs
      , coalesce(v.amount, 0) + coalesce(e.amount, 0) + 5000 - 3000 + coalesce(t.amount, 0) AS payment_with_tarrifs
    FROM chv_performance AS cp
    LEFT JOIN pay_chart_cte AS e
      ON e.type = 'enrollment'
      AND cp.total_enrollments BETWEEN e.min AND e.max
    LEFT JOIN pay_chart_cte AS v
      ON v.type = 'visit'
      AND cp.total_visits BETWEEN v.min AND v.max
    LEFT JOIN pay_chart_cte AS t
      ON t.type = 'tarrifs'
      AND (coalesce(v.amount, 0) + coalesce(e.amount, 0) + 5000 - 3000) BETWEEN t.min AND t.max
  )

  SELECT
    pay.chv_uuid
    , pay.reported_month
    , loc.shehia
    , loc.district
    , stat.latest_sync_date
    , stat.still_in_training
    , stat.payment_group
    , pay.base_pay
    , pay.total_enrollments
    , pay.enrollments_pay
    , pay.total_visits
    , pay.visits_pay
    , pay.insurance_deduction
    , pay.payment
    , pay.tarrifs
    , pay.payment_with_tarrifs
    , regexp_replace(chv.name, '[^a-zA-Z\s]', '') AS "name"
    , '255' || substring(chv.phone FROM 2 FOR 9) AS phone
    , current_date - stat.latest_sync_date AS days_since_last_sync
  FROM pay_cte AS pay
  INNER JOIN useview_chv AS chv
    ON chv._id = pay.chv_uuid
  INNER JOIN useview_jna_locations AS loc
    ON loc.catchment_area_uuid = chv.catchment_area_uuid
  INNER JOIN chv_status AS stat
    ON pay.chv_uuid = stat.chv_uuid
    AND stat.retired IS NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS chv_p4p_month_uuid ON chv_p4p USING btree(reported_month, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW chv_p4p OWNER TO full_access;
GRANT SELECT ON chv_p4p TO dtree, periscope;
