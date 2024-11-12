------------------------------------------------------------
-- Materialized view to show table of infant_child forms.
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS useview_infant_child;

CREATE MATERIALIZED VIEW useview_infant_child AS
(
  SELECT
    doc ->> '_id' AS _id,
    doc ->> '_rev' AS _rev,
    doc ->> 'form' AS form,
    doc ->> 'type' AS type,
    doc ->> 'content_type' AS content_type,
    to_timestamp(nullif(doc ->> 'reported_date', '')::DOUBLE PRECISION / 1000) AS reported_date,
    doc #>> '{contact,_id}' AS chv_uuid,
    doc #>> '{contact,parent,_id}' AS catchment_area_uuid,
    doc #>> '{contact,parent,parent,_id}' AS supervisory_area_uuid,
    doc ->> 'from' AS chv_phone,
    doc #>> '{fields,patient_id}' AS patient_id,
    doc #>> '{fields,child_name}' AS child_name,
    doc #>> '{fields,inputs,contact,sex}' AS child_sex,
    nullif(doc #>> '{fields,n_child_visits}', '')::INTEGER AS n_child_visits,
    to_date(doc #>> '{fields,child_date_of_birth}', 'YYYY-MM-DD') AS child_date_of_birth,
    nullif(doc #>> '{fields,age_days}', '')::DECIMAL AS age_days,
    nullif(doc #>> '{fields,age_months}', '')::INTEGER AS age_months,
    nullif(doc #>> '{fields,age_years}', '')::INTEGER AS age_years,
    nullif(doc #>> '{fields,age_days_display}', '')::INTEGER AS age_days_display,
    nullif(doc #>> '{fields,previous_small_baby}', '')::BOOLEAN AS previous_small_baby,
    nullif(doc #>> '{fields,previous_bcg}', '')::BOOLEAN AS previous_bcg,
    nullif(doc #>> '{fields,previous_bopv0}', '')::BOOLEAN AS previous_bopv0,
    nullif(doc #>> '{fields,previous_bopv1}', '')::BOOLEAN AS previous_bopv1,
    nullif(doc #>> '{fields,previous_dtp_hepb_hib1}', '')::BOOLEAN AS previous_dtp_hepb_hib1,
    nullif(doc #>> '{fields,previous_pcvi1}', '')::BOOLEAN AS previous_pcvi1,
    nullif(doc #>> '{fields,previous_rota1}', '')::BOOLEAN AS previous_rota1,
    nullif(doc #>> '{fields,previous_bopv2}', '')::BOOLEAN AS previous_bopv2,
    nullif(doc #>> '{fields,previous_dtp_hepb_hib2}', '')::BOOLEAN AS previous_dtp_hepb_hib2,
    nullif(doc #>> '{fields,previous_pcvi2}', '')::BOOLEAN AS previous_pcvi2,
    nullif(doc #>> '{fields,previous_rota2}', '')::BOOLEAN AS previous_rota2,
    nullif(doc #>> '{fields,previous_bopv3}', '')::BOOLEAN AS previous_bopv3,
    nullif(doc #>> '{fields,previous_dtp_hepb_hib3}', '')::BOOLEAN AS previous_dtp_hepb_hib3,
    nullif(doc #>> '{fields,previous_pcvi3}', '')::BOOLEAN AS previous_pcvi3,
    nullif(doc #>> '{fields,previous_ipv}', '')::BOOLEAN AS previous_ipv,
    nullif(doc #>> '{fields,previous_surua_rubella1}', '')::BOOLEAN AS previous_surua_rubella1,
    nullif(doc #>> '{fields,previous_surua_rubella2}', '')::BOOLEAN AS previous_surua_rubella2,
    doc #>> '{fields,visit_id}' AS visit_id,
    to_timestamp(nullif(doc #>> '{fields,due_date}', '')::DOUBLE PRECISION / 1000) AS due_date,
    doc #>> '{fields,due_date_pretty_print}' AS due_date_pretty_print,
    doc #>> '{fields,created_by}' AS chv_name,
    doc #>> '{fields,household_head}' AS household_head,
    doc #>> '{fields,house_number}' AS house_number,
    doc #>> '{fields,kitongoji}' AS kitongoji,
    doc #>> '{fields,phone}' AS phone,
    nullif(doc #>> '{fields,start}', '')::TIMESTAMP AS start_time,
    nullif(doc #>> '{fields,end}', '')::TIMESTAMP AS end_time,
    nullif(doc #>> '{fields,consent,child_consent_today}', '')::BOOLEAN AS child_consent_today,
    doc #>> '{fields,first_visit_6_months,delivery_location}' AS delivery_location,
    nullif(doc #>> '{fields,first_visit_6_months,child_card_available}', '')::BOOLEAN AS child_card_available,
    nullif(doc #>> '{fields,first_visit_6_months,birthweight_on_child_card}', '')::BOOLEAN AS birthweight_on_child_card,
    nullif(doc #>> '{fields,first_visit_6_months,child_birthweight}', '')::DECIMAL AS child_birthweight,
    doc #>> '{fields,first_visit_6_months,child_size_birth}' AS child_size_birth,
    nullif(doc #>> '{fields,first_visit_6_months,small_baby_today}', '')::BOOLEAN AS small_baby_today,
    nullif(doc #>> '{fields,first_visit_6_months,has_received_small_baby_services}', '')::BOOLEAN AS has_received_small_baby_services,
    nullif(doc #>> '{fields,first_visit_6_months,refer_flag_small_baby}', '')::BOOLEAN AS refer_flag_small_baby,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_not_able_feed}', '')::BOOLEAN AS neonatal_not_able_feed,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_had_convulsions}', '')::BOOLEAN AS neonatal_had_convulsions,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_difficulty_fast_breathing}', '')::BOOLEAN AS neonatal_difficulty_fast_breathing,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_fever}', '')::BOOLEAN AS neonatal_fever,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs,neonatal_not_crying}',doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_not_crying}'),'')::BOOLEAN AS neonatal_not_crying,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs,neonatal_blue_color}',doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_blue_color}'),'')::BOOLEAN AS neonatal_blue_color,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_eyes_pus}', '')::BOOLEAN AS neonatal_eyes_pus,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_skin_boils}', '')::BOOLEAN AS neonatal_skin_boils,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_excessive_vomiting}', '')::BOOLEAN AS neonatal_excessive_vomiting,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_excessive_crying}', '')::BOOLEAN AS neonatal_excessive_crying,
    nullif(doc #>> '{fields,neonatal_danger_signs,neonatal_severe_diarrhea}', '')::BOOLEAN AS neonatal_severe_diarrhea,
    nullif(doc #>> '{fields,neonatal_danger_signs,refer_neonatal_danger_sign_flag}', '')::BOOLEAN AS refer_neonatal_danger_sign_flag,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_cold}', doc #>> '{fields,neonatal_danger_signs,neonatal_cold}'),'')::BOOLEAN AS neonatal_cold,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_yellow_pale_palms}',doc #>> '{fields,neonatal_danger_signs,neonatal_yellow_pale_palms}'),'')::BOOLEAN AS neonatal_yellow_pale_palms,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_no_movement}', doc #>> '{fields,neonatal_danger_signs,neonatal_no_movement}'),'')::BOOLEAN AS neonatal_no_movement,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_cord_bleeding}', doc #>> '{fields,neonatal_danger_signs,neonatal_cord_bleeding}'),'')::BOOLEAN AS neonatal_cord_bleeding,
    nullif(coalesce(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_diarrhea}', doc #>> '{fields,neonatal_danger_signs,neonatal_diarrhea}'),'')::BOOLEAN AS neonatal_diarrhea,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_eye_discharge}', '')::BOOLEAN AS neonatal_eye_discharge,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_skin_rash}', '')::BOOLEAN AS neonatal_skin_rash,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_congenital}', '')::BOOLEAN AS neonatal_congenital,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_vomiting}', '')::BOOLEAN AS neonatal_vomiting,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_bulging_fontanel}', '')::BOOLEAN AS neonatal_bulging_fontanel,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_abdominal_distension}', '')::BOOLEAN AS neonatal_abdominal_distension,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_no_urine}', '')::BOOLEAN AS neonatal_no_urine,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,neonatal_no_stool}', '')::BOOLEAN AS neonatal_no_stool,
    nullif(doc #>> '{fields,neonatal_danger_signs_secondary,refer_secondary_neonatal_danger_sign_flag}', '')::BOOLEAN AS refer_secondary_neonatal_danger_sign_flag,
    nullif(doc #>> '{fields,child_danger_signs,child_vomit}', '')::BOOLEAN AS child_vomit,
    nullif(doc #>> '{fields,child_danger_signs,child_convulsions}', '')::BOOLEAN AS child_convulsions,
    nullif(doc #>> '{fields,child_danger_signs,child_lethargic}', '')::BOOLEAN AS child_lethargic,
    nullif(doc #>> '{fields,child_danger_signs,child_fever}', '')::BOOLEAN AS child_fever,
    nullif(doc #>> '{fields,child_danger_signs,child_difficulty_fast_breathing}', '')::BOOLEAN AS child_difficulty_fast_breathing,
    nullif(coalesce(doc #>> '{fields,child_danger_signs,child_severe_diarrhea}', doc #>> '{fields,child_danger_signs,child_diarrhea}'),'')::BOOLEAN AS child_severe_diarrhea,
    nullif(doc #>> '{fields,child_danger_signs,refer_child_danger_sign_flag}', '')::BOOLEAN AS refer_child_danger_sign_flag,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_drink_below_6_months}', doc #>> '{fields,child_danger_signs,child_drink_below_6_months}'),'')::BOOLEAN AS child_drink_below_6_months,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_drink_6_months_to_2_years}',doc #>> '{fields,child_danger_signs,child_drink_6_months_to_2_years}'),'')::BOOLEAN AS child_drink_6_months_to_2_years,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_drink_above_2_years}',doc #>> '{fields,child_danger_signs,child_drink_above_2_years}'),'')::BOOLEAN AS child_drink_above_2_years,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_coughing}',doc #>> '{fields,child_danger_signs,child_coughing}'),'')::BOOLEAN AS child_coughing,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_cold}',doc #>> '{fields,child_danger_signs,child_cold}'),'')::BOOLEAN AS child_cold,
    nullif(coalesce(doc #>> '{fields,child_other_danger_signs,child_skin_boils}',doc #>> '{fields,child_danger_signs,child_skin_boils}'),'')::BOOLEAN AS child_skin_boils,
    nullif(doc #>> '{fields,child_other_danger_signs,child_mild_diarrhea }', '')::BOOLEAN AS child_mild_diarrhea,
    nullif(doc #>> '{fields,child_other_danger_signs,refer_child_other_danger_sign_flag}', '')::BOOLEAN AS refer_child_other_danger_sign_flag,
    doc #>> '{fields,malnutrition_anemia,growth_graph_range}' AS growth_graph_range,
    doc #>> '{fields,malnutrition_anemia,muac_color}' AS muac_color,
    nullif(doc #>> '{fields,malnutrition_anemia,refer_muac_flag}', '')::BOOLEAN AS refer_muac_flag,
    doc #>> '{fields,malnutrition_anemia,palm_pallor}' AS palm_pallor,
    nullif(doc #>> '{fields,malnutrition_anemia,refer_palm_pallor_flag}', '')::BOOLEAN AS refer_palm_pallor_flag,
    doc #>> '{fields,malnutrition_anemia,diff_foods_should_give_child}' AS diff_foods_should_give_child,
    nullif(doc #>> '{fields,malnutrition_anemia,score}', '')::INTEGER AS food_varieties,
    nullif(doc #>> '{fields,malnutrition_anemia,calculated_score}', '')::INTEGER AS food_variety_score,
    doc #>> '{fields,malnutrition_anemia,mny_solid_food_feed_child}' AS mny_solid_food_feed_child,
    nullif(doc #>> '{fields,small_baby_ever}', '')::BOOLEAN AS small_baby_ever,
    nullif(doc #>> '{fields,wash,subgroup_cleanliness,hand_wash_importance}','')::BOOLEAN AS is_hand_wash_important,
    nullif(doc #>> '{fields,wash,subgroup_health_concerns,health_concerns}','') AS selected_health_concerns,
    nullif(coalesce(doc #>> '{fields,essential_newborn_breastfeeding,currently_breastfeeding}', doc #>> '{fields,essential_newborn_breastfeeding,breastfeeding,currently_breastfeeding}',doc #>> '{fields,small_baby_breastfeeding,small_baby_currently_breastfeeding}'),'')::BOOLEAN AS currently_breastfeeding,
    nullif(coalesce(doc #>> '{fields,essential_newborn_breastfeeding,exclusively_breastfeeding}',doc #>> '{fields,essential_newborn_breastfeeding,exclusive_breastfeeding}', doc #>> '{fields,essential_newborn_breastfeeding,breastfeeding,exclusively_breastfeeding}',doc #>> '{fields,small_baby_breastfeeding,small_baby_breastfeed_exclusively}'), '')::BOOLEAN AS exclusively_breastfeeding,
    nullif(doc #>> '{fields,essential_newborn_breastfeeding,exclusive_breastfeeding_multiple_choice}','') AS exclusive_breastfeeding_multiple_choice,
    nullif(doc #>> '{fields,essential_newborn_breastfeeding_positioning,is_breastfeeding_positioning_ok}', '')::BOOLEAN AS is_breastfeeding_positioning_ok,
    nullif(doc #>> '{fields,essential_newborn_breastfeeding_positioning,suckling_effectively}', '')::BOOLEAN AS suckling_effectively,
    nullif(coalesce(doc #>> '{fields,small_baby_breastfeeding,small_baby_ever_breastfed}', doc #>> '{fields,essential_newborn_breastfeeding,ever_breastfed}',doc #>> '{fields,essential_newborn_breastfeeding,breastfeeding,ever_breastfed}'), '')::BOOLEAN AS ever_breastfed,
    nullif(coalesce(doc #>> '{fields,small_baby_breastfeeding,small_baby_time_breastfeed}',doc #>> '{fields,essential_newborn_breastfeeding,time_to_breastfeed}',doc #>> '{fields,essential_newborn_breastfeeding,breastfeeding,time_to_breastfeed}'),'') AS time_to_breastfeed,
    nullif(coalesce(doc #>> '{fields,small_baby_breastfeeding,small_baby_times_breastfed_daily}', doc #>> '{fields,essential_newborn_breastfeeding,baby_time_breastfed_daily}'),'') AS baby_times_breastfed_daily,
    nullif(coalesce(doc #>> '{fields,essential_newborn_breastfeeding,baby_breastfeed_well}', doc #>> '{fields,small_baby_breastfeeding,small_baby_breastfeed_well}'), '')::BOOLEAN AS breastfeed_well,
    nullif(doc #>> '{fields,small_baby_breastfeeding,small_baby_other_than_breast_milk}', '')::BOOLEAN AS small_baby_other_than_breast_milk,
    nullif(doc #>> '{fields,essential_newborn_care_nutrition,still_breastfeeding}', '')::BOOLEAN AS still_breastfeeding,
    doc #>> '{fields,essential_newborn_care_nutrition,confirm_nutrition_counseling_c}' AS confirm_nutrition_counseling_c,
    nullif(doc #>> '{fields,immunizations,has_health_card}', '')::BOOLEAN AS has_health_card,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_bcg}', '')::BOOLEAN AS received_bcg,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,bcg_date}' > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,bcg_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS bcg_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_bopv0}', '')::BOOLEAN AS received_bopv0,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,bopv0_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,bopv0_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS bopv0_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_bopv1}', '')::BOOLEAN AS received_bopv1,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,bopv1_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,bopv1_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS bopv1_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_dtp_hepb_hib1}', '')::BOOLEAN AS received_dtp_hepb_hib1,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,dtp_hepb_hib1_date}'   > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,dtp_hepb_hib1_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS dtp_hepb_hib1_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_pcvi1}', '')::BOOLEAN AS received_pcvi1,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,pcvi1_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,pcvi1_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS pcvi1_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_rota1}', '')::BOOLEAN AS received_rota1,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,rota1_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,rota1_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS rota1_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_bopv2}', '')::BOOLEAN AS received_bopv2,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,bopv2_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,bopv2_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS bopv2_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_dtp_hepb_hib2}', '')::BOOLEAN AS received_dtp_hepb_hib2,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,dtp_hebp_hib2_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,dtp_hebp_hib2_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS dtp_hebp_hib2_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_pcvi2}', '')::BOOLEAN AS received_pcvi2,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,pcvi2_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,pcvi2_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS pcvi2_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_rota2}', '')::BOOLEAN AS received_rota2,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,rota2_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,rota2_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS rota2_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_bopv3}', '')::BOOLEAN AS received_bopv3,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,bopv3_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,bopv3_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS bopv3_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_dtp_hepb_hib3}', '')::BOOLEAN AS received_dtp_hepb_hib3,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,dtp_hebp_hib3_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,dtp_hebp_hib3_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS dtp_hebp_hib3_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_pcvi3}', '')::BOOLEAN AS received_pcvi3,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,pcvi3_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,pcvi3_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS pcvi3_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_ipv}', '')::BOOLEAN AS received_ipv,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,ipv_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,ipv_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS ipv_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_surua_rubella1}', '')::BOOLEAN AS received_surua_rubella1,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,surua_rubella1_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,surua_rubella1_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS surua_rubella1_date,
    nullif(doc #>> '{fields,immunizations,record_vaccines,received_surua_rubella2}', '')::BOOLEAN AS received_surua_rubella2,
    CASE 
      WHEN doc #>> '{fields,immunizations,record_vaccines,surua_rubella2_date}'  > '1901-01-01'
      THEN to_date(doc #>> '{fields,immunizations,record_vaccines,surua_rubella2_date}', 'YYYY-MM-DD')
      ELSE NULL
    END AS surua_rubella2_date,
    nullif(doc #>> '{fields,immunizations,vaccines_up_to_date}', '')::BOOLEAN AS vaccines_up_to_date,
    doc #>> '{fields,immunizations,why_not_vaccines_up_to_date}' AS why_not_vaccines_up_to_date,
    nullif(doc #>> '{fields,immunizations,refer_vaccines_flag}', '')::BOOLEAN AS refer_vaccines_flag,
    nullif(coalesce(doc #>> '{fields,assess_dev_coach_play_communication,spend_time_with}',
                    doc #>> '{fields,assess_dev_coach_play_communication_new,spend_time_with_new}'),
                    '') AS spend_time_with,
    nullif(doc #>> '{fields,assess_dev_coach_play_communication_new,who_joined_visit}','') AS who_joined_visit,
 nullif(doc #>> '{fields,assess_dev_coach_play_communication_new,father_first_visit}','')::BOOLEAN AS father_first_visit,                                        
    nullif(doc #>> '{fields,assess_dev_coach_play_communication,child_age_months}', '')::INTEGER AS child_age_months,
    nullif(coalesce(doc #>> '{fields,assess_dev_coach_play_communication,development_stage}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,development_stage_new}'), 
          '') AS development_stage,
    doc #>> '{fields,assess_dev_coach_play_communication,play_communicate_lt_6mo,how_play}' AS how_play,
    doc #>> '{fields,assess_dev_coach_play_communication,play_communicate_lt_6mo,how_communicate}' AS how_communicate_lt_6mo,
    nullif(doc #>> '{fields,assess_dev_coach_play_communication,play_communicate_ge_6mo,how_play}', '')::BOOLEAN AS how_play_ge_6mo,
    doc #>> '{fields,assess_dev_coach_play_communication,play_communicate_ge_6mo,how_communicate}' AS how_communicate_ge_6mo,
    doc #>> '{fields,assess_behavior,how_interact}' AS how_interact,
    nullif(coalesce(doc #>> '{fields,assess_behavior,has_observed_correcting}', 
                    doc #>> '{fields,assess_caregiver_child_interaction_gt_6mo,has_observed_correcting_new}'),
                   '')::BOOLEAN AS has_observed_correcting,
    nullif(coalesce(doc #>> '{fields,assess_behavior,how_correct}',
                    doc #>> '{fields,assess_caregiver_child_interaction_gt_6mo,how_correct_new}'),
                    '') AS how_correct,
    nullif(doc #>> '{fields,assess_caregiver_child_interaction_gt_6mo,does_caregiver_demonstrate_interaction}','')::BOOLEAN AS does_caregiver_demonstrate_interaction,
    nullif(coalesce(doc #>> '{fields,problem_solving,has_stress_concern_play_comm}', 
                    doc #>> '{fields,problem_solving_new,stress_concern}'),
                    '')::BOOLEAN AS has_stress_concern_play_comm,
    nullif(coalesce(doc #>> '{fields,problem_solving,has_time_concern_play_comm}', 
                    doc #>> '{fields,problem_solving_new,time_concern}'), 
                    '')::BOOLEAN AS has_time_concern_play_comm,
    nullif(coalesce(doc #>> '{fields,problem_solving,engage_with_child}',
                    doc #>> '{fields,problem_solving_new,engage_with_child_new}'),
                    '') AS engage_with_child,
    nullif(coalesce(doc #>> '{fields,problem_solving,who_engages}',
                   doc #>> '{fields,problem_solving_new,who_engages_new}'),
                  '') AS who_engages,
    nullif(coalesce(doc #>> '{fields,problem_solving,who_engages_other}',
                    doc #>> '{fields,problem_solving_new,who_engages_other_new}'),
                    '') AS who_engages_other,

    nullif(doc #>> '{fields,problem_solving_new,who_engages_how_many_hours_over_15}','')::INTEGER AS who_engages_how_many_hours_over_15,
    nullif(doc #>> '{fields,problem_solving,who_engages_how_many_hours}', '')::INTEGER AS who_engages_how_many_hours,
    nullif(doc #>> '{fields,problem_solving_new,who_engages_how_many_hours}', '')::INTEGER AS who_engages_how_many_hours,

    nullif(doc #>> '{fields,problem_solving,concern_toys}', '')::BOOLEAN AS concern_toys,
    nullif(coalesce(doc #>> '{fields,problem_solving,who_engages_other}',
                    doc #>> '{fields,problem_solving_new,who_engages_other_new}'),
                    '') AS who_engages_other,
    nullif(doc #>> '{fields,problem_solving,plays_with_toys_homemade}', '')::BOOLEAN AS plays_with_toys_homemade,
    nullif(doc #>> '{fields,problem_solving_new,plays_with_toys_homemade_new}', '')::BOOLEAN AS plays_with_toys_homemade,

    nullif(doc #>> '{fields,problem_solving,plays_with_toys_manufactured}', '')::BOOLEAN AS plays_with_toys_manufactured,
    nullif(coalesce(doc #>> '{fields,problem_solving,plays_with_toys_household_objects}', 
                    doc #>> '{fields,problem_solving_new,plays_with_toys_household_objects}'),
            '')::BOOLEAN AS plays_with_toys_household_objects,
    nullif(coalesce(doc #>> '{fields,problem_solving,number_books}', 
                    doc #>> '{fields,problem_solving_new,number_books}'),
                  '')::INTEGER AS number_books,
    nullif(coalesce(doc #>> '{fields,problem_solving,concern_leave_child}',
                    doc #>> '{fields,problem_solving_new,concern_leave_child_new}'),
                     '')::BOOLEAN AS concern_leave_child,
    nullif(doc #>> '{fields,problem_solving,days_left_alone_more_than_1h}', '')::INTEGER AS days_left_alone_more_than_1h,
    nullif(doc #>> '{fields,problem_solving,days_in_care_of_other_child_more_than_1h}', '')::INTEGER AS days_in_care_of_other_child_more_than_1h,
    nullif(coalesce(doc #>> '{fields,problem_solving,concern_harsh_treatment}',
                    doc #>> '{fields,problem_solving_new,concern_harsh_treatment_new}'),
                   '')::BOOLEAN AS concern_harsh_treatment,
    nullif(doc #>> '{fields,problem_solving,concern_stressful_family_environment}', '')::BOOLEAN AS concern_stressful_family_environment,
    nullif(doc #>> '{fields,problem_solving_new,num_times_read_books}', '')::INTEGER AS num_times_read_books,
    nullif(doc #>> '{fields,problem_solving_new,num_times_told_stories}', '')::INTEGER AS num_times_told_stories,
    nullif(doc #>> '{fields,problem_solving_new,num_times_sang_to_child}', '')::INTEGER AS num_times_sang_to_child,
    nullif(doc #>> '{fields,problem_solving_new,num_times_took_child_outside}', '')::INTEGER AS num_times_took_child_outside,
    nullif(doc #>> '{fields,problem_solving_new,num_times_played_with_child}', '')::INTEGER AS num_times_played_with_child,
    nullif(doc #>> '{fields,problem_solving_new,num_times_drew_things}', '')::INTEGER AS num_times_drew_things,
    nullif(doc #>> '{fields,problem_solving_new,refer_stressful_environment_concern_flag}', '')::BOOLEAN AS refer_stressful_environment_concern_flag,
   
    nullif(coalesce(doc #>> '{fields,development_concerns,concern_slow_to_learn}', 
                   doc #>> '{fields,assess_dev_coach_play_communication_new,concern_slow_to_learn_new}'),
                   '')::BOOLEAN AS concern_slow_to_learn,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_delay_sitting}', 
                  doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_delay_sitting_new}'),
                  '')::BOOLEAN AS slow_to_learn_delay_sitting,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_difficulty_seeing}',
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_difficulty_seeing_new}'),
                    '')::BOOLEAN AS slow_to_learn_difficulty_seeing,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_difficulty_hearing}',
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_difficulty_hearing_new}'),
                    '')::BOOLEAN AS slow_to_learn_difficulty_hearing,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_understand_speech}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_understand_speech_new}'),
                    '')::BOOLEAN AS slow_to_learn_understand_speech,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_difficulty_walking_moving}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_difficulty_walking_moving_new}'),
                    '')::BOOLEAN AS slow_to_learn_difficulty_walking_moving,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_has_fits}',
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_has_fits_new}'),
                   '')::BOOLEAN AS slow_to_learn_has_fits,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_compared_with_kids}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_compared_with_kids_new}'),
                    '')::BOOLEAN AS slow_to_learn_compared_with_kids,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_does_speak}',
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_does_speak_new}'),
                    '')::BOOLEAN AS slow_to_learn_does_speak,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_speech_different}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_speech_different_new}'),
                    '')::BOOLEAN AS slow_to_learn_speech_different,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_can_name_object}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_can_name_object_new}'),
          '')::BOOLEAN AS slow_to_learn_can_name_object,
    nullif(coalesce(doc #>> '{fields,development_concerns,slow_to_learn_appears_mentally_backward}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,slow_to_learn_appears_mentally_backward_new}'),
                  '')::BOOLEAN AS slow_to_learn_appears_mentally_backward,
    nullif(coalesce(doc #>> '{fields,development_concerns,refer_slow_to_learn_specifics_flag}', 
                    doc #>> '{fields,assess_dev_coach_play_communication_new,refer_slow_to_learn_specifics_flag_new}'),
                  '')::BOOLEAN AS refer_slow_to_learn_specifics_flag,
    nullif(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,play_with_baby}', '')::BOOLEAN AS play_with_baby,
    nullif(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,talk_or_sing_with_baby}', '')::BOOLEAN AS talk_or_sing_with_baby,
        nullif(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,mention_ways_to_comfort_child}', '') AS mention_ways_to_comfort_child,
      nullif(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,does_caregiver_interact_well_with_baby}', '')::BOOLEAN AS does_caregiver_interact_well_with_baby,
    nullif(coalesce(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,caregiver_comfort_child}', 
                    doc #>> '{fields,assess_behavior,has_observed_comforting}',
                    doc #>> '{fields,assess_caregiver_child_interaction_gt_6mo,has_observed_comforting_gt_6mo}'),
                    '')::BOOLEAN AS caregiver_comfort_child,
    nullif(doc #>> '{fields,assess_caregiver_child_interaction_lt_6mo,caregiver_comfort_ways}', '')::BOOLEAN AS caregiver_comfort_ways,
    nullif(doc #>> '{fields,male_involvement,was_male_present}', '')::BOOLEAN AS was_male_present,
    nullif(doc #>> '{fields,assess_dev_coach_play_communication_new,concern_see_or_hear}', '')::BOOLEAN AS concern_see_or_hear,
    nullif(doc #>> '{fields,male_involvement,male_present_entire_visit}', '')::BOOLEAN AS male_present_entire_visit,
    doc #>> '{fields,male_involvement,partner_interaction}' AS partner_interaction,
    nullif(doc #>> '{fields,child_stool_disposal,has_latrine}', '')::BOOLEAN AS has_latrine,
    doc #>> '{fields,child_stool_disposal,latrine_type}' AS latrine_type,
    nullif(doc #>> '{fields,llints,has_mosquito_net}', '')::BOOLEAN AS has_mosquito_net,
    nullif(doc #>> '{fields,group_summary,any_referral}', '')::BOOLEAN AS any_referral,
    nullif(doc #>> '{geolocation,latitude}', '')::DECIMAL AS latitude,
    nullif(doc #>> '{geolocation,longitude}', '')::DECIMAL AS longitude,
    nullif(doc #>> '{geolocation,altitude}', '')::DECIMAL AS altitude,
    nullif(doc #>> '{geolocation,accuracy}', '')::DECIMAL AS accuracy
  FROM
    couchdb
  WHERE
    doc ->> 'form' = 'infant_child'
);
CREATE UNIQUE INDEX IF NOT EXISTS infant_child_reported_date_created_by_uuid ON useview_infant_child USING btree(reported_date, chv_uuid, patient_id);
-- Permissions
ALTER MATERIALIZED VIEW useview_infant_child OWNER TO full_access;
GRANT SELECT ON useview_infant_child TO dtree, periscope;
