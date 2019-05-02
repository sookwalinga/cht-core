// HH: I copied this from a medic example
// This was identical to the ones in nootils, but now `form` can be an array, and can count for number of forms in the window. This needs to be ported to nootils.
function isFormSubmittedInWindow(reports, form, start, end, count) {
  var result = false;
  var reportsFound = 0;
  reports.forEach(function(r) {
    if (!result && form.indexOf(r.form) >= 0) {
      if (r.reported_date >= start && r.reported_date <= end) {
        reportsFound++;
        if (!count ||
            (r.fields && r.fields.follow_up_count > count) ||
            (reportsFound >= count) ) {
          result = true;
        }
      }
    }
  });
  return result;
}

function isChildUnder5(c) {
  if(c.contact && c.contact.date_of_birth) {
    var birthDate = new Date(c.contact.date_of_birth);
    var ageInMs = new Date(now - birthDate.getTime());
    var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30)); //Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
    return ageInMonths < 60;
  }
  return false;
}

function countReportsSubmitted(c, form) {
  var reportsFound = [];
  if(c && c.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === form;
    });
    return reportsFound.length;
  }
  return 0;
}

function hasGivenConsent(c) {
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
}

function isSmallBaby(c) {
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
}

function referralMade(report) {
  var hasReferral = false;
  var reportsFound = [];
  if(c && c.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
    });
    if(reportsFound.length > 0){
      var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
      if(report.fields.first_visit_6_months.refer_flag_small_baby === '1') {
        return true;
      }
      if(report.fields.neonatal_danger_signs.refer_neonatal_danger_sign_flag === '1') {
        return true;
      }
      if(report.fields.child_danger_signs.refer_child_danger_sign_flag === '1') {
        return true;
      }
      if(report.fields.malnutrition_anemia.refer_muac_flag === '1') {
        return true;
      }
      if(report.fields.malnutrition_anemia.refer_palm_pallor_flag === '1') {
        return true;
      }
      if(report.fields.immunizations.refer_vaccines_flag === '1') {
        return true;
      }
      if(report.fields.problem_solving.refer_slow_to_lear_specifics_flag === '1') {
        return true;
      }
    }
  }
  return hasReferral;
}

function getReferralReasons(report) {
  // if this is to work for all forms, we'll need a standard way to store this
  console.log("Satisfying jshint...", report);
  return "some very good reason<br>and another one";
}
