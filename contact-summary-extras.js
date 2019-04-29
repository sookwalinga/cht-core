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

function getBcg() {
  var result = 0;
  var reportsFound = [];
  if(contact.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bcg === 'yes';
    });
    if(reportsFound.length > 0) {
      result = 1;
    }
  }
  return result;
}

function getBopv0() {
  var result = 0;
  var reportsFound = [];
  if(contact.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv0 === 'yes';
    });
    if(reportsFound.length > 0) {
      result = 1;
    }
  }
  return result;
}

function getBopv1() {
  var result = 0;
  var reportsFound = [];
  if(contact.reports) {
    reportsFound = contact.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bcg === 'yes';
    });
    if(reportsFound.length > 0) {
      result = 1;
    }
  }
  return result;
}

// FIXME paste code below
function getDtp_hepb_hib1() {
  var result = 0;
  return result;
}

function getPcvi1() {
  var result = 0;
  return result;
}

function getRota1() {
  var result = 0;
  return result;
}

function getBopv2() {
  var result = 0;
  return result;
}

function getDtp_hepb_hib2() {
  var result = 0;
  return result;
}

function getPcvi2() {
  var result = 0;
  return result;
}

function getRota2() {
  var result = 0;
  return result;
}

function getBopv3() {
  var result = 0;
  return result;
}

function getDtp_hepb_hib3() {
  var result = 0;
  return result;
}

function getPciv3() {
  var result = 0;
  return result;
}

function getSurua_rubella1() {
  var result = 0;
  return result;
}

function getSurua_rubella2() {
  var result = 0;
  return result;
}
