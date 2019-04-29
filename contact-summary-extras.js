function isChildUnder5() {
  if(contact && contact.date_of_birth) {
    var birthDate = new Date(contact.date_of_birth);
    var ageInMs = new Date(now - birthDate.getTime());
    var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
    return ageInMonths < 60;
  }
  return false;
}

function countReportsSubmitted(form) {
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === form;
  });
  return reportsFound.length;
}

function hasGivenConsent() {
  var consent = '';
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
  });
  if(reportsFound.length > 0){
    var report = getMostRecentReport(reportsFound, 'infant_child');
    consent = report.fields.consent.child_consent_today;
  }
  return consent;
}

function isSmallBaby() {
  var small ="";
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
  });
  if(reportsFound.length > 0){
    var report = getMostRecentReport(reportsFound, 'infant_child');
    small = report.fields.first_visit_6_months.small_baby_today;
  }
  return small;
}

function referralMade(report) {
  // if this is to work for all forms, we'll need a standard way to store this
  console.log("Satisfying jshint...", report);
  return true;
}

function getReferralReasons(report) {
  // if this is to work for all forms, we'll need a standard way to store this
  console.log("Satisfying jshint...", report);
  return "some very good reason<br>and another one";
}
