const extras = require('./contact-summary-extras.js');
function get(obj,field){
  if(!obj){return;}
  const parts=field.split('.');
  for(const f of parts){ if(!obj[f]){return;} obj=obj[f];}
  return obj;
}

const allReports = reports;
const cards = [
  {
    label: 'contact.profile.performance.monthly_meeting',
    appliesToType: 'report',
    appliesIf: (report) => {
      if(report.form === 'chw_monthly_meeting') {
        const monthlyMeetingForm = extras.getNewestReport(allReports, 'chw_monthly_meeting');
        if(monthlyMeetingForm) {
          return monthlyMeetingForm.reported_date === report.reported_date;
        }
      }
      return false;
    },
    fields: [
      {
        label: 'contact.profile.performance.monthly_meeting.goal',
        value: (report) => {
          const reportedDate = new Date(report.reported_date);
          if (reportedDate.getMonth() === extras.CURRENT_MONTH && reportedDate.getFullYear() === extras.CURRENT_YEAR) {
            const reportsThisMonth = extras.getMonthlyMeetingsThisMonth(allReports, 'chw_monthly_meeting');
            const numberOfReportsThisMonth = reportsThisMonth.length;
            const completionPercentage = numberOfReportsThisMonth * 100;
            return `${completionPercentage}% (${numberOfReportsThisMonth} out of 1)`;
          }
          return '0% (0 out of 1)';
        },
        width: 6
      },
      {
        label: 'contact.profile.performance.monthly_meeting.last_date',
        value: (report) => {
          return report.reported_date;
        },
        filter: 'simpleDate',
        width: 6
      }
    ]
  },
  {
    label: 'contact.profile.performance.group_session',
    appliesToType: 'report',
    appliesIf: (report) => {
      if (report.form === 'group_session') {
        const groupSessionForm = extras.getNewestReport(allReports, 'group_session');
        if (groupSessionForm){
          return groupSessionForm.reported_date === report.reported_date;
        }
      }
      return false;
    },
    fields: [
      {
        label: 'contact.profile.performance.group_session.goal',
        value: (report) => {
          const reportedDate = new Date(report.reported_date);
          if (reportedDate.getMonth() === extras.CURRENT_MONTH && reportedDate.getFullYear() === extras.CURRENT_YEAR) {
            const reportsThisMonth = extras.getReportsThisMonth(allReports, 'group_session');
            const numberOfReportsThisMonth = reportsThisMonth.length;
            const completionPercentage = numberOfReportsThisMonth * 100;
            return `${completionPercentage}% (${numberOfReportsThisMonth} out of 1)`;
          }
          return '0% (0 out of 1)';
        },
        width: 6
      },
      {
        label: 'contact.profile.performance.group_session.last_date',
        value: (report) => {
          return report.reported_date;
        },
        filter: 'simpleDate',
        width: 6
      }
    ]
  },
  {
    label: 'contact.profile.performance.quality_monitoring',
    appliesToType: 'report',
    appliesIf: (report) => {
      if (report.form === 'quality_monitoring') {
        const qualityMonitoringForm = extras.getNewestReport(allReports, 'quality_monitoring');
        if(qualityMonitoringForm) {
          return qualityMonitoringForm.reported_date === report.reported_date;
        }
      }
      return false;
    },
    fields: [
      {
        label: 'contact.profile.performance.quality_monitoring.goal',
        value: (report) => {
          const reportedDate = new Date(report.reported_date);
          if (reportedDate.getMonth() === extras.CURRENT_MONTH && reportedDate.getFullYear() === extras.CURRENT_YEAR) {
            const reportsThisMonth = extras.getReportsThisMonth(allReports, 'quality_monitoring');
            const numberOfReportsThisMonth = reportsThisMonth.length;
            const completionPercentage = numberOfReportsThisMonth * 100;
            return `${completionPercentage}% (${numberOfReportsThisMonth} out of 1)`;
          }
          return '0% (0 out of 1)';
        },
        width: 6
      },
      {
        label: 'contact.profile.performance.quality_monitoring.last_date',
        value: (report) => {
          return report.reported_date;
        },
        filter: 'simpleDate',
        width: 6
      }
    ]
  }
];
module.exports = {
  get:get,
  context: {
    household_head: extras.getContactHouseholdHead(),
    house_number: extras.getContactHouseNumber(),
    kitongoji: extras.getContactHouseKitongoji(),
    phone: extras.getContactPhone(),
    currently_pregnant: extras.currentlyPregnant(),
    n_pregnancy_visits: extras.countPregnancyVisitsForThisPregnancy(),
    show_research_questions: extras.shouldResearchQnsBeShown(),
    n_previous_anc_visits: extras.getRecentANCCountForThisPregnancy(),
    previous_hiv_status: extras.showPMTCT(),
    previous_rchcard_status: extras.showPregnancyEDDEstimation(),
    hide_lmp_or_months_pregnant: extras.hideLastLMPOrEstimatedMonthsPregnant(),
    show_wash_protocol:extras.isCHVInProject('wash'), 
    quality_monitoring_count: extras.getQualityMonitoringCount(),
    is_parent_health_center:extras.isParentHealthCenter(),
    is_contact_deceased:extras.isClientReportedDead(), 
    is_contact_retired: extras.isContactRetired(),
    show_asrh_form: extras.isCHVInProject('asrh'),
    lastest_monthly_meeting_topic: extras.getLatestMonthlyMeetingTopic(), 
    latest_monthly_meeting_date: extras.getLatestMonthlyMeetingDate(), 
    latest_monthly_meeting_absentees: extras.getLatestMonthlyMeetingAbsentees(), 
    is_qm_planning_submitted_this_month: extras.isQMPlanningSubmittedThisMonth(), 
    is_client_adult: extras.isClientAdult(), 
    show_new_ecd_protocol:extras.isCHVInProject('new_ecd') 
  },

  fields: [
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, 
      label: 'contact.age', value: contact.date_of_birth, width: 4, filter: 'age' 
    },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, 
      label: 'contact.sex', value: contact.sex === 'male' ? 'Mwanamme' : 'Mwanamke', width: 4 
    },
    { appliesToType: 'person', appliesIf: function () { return contact.phone; }, 
      label: 'contact.phone', value: contact.phone, width: 4, filter: 'phone' 
    },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && !contact.phone && lineage[1] && lineage[1].parent; }, 
      label: 'contact.phone', value: lineage[0] && lineage[0].contact ? lineage[0].contact.phone : '', width: 4, filter: 'phone' 
    },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, 
      label: 'contact.parent', value: lineage[0], filter: 'lineage' 
    },
    { appliesToType: 'person', appliesIf: function () { return get(contact, 'parent.parent') && !get(contact, 'parent.parent.parent'); }, 
      label: 'contact.grandparent', value: lineage[0], filter: 'lineage' 
    },
    { appliesToType: 'person', appliesIf: function () { return (contact.temp_hh_member === 'temporary' && !extras.isContactDeceased() && !extras.isContactMuted()); }, 
      label: 'contact.temporary_member', icon: 'moving' 
    },
    { appliesToType: 'person', appliesIf: function () { return (extras.isChildUnder5() && !extras.isContactDeceased() && !extras.isContactMuted()); }, 
      label: 'contact.child_under_5', icon: 'child' 
    },
    { appliesToType: 'person', appliesIf: function () { return (extras.currentlyPregnant() && !extras.isContactDeceased() && !extras.isContactMuted()); }, 
      label: 'contact.is_pregnant', icon: 'pregnancy-1' 
    }
  ],

  cards:cards 
};
