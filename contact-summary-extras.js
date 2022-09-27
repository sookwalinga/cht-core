const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth();
const CURRENT_YEAR = NOW.getFullYear();

function get(obj, field,defaultValue) {
  return obj && field && field.split('.')
    .reduce((a, b) => a && a[b]||defaultValue, obj);
}

module.exports = {
  week: 7,
  
  isCHVInProject:function(projectName){
    return projectName && [contact, ...lineage]
    .map(l => l && l.contact).some(c =>
        c &&
        c.projects &&
        c.parent && c.parent.parent && !c.parent.parent.parent &&
        c.projects.includes(projectName));
  },

  isClientReportedDead: function () {
    return reports.filter(r=>r.form === 'death_report').length>0;
 },

  isChildUnder5: function () {
    if (contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },

  isClientAdult: function(){
    const yearInMs = 365.25 * 24 * 60 * 60 * 1000;
    return contact && contact.date_of_birth &&
      (new Date().getTime() - new Date(contact.date_of_birth).getTime() >= 9 * yearInMs);
  },
  
  isContactRetired: function(){   
    return lineage[0] && lineage[0].contact && lineage[0].contact.retired; 
  },

  getVisitCount: function () {
    var count = [];
    count = reports.filter(function (r) {
      return r.form === 'infant_child';
    });
    return count.length;
  },

  getQualityMonitoringCount: function() { 
     return reports.filter(r =>r.form === 'chv_quality_monitoring').length;
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

  isParentHealthCenter: function(){ 
    return lineage[0] && lineage[0].type==='health_center'; 
  },

  getPositiveConsentingPregnancyRegistrations: function () {
    var positiveConsentingPregnancyRegistrations = [];
    positiveConsentingPregnancyRegistrations = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent === 'yes';
    });
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function () {
    var deliveryOutcomes = [];
    var earlyTerminations = [];
    deliveryOutcomes = reports.filter(function (r) {
      return r.form === 'pregnancy_outcomes' &&
        r.fields &&
        r.fields.confirm_delivery &&
        r.fields.confirm_delivery.pregnancy_outcome &&
        ((r.fields.confirm_delivery.pregnancy_outcome === 'did_deliver') ||
        (r.fields.confirm_delivery.pregnancy_outcome === 'miscarriage_or_stillbirth'));
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
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent &&
        r.fields.pregnancy_consent.consent === 'yes';
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
        ((r.fields.pregnancy_consent && r.fields.pregnancy_consent.consent &&
          r.fields.pregnancy_consent.consent === 'yes') ||
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

  getLastReportOfType: function (count,type){ 
    return reports && count && 
    reports.filter(r =>type.includes(r.form))
           .sort((a,b) => 
              a.reported_date> b.reported_date ? -1:
              a.reported_date < b.reported_date ? 1:0
         ).slice(0,1);
  }, 
  
  getLatestMonthlyMeetingDate: function(){ 
   return this.getLastReportOfType(1,'chw_monthly_meeting')
   .map(r => {
      let d = new Date(r.reported_date); 
      return d.getDate() + '/' +  (d.getMonth() + 1) + '/' + d.getFullYear();

   }); 
  }, 

  getLatestMonthlyMeetingTopic: function(){ 
     return this.getLastReportOfType(1,'chw_monthly_meeting')
     .map(r =>get(r,'fields.meeting_details.topics')); 
    }, 

    getLatestMonthlyMeetingAbsentees: function(){ 
      return this.getLastReportOfType(1,'chw_monthly_meeting')
      .map(r=>get(r,'fields.meeting_details.absent_chvs',[]).map(d=>d.name)).join(',');
      // .map(r => {
      //     return r && 
      //            r.fields && 
      //            r.fields.meeting_details && 
      //            r.fields.meeting_details.absent_chvs && 
      //            r.fields.meeting_details.absent_chvs.map(d=>d.name);
      // }).join(','); 
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
      ((report.fields.rch_card.is_rch_card_available === 'no') ||
        (report.fields.rch_card.is_rch_card_available === 'yes' &&
          report.fields.rch_card.is_delivery_date_written && report.fields.rch_card.is_delivery_date_written === 'no'))) {
      return true;
    }
    return false;
  },

  isContactDeceased: function () {
    var isDeceased = false;
    if (contact && contact.date_of_death) {
      isDeceased = true;
    }
    return isDeceased;
  },

  isContactMuted: function () {
    var isMuted = false;
    if (contact && contact.muted) {
      isMuted = true;
    }
    return isMuted;
  },

  isQMPlanningSubmittedThisMonth: function()
  { 
    return this.getReportsThisMonth(reports,'quality_monitoring_planning').length> 0;
  },

  CURRENT_MONTH: CURRENT_MONTH,
  CURRENT_YEAR: CURRENT_YEAR,
  getNewestReport: function (reports, form) {
    let newestReport;
    let currentReport;
    for (let i = 0; i < reports.length; i++) {
      currentReport = reports[i];
      if (!newestReport && currentReport.form === form) {
        newestReport = currentReport;
        continue;
      }
      if (currentReport.form === form && (newestReport.reported_date < currentReport.reported_date)) {
        newestReport = currentReport;
      }
    }
    return newestReport;
  },
  getReportsThisMonth: function (reports, forms) {
    return reports.filter(r => forms.includes(r.form) &&
      new Date().toISOString().slice(0, 7) ===
      new Date(r.reported_date).toISOString().slice(0, 7));
  },
  getMonthlyMeetingsThisMonth: function (reports, forms) {
    return this.getReportsThisMonth(reports,forms)
    .filter(r=>get(r, 'fields.planned_meeting.meeting_option') === 'now'); 
  }

};
