------------------------------------------------------------
-- Materialized view to show table of covid education forms.
-- Reason we have none and no is because in the first draft of the form, no was labelled as none. 
-- Hence, we had to capture none response as well. 
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_covid_education;

CREATE MATERIALIZED VIEW useview_covid_education AS 
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    TO_TIMESTAMP((NULLIF(doc ->> 'reported_date', '')::BIGINT / 1000)::DOUBLE PRECISION) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,created_by}' AS chv_name,
    NULLIF(doc #>> '{fields,start}', '')::TIMESTAMP as start_time,
    NULLIF(doc #>> '{fields,end}', '')::TIMESTAMP as end_time,
    doc #>> '{fields,inputs,contact,_id}' AS household_id,
    NULLIF(replace(doc #>>'{fields,introductory_qns,corona_awareness}','none','no'),'')::BOOLEAN AS corona_awareness,
    NULLIF(replace(doc #>>'{fields,introductory_qns,qns_from_family}','none','no'),'')::BOOLEAN AS qns_from_family,
    doc #>> '{fields,introductory_qns,asked_qns}' AS asked_qns,
    NULLIF(replace(doc #>>'{fields,corona_symptoms,has_corona}','none','no'),'')::BOOLEAN AS has_corona,
    NULLIF(replace(doc #>>'{fields,mask_questions,has_mask}','none','no'),'')::BOOLEAN AS has_mask,
    NULLIF(replace(doc #>>'{fields,mask_questions,is_wearing}','none','no'),'')::BOOLEAN AS is_wearing,
    NULLIF(replace(doc #>>'{fields,hand_washing,has_infrastructure}','none','no'),'')::BOOLEAN AS has_infrastructure,
    doc #>> '{fields,hand_washing,is_practicing}' AS is_practicing,
    doc #>> '{fields,risks_and_directions,serious_diseases}' AS serious_diseases,
    NULLIF(replace(doc #>>'{fields,risks_and_directions,age_above_50}','none','no'),'')::BOOLEAN 
    OR NULLIF(replace(doc #>>'{fields,corona_signs,age_above_50}','none','no'),'')::BOOLEAN AS age_above_50,
    NULLIF(replace(doc #>>'{fields,test_understading,asymptomatic}','none','no'),'')::BOOLEAN AS asymptomatic,
    NULLIF(replace(doc #>>'{fields,test_understading,infected_area}','none','no'),'')::BOOLEAN AS infected_area,
    NULLIF(doc #>> '{fields,corona_precautions,does_client_take_precautions}','')::BOOLEAN  AS does_client_take_precautions,
    NULLIF(doc #>> '{fields,corona_precautions,precautions_taken}', '') AS precautions_taken,
    NULLIF(doc #>> '{fields,corona_education,source_of_corona_education}', '') AS source_of_corona_education,
    NULLIF(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    NULLIF(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    NULLIF(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    NULLIF(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy 
  FROM  
	couchdb	
  WHERE 
	doc ->> 'form' = 'covid_education'
);

CREATE UNIQUE INDEX IF NOT EXISTS covid_education_reported_date_created_by_uuid ON useview_covid_education USING btree (reported_date, chv_uuid);
-- Permissions
ALTER MATERIALIZED VIEW useview_covid_education OWNER TO full_access;
GRANT SELECT ON useview_covid_education TO dtree, periscope;