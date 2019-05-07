module.exports = {

  // HH: I copied this from a medic example
  // This was identical to the ones in nootils, but now `form` can be an array, and can count for number of forms in the window. This needs to be ported to nootils.
  isFormSubmittedInWindow: function (reports, form, start, end, count) {
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
  },

  // HH: I copied this from a medic example
  // This is identical to the ones in nootils, but `form` can be an array. This needs to be ported to nootils.
  // TODO shared with contact-summary?
  getMostRecentReport: function (reports, form) {
    var result = null;
    reports.forEach(function(r) {
      if (form.indexOf(r.form) >= 0 &&
          !r.deleted &&
          (!result || r.reported_date > result.reported_date)) {
        result = r;
      }
    });
    return result;
  },

  isChildUnder5: function (c) {
    if(c.contact && c.contact.date_of_birth) {
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInMs = new Date(now - birthDate.getTime());
      var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30)); //Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
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

  countConsentingInfantChildVisits: function(c) {
    var consentingVisits = [];
    if(c && c.reports) {
      consentingVisits = c.reports.filter(function(r) {
        if (r.form && r.fields && r.fields.previous_child_consent && r.fields.consent && r.fields.consent.child_consent_today) {
          return r.form === 'infant_child' && (r.fields.previous_child_consent === 'yes' || r.fields.consent.child_consent_today === 'yes');
        }
      });
      return consentingVisits.length;
    }
    return 0;
  },

  daysAfterBirth: function(c, days) {
    if (c.contact && c.contact.date_of_birth) {
      var result = new Date(c.contact.date_of_birth);
      return result.setDate(result.getDate() + days);
    }
    return null;
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

  isAgeUnderFive: function (c) {
      var oneDay = 24 * 60 * 60 * 1000;
      var today = new Date();
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInYears =  Math.round(Math.abs((today - birthDate)/ (oneDay * 7 * 52)));
    if(ageInYears < 5)
      return true;
    return false;
  },

  isAgeUnderOne: function (c) {
      var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      var today = new Date();
      var birthDate = new Date(c.contact.date_of_birth);
      var ageInYears =  Math.round((today - birthDate)/ (oneDay * 7* 52));
    if(ageInYears < 1) {
    console.log("Inside ageInYrs < 1");
      return true;
      }
    return false;
  },


  getVisitCount: function (r) {
      var count = [];
      count = r.reports.filter(function(r){
          return r.form === "infant_child";
      });
      return count.length;
  },

  isAgeUnderOneAndVisited: function (c)
  {
      return extras.isAgeUnderOne(c) && extras.getVisitCount(c) > 0;
  },

  getBcg: function (c) {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bcg === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv0: function (c) {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv0 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv1: function (c) {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv1 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },
// FIXME
  getDtp_hepb_hib1: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib1 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPcvi1: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pcvi1 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getRota1: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_rota1 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv2: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv2 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getDtp_hepb_hib2: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib2 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPcvi2: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pcvi2 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getRota2: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_rota2 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getBopv3: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_bopv3 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getDtp_hepb_hib3: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_dtp_hepb_hib3 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getPciv3: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_pciv3 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getSurua_rubella1: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_surua_rubella1 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  },

  getSurua_rubella2: function () {
    var result = 0;
    var reportsFound = [];
    if(c && c.reports) {
      reportsFound = c.reports.filter(function(r) {
        return r.form === 'infant_child' && r.fields && r.fields.immunizations && r.fields.immunizations.record_vaccines && r.fields.immunizations.record_vaccines.received_surua_rubella2 === 'yes';
      });
      if(reportsFound.length > 0) {
        result = 1;
      }
    }
    return result;
  }
};
