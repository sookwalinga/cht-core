module.exports = {
  isChildUnder5: function () {
    if(contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },

  countReportsSubmitted: function (form) {
    var reportsFound = [];
    if (contact && reports && reports.filter) {
      reportsFound = reports.filter(function(r) {
        return r.form === form;
      });
    }
    return reportsFound.length;
  },

  hasGivenConsent: function () {
    var consent = '';
    var reportsFound = [];
    if (contact && reports && reports.filter) {
      reportsFound = reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
      });
    }
    if(reportsFound.length > 0){
      var report = extras.getMostRecentReport(reportsFound, 'infant_child');
      consent = report.fields.consent.child_consent_today;
    }
    return consent;
  },

  isAgeUnderFive: function() {
    console.log(contact);

    var oneDay = 24 * 60 * 60 * 1000;

    var today = new Date();

    var birthDate = new Date(contact.date_of_birth);

    var ageInYears =  Math.round(Math.abs((today - birthDate)/ (oneDay * 7 * 52)));

    if(ageInYears < 5)
      return true;

    return false;
  },

  getVisitCount: function() {
    console.debug(reports);

    var count = [];

    count = reports.filter(function(r){

      return r.form === "infant_child";

    });

    return count.length;
  },

  isSmallBaby: function () {
    var small = '';
    var reportsFound = [];
    if (contact && reports && reports.filter) {
      reportsFound = reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
      });
    }
    if(reportsFound.length > 0){
      var report = extras.getMostRecentReport(reportsFound, 'infant_child');
      small = report.fields.first_visit_6_months.small_baby_today;
    }
    return small;
  },

  getBcg: function() {
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
  },

  getBopv0: function() {
      var result = 0;
    var reportsFound = [];
    if(contact.reports) {
      reportsFound = contact.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv0 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv1: function() {
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
  },

  // FIXME paste code below
  getDtp_hepb_hib1: function() {
      var result = 0;
    return result;
  },

  getPcvi1: function() {
      var result = 0;
    return result;
  },

  getRota1: function() {
      var result = 0;
    return result;
  },

  getBopv2: function() {
      var result = 0;
    return result;
  },

  getDtp_hepb_hib2: function() {
      var result = 0;
    return result;
  },

  getPcvi2: function() {
      var result = 0;
    return result;
  },

  getRota2: function() {
      var result = 0;
    return result;
  },

  getBopv3: function() {
      var result = 0;
    return result;
  },

  getDtp_hepb_hib3: function() {
      var result = 0;
    return result;
  },

  getPciv3: function() {
      var result = 0;
    return result;
  },

  getSurua_rubella1: function() {
      var result = 0;
    return result;
  },

  getSurua_rubella2: function() {
      var result = 0;
    return result;
  }

};
