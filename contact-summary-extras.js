module.exports = {

  week: 7,

  isChildUnder5: function () {
    if (contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },


  getVisitCount: function () {
    var count = [];
    count = reports.filter(function (r) {
      return r.form === "infant_child";
    });
    return count.length;
  },

  getContactHouseholdHead: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.name) {
        return lineage[0].contact.name;
      }
    }
    return null;
  },

  getContactHouseNumber: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].house_number) {
        return lineage[0].house_number;
      }
    }
    return null;
  },

  getContactHouseKitongoji: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].kitongoji) {
        return lineage[0].kitongoji;
      }
    }
    return null;
  },

  getContactPhone: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.phone) {
        return lineage[0].contact.phone;
      }
    }
    return null;
  },

  getPositiveConsentingPregnancyRegistrations: function () {
    var positiveConsentingPregnancyRegistrations = [];
    positiveConsentingPregnancyRegistrations = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.pregnancy_form &&
        r.fields.pregnancy_form.consent === 'yes';
    });
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function () {
    var deliveryOutcomes = [];
    var earlyTerminations = [];
    deliveryOutcomes = reports.filter(function (r) {
      return r.form === 'delivery_outcomes' &&
        r.fields &&
        r.fields.confirm_delivery &&
        r.fields.confirm_delivery.did_deliver &&
        ((r.fields.confirm_delivery.did_deliver === 'yes') ||
        (r.fields.confirm_delivery.did_deliver === 'no' &&
        r.fields.confirm_delivery.pregnancy_viable &&
        r.fields.confirm_delivery.pregnancy_viable === 'no'));
    });
    earlyTerminations = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.visit_introduction &&
        r.fields.visit_introduction.viable_pregnancy &&
        r.fields.visit_introduction.viable_pregnancy === 'no';
    });
    return deliveryOutcomes.length + earlyTerminations.length;
  },

  currentlyPregnant: function () {
    if (this.getPositiveConsentingPregnancyRegistrations() > this.getPregnancyOutcomes()) {
      return true;
    }
    else {
      return false;
    }
  },

  getMostRecentReport: function (filteredReports, form) {
    var result = null;
    filteredReports.forEach(function (r) {
      if (form === r.form &&
        !r.deleted &&
        (!result || r.reported_date > result.reported_date)) {
        result = r;
      }
    });
    return result;
  },

  getMostRecentPregnancyConsentDate: function () {
    var reportedDate = '';
    var reportsFound = [];
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.pregnancy_form &&
        r.fields.pregnancy_form.consent &&
        r.fields.pregnancy_form.consent === 'yes';
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      reportedDate = report.reported_date;
    }
    return reportedDate;
  },

  countTotalVisitsThisPregnancy: function () {
    return this.countPregnancyVisitsForThisPregnancy() + this.countPostpartumVisitsForThisPregnancy();
  },

  countPregnancyVisitsForThisPregnancy: function () {
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        ((r.fields.pregnancy_form && r.fields.pregnancy_form.consent &&
          r.fields.pregnancy_form.consent === 'yes') ||
          (r.fields.visit_introduction &&
            r.fields.visit_introduction.has_given_birth &&
            r.fields.visit_introduction.has_given_birth === 'no'));
    });
    return reportsFound.length;
  },

  countPostpartumVisitsForThisPregnancy: function () {
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'postpartum' &&
        r.reported_date >= recentConsentReportDate;
    });
    return reportsFound.length;
  },

  shouldResearchQnsBeShown: function () {
    var totalVisitsThisPregnancy = this.countTotalVisitsThisPregnancy();
    if (totalVisitsThisPregnancy === 1)
      return true;
    return false;

  },

  getRecentANCCountForThisPregnancy: function () {
    var ancCount = 0;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.anc_screening_and_counseling &&
        r.fields.anc_screening_and_counseling.num_anc_visits;
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      ancCount = report.fields.anc_screening_and_counseling.num_anc_visits;
    }
    return ancCount;
  },

  showPMTCT: function () {
    var previous_hiv_status = false;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.pmtct &&
        r.fields.pmtct.hiv_status;
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      if (report.fields.pmtct.hiv_status === 'hiv_positive') {
        previous_hiv_status = true;
      }
    }
    return previous_hiv_status;
  },

  showPregnancyEDDEstimation: function () {
    var previousRchCard = false;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.rch_card &&
        r.fields.rch_card.is_rch_card_available === 'yes' &&
        r.fields.rch_card.is_delivery_date_written === 'yes';
    });
    if (reportsFound.length > 0) {
      previousRchCard = true;
    }
    return previousRchCard;
  },

  getRecentPregnancyReport: function () {
    var report = '';
    var reportsFound = [];
    var recentReportDate = this.getMostRecentPregnancyConsentDate();
    if (recentReportDate !== '') {
      reportsFound = reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentReportDate;
      });
    }
    if (reportsFound.length > 0) {
      report = this.getMostRecentReport(reportsFound, 'pregnancy');
    }
    return report;
  },

  hideLastLMPOrEstimatedMonthsPregnant: function () {
    var report = this.getRecentPregnancyReport();
    if (report && report.fields &&
      report.fields.rch_card &&
      report.fields.rch_card.is_rch_card_available &&
      report.fields.rch_card.is_delivery_date_written &&
      ((report.fields.rch_card.is_rch_card_available === 'no') ||
        (report.fields.rch_card.is_rch_card_available === 'yes' &&
          report.fields.rch_card.is_delivery_date_written === 'no'))) {
      return true;
    }
    return false;
  }

};
