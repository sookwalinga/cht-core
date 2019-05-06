module.exports = {
  isChildUnder5: function () {
    if(contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = Date.now() - birthDate.getTime();
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },

  countReportsSubmitted: function (form) {
    var reportsFound = [];
    reportsFound = contact.reports.filter(function(r) {
      return r.form === form;
    });
    return reportsFound.length;
  },

  hasGivenConsent: function () {
    var consent = '';
    var reportsFound = [];
    reportsFound = contact.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
    });
    if(reportsFound.length > 0){
      var report = extras.getMostRecentReport(reportsFound, 'infant_child');
      consent = report.fields.consent.child_consent_today;
    }
    return consent;
  },

  isSmallBaby: function () {
    var small ="";
    var reportsFound = [];
    reportsFound = contact.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
    });
    if(reportsFound.length > 0){
      var report = extras.getMostRecentReport(reportsFound, 'infant_child');
      small = report.fields.first_visit_6_months.small_baby_today;
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
        reasons += 'Small baby, \n';
      }
      if (
        report.fields.neonatal_danger_signs &&
        report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag &&
        report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag === '1'
      ) {
        reasons += 'Neonatal danger sign, \n';
      }
      if (
        report.fields.child_danger_signs &&
        report.fields.child_danger_signs.refer_child_danger_sign_flag &&
        report.fields.child_danger_signs.refer_child_danger_sign_flag === '1'
      ) {
        reasons += 'Child danger sign, \n';
      }
      if (report.fields.malnutrition_anemia) {
        if (
          report.fields.malnutrition_anemia.refer_muac_flag &&
          report.fields.malnutrition_anemia.refer_muac_flag === '1'
        ) {
          reasons += 'MUAC, \n';
        }
        if (
          report.fields.malnutrition_anemia.refer_muac_flag &&
          report.fields.malnutrition_anemia.refer_palm_pallor_flag === '1'
        ) {
          reasons += 'Palm pallor, \n';
        }
      }
      if (
        report.fields.immunizations &&
        report.fields.immunizations.refer_vaccines_flag &&
        report.fields.immunizations.refer_vaccines_flag === '1'
      ) {
        reasons += 'Vaccines, \n';
      }
      if (
        report.fields.problem_solving &&
        report.fields.problem_solving.refer_slow_to_lear_specifics_flag &&
        report.fields.problem_solving.refer_slow_to_lear_specifics_flag === '1'
      ) {
        reasons += 'Slow to learn specifics';
      }
    }
    return reasons;
  }
};
