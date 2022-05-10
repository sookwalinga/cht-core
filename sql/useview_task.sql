------------------------------------------------------------
-- Materialized view to show table of all Client Tasks
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_task;

CREATE MATERIALIZED VIEW useview_task AS 
(
SELECT 
  doc->>'state' as state
  ,NULLIF(doc->'emission'->>'resolved','')::BOOLEAN AS resolved
  ,TO_DATE(doc->'emission'->> 'dueDate', 'YYYY-MM-DD') AS due_date
  ,TO_DATE(doc->'emission'->> 'startDate', 'YYYY-MM-DD') AS start_date
  ,TO_DATE(doc->'emission'->> 'endDate', 'YYYY-MM-DD') AS end_date
  ,doc->'emission'->'contact'->>'name' AS contact_name
  ,doc->>'owner' AS patient_uuid
  ,doc->'emission'->>'priority' AS priority
  ,doc->'emission'->>'priorityLabel' AS priority_label
  ,TO_TIMESTAMP((NULLIF(doc ->> 'authoredOn', '')::BIGINT / 1000)::DOUBLE PRECISION) AS authored_on
  ,doc->'emission'->'actions'->0->>'form' AS action_form
  ,doc->'emission'->'actions'->0->>'label' AS action_label
  ,doc->'emission'->'actions'->0->>'type' AS action_type
  ,doc->'emission'->>'icon' AS icon
  ,doc->'emission'->>'title' as title
  ,doc->>'stateHistory' AS state_history
  ,doc->>'user' AS username
  ,doc->'emission'->>'_id' AS emission_id
  ,doc->>'_id' AS _id
  ,doc->>'_rev' AS _rev
FROM couchdb
WHERE 
doc->>'type'='task'
);
CREATE UNIQUE INDEX IF NOT EXISTS Id ON useview_task USING btree (_id);
CREATE INDEX IF NOT EXISTS authored_on ON useview_task USING btree (authored_on);  
CREATE INDEX IF NOT EXISTS patient_uuid ON useview_task USING btree (patient_uuid);  
-- Permissions
ALTER MATERIALIZED VIEW useview_task OWNER TO full_access;
GRANT SELECT ON useview_task TO dtree, periscope;
