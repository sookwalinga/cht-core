var RandomForestClassifier = require('./model-min.js');
var getShehiaData=require('./catchments.js').getShehiaData;
module.exports = {

  day: 1,
  week: 7,
  month: 30,

  isChildUnder5: function (c) {
    if (c.contact && c.contact.parent && c.contact.parent.parent &&
      c.contact.parent.parent.parent && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = Math.round(ageInMs / (1000 * 60 * 60 * 24 * 30));
      return ageInMonths < 60;
    }
    return false;
  },

  isChildUnder20Days: function (c) {
    if (c.contact && c.contact.parent && c.contact.parent.parent &&
      c.contact.parent.parent.parent && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInDays = Math.round(ageInMs / (1000 * 60 * 60 * 24));
      return ageInDays < 20;
    }
    return false;
  },

  isChildInWindow3Or4: function (c) {
    if (c.contact && c.contact.parent && c.contact.parent.parent &&
      c.contact.parent.parent.parent && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInDays = Math.round(ageInMs / (1000 * 60 * 60 * 24));
      return ageInDays >= 20 && ageInDays < (this.week * 15);
    }
    return false;
  },

  isChildInWindow5Plus: function (c) {
    if (c.contact && c.contact.parent && c.contact.parent.parent &&
      c.contact.parent.parent.parent && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInDays = Math.round(ageInMs / (1000 * 60 * 60 * 24));
      return ageInDays >= (this.week * 15);
    }
    return false;
  },

  countReportsSubmitted: function (c, form) {
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === form;
      });
      return reportsFound.length;
    }
    return 0;
  },

  countConsentingInfantChildVisits: function (c) {
    var consentingVisits = [];
    if (c && c.reports) {
      consentingVisits = c.reports.filter(function (r) {
        return r.form === 'infant_child' &&
          r.fields &&
          ((!r.fields.consent) ||
            (!r.fields.consent.child_consent_today) ||
            (r.fields.consent.child_consent_today === 'yes'));
      });
      return consentingVisits.length;
    }
    return 0;
  },

  daysAfterBirth: function (c, days) {
    if (c.contact && c.contact.date_of_birth && Number.isInteger(days)) {
      var result = new Date(c.contact.date_of_birth);
      result.setDate(result.getDate() + days);
      return result;
    }
    return null;
  },

  getContactReportedDate: function (c) {
    if (c.contact && c.contact.reported_date) {
      var reported_date = new Date(c.contact.reported_date);
      return reported_date.getTime();
    }
    return null;
  },

  mapInfantChildVisitType: function (c) {
    if (c.contact && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInDays = Math.round(ageInMs / (1000 * 60 * 60 * 24));

      if (ageInDays < (this.day * 3)) {
        return 'infant_child_0_2_day_pp_visit';
      }
      else if (ageInDays < (this.day * 20)) {
        return 'infant_child_3_19_day_pp_visit';
      }
      else if (ageInDays < (this.week * 11)) {
        return 'infant_child_day_20_week_11_visit';
      }
      else if (ageInDays < (this.week * 15)) {
        return 'infant_child_week_11_week_15_visit';
      }
      else if (ageInDays < (this.month * 6)) {
        return 'infant_child_week_15_month_6_visit';
      }
      else if (ageInDays < (this.month * 9)) {
        return 'infant_child_month_6_month_9_visit';
      }
      else if (ageInDays < (this.month * 12)) {
        return 'infant_child_month_9_month_12_visit';
      }
      else if (ageInDays < (this.month * 15)) {
        return 'infant_child_month_12_month_15_visit';
      }
      else if (ageInDays < (this.month * 18)) {
        return 'infant_child_month_15_month_18_visit';
      }
      else if (ageInDays < (this.month * 24)) {
        return 'infant_child_month_18_month_24_visit';
      }
      else if (ageInDays < (this.month * 36)) {
        return 'infant_child_year_2_visit';
      }
      else if (ageInDays < (this.month * 48)) {
        return 'infant_child_year_3_visit';
      }
      else if (ageInDays < (this.month * 60)) {
        return 'infant_child_year_4_visit';
      }
    }
    return null;
  },

  mapPregnancyVisitType: function (c) {
    var gestation_in_weeks = this.getCurrentGestationAge(c);
    if (gestation_in_weeks >= 22.5 && gestation_in_weeks < 31.5) {
      return 'pregnancy_month_5_month_7_visit';
    }
    else if (gestation_in_weeks >= 31.5) {
      return 'pregnancy_over_7_months_visit';
    }
  },

  mapInfantChildVisitScheduleDueDates: function (c) {
    if (c.contact && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInDays = Math.round(ageInMs / (1000 * 60 * 60 * 24));

      if (ageInDays < (this.day * 20)) {
        return this.daysAfterBirth(c, (this.day * 5)).getTime();
      }
      else if (ageInDays < (this.week * 11)) {
        return this.daysAfterBirth(c, (this.week * 4)).getTime();
      }
      else if (ageInDays < (this.week * 15)) {
        return this.daysAfterBirth(c, (this.week * 11)).getTime();
      }
      else if (ageInDays < (this.month * 6)) {
        return this.daysAfterBirth(c, (this.week * 16)).getTime();
      }
      else if (ageInDays < (this.month * 9)) {
        return this.daysAfterBirth(c, (this.week * 26)).getTime();
      }
      else if (ageInDays < (this.month * 12)) {
        return this.daysAfterBirth(c, (this.week * 42)).getTime();
      }
      else if (ageInDays < (this.month * 15)) {
        return this.daysAfterBirth(c, (this.month * 13)).getTime();
      }
      else if (ageInDays < (this.month * 18)) {
        return this.daysAfterBirth(c, (this.month * 16)).getTime();
      }
      else if (ageInDays < (this.month * 24)) {
        return this.daysAfterBirth(c, (this.month * 20)).getTime();
      }
      else if (ageInDays < (this.month * 36)) {
        return this.daysAfterBirth(c, (this.month * 24)).getTime();
      }
      else if (ageInDays < (this.month * 48)) {
        return this.daysAfterBirth(c, (this.month * 39)).getTime();
      }
      else if (ageInDays < (this.month * 60)) {
        return this.daysAfterBirth(c, (this.month * 51)).getTime();
      }
    }

    return null;
  },

  isSmallBaby: function (c) {
    var small;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
        small = report.fields.first_visit_6_months.small_baby_today;
      }
    }
    return small;
  },

  hasReferral: function (report, referral_type) {
    if (report && report.fields) {
      if (referral_type === 'infant_child') {
        return report.fields.has_infant_child_referral === 'true';
      }
      else if (referral_type === 'pregnancy') {
        return report.fields.has_pregnancy_referral === 'true';
      }
      else if (referral_type === 'postpartum') {
        return report.fields.has_postpartum_referral === 'true';
      }
    }
    return false;
  },

  shouldVisitAgain: function (report) {
    if (report && report.fields && report.fields.should_visit_again &&
      report.fields.should_visit_again === '1') {
      return true;
    }
    return false;
  },

  getANCVisitAfter6MonthsFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.refer_flag_anc_visit_6m_or_more
    ) {
      return report.fields.refer_flag_anc_visit_6m_or_more;
    }
    return '0';
  },

  getPregnancyEmergencyDangerSigns: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.refer_flag_emergency_danger_sign
    ) {
      return report.fields.refer_flag_emergency_danger_sign;
    }
    return '0';
  },

  getPregnancyIssues: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.refer_flag_pregnancy_issues
    ) {
      return report.fields.refer_flag_pregnancy_issues;
    }
    return '0';
  },

  getPregnancyComplications: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.refer_flag_pregnancy_complications
    ) {
      return report.fields.refer_flag_pregnancy_complications;
    }
    return '0';
  },

  getPostpartumEmergencyDangerSigns: function (report) {
    if (report &&
      report.fields &&
      report.fields.refer_postpartum_emergency_danger_sign_flag &&
      report.fields.refer_postpartum_emergency_danger_sign_flag === '1'
    ) {
      return '1';
    }
    return '0';
  },

  getPostpartumOtherDangerSigns: function (report) {
    if (report &&
      report.fields &&
      report.fields.refer_postpartum_other_danger_sign_flag &&
      report.fields.refer_postpartum_other_danger_sign_flag === '1'
    ) {
      return '1';
    }
    return '0';
  },

  getSmallBabyFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.first_visit_6_months &&
      report.fields.first_visit_6_months.refer_flag_small_baby
    ) {
      return report.fields.first_visit_6_months.refer_flag_small_baby;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_flag_small_baby
    ) {
      return report.fields.refer_flag_small_baby;
    }
    return '0';
  },

  getNeonatalDangerSignFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.neonatal_danger_signs &&
      report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag
    ) {
      return report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_neonatal_danger_sign_flag
    ) {
      return report.fields.refer_neonatal_danger_sign_flag;
    }
    return '0';
  },

  getSecondaryNeonatalDangerSignFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.neonatal_danger_signs_secondary &&
      report.fields.neonatal_danger_signs_secondary.refer_secondary_neonatal_danger_sign_flag
    ) {
      return report.fields.neonatal_danger_signs_secondary.refer_secondary_neonatal_danger_sign_flag;
    }
    return '0';
  },

  getChildDangerSignFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.child_danger_signs &&
      report.fields.child_danger_signs.refer_child_danger_sign_flag
    ) {
      return report.fields.child_danger_signs.refer_child_danger_sign_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_child_danger_sign_flag
    ) {
      return report.fields.refer_child_danger_sign_flag;
    }
    return '0';
  },

  getChildOtherDangerSignFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.child_other_danger_signs &&
      report.fields.child_other_danger_signs.refer_child_other_danger_sign_flag
    ) {
      return report.fields.child_other_danger_signs.refer_child_other_danger_sign_flag;
    }
    return '0';
  },

  getMUACFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.malnutrition_anemia &&
      report.fields.malnutrition_anemia.refer_muac_flag
    ) {
      return report.fields.malnutrition_anemia.refer_muac_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_muac_flag
    ) {
      return report.fields.refer_muac_flag;
    }
    return '0';
  },

  getPalmPallorFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.malnutrition_anemia &&
      report.fields.malnutrition_anemia.refer_palm_pallor_flag
    ) {
      return report.fields.malnutrition_anemia.refer_palm_pallor_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_palm_pallor_flag
    ) {
      return report.fields.refer_palm_pallor_flag;
    }
    return '0';
  },

  getVaccinesFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.immunizations &&
      report.fields.immunizations.refer_vaccines_flag
    ) {
      return report.fields.immunizations.refer_vaccines_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_vaccines_flag
    ) {
      return report.fields.refer_vaccines_flag;
    }
    return '0';
  },

  getSlowToLearnSpecificsFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.development_concerns &&
      report.fields.development_concerns.refer_slow_to_learn_specifics_flag
    ) {
      return report.fields.development_concerns.refer_slow_to_learn_specifics_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_slow_to_learn_specifics_flag
    ) {
      return report.fields.refer_slow_to_learn_specifics_flag;
    }
    return '0';
  },

  getBcg: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bcg === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv0: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv0 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv1: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv1 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getDtp_hepb_hib1: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib1 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPcvi1: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pcvi1 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getRota1: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_rota1 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv2: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv2 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getDtp_hepb_hib2: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib2 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPcvi2: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pcvi2 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getRota2: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_rota2 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv3: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv3 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getDtp_hepb_hib3: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib3 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPcvi3: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pcvi3 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getIpv: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_ipv === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getSurua_rubella1: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_surua_rubella1 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getSurua_rubella2: function (c) {
    var result = 0;
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_surua_rubella2 === 'yes';
      });
      if (reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  isFormSubmittedForSource: function (reports, source_form, source_id) {
    var reportsFound = reports.filter(function (r) {
      return (r.form === source_form) &&
        r.fields &&
        r.fields.referral_source_id &&
        (r.fields.referral_source_id === source_id);
    });
    return reportsFound.length > 0;
  },

  getRecentEDDForThisPregnancy: function (c) {
    var reportsFound = [];
    var EDD = '';
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.EDD;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        EDD = report.fields.EDD;
      }
    }
    return EDD;
  },

  getCurrentGestationAge: function (c) {
    if (this.getRecentEDDForThisPregnancy(c) !== '') {
      var EDD = new Date(this.getRecentEDDForThisPregnancy(c));
      var gestation_in_weeks;
      var estimatedDaysLeftInMs = new Date(EDD.getTime() - Date.now());
      gestation_in_weeks = 40 - estimatedDaysLeftInMs / (1000 * 60 * 60 * 24 * 7);
      return gestation_in_weeks;
    }
    return 0;
  },

  getPregnancyDueDate: function (c) {
    var dueDate = new Date();
    if (this.getRecentEDDForThisPregnancy(c) !== '') {
      //Get EDD 
      var EDD = new Date(this.getRecentEDDForThisPregnancy(c));
      var gestation_in_weeks = this.getCurrentGestationAge(c);
      if (gestation_in_weeks >= 22.5 && gestation_in_weeks < 31.5) {
        dueDate = new Date(EDD.setDate(EDD.getDate() - (13 * this.week)));
      }
      else if (gestation_in_weeks >= 31.5) {
        dueDate = new Date(EDD.setDate(EDD.getDate() - (4 * this.week)));
      }
    }
    return dueDate;
  },

  isOver5MonthsPregnant: function (c) {
    var gestation_in_week = this.getCurrentGestationAge(c);
    if (gestation_in_week >= 22.5) {
      return true;
    }
    return false;
  },

  getMostRecentPregnancyConsentDate: function (c) {
    var reportedDate = '';
    var reportsFound = [];
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.fields &&
          r.fields.pregnancy_consent &&
          r.fields.pregnancy_consent.consent &&
          r.fields.pregnancy_consent.consent === 'yes';
      });
    }
    if (reportsFound.length > 0) {
      var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
      reportedDate = report.reported_date;
    }
    console.log('Most recent pregnancy consent date ' + reportedDate);
    return reportedDate;
  },

  getRecentPregnancyReport: function (c) {
    var report = '';
    var reportsFound = [];
    var recentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports && recentReportDate !== '') {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentReportDate;
      });
    }
    if (reportsFound.length > 0) {
      report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
    }
    return report;
  },

  getPositiveConsentingPregnancyRegistrations: function (c) {
    var positiveConsentingPregnancyRegistrations = [];
    if (c && c.reports) {
      positiveConsentingPregnancyRegistrations = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.fields &&
          r.fields.pregnancy_consent &&
          r.fields.pregnancy_consent.consent === 'yes';
      });
    }
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function (c) {
    var deliveryOutcomes = [];
    var earlyTerminations = [];
    if (c && c.reports) {
      deliveryOutcomes = c.reports.filter(function (r) {
        return r.form === 'pregnancy_outcomes' &&
          r.fields &&
          r.fields.confirm_delivery &&
          r.fields.confirm_delivery.pregnancy_outcome &&
          ((r.fields.confirm_delivery.pregnancy_outcome === 'did_deliver') ||
            (r.fields.confirm_delivery.pregnancy_outcome === 'miscarriage_or_stillbirth'));
      });
      earlyTerminations = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.fields &&
          r.fields.visit_introduction &&
          r.fields.visit_introduction.viable_pregnancy &&
          r.fields.visit_introduction.viable_pregnancy === 'no';
      });
    }
    return deliveryOutcomes.length + earlyTerminations.length;
  },

  isCurrentlyPregnant: function (c) {
    if (this.getPositiveConsentingPregnancyRegistrations(c) > this.getPregnancyOutcomes(c)) {
      return true;
    }
    else {
      return false;
    }
  },

  hadCSection: function (c) {
    var report = '';
    var flag = false;
    if (c && c.reports) {
      report = Utils.getMostRecentReport(c.reports, 'pregnancy_outcomes');
      if (report && report.fields && report.fields.delivery_information &&
        report.fields.delivery_information.facility_delivery_method &&
        report.fields.delivery_information.facility_delivery_method === 'caesarian') {
        flag = true;
      }
    }
    return flag;
  },

  getDeliveryDate: function (c) {
    var delivery_date = null;
    if (c && c.reports) {
      var report = Utils.getMostRecentReport(c.reports, 'pregnancy_outcomes');
      if (report && report.fields && report.fields.confirm_delivery && report.fields.confirm_delivery.date_of_delivery) {
        delivery_date = new Date(report.fields.confirm_delivery.date_of_delivery);
      }
    }
    return delivery_date;
  },

  showQualityOfCare: function (c) {
    var deliveryDate = this.getDeliveryDate(c);
    var flag = false;
    if (deliveryDate !== null) {
      var daysPassedInMs = new Date(Date.now() - deliveryDate.getTime());
      var daysPassed = Math.round(daysPassedInMs / (1000 * 60 * 60 * 24));
      if (daysPassed >= 3) {
        flag = true;
      }
    }
    return flag;
  },

  noPostpartumVisitsCurrentPregnancy: function (c) {
    var flag = true;
    var reportsFound = [];
    if (c && c.reports) {
      var report = Utils.getMostRecentReport(c.reports, 'pregnancy_outcomes');
      if (report) {
        var delivery_reported_date = report.reported_date;
        reportsFound = c.reports.filter(function (r) {
          return r.form === 'postpartum' &&
            r.reported_date &&
            r.reported_date >= delivery_reported_date;
        });
      }
      if (reportsFound.length > 0) {
        flag = false;
      }
    }
    return flag;
  },

  isAtleastOneBabyAlive: function (report) {
    var flag = false;
    if (report &&
      report.fields &&
      report.fields.number_deliveries &&
      (report.fields.number_deliveries.live_birth === 'yes' ||
        report.fields.number_deliveries.num_live_births > 0)) {
      flag = true;
    }
    return flag;
  },

  mapPostPartumVisitType: function (c) {
    if (this.noPostpartumVisitsCurrentPregnancy(c)) {
      return 'postpartum_initial_visit';
    }
    else {
      return 'postpartum_visit_3_or_more_days';
    }
  },

  didClientDeliver: function (c) {
    var flag = false;
    if (c && c.reports) {
      var report = Utils.getMostRecentReport(c.reports, 'pregnancy_outcomes');
      if (report && report.fields && report.fields.confirm_delivery &&
        report.fields.confirm_delivery.pregnancy_outcome &&
        report.fields.confirm_delivery.pregnancy_outcome === 'did_deliver'
      ) {
        flag = true;
      }
    }
    return flag;
  },

  consentingVisitsThisMonth: function (c, form_type) {
    var flag = false;
    var isReportedThisMonth = this.isOnSameMonth;
    if (c && c.reports) {
      var counter = [];
      counter = c.reports.filter(function (r) {
        switch (form_type) {
          case 'pregnancy':
            return r.form === 'pregnancy' && r.fields && r.fields.pregnancy_consent &&
              r.fields.pregnancy_consent.consent && r.fields.pregnancy_consent.consent === 'yes' &&
              r.reported_date && isReportedThisMonth(new Date(r.reported_date), new Date());
          case 'infant_child':
            return r.form === 'infant_child' &&
              r.fields && r.fields.consent && r.fields.consent.child_consent_today &&
              r.fields.consent.child_consent_today === 'yes' &&
              isReportedThisMonth(new Date(r.reported_date), new Date());
        }
      });
      if (counter.length > 0) {
        flag = true;
      }
    }
    return flag;
  },

  isOnSameMonth: function (date1, date2) {
    var firstDate = date1;
    var secondDate = date2;
    return firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() + 1 === secondDate.getMonth() + 1;
  },

  isContactDeceased: function (c) {
    var isDeceased = false;
    if (c && c.contact && c.contact.date_of_death) {
      isDeceased = true;
    }
    return isDeceased;
  },

  isContactMuted: function (c) {
    var isMuted = false;
    if (c && c.contact && c.contact.muted) {
      isMuted = true;
    }
    return isMuted;
  },

  getPregnantWomanAge: function (c) {
    var reportsFound = [];
    var ageInYears = '';
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.age_years;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        ageInYears = report.fields.age_years;
      }
    }
    console.log('Pregnant woman age ' + ageInYears);
    return ageInYears;
  },

  getHIVStatus: function (c) {
    console.log('Inside HIV function');
    var hiv_status = false;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.pmtct &&
          r.fields.pmtct.hiv_status;
      });
      if (reportsFound.length > 0) {
        reportsFound.forEach(function (r) {
          if (r.fields.pmtct.hiv_status === 'hiv_positive') {
            hiv_status = true;
          }
        });
      }
    }
    console.log('HIV status ' + hiv_status);
    return hiv_status;
  },

  getPrevMiscarrige: function (c) {
    var reportsFound = [];
    var prevMiscarriage = false;
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.pregnant_woman_information &&
          r.fields.pregnant_woman_information.previous_miscarriages;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        prevMiscarriage = report.fields.pregnant_woman_information.previous_miscarriages;
      }
    }
    console.log('Previous Miscarriage ' + prevMiscarriage);
    return prevMiscarriage;
  },

  getPrevPregnancies: function (c) {
    var reportsFound = [];
    var prevPregnancies = false;
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.pregnant_woman_information &&
          r.fields.pregnant_woman_information.previous_pregnancies;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        prevPregnancies = report.fields.pregnant_woman_information.previous_pregnancies;
      }
    }
    console.log('Previous pregnancies ' + prevPregnancies);
    return prevPregnancies;
  },

  getPreviousDeliveries: function (c) {
    var prevDeliveries = this.getPrevPregnancies(c) - this.getPrevMiscarrige(c);
    console.log('Previous deliveries ' + prevDeliveries);
    return prevDeliveries;
  },

  getPrevDeliveryLocation: function (c) {
    var reportsFound = [];
    var prevDeliveryLocation = '';
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.facility_delivery_importance &&
          r.fields.facility_delivery_importance.delivery_location;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        prevDeliveryLocation = report.fields.facility_delivery_importance.delivery_location;
      }
    }
    console.log('Prev delivery location ' + prevDeliveryLocation);
    return prevDeliveryLocation;
  },
 
  getHouseInfo: function (c,property) {
    var reportsFound = [];
    var data = '';
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate(c);
    if (c && c.reports) {
      reportsFound = c.reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentConsentReportDate &&
          r.fields &&
          r.fields.education_and_prev_enrollment &&
          r.fields.education_and_prev_enrollment;
      });
      if (reportsFound.length > 0) {
        var report = Utils.getMostRecentReport(reportsFound, 'pregnancy');
        data = report.fields.education_and_prev_enrollment;
        if(property === 'roof_material')
          data = report.fields.education_and_prev_enrollment.roof_material; 
        else if(property === 'floor_material')
        data = report.fields.education_and_prev_enrollment.floor_material;
        else if(property === 'highest_school_level')
        data = report.fields.education_and_prev_enrollment.floor_material;
        else if(property === 'water_source')
        data = report.fields.education_and_prev_enrollment.floor_material;
        else if(property === 'home_electricity')
        data = report.fields.education_and_prev_enrollment.floor_material;
      }
    }
    return data;
  },

  
  isHighRiskPregnancy: function (c) {
    var data=getShehiaData(c.contact.meta.created_by_place_uuid);
    console.log('Data is ' + JSON.stringify(data)); 
   if(data.shehia === '')
   { 
    console.log('No catchment area found'); 
    return; 
   }
   var shehia = data.shehia; 
   var district = data.district; 
   var  home_ct = data.home_ct; 
   var avg_contacts = data.avg_contacts; 
   var avg_trans_sent = data.avg_trans_sent; 
   var avg_sent_overall_trans = data.avg_sent_overall_trans; 
   var avg_trans_received = data.avg_trans_received; 
   var population_2002 = data.population_2002; 
   var population_2012 = data.population_2012; 
   var status = data.status; 
    var prevDeliveryLocation = this.getPrevDeliveryLocation(c);
    var waterSource = this.getHouseInfo(c, 'water_source');
    var highestSchoolLevel = this.getHouseInfo(c, 'highest_school_level');
    var homeElectricity = this.getHouseInfo(c, 'home_electricity');
     var floorMaterial = this.getHouseInfo(c, 'floor_material');
     var roofMaterial = this.getHouseInfo(c, 'roof_material');
    //console.log('water source ' + this.getWaterSource(c)); 
    var inputData = [
     
      this.getPregnantWomanAge(c),  //getPregnantWomanAge()
      0,  //driver arranged in advance (No match)
      this.getHIVStatus(c),   // getHIVStatus()
      0, //partner permission (No match)
      0, //Outcome variable 
      // getMostRecentPregnancyConsentDate() , prevMiscarriage(), 
      this.getMostRecentPregnancyConsentDate(c), 
      this.getPrevMiscarrige(c), 
      0, //Breech ( No match)
      0, //Cardiac disease (No match) 
      0, // Diabetes (no match ) 
      0, //High bp ( No match) 
      0,//Macrosomia (no match) 
      this.getPreviousDeliveries(),// getPrevDeliveries()
      0, //previous_eclampsia (no match) 
      0, //previous_perineal_tear (no match) 
      0,//previous_placenta_previa (no match)
      0,//previous_pph (no match) 
      0,//previous_prolonged_labor (no match) 
      0, //previous_retained_placenta (no match) 
      0, //previous_vacuum (no match) 
      0,//prior_c_section (no match) 
      0, //sickle_cell (no match) 
      0, //TO DO: Calculate stillbirth
      home_ct, //home_ct 
      0, // Twins (No match) 
      avg_trans_sent,//avg_trans_sent 
      avg_contacts,//avg_contacts 
      avg_sent_overall_trans , //avg_sent_overall_trans 
      avg_trans_received,  //avg_trans_received 
      population_2002,//population_2002
      population_2012 , //population_2012
      district === 'chake', //district chake
      district === 'kaskazini a', // kaskaziniA (Not sure how to get it in CHT) 
      district === 'kaskazini b',// kaskazini B 
      district === 'kati',  // kati
      district === 'kusini', //kusini
      district === 'magharibi',//magharibi
      district === 'micheweni',//micheweni
      district === 'mkoani',//mkoani
      district === 'wete', //wete 
      0, // delivery_location = null  (No match) 
      prevDeliveryLocation === 'on_the_way', //Location = On the way 
      prevDeliveryLocation === 'local_health_facility', // Location = Health facility  ( Map to variable name with highest number of rows)
      prevDeliveryLocation === 'home',//Location = Home               (Map to variable name with highest number of row) 
      prevDeliveryLocation === 'local_health_facility', //Location = Health facility 
      prevDeliveryLocation === 'home', //Location = Home 
     waterSource === 'other' || waterSource === 'decline_to_answer', //Water source = Other 
     waterSource === 'surface',//Water source  surface 
      waterSource === 'home_tap_pump', //Water source home_tap_pump
      waterSource === 'community_tap_pump',//Water source community_tap_pump
      waterSource === 'well',//Water source well 
      waterSource === 'home_well',//Water source home well 
      highestSchoolLevel === 'primary',// education level === primary 
      highestSchoolLevel === 'secondary',//secondary 
      highestSchoolLevel === 'completed_high_school' ||
      highestSchoolLevel === 'more_than_high_school',// completed_high_school or more_than_high_school
      highestSchoolLevel === 'incomplete_primary',// incomplete_primary
      highestSchoolLevel === 'incomplete_secondary',//incomplete_secondary
      highestSchoolLevel === 'school_level_dont_know_decline' ||
      highestSchoolLevel === 'no_formal_education',//highest_school_level = "school_level_dont_know_decline" or highest_school_level = "no_formal_education"
      homeElectricity === 'no',//Electricity = 'no' 
      homeElectricity === 'yes', //Electricity = 'yes'
      floorMaterial === 'decline_to_answer' ||
      floorMaterial === 'other', // floor = "decline_to_answer" or "other"
      floorMaterial === 'concrete', // floor = concrete 
      floorMaterial === 'dirt', // floor = dirt 
      floorMaterial === 'plastic_mat', // floor = plastic_mat 
      floorMaterial === 'tiles', // floor = tiles 
      roofMaterial === 'decline_to_answer' ||
      roofMaterial === 'other',// roof = "decline_to_answer" or "other" 
      roofMaterial === 'iron_sheets', // roof = iron_sheets
      roofMaterial === 'scrap_iron', // roof = scrap_iron 
      roofMaterial === 'makuti', // roof = makuti 
      roofMaterial === 'tiles_shingles',  //roof = tiles_shingles 
      shehia === 'bambi'
      , shehia === 'bandamaji'
      , shehia === 'binguni'
      , shehia === 'bopwe'
      , shehia === 'bwejuu'
      , shehia === 'bwereu'
      , shehia === 'chaani kubwa'
      , shehia === 'chaani masingini'
      , shehia === 'chambani'
      , shehia === 'changaweni'
      , shehia === 'chanjaani'
      , shehia === 'chimba'
      , shehia === 'chokocho'
      , shehia === 'chonga'
      , shehia === 'chumbageni'
      , shehia === 'chutama'
      , shehia === 'chwaka'
      , shehia === 'chwale'
      , shehia === 'dimani'
      , shehia === 'dodo'
      , shehia === 'donge  mchangani'
      , shehia === 'donge karange'
      , shehia === 'donge mbiji'
      , shehia === 'donge mtambile'
      , shehia === 'dunga bweni'
      , shehia === 'fujoni'
      , shehia === 'fukuchani'
      , shehia === 'fuoni kibondeni'
      , shehia === 'fuoni kijito upele'
      , shehia === 'gamba'
      , shehia === 'ghana'
      , shehia === 'jambiani kikadini'
      , shehia === 'jendele'
      , shehia === 'jombwe'
      , shehia === 'jongowe'
      , shehia === 'jumbi'
      , shehia === 'junguni'
      , shehia === 'kambini'
      , shehia === 'kangagani'
      , shehia === 'kendwa'
      , shehia === 'kengeja'
      , shehia === 'kianga'
      , shehia === 'kibeni'
      , shehia === 'kibokoni'
      , shehia === 'kibuteni'
      , shehia === 'kichungwani'
      , shehia === 'kidimni'
      , shehia === 'kidoti'
      , shehia === 'kihinani'
      , shehia === 'kijini'
      , shehia === 'kikungwi'
      , shehia === 'kilimani'
      , shehia === 'kilindi'
      , shehia === 'kinduni'
      , shehia === 'kinowe'
      , shehia === 'kinuni'
      , shehia === 'kinyasini'
      , shehia === 'kipangani'
      , shehia === 'kisauni'
      , shehia === 'kisiwa panza'
      , shehia === 'kitope'
      , shehia === 'kiungoni'
      , shehia === 'kiuyu kigongoni'
      , shehia === 'kiuyu mbuyuni'
      , shehia === 'kiuyu minungwini'
      , shehia === 'kivunge'
      , shehia === 'kiwani'
      , shehia === 'kizimbani'
      , shehia === 'kizimkazi dimbani'
      , shehia === 'kizimkazi mkunguni'
      , shehia === 'koani'
      , shehia === 'kojani'
      , shehia === 'kombeni'
      , shehia === 'konde'
      , shehia === 'kuukuu'
      , shehia === 'kwale'
      , shehia === 'madungu'
      , shehia === 'mafufuni'
      , shehia === 'mahonda'
      , shehia === 'makoba'
      , shehia === 'makoongwe'
      , shehia === 'matale'
      , shehia === 'matemwe'
      , shehia === 'maungani'
      , shehia === 'maziwa ng\'ombe'
      , shehia === 'maziwani'
      , shehia === 'mbaleni'
      , shehia === 'mbuguani'
      , shehia === 'mbuyuni'
      , shehia === 'mbuzini'
      , shehia === 'mchangani'
      , shehia === 'melinne'
      , shehia === 'mgagadu'
      , shehia === 'mgambo'
      , shehia === 'mgelema'
      , shehia === 'mgeni haji'
      , shehia === 'michenzani'
      , shehia === 'micheweni'
      , shehia === 'michungwani'
      , shehia === 'minazini'
      , shehia === 'misufini'
      , shehia === 'miwani'
      , shehia === 'mizingani'
      , shehia === 'mjimbini'
      , shehia === 'mjini ole'
      , shehia === 'mjini wingwi'
      , shehia === 'mkokotoni'
      , shehia === 'mkoroshoni'
      , shehia === 'mkwajuni'
      , shehia === 'moga'
      , shehia === 'mpapa'
      , shehia === 'msuka magharibi'
      , shehia === 'msuka mashariki'
      , shehia === 'mtambile'
      , shehia === 'mtambwe kaskazini'
      , shehia === 'mtambwe kusini'
      , shehia === 'mtangani'
      , shehia === 'mtemani'
      , shehia === 'mtende'
      , shehia === 'mto wa pwani'
      , shehia === 'mtufaani'
      , shehia === 'muambe'
      , shehia === 'muwanda'
      , shehia === 'muyuni a'
      , shehia === 'mvumoni'
      , shehia === 'mwanyanya'
      , shehia === 'mwera'
      , shehia === 'mzuri'
      , shehia === 'ndagoni'
      , shehia === 'ndijani muembe punda'
      , shehia === 'ng\'ambwa'
      , shehia === 'ng\'ombeni'
      , shehia === 'nganani'
      , shehia === 'ngwachani'
      , shehia === 'nungwi'
      , shehia === 'paje'
      , shehia === 'pangawe'
      , shehia === 'pete'
      , shehia === 'piki'
      , shehia === 'pitanazako'
      , shehia === 'pujini'
      , shehia === 'pwani mchangani'
      , shehia === 'shengejuu'
      , shehia === 'shumba mjini'
      , shehia === 'shumba viamboni'
      , shehia === 'sizini'
      , shehia === 'stahabu'
      , shehia === 'tasani'
      , shehia === 'tazari'
      , shehia === 'tibirinzi'
      , shehia === 'tomondo'
      , shehia === 'tumbatu gomani'
      , shehia === 'tumbe magharibi'
      , shehia === 'ukunjwi'
      , shehia === 'ukutini'
      , shehia === 'umbuji'
      , shehia === 'unguja ukuu kaepwani'
      , shehia === 'upenja'
      , shehia === 'uroa'
      , shehia === 'uwandani'
      , shehia === 'uweleni'
      , shehia === 'uzi'
      , shehia === 'uzini'
      , shehia === 'vitongoji'
      , shehia === 'wambaa'
      , shehia === 'wara'
      , shehia === 'wesha'
      , shehia === 'wingwi mapofu'
      , shehia === 'wingwi njuguni'
      , shehia === 'zingwe zingwe'
      , shehia === 'ziwani',
      //Shehia low count (??), status =mixed ward, status = rural ward, status = urban ward
      shehia!==null? 0: 1,
      status === 'Rural Ward',
      status === 'Urban',
      status === 'Urban Ward'
    ];
    var model = new RandomForestClassifier();
    var result = model.predict(inputData);
    return result;
  }
};