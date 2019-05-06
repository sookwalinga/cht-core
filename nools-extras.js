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

  getReferralReasons: function (report) {
    var reasons = '';
    if (report && report.fields) {
      if (
        report.fields.first_visit_6_months &&
        report.fields.first_visit_6_months.refer_flag_small_baby &&
        report.fields.first_visit_6_months.refer_flag_small_baby === '1'
      ) {
        reasons += 'Small baby, ';
      }
      if (
        report.fields.neonatal_danger_signs &&
        report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag &&
        report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag === '1'
      ) {
        reasons += 'Neonatal danger sign, ';
      }
      if (
        report.fields.child_danger_signs &&
        report.fields.child_danger_signs.refer_child_danger_sign_flag &&
        report.fields.child_danger_signs.refer_child_danger_sign_flag === '1'
      ) {
        reasons += 'Child danger sign, ';
      }
      if (report.fields.malnutrition_anemia) {
        if (
          report.fields.malnutrition_anemia.refer_muac_flag &&
          report.fields.malnutrition_anemia.refer_muac_flag === '1'
        ) {
          reasons += 'MUAC, ';
        }
        if (
          report.fields.malnutrition_anemia.refer_muac_flag &&
          report.fields.malnutrition_anemia.refer_palm_pallor_flag === '1'
        ) {
          reasons += 'Palm pallor, ';
        }
      }
      if (
        report.fields.immunizations &&
        report.fields.immunizations.refer_vaccines_flag &&
        report.fields.immunizations.refer_vaccines_flag === '1'
      ) {
        reasons += 'Vaccines, ';
      }
      if (
        report.fields.problem_solving &&
        report.fields.problem_solving.refer_slow_to_lear_specifics_flag &&
        report.fields.problem_solving.refer_slow_to_lear_specifics_flag === '1'
      ) {
        reasons += 'Slow to learn specifics, ';
      }
    }
    if (reasons.length >= 2) {
      reasons = reasons.slice(0, -2);
    }
    return reasons;
  }
};
