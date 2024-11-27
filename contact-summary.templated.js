const extras = require('./contact-summary-extras.js');
const currentDate = new Date();
function get(obj,field){
  if(!obj){return;}
  const parts=field.split('.');
  for(const f of parts){ if(!obj[f]){return;} obj=obj[f];}
  return obj;
}

// Adding P4P summary on condition card for CHW profile
const current_and_previous_month_names = extras.isMonthName(currentDate);
const current_month_name = current_and_previous_month_names[0];
const previous_month_name = current_and_previous_month_names[1];

const last_chw_month_performance_metrics = extras.isCHWPerformanceLastMonth(targetDoc,contact);
const this_chw_month_performance_metrics = extras.isCHWPerformanceThisMonth(targetDoc,contact);

const supervisor_monthly_performance_metrics_last_month = extras.isSupervisorPerformanceLastMonth(targetDoc);
const supervisor_monthly_performance_metrics_this_month = extras.isSupervisorPerformanceThisMonth(targetDoc);

//Calculating payment details for both last month and this month
const last_month_base_enrollment_pay = extras.getCHWEnrollmentPay(last_chw_month_performance_metrics);
const last_month_base_visit_pay = extras.getCHWVisitPay(last_chw_month_performance_metrics);
const this_month_base_enrollment_pay =extras.getCHWEnrollmentPay(this_chw_month_performance_metrics);
const this_month_base_visit_pay = extras.getCHWVisitPay(this_chw_month_performance_metrics);
const chw_basic_pay = 5000;
const last_month_total_pay = chw_basic_pay + last_month_base_enrollment_pay + last_month_base_visit_pay;
const this_month_total_pay = chw_basic_pay + this_month_base_enrollment_pay + this_month_base_visit_pay;

// Calculating payment details for CHW supervisor
const supervisor_chv_monthly_meeting_pay_last_month = extras.getSupervisorMeetingPay(supervisor_monthly_performance_metrics_last_month);
const supervisor_chv_monthly_meeting_pay_this_month = extras.getSupervisorMeetingPay(supervisor_monthly_performance_metrics_this_month);
const supervisor_chv_visiting_pay_last_month = extras.getSupervisorVisitingPay(supervisor_monthly_performance_metrics_last_month);
const supervisor_chv_visiting_pay_this_month = extras.getSupervisorVisitingPay(supervisor_monthly_performance_metrics_this_month);
const last_month_supervisor_total_pay = supervisor_chv_monthly_meeting_pay_last_month + supervisor_chv_visiting_pay_last_month 
+ chw_basic_pay;
const this_month_supervisor_total_pay = supervisor_chv_monthly_meeting_pay_this_month + supervisor_chv_visiting_pay_this_month 
+ chw_basic_pay;

// Calculate Total payment amount with tarrif
const last_month_total_pay_with_tarrif = last_month_total_pay + extras.getTarrifCost(last_month_total_pay);
const this_month_total_pay_with_tarrif = this_month_total_pay + extras.getTarrifCost(this_month_total_pay);
const last_month_supervisor_total_pay_with_tarrif = last_month_supervisor_total_pay + extras.getTarrifCost(last_month_supervisor_total_pay);
const this_month_supervisor_total_pay_with_tarrif = this_month_supervisor_total_pay + extras.getTarrifCost(this_month_supervisor_total_pay);

// Including a condition card that contains P4P summary
const allReports = reports;
const cards = [
  {
    label: 'contact.profile.performance.p4p.month' + previous_month_name,
    appliesToType: 'person',
    appliesIf: function () { 
      if (typeof targetDoc !== 'undefined'){
        return contact.projects && contact.projects.includes('jna');
      }
    },    
    fields: [
      {
        label: 'contact.profile.performance.p4p.enrollment_amount',
        value: last_month_base_enrollment_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.visit_amount',
        value: last_month_base_visit_pay , 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.basic_pay',
        value: chw_basic_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount',
        value: last_month_total_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount_with_tarrif',
        value: last_month_total_pay_with_tarrif, 
        width: 6,
      }
    ]
  },
  {
    label: 'contact.profile.performance.p4p.month' + current_month_name,
    appliesToType: 'person',
    appliesIf: function () { 
      if (typeof targetDoc !== 'undefined'){
        return contact.role === 'chw' || contact.role === 'chv';}},
    fields: [
      {
        label: 'contact.profile.performance.p4p.enrollment_amount',
        value: this_month_base_enrollment_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.visit_amount',
        value: this_month_base_visit_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.basic_pay',
        value: chw_basic_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount',
        value: this_month_total_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount_with_tarrif',
        value: this_month_total_pay_with_tarrif, 
        width: 6,
      }
    ]
  },
  // Adding P4P summary for CHW supervisor profile for last month
  {
    label: 'contact.profile.performance.p4p.month' + previous_month_name,
    appliesToType: 'person',
    appliesIf: function () { 
      return contact.role === 'supervisor'; },
    fields: [
      {
        label: 'contact.profile.performance.p4p.monthy_meeting_attendance_pay',
        value: supervisor_chv_monthly_meeting_pay_last_month, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.supervisor_visitng_chv_pay',
        value: supervisor_chv_visiting_pay_last_month , 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.supervisor_base_payment',
        value: chw_basic_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount',
        value: last_month_supervisor_total_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount_with_tarrif',
        value: last_month_supervisor_total_pay_with_tarrif, 
        width: 6,
      }
    ]
  },
  // Adding P4P summary for CHW supervisor profile for this month
  {
    label: 'contact.profile.performance.p4p.month' + current_month_name,
    appliesToType: 'person',
    appliesIf: function () { 
      return contact.role === 'supervisor'; },
    fields: [
      {
        label: 'contact.profile.performance.p4p.monthy_meeting_attendance_pay',
        value: supervisor_chv_monthly_meeting_pay_this_month, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.supervisor_visitng_chv_pay',
        value: supervisor_chv_visiting_pay_this_month , 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.supervisor_base_payment',
        value: chw_basic_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount',
        value: this_month_supervisor_total_pay, 
        width: 6,
      },
      {
        label: 'contact.profile.performance.p4p.total_amount_with_tarrif',
        value: this_month_supervisor_total_pay_with_tarrif, 
        width: 6,
      }
    ]
  },
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
    is_qm_planning_submitted_this_month: extras.isFormSubmittedThisMonth('quality_monitoring_planning'),
    is_qm_submitted_this_month: extras.isFormSubmittedThisMonth('chv_quality_monitoring'),  
    is_monthly_meeting_submitted_this_month: extras.isFormSubmittedThisMonth('monthly_meeting'),
    is_group_session_submitted_this_month: extras.isFormSubmittedThisMonth('group_session'), 
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
    }, 
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1] && (contact.kadi_ya_matibabu_id || contact.kadi_ya_matibabu_id_read_only); }, 
      label: 'contact.kadi_ya_matibabu', value: (contact.kadi_ya_matibabu_id || contact.kadi_ya_matibabu_id_read_only), width: 4 
    },
  ],

  cards:cards 
};
