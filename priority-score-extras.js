module.exports = {
  chronic_condition_medication_defaulter: 2,
  immunisation_defaulter: 2,
  previous_referral: 1,
  previous_danger_signs_pregnancy_or_delivery: 3, // not provided, inferred
  low_birth_weight_or_delivery_complication: 3,
  pregnant_under_20: 2,
  pregnant_over_35: 2,
  multiparous: 1,
  child_with_disability_or_chronic_illness: 2,
  malnutrition_history: 2,
};

module.exports = {
  'emergency_followup_pregnancy': 10,
  'emergency_followup_postpartum': 10,
  'emergency_followup_neonate': 10,
  'emergency_followup_child': 9,
  'followup_red_muac': 9,
  'followup_yellow_muac': 8,
  'followup_pregnancy_outcome': 8,
  'routine_pnc': 8,
  'routine_newborn_visit': 7,
  'followup_vaccine_missed': 7,
  'routine_anc': 8,
  'followup_pregnancy_danger': 5,
  'routine_child_u6mo': 6,
  'routine_child_u3yrs': 6,
  'followup_chronic_disease': 5,
  'followup_mental_health': 5,
  'followup_tb': 5,
  'routine_elderly': 5,
  'monthly_meeting': 4,
  'update_missing_info': 3,
  'routine_household_visit': 2,
  'chw_meeting': 4,
  'health_campaign': null, // configurable per instance
  'followup_nonemergency_referral': 4,
};
