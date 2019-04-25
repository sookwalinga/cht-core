function isChildUnder5() {
  var birthDate = new Date(contact.date_of_birth);
  var ageInMs = new Date(now - birthDate.getTime());
  var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
  return ageInMonths < 60;
}

function countReportsSubmitted(form) {
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === form;
  });
  return reportsFound.length;
}

function hasGivenConsent() {
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
  });
  if(reportsFound.length > 0){
    reportsFound.forEach(function(r) {
      if(r.consent.child_consent_today === 'yes') {
        return 'yes';
      }
    });
  }
  return 'no';
}

function isSmallBaby() {
  var reportsFound = [];
  reportsFound = contact.reports.filter(function(r) {
    return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
  });
  if(reportsFound.length > 0){
    reportsFound.forEach(function(r) {
      if(r.first_visit_6_months.small_baby_today === 'yes') {
        return 'yes';
      }
    });
  }
  return 'no';
}
