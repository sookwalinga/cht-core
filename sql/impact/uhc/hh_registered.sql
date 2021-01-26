WITH hhdata AS (
    SELECT 
        date_trunc('month', h.reported_date)::date AS period_start,
        COUNT(DISTINCT h._id) AS count_hh
    FROM 
        useview_household h
    LEFT JOIN useview_supervisor s ON s.supervisory_area_uuid = h.supervisory_area_uuid
    LEFT JOIN useview_chv AS chv ON h.catchment_area_uuid = chv.catchment_area_uuid
    WHERE 
        chv.name != 'DEV_CHV'
        AND s.retired IS NULL
    GROUP BY 
        period_start
    )
SELECT period_start,
    count_hh,
    sum(count_hh) OVER (ORDER BY period_start) AS total_hh_registered
FROM hhdata;
