module.exports = {
  isChildUnder5: function (c) {
    if(c.contact && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(now - birthDate.getTime());
      var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30));
      return ageInMonths < 60;
    }
    return false;
  },

  countReportsSubmitted: function (c, form) {
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === form;
      });
      return reportsFound.length;
    }
    return 0;
  },

  hasGivenConsent: function (c) {
    var consent = '';
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
      });
      if(reportsFound.length > 0){
        var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
        consent = report.fields.consent.child_consent_today;
      }
    }
    return consent;
  },

  isSmallBaby: function (c) {
    var small;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
      });
      if(reportsFound.length > 0){
        var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
        small = report.fields.first_visit_6_months.small_baby_today;
      }
    }
    return small;
  },

  getSmallBabyFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.first_visit_6_months &&
      report.fields.first_visit_6_months.refer_flag_small_baby
    ) {
      return report.fields.first_visit_6_months.refer_flag_small_baby;
    }
    return 0;
  },

  getNeonatalDangerSignFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.neonatal_danger_signs &&
      report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag
  ) {
      return report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag;
    }
    return 0;
  },

  getChildDangerSignFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.child_danger_signs &&
      report.fields.child_danger_signs.refer_child_danger_sign_flag
    ) {
      return report.fields.child_danger_signs.refer_child_danger_sign_flag;
    }
    return 0;
  },

  getMUACFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.malnutrition_anemia &&
      report.fields.malnutrition_anemia.refer_muac_flag
    ) {
      return report.fields.malnutrition_anemia.refer_muac_flag;
    }
    return 0;
  },

  getPalmPallorFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.malnutrition_anemia &&
      report.fields.malnutrition_anemia.refer_palm_pallor_flag
    ) {
      return report.fields.malnutrition_anemia.refer_palm_pallor_flag;
    }
    return 0;
  },

  getVaccinesFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.immunizations &&
      report.fields.immunizations.refer_vaccines_flag
    ) {
      return report.fields.immunizations.refer_vaccines_flag;
    }
    return 0;
  },

  getSlowToLearnSpecificsFlag: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.problem_solving &&
      report.fields.problem_solving.refer_slow_to_learn_specifics_flag
  ) {
      return report.fields.problem_solving.refer_slow_to_learn_specifics_flag;
    }
    return 0;

  },
};
