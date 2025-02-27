------------------------------------------------------------
-- Materialized view to show table of agg_ecd_outcomes
------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS agg_ecd_outcomes;

CREATE MATERIALIZED VIEW agg_ecd_outcomes AS
(
  WITH combos AS (
    SELECT t.* FROM (VALUES
      ('child_age', 'sex'),
      ('default', 'default')
    ) AS t(cat_1, cat_2)
  ),

  category_options AS (
    SELECT co.* FROM (VALUES
      (0, 0, 'default', 'default'),
      (1, 1, 'male', 'sex'),
      (2, 2, 'female', 'sex'),
      (0, 5, '0_5months', 'child_age'),
      (6, 23, '6_23months', 'child_age'),
      (24, 59, '24_59months', 'child_age')
    )AS co(low, up, option, kind)
  ),

  category_options_combos AS (
    SELECT
      option_1.up AS cat_1_up,
      option_2.up AS cat_2_up,
      option_1.low AS cat_1_low,
      option_2.low AS cat_2_low,
      option_1.kind AS cat_1_kind,
      option_2.kind AS cat_2_kind,
      option_1.option AS cat_1_option,
      option_2.option AS cat_2_option
    FROM combos
    INNER JOIN category_options AS option_1
      ON option_1.kind = combos.cat_1
    INNER JOIN category_options AS option_2
      ON option_2.kind = combos.cat_2
  ),

  dev_stages AS (
    SELECT * FROM (VALUES
        ('stage_3mo_to_6mo',3,6),
        ('stage_6mo_to_9mo',6,9),
        ('stage_9mo_to_12mo',9,12),
        ('stage_12mo_to_2yr',12,24),
        ('stage_2yr_plus',24,60)
    ) AS t(stage,low,up)
  )

  SELECT
    district,
    shehia,
    date_trunc('month',reported_date)::date AS reported_month,
    (combo.cat_1_kind || ',' || combo.cat_2_kind) AS disaggregation,
    (combo.cat_1_option || ',' || combo.cat_2_option) AS disaggregation_value,
    sum((muac_color = 'red')::INT) AS severe_malnutrition,
    sum((muac_color = 'yellow')::INT) AS malnutrition_yellow,
    sum((muac_color = 'green')::INT) AS malnutrition_green,
    sum((muac_color IS NOT NULL)::INT) AS screened_malnutrition,
    sum((child_age_months >= dev_stages.low)::INT) AS development_on_track,
    sum((child_age_months < dev_stages.low)::INT) AS development_not_on_track,
    sum((number_books IS NOT NULL)::INT) AS screened_household_books,
    sum((number_books >= 3)::INT) AS households_books_3_or_more,
    sum((plays_with_toys_homemade IS NOT NULL)::INT) AS screened_plays_homemade_toys,
    sum(plays_with_toys_homemade::INT) AS plays_homemade_toys,
    sum(has_observed_correcting::INT) AS screened_correcting_child,
    sum((how_correct = 'scold')::INT) AS correcting_by_scold,
    sum((concern_see_or_hear IS NOT NULL)::INT) AS screeened_concern_see_or_hear,
    sum((concern_see_or_hear)::INT) AS concern_see_or_hear,
    sum((exclusively_breastfeeding)::INT) AS exclusively_breastfeeding,
    sum((exclusively_breastfeeding IS NOT NULL)::INT) AS screened_exclusively_breastfeeding,
    sum((concern_slow_to_learn IS NOT NULL)::INT) AS screened_slow_to_learn,
    sum(concern_slow_to_learn::INT) AS slow_to_learn,
    sum((concern_harsh_treatment)::INT) AS concern_harsh_treatment,
    sum((concern_harsh_treatment IS NOT NULL)::INT) AS screened_concern_harsh_treatment,
    sum((was_child_left_in_care_of_other_child_more_than_1h >= 1)::INT) AS in_care_of_other_children,
    sum((was_child_left_in_care_of_other_child_more_than_1h IS NOT NULL)::INT) AS screened_in_care_of_other_children,
    sum((coalesce(slow_to_learn_appears_mentally_backward,
        slow_to_learn_can_name_object,
        slow_to_learn_speech_different,
        slow_to_learn_does_speak,
        slow_to_learn_compared_with_kids,
        slow_to_learn_has_fits,
        slow_to_learn_difficulty_walking_moving,
        slow_to_learn_understand_speech,
        slow_to_learn_difficulty_hearing,
        slow_to_learn_difficulty_seeing,
        slow_to_learn_delay_sitting,
        concern_slow_to_learn) IS NOT NULL
    )::INT) AS screened_for_disability,
    sum((slow_to_learn_appears_mentally_backward
        OR slow_to_learn_can_name_object
        OR slow_to_learn_speech_different
        OR slow_to_learn_does_speak
        OR slow_to_learn_compared_with_kids
        OR slow_to_learn_has_fits
        OR slow_to_learn_difficulty_walking_moving
        OR slow_to_learn_understand_speech
        OR slow_to_learn_difficulty_hearing
        OR slow_to_learn_difficulty_seeing
        OR slow_to_learn_delay_sitting
        OR concern_slow_to_learn
    )::INT) AS have_disability
  FROM useview_infant_child AS child
  INNER JOIN useview_jna_locations AS loc
    ON loc.catchment_area_uuid = child.catchment_area_uuid
  INNER JOIN category_options_combos AS combo
    ON child.age_days::INT / 30 BETWEEN combo.cat_1_low AND combo.cat_1_up
      AND child.child_sex = combo.cat_2_option
  LEFT JOIN dev_stages
    ON dev_stages.stage = child.development_stage
  GROUP BY reported_month,shehia,district,disaggregation,disaggregation_value

);

CREATE UNIQUE INDEX IF NOT EXISTS agg_ecd_outcomes_shehia_month ON agg_ecd_outcomes USING btree(reported_month, shehia,district,disaggregation,disaggregation_value);
-- Permissions
ALTER MATERIALIZED VIEW agg_ecd_outcomes OWNER TO full_access;
GRANT SELECT ON agg_ecd_outcomes TO dtree, periscope;
