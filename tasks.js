var extras = require('./nools-extras.js');
module.exports = [

  // Infant-child referral follow-up
  {
    name: 'infant_child_referral_followup',
    icon: 'follow-up',
    title: 'task.infant_child_referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return extras.hasReferral(r, 'infant_child') ||
        extras.getSmallBabyFlag(r) === '1' ||
        extras.getNeonatalDangerSignFlag(r) === '1' ||
        extras.getSecondaryNeonatalDangerSignFlag(r) === '1' ||
        extras.getChildDangerSignFlag(r) === '1' ||
        extras.getChildOtherDangerSignFlag(r) === '1' ||
        extras.getMUACFlag(r) === '1' ||
        extras.getPalmPallorFlag(r) === '1' ||
        extras.getVaccinesFlag(r) === '1' ||
        extras.getSlowToLearnSpecificsFlag(r) === '1';
    },
    appliesToType: ['infant_child', 'referral_follow_up'],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function (content, contact, report) {
        content.source_form = report.form;
        content.original_source_form = 'infant_child';
        content.source_id = report._id;
        content.last_visit_date = report.reported_date;
        content.refer_flag_small_baby = extras.getSmallBabyFlag(report);
        content.refer_neonatal_danger_sign_flag = extras.getNeonatalDangerSignFlag(report);
        content.refer_secondary_neonatal_danger_sign_flag = extras.getSecondaryNeonatalDangerSignFlag(report);
        content.refer_child_danger_sign_flag = extras.getChildDangerSignFlag(report);
        content.refer_child_other_danger_sign_flag = extras.getChildOtherDangerSignFlag(report);
        content.refer_muac_flag = extras.getMUACFlag(report);
        content.refer_refer_palm_pallor_flag = extras.getPalmPallorFlag(report);
        content.refer_vaccines_flag = extras.getVaccinesFlag(report);
        content.refer_slow_to_learn_specifics_flag = extras.getSlowToLearnSpecificsFlag(report);
        content.due_date = Utils.addDate(new Date(report.reported_date), 3).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'infant_child_referral_follow_up',
        dueDate: function (event, contact, report) {
          var days = 3;
          if (
            report.fields &&
            report.fields.referral_days
          ) {
            days = Number(report.fields.referral_days);
          }
          return Utils.addDate(new Date(report.reported_date), days);
        },
        start: 3,
        end: 7,
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c, r) {
      //Resolve this form if there is a referral form in couch where the woman
      // does not need to be visited again OR there is a form in couch whose referral_source_id = infant child form. 
      return ((r.form === 'referral_follow_up' && !extras.shouldVisitAgain(r)) ||
        extras.isFormSubmittedForSource(c.reports, 'referral_follow_up', r._id) ||
        extras.isContactDeceased(c)) ||
        extras.isContactMuted(c);
    },
  },

  // Pregnancy referral follow-up
  {
    name: 'pregnancy_referral_followup',
    icon: 'follow-up',
    title: 'task.pregnancy_referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return extras.hasReferral(r, 'pregnancy') || extras.getPregnancyEmergencyDangerSigns(r) === '1' ||
        extras.getPregnancyIssues(r) === '1' || extras.getPregnancyComplications(r) === '1' ||
        extras.getANCVisitAfter6MonthsFlag(r) === '1';
    },
    appliesToType: ['referral_follow_up', 'pregnancy'],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function (content, contact, report) {
        content.original_source_form = 'pregnancy';
        content.source_form = report.form;
        content.source_id = report._id;
        content.last_visit_date = report.reported_date;
        content.due_date = Utils.addDate(new Date(report.reported_date), 3).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        content.refer_flag_emergency_danger_sign = extras.getPregnancyEmergencyDangerSigns(report);
        content.refer_flag_pregnancy_issues = extras.getPregnancyIssues(report);
        content.refer_flag_pregnancy_complications = extras.getPregnancyComplications(report);
        content.refer_flag_anc_visit_6m_or_more = extras.getANCVisitAfter6MonthsFlag(report);
      }
    }],
    events: [
      {
        id: 'pregnancy_referral_follow_up',
        dueDate: function (event, contact, report) {
          var days = 3;
          if (
            report.fields &&
            report.fields.referral_days
          ) {
            days = Number(report.fields.referral_days);
          }
          return Utils.addDate(new Date(report.reported_date), days);
        },
        start: 3,
        end: 7,
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c, r) {
      return (r.form === 'referral_follow_up' && !extras.shouldVisitAgain(r)) ||
        extras.isFormSubmittedForSource(c.reports, 'referral_follow_up', r._id) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    },
  },

  // Postpartum referral follow-up
  {
    name: 'postpartum_referral_followup',
    icon: 'follow-up',
    title: 'task.postpartum_referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return extras.hasReferral(r, 'postpartum') || extras.getPostpartumEmergencyDangerSigns(r) === '1' ||
        extras.getPostpartumOtherDangerSigns(r) === '1';
    },
    appliesToType: ['referral_follow_up', 'postpartum'],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function (content, contact, report) {
        content.source_form = report.form;
        content.source_id = report._id;
        content.last_visit_date = report.reported_date;
        content.due_date = Utils.addDate(new Date(report.reported_date), 3).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        content.refer_flag_postpartum_danger_signs = extras.getPostpartumEmergencyDangerSigns(report);
        content.refer_flag_postpartum_other_signs = extras.getPostpartumOtherDangerSigns(report);
      }
    }],
    events: [
      {
        id: 'postpartum_referral_follow_up',
        dueDate: function (event, contact, report) {
          var days = 3;
          if (
            report.fields &&
            report.fields.referral_days
          ) {
            days = Number(report.fields.referral_days);
          }
          return Utils.addDate(new Date(report.reported_date), days);
        },
        start: 3,
        end: 7,
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c, r) {
      return (r.form === 'referral_follow_up' && !extras.shouldVisitAgain(r)) ||
        extras.isFormSubmittedForSource(c.reports, 'referral_follow_up', r._id) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    },
  },

  //Enabel bi-weekly visit 
{
  name: 'pregnancy_counselling_visit',
  icon: 'follow-up',
  title: 'task.pregnancy_counselling_visit',
  appliesTo: 'reports',
  appliesIf: function (c, r) {
    return  extras.getPregnancyEmergencyDangerSigns(r) === '1' ||
      extras.getPregnancyIssues(r) === '1' || extras.getPregnancyComplications(r) === '1' ||
      extras.getANCVisitAfter6MonthsFlag(r) === '1' || extras.isHighRiskPregnancyML(c) === '1';
  },
  appliesToType: ['pregnancy','pregnancy_counselling'],
  actions: [{
    form: 'pregnancy_counselling', // this here will be replaced with pregnancy counselling form 
    modifyContent: function (content, contact, report) {
      content.original_source_form = 'pregnancy';
      content.source_form = report.form;
      content.source_id = report._id;
      content.last_visit_date = report.reported_date;
      content.due_date = Utils.addDate(new Date(report.reported_date), 14).getTime();
      content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      content.refer_flag_emergency_danger_sign = extras.getPregnancyEmergencyDangerSigns(report);
      content.refer_flag_pregnancy_issues = extras.getPregnancyIssues(report);
      content.refer_flag_pregnancy_complications = extras.getPregnancyComplications(report);
      content.refer_flag_anc_visit_6m_or_more = extras.getANCVisitAfter6MonthsFlag(report);
      content.high_risk_ML = extras.isHighRiskPregnancyML(contact); 
    }
  }],
  events: [
    {
      id: 'pregnancy_counselling_visit',
      dueDate: function (event, contact, report) {
        var days = 14;
        return Utils.addDate(new Date(report.reported_date), days);
      },
      start: 14,
      end: 14,
    }
  ],
  priority: {
    level: 'high',
    label: 'task.pregnancy_counselling.high_priority'
  },
  resolvedIf: function (c, r) {
    return (r.form === 'pregnancy_couselling_visit' && !extras.shouldVisitAgain(r)) ||
      extras.isFormSubmittedForSource(c.reports, 'pregnancy_couselling_visit', r._id) ||
      extras.isContactDeceased(c) ||
      extras.isContactMuted(c);
  },
},

  // First-time infant child visit for children registered at 19 days of age or younger.
  // Task triggers with the high priority flag set and a due date of the same day the child was registered
  {
    name: 'under20days_first_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.first_visit_under_20_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return c.contact.parent &&
        c.contact.parent.parent &&
        c.contact.parent.parent.parent &&
        extras.isChildUnder20Days(c);
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
        content.num_child_visits = extras.countConsentingInfantChildVisits(c);
        content.small_baby = extras.isSmallBaby(c);
        content.bcg = extras.getBcg(c);
        content.bopv0 = extras.getBopv0(c);
        content.bopv1 = extras.getBopv1(c);
        content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
        content.pcvi1 = extras.getPcvi1(c);
        content.rota1 = extras.getRota1(c);
        content.bopv2 = extras.getBopv2(c);
        content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
        content.pcvi2 = extras.getPcvi2(c);
        content.rota2 = extras.getRota2(c);
        content.bopv3 = extras.getBopv3(c);
        content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
        content.pcvi3 = extras.getPcvi3(c);
        content.ipv = extras.getIpv(c);
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
        content.visit_id = extras.mapInfantChildVisitType(c);
        content.due_date = extras.getContactReportedDate(c);
        content.risk_options = extras.multiSelectOptions(c); 
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'infant_child_first_visit_under_20_days',
        days: 0,
        start: 0,
        end: (extras.month * 60)
      },
    ],
    priority: {
      level: 'high',
      label: 'task.infant_child.high_priority'
    },
    resolvedIf: function (c) {
      // Resolved if there are any infant-child forms submitted - this is a first time visit only
      return extras.countReportsSubmitted(c, 'infant_child') > 0 ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },

  // Second infant child visit for children who got a first infant-child visit and are still under 20 days old.
  // Task triggers with the high priority flag set and a due date based on the child's dob and visit schedule
  {
    name: 'under20days_second_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.second_visit_under_20_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return c.contact.parent &&
        c.contact.parent.parent &&
        c.contact.parent.parent.parent &&
        extras.isChildUnder20Days(c) &&
        extras.countConsentingInfantChildVisits(c) > 0;
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
        content.num_child_visits = extras.countConsentingInfantChildVisits(c);
        content.small_baby = extras.isSmallBaby(c);
        content.bcg = extras.getBcg(c);
        content.bopv0 = extras.getBopv0(c);
        content.bopv1 = extras.getBopv1(c);
        content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
        content.pcvi1 = extras.getPcvi1(c);
        content.rota1 = extras.getRota1(c);
        content.bopv2 = extras.getBopv2(c);
        content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
        content.pcvi2 = extras.getPcvi2(c);
        content.rota2 = extras.getRota2(c);
        content.bopv3 = extras.getBopv3(c);
        content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
        content.pcvi3 = extras.getPcvi3(c);
        content.ipv = extras.getIpv(c);
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
        content.visit_id = extras.mapInfantChildVisitType(c);
        content.due_date = extras.mapInfantChildVisitScheduleDueDates(c);
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'infant_child_3_19_day_pp_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, extras.day * 5);
        },
        start: (extras.day * 2),
        end: (extras.day * 14)
      },
    ],
    priority: {
      level: 'high',
      label: 'task.infant_child.high_priority'
    },
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return Utils.isFormSubmittedInWindow(c.reports, 'infant_child',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },

  // First-time infant child visit for children registered at between 20 and 105 (15 weeks) days of age.
  // Task triggers with normal priority and a due date of one week after the date of child registration
  {
    name: 'btn20and105days_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.first_visit_between_20_105_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return c.contact.parent &&
        c.contact.parent.parent &&
        c.contact.parent.parent.parent &&
        extras.isChildInWindow3Or4(c);
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
        content.num_child_visits = extras.countConsentingInfantChildVisits(c);
        content.small_baby = extras.isSmallBaby(c);
        content.bcg = extras.getBcg(c);
        content.bopv0 = extras.getBopv0(c);
        content.bopv1 = extras.getBopv1(c);
        content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
        content.pcvi1 = extras.getPcvi1(c);
        content.rota1 = extras.getRota1(c);
        content.bopv2 = extras.getBopv2(c);
        content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
        content.pcvi2 = extras.getPcvi2(c);
        content.rota2 = extras.getRota2(c);
        content.bopv3 = extras.getBopv3(c);
        content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
        content.pcvi3 = extras.getPcvi3(c);
        content.ipv = extras.getIpv(c);
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
        content.visit_id = extras.mapInfantChildVisitType(c);
        content.due_date = Utils.addDate(new Date(extras.getContactReportedDate(c)), extras.week).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'infant_child_first_visit_between_20_105_days',
        days: extras.week,
        start: extras.week,
        end: (extras.month * 60)
      },
    ],
    resolvedIf: function (c) {
      // Resolved if there are any infant-child forms submitted - this is a first time task only
      return extras.countReportsSubmitted(c, 'infant_child') > 0 ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },

  // First-time infant child visit for children registered at over 105 (15 weeks) days of age.
  // Task triggers with normal priority and a due date of one month after the date of child registration
  {
    name: 'over105days_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.first_visit_over_105_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return c.contact.parent &&
        c.contact.parent.parent &&
        c.contact.parent.parent.parent &&
        extras.isChildInWindow5Plus(c) &&
        extras.isChildUnder5(c);
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
        content.num_child_visits = extras.countConsentingInfantChildVisits(c);
        content.small_baby = extras.isSmallBaby(c);
        content.bcg = extras.getBcg(c);
        content.bopv0 = extras.getBopv0(c);
        content.bopv1 = extras.getBopv1(c);
        content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
        content.pcvi1 = extras.getPcvi1(c);
        content.rota1 = extras.getRota1(c);
        content.bopv2 = extras.getBopv2(c);
        content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
        content.pcvi2 = extras.getPcvi2(c);
        content.rota2 = extras.getRota2(c);
        content.bopv3 = extras.getBopv3(c);
        content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
        content.pcvi3 = extras.getPcvi3(c);
        content.ipv = extras.getIpv(c);
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
        content.visit_id = extras.mapInfantChildVisitType(c);
        content.due_date = Utils.addDate(new Date(extras.getContactReportedDate(c)), extras.month).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      // One event for each potential infant-child visit.  Allowed timing spans until relevancy of following visit
      {
        id: 'infant_child_first_visit_over_105_days',
        days: extras.month,
        start: extras.month,
        end: (extras.month * 60)
      },
    ],
    resolvedIf: function (c) {
      // Resolved if there are any infant-child forms submitted - this is a first time task only
      return extras.countReportsSubmitted(c, 'infant_child') > 0 ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },

  // Second infant child visit for children who got a first infant-child visit but are older than 20 days.
  // Task triggers with the high priority flag set and a due date based on the child's dob and visit schedule
  {
    name: 'over20days_secondplus_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.second_plus_visit_over_20_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return c.contact.parent &&
        c.contact.parent.parent &&
        c.contact.parent.parent.parent &&
        !extras.isChildUnder20Days(c) &&
        extras.countConsentingInfantChildVisits(c) > 0;
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
        content.num_child_visits = extras.countConsentingInfantChildVisits(c);
        content.small_baby = extras.isSmallBaby(c);
        content.bcg = extras.getBcg(c);
        content.bopv0 = extras.getBopv0(c);
        content.bopv1 = extras.getBopv1(c);
        content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
        content.pcvi1 = extras.getPcvi1(c);
        content.rota1 = extras.getRota1(c);
        content.bopv2 = extras.getBopv2(c);
        content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
        content.pcvi2 = extras.getPcvi2(c);
        content.rota2 = extras.getRota2(c);
        content.bopv3 = extras.getBopv3(c);
        content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
        content.pcvi3 = extras.getPcvi3(c);
        content.ipv = extras.getIpv(c);
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
        content.visit_id = extras.mapInfantChildVisitType(c);
        content.due_date = extras.mapInfantChildVisitScheduleDueDates(c);
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'infant_child_day_20_week_11_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.week * 4));
        },
        start: (extras.day * 8),
        end: (extras.week * 7) - 1
      },
      {
        id: 'infant_child_week_11_week_15_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.week * 12));
        },
        start: (extras.week * 1),
        end: (extras.week * 3) - 1
      },
      {
        id: 'infant_child_week_15_month_6_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.week * 16));
        },
        start: (extras.week * 1),
        end: (extras.day * 68) - 1
      },
      {
        id: 'infant_child_month_6_month_9_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.week * 26));
        },
        start: (extras.day * 2),
        end: (extras.day * 88) - 1
      },
      {
        id: 'infant_child_month_9_month_12_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.week * 42));
        },
        start: (extras.day * 24),
        end: (extras.day * 66) - 1
      },
      {
        id: 'infant_child_month_12_month_15_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 13));
        },
        start: (extras.month * 1),
        end: (extras.month * 2) - 1
      },
      {
        id: 'infant_child_month_15_month_18_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 16));
        },
        start: (extras.month * 1),
        end: (extras.month * 2) - 1
      },
      {
        id: 'infant_child_month_18_month_24_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 20));
        },
        start: (extras.month * 2),
        end: (extras.month * 4) - 1
      },
      {
        id: 'infant_child_year_2_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 25));
        },
        start: (extras.month * 1),
        end: (extras.month * 11) - 1
      },
      {
        id: 'infant_child_year_3_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 39));
        },
        start: (extras.month * 3),
        end: (extras.month * 9) - 1
      },
      {
        id: 'infant_child_year_4_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.month * 51));
        },
        start: (extras.month * 3),
        end: (extras.month * 9)
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return Utils.isFormSubmittedInWindow(c.reports, 'infant_child',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },


  //Trigger a task  for 5-7 months or 7-8 months 
  {
    name:'pregnancy_visit_5to7_or_7to8_months',
    icon: 'icon-pregnant',
    title: 'task.pregnancy',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return extras.isCurrentlyPregnant(c) &&
        extras.isOver5MonthsPregnant(c);
    },
    appliesToType: ['person'],
    actions: [{
      form: 'pregnancy',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPregnancyVisitType(c);
        content.client_EDD = extras.getRecentEDDForThisPregnancy(c);
        content.due_date = extras.getPregnancyDueDate(c).getTime();
        content.is_high_risk_pregnancy = extras.isHighRiskPregnancyML(c); 
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        content.client_EDD_human_readable = new Date(content.client_EDD).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }],
    events: [
      {
        id: 'pregnancy_month_5_month_7_visit',
        dueDate: function (event, c) {
          var EDD = new Date(extras.getRecentEDDForThisPregnancy(c));
          var dueDate = new Date(EDD.setDate(EDD.getDate() - (13 * extras.week)));
          return dueDate;
        },
        start: (extras.week * 4.5),
        end: (extras.week * 4.5) - 1
      },
      {
        id: 'pregnancy_over_7_months_visit',
        dueDate: function (event, c) {
          var EDD = new Date(extras.getRecentEDDForThisPregnancy(c));
          var dueDate = new Date(EDD.setDate(EDD.getDate() - (4 * extras.week)));
          return dueDate;
        },
        start: (extras.week * 4.5),
        //Set end date to 2 years from now so that the CHV can come back at anytime at finish the last visit
        end: (extras.month * 24)
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      var isResolved = Utils.isFormSubmittedInWindow(c.reports, 'pregnancy',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
      return isResolved;
    }
  },

  // 1st postpartum visit 
  {
    name:'first_postpartum_visit',
    icon: 'mother-child',
    title: 'task.postpartum',
    appliesTo: 'reports',
    appliesIf: function (c) {
      return extras.didClientDeliver(c);
    },
    appliesToType: ['pregnancy_outcomes'],
    actions: [{
      form: 'postpartum',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPostPartumVisitType(c);
        content.due_date = new Date().getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        content.c_section = extras.hadCSection(c);
        content.is_atleast_one_baby_alive = extras.isAtleastOneBabyAlive(c);
        content.show_quality_care = extras.showQualityOfCare(c);
      }
    }],
    events: [
      {
        id: 'postpartum_initial_visit',
        days: 0,
        start: 0,
        end: (extras.month * 60),  //setting end date high so that CHV gets ample of time to complete
      }
    ],
    resolvedIf: function (c) {
      // Resolved if there are any postpartum forms submitted for the current pregnancy
      return !extras.noPostpartumVisitsCurrentPregnancy(c) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },

  // 2nd postpartum visit 
  {
    name:'second_postpartum_visit',
    icon: 'mother-child',
    title: 'task.postpartum',
    appliesTo: 'reports',
    appliesIf: function (c) {
      return extras.didClientDeliver(c) && !(extras.noPostpartumVisitsCurrentPregnancy(c));
    },
    appliesToType: ['pregnancy_outcomes'],
    actions: [{
      form: 'postpartum',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPostPartumVisitType(c);
        content.due_date = Utils.addDate(extras.getDeliveryDate(c), 5).getTime();
        content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        content.c_section = extras.hadCSection(c);
        content.is_atleast_one_baby_alive = extras.isAtleastOneBabyAlive(c);
        content.show_quality_care = extras.showQualityOfCare(c);
      }
    }],
    events: [
      {
        id: 'postpartum_visit_3_or_more_days',
        dueDate: function (event, c) {
          var dueDate = Utils.addDate(extras.getDeliveryDate(c), 5);
          return dueDate;
        },
        start: (extras.day * 2),
        end: (extras.month * 60),  //setting end date high so that CHV gets ample of time to complete
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      var isResolved = Utils.isFormSubmittedInWindow(c.reports, 'postpartum',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
      return isResolved;
    }
  }
];
