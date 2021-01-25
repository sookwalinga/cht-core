SELECT
    date_trunc('month',to_timestamp((doc->>'reported_date')::bigint/1000))::date AS reported_month,
    count(DISTINCT(doc#>>'{contact,_id}')) AS count_reported_by,
    count(*) AS count_any_interaction
FROM
    couchdb
WHERE
    doc->>'type'='data_record'
GROUP BY
    reported_month
ORDER BY
    reported_month;