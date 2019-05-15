module.exports = {

  day: 1,
  week: 7,
  month: 30,

  isChildUnder5: function (c) {
    if(c.contact && c.contact.parent && c.contact.parent.parent &&
       c.contact.parent.parent.parent && c.contact.date_of_birth) {
          var birthDate = new Date(c.contact.date_of_birth);
          var ageInMs = new Date(now - birthDate.getTime());
          var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30));
          return ageInMonths < 60;
    }
    return false;
  },

  isChildUnder1: function (c) {
    if(c.contact && c.contact.parent && c.contact.parent.parent &&
       c.contact.parent.parent.parent && c.contact.date_of_birth) {
          var birthDate = new Date(c.contact.date_of_birth);
          var ageInMs = new Date(now - birthDate.getTime());
          var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30));
          return ageInMonths < 12;
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

  isChildUnder1AndVisited: function (c)
  {
      return extras.isChildUnder1(c) && extras.getVisitCount(c) > 0;
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
    if (c.contact.date_of_birth) {
      var result = new Date(c.contact.date_of_birth);
      result.setDate(result.getDate() + days);
      return result;
    }
    return null;
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

  hasReferral: function (report) {
    if (
      report &&
      report.fields &&
      report.fields.has_referral
    ) {
      return report.fields.has_referral === '1';
    }
    return false;
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
    return 0;
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
    return 0;
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
    return 0;
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
    return 0;
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
    return 0;
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
    return 0;
  },

  getSlowToLearnSpecificsFlag: function (report) {
    if ( // delete this if after refactoring the infant-child form
      report &&
      report.fields &&
      report.fields.problem_solving &&
      report.fields.problem_solving.refer_slow_to_learn_specifics_flag
    ) {
      return report.fields.problem_solving.refer_slow_to_learn_specifics_flag;
    }
    if (
      report &&
      report.fields &&
      report.fields.refer_slow_to_learn_specifics_flag
    ) {
      return report.fields.refer_slow_to_learn_specifics_flag;
    }
    return 0;
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
  },

  isFormSubmittedForSource: function (reports, source_form, source_id) {
    var reportsFound = reports.filter(function(r) {
      return (r.form === source_form) &&
        r.fields &&
        r.fields.referral_source_id &&
        (r.fields.referral_source_id === source_id);
    });
    return reportsFound.length > 0;
  },
};
