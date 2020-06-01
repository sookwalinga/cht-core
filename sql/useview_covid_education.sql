------------------------------------------------------------
-- Materialized view to show table of covid education forms.
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
    CASE 
      WHEN doc #>> '{fields,introductory_qns,corona_awareness}' = 'none'  
      OR   doc #>> '{fields,introductory_qns,corona_awareness}' = 'no'
      THEN FALSE 
      WHEN doc #>> '{fields,introductory_qns,corona_awareness}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS corona_awareness,
    CASE 
      WHEN doc #>> '{fields,introductory_qns,qns_from_family}' = 'none'  
      OR   doc #>> '{fields,introductory_qns,qns_from_family}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,introductory_qns,qns_from_family}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS qns_from_family,
    doc #>> '{fields,introductory_qns,asked_qns}' AS asked_qns,
    CASE 
      WHEN doc #>> '{fields,corona_symptoms,has_corona}' = 'none' 
      OR   doc #>> '{fields,corona_symptoms,has_corona}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,corona_symptoms,has_corona}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS has_corona,
    CASE 
      WHEN doc #>> '{fields,mask_questions,has_mask}' = 'none' 
      OR   doc #>> '{fields,mask_questions,has_mask}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,mask_questions,has_mask}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS has_mask,
    CASE 
      WHEN doc #>> '{fields,mask_questions,is_wearing}' = 'none' 
      OR   doc #>> '{fields,mask_questions,is_wearing}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,mask_questions,is_wearing}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS is_wearing,
    CASE 
      WHEN doc #>> '{fields,hand_washing,has_infrastructure}' = 'none' 
      OR   doc #>> '{fields,hand_washing,has_infrastructure}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,hand_washing,has_infrastructure}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS has_infrastructure,
    doc #>> '{fields,hand_washing,is_practicing}' AS is_practicing,
    doc #>> '{fields,risks_and_directions,serious_diseases}' AS serious_diseases,
    CASE 
      WHEN doc #>> '{fields,risks_and_directions,age_above_50}' = 'none' 
      OR   doc #>> '{fields,risks_and_directions,age_above_50}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,risks_and_directions,age_above_50}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS age_above_50,
    CASE 
      WHEN doc #>> '{fields,test_understading,asymptomatic}' = 'none' 
      OR   doc #>> '{fields,test_understading,asymptomatic}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,test_understading,asymptomatic}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS asymptomatic,
    CASE 
      WHEN doc #>> '{fields,test_understading,infected_area}' = 'none' 
      OR   doc #>> '{fields,test_understading,infected_area}' = 'no'  
      THEN FALSE 
      WHEN doc #>> '{fields,test_understading,infected_area}' = 'yes'
      THEN TRUE 
      ELSE NULL 
    END AS infected_area,
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
REASSIGN OWNED BY current_user TO full_access;
GRANT SELECT ON useview_covid_education TO full_access, dtree, periscope;