const extras = require('./nools-extras.js');
module.exports = [

  // General: Total under 5 registrations this month + pregnant women registration this month
  {
    id: 'u5-and-pregnant-registrations-this-month',
    translation_key: 'targets.u5-and-pregnant-women-registration.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 4,
    appliesTo: 'contacts',
    appliesToType: ['person'],
    context: 'user.parent.type === "health_center"',
    appliesIf: function (c) {  
      return extras.consentingVisitsThisMonth(c,'infant_child') || extras.consentingVisitsThisMonth(c,'pregnancy');
    }
  },
  // General: Total under 5 registrations last month + pregnant women registration last month
  {
    id: 'u5-and-pregnant-registrations-last-month',
    translation_key: 'targets.last-u5-and-pregnant-women-registration.title',
    subtitle_translation_key: 'targets.last_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 4,
    appliesTo: 'contacts',
    appliesToType: ['person'],
    context: 'user.parent.type === "health_center"',
    appliesIf: function (c) {    
      return extras.consentingVisitsLastMonth(c,'infant_child') || extras.consentingVisitsLastMonth(c,'pregnancy');
    },
    visible: false
  },
  // General: Total under 5 visits last month + Pregnancy Visits last month.  No credit for visits that result in denial of consent
  {
    id: 'u5-and-anc-visits-last-month',
    translation_key: 'targets.last-u5-and-pregnant-women-visits.title',
    subtitle_translation_key: 'targets.last_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 16,
    appliesTo: 'reports',
    appliesToType: ['infant_child', 'pregnancy','postpartum','pregnancy_outcomes'],
    context: 'user.parent.type === "health_center"',
    idType: 'report',
    appliesIf: function (c, r) {
      switch (r && r.form) {
      case 'infant_child': return (extras.get(r, 'fields.consent.child_consent_today') === 'yes' && extras.consentingHomeVisitsLastMonth(c,r.fields.start) ) ||
          (extras.get(r, 'fields.consent')===undefined) && extras.consentingHomeVisitsLastMonth(c,r.fields.start);
      case 'pregnancy': return (extras.get(r, 'fields.pregnancy_consent.consent') === 'yes'&& extras.consentingHomeVisitsLastMonth(c,r.fields.start)) ||
          (extras.get(r, 'fields.pregnancy_consent')===undefined)&& extras.consentingHomeVisitsLastMonth(c,r.fields.start);
      case 'postpartum': return extras.consentingHomeVisitsLastMonth(c,r.fields.start);
      case 'pregnancy_outcomes': return extras.consentingHomeVisitsLastMonth(c,r.fields.start);
      default: return false;
      }
    },
    visible: false
  },
  // General: Total under 5 visits this month + Pregnancy Visits this month.  No credit for visits that result in denial of consent
  {
    id: 'u5-and-anc-visits-this-month',
    translation_key: 'targets.u5-and-pregnant-women-visits.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 16,
    appliesTo: 'reports',
    appliesToType: ['infant_child', 'pregnancy','postpartum','pregnancy_outcomes'],
    context: 'user.parent.type === "health_center"',
    idType: 'report',
    appliesIf: function (c, r) {
      switch (r && r.form) {
      case 'infant_child': return extras.get(r, 'fields.consent.child_consent_today') === 'yes' ||
          extras.get(r, 'fields.consent')===undefined;
      case 'pregnancy': return extras.get(r, 'fields.pregnancy_consent.consent') === 'yes' ||
          extras.get(r, 'fields.pregnancy_consent')===undefined;
      case 'postpartum': return true;
      case 'pregnancy_outcomes': return true;
      default: return false;
      }
    },
    date: 'reported'
  },
  {
    id: 'monthly-meetings-this-month',
    type: 'count',
    goal: 1,
    translation_key: 'targets.monthly_meetings.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    context: 'user.parent.type === "district_hospital"',
    appliesToType: ['chw_monthly_meeting'],
    appliesIf: function (contact, report) {
      return extras.get(report,'fields.planned_meeting.meeting_option') === 'now';},
    date: 'reported'
  },
  {
    id: 'monthly-meetings-last-month',
    type: 'count',
    goal: 1,
    translation_key: 'targets.monthly_meetings.title',
    subtitle_translation_key: 'targets.last_month.subtitle',
    appliesTo: 'reports',
    context: 'user.parent.type === "district_hospital"',
    appliesToType: ['chw_monthly_meeting'],
    appliesIf: function (contact, report) {
      return (extras.get(report,'fields.planned_meeting.meeting_option') === 'now' && extras.consentingHomeVisitsLastMonth(contact,report.fields.start));},
    date: 'now',
    visible:false
  },
  {
    id: 'group-sessions-this-month',
    type: 'count',
    goal: 1,
    translation_key: 'targets.group_sessions.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    context: 'user.parent.type === "district_hospital"',
    appliesToType: ['group_session'],
    date: 'reported'
  },
  {
    id: 'quality-monitoring-this-month',
    type: 'count',
    goal: 1,
    translation_key: 'targets.quality_monitoring.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    context: 'user.parent.type === "district_hospital"',
    appliesToType: ['chv_quality_monitoring'],
    date: 'reported'
  },
  {
    id: 'households-all-time',
    type: 'count',
    goal: 130,
    translation_key: 'targets.households.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'contacts',
    appliesToType: ['clinic'],
    visible:false,
    date: 'now',
    aggregate: true
  },
  {
    id: 'population-all-time',
    type: 'count',
    goal: 730,
    translation_key: 'targets.population.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    visible:false,
    date: 'now',
    aggregate: true
  },
  {
    id: 'pregnancies-this-month',
    type: 'count',
    goal: -1,
    translation_key: 'targets.pregnancies_enrolled.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    visible:false,
    date: 'reported',
    aggregate: true, 
    appliesIf: function (c, r) {
      return extras.get(r, 'pregnancy_consent.consent') === 'yes' ||
      !extras.get(r, 'pregnancy_consent');
    }
  },
  {
    id: 'home-maternal-deaths-this-month',
    type: 'count',
    goal: -1,
    translation_key: 'targets.home_maternal_deaths.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    visible:false,
    appliesIf: function(contact, report) {
      return extras.get(report, 'fields.suspected_maternal_death.where_death') === 'home';
    },
    date: 'reported',
    aggregate: true
  },
  {
    id: 'facility-maternal-deaths-this-month',
    type: 'count',
    goal: -1,
    translation_key: 'targets.facility_maternal_deaths.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    visible:false,
    appliesIf: function(contact, report) {
      return extras.get(report, 'fields.suspected_maternal_death.where_death') === 'health_facility';
    },
    date: 'reported',
    aggregate: true
  }, 
  {
    id: 'home-U5-deaths-this-month',
    type: 'count',
    goal: -1,
    translation_key: 'targets.home_U5_deaths.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    visible:false,
    appliesIf: function(contact, report) {
      return extras.get(report, 'fields.other.where_death_child') === 'home';
    },
    date: 'reported',
    aggregate: true
  }, 
  {
    id: 'facility-U5-deaths-this-month',
    type: 'count',
    goal: -1,
    translation_key: 'targets.facility_U5_deaths.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    visible:false,
    appliesIf: function(contact, report) {
      return extras.get(report, 'fields.other.where_death_child') === 'health_facility';
    },
    date: 'reported',
    aggregate: true
  },
  {
   
    id: 'quality-monitoring-last-month',
    type: 'count',
    goal: 1,
    translation_key: 'targets.quality_monitoring.title',
    subtitle_translation_key: 'targets.last_month.subtitle',
    appliesTo: 'reports',
    context: 'user.parent.type === "district_hospital"',
    appliesToType: ['chv_quality_monitoring'],
    appliesIf: function (contact, report) {
      return extras.consentingHomeVisitsLastMonth(contact,report.fields.start);},
    date: 'now',
    visible:false
  }
];
