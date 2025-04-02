
/* eslint-disable */
const extras = require('./nools-extras.js');
module.exports = [

  // Infant-child referral follow-up
  {
    name: 'infant_child_referral_followup',
    icon: 'follow-up',
    title: 'task.infant_child_referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return (extras.get(user,'parent.type')==='health_center') &&
        extras.hasReferral(r, 'infant_child') ||
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
        content.refer_palm_pallor_flag = extras.getPalmPallorFlag(report);
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
          let days = 3;
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

  //Pregnancy referral follow-up
  {
    name: 'pregnancy_referral_followup',
    icon: 'follow-up',
    title: 'task.pregnancy_referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      if((r.fields.referral_original_source_form === 'pregnancy' || r.form === 'pregnancy') && 
        (extras.get(user,'parent.type')==='health_center'))
      {return extras.isCurrentlyPregnant(c) && extras.hasReferral(r, 'pregnancy') || extras.getPregnancyEmergencyDangerSigns(r) === '1' ||
               extras.getPregnancyIssues(r) === '1' || extras.getPregnancyComplications(r) === '1' ||
               extras.getANCVisitFlag(r) === '1';}
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
        content.refer_flag_anc_visit = extras.getANCVisitFlag(report);
      }
    }],
    events: [
      {
        id: 'pregnancy_referral_follow_up',
        dueDate: function (event, contact, report) {
          let days = 3;
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
      return  (extras.get(user,'parent.type')==='health_center') && 
              (extras.hasReferral(r, 'postpartum') || extras.getPostpartumEmergencyDangerSigns(r) === '1' ||
              extras.getPostpartumOtherDangerSigns(r) === '1' || extras.getPostpartumPNCReferral(r) === '1');
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
        content.refer_flag_postpartum_pnc_visit = extras.getPostpartumPNCReferral(report); 
      }
    }],
    events: [
      {
        id: 'postpartum_referral_follow_up',
        dueDate: function (event, contact, report) {
          let days = 3;
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

  // First-time infant child visit for children registered at 19 days of age or younger.
  // Task triggers with the high priority flag set and a due date of the same day the child was registered
  {
    name: 'under20days_first_infant_child_visit',
    icon: 'child',
    title: 'task.infant_child.first_visit_under_20_days',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      return (extras.get(user,'parent.type')==='health_center') &&
             extras.get(c,'contact.parent.parent.parent') &&
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
      return (extras.get(user,'parent.type')==='health_center') &&
        extras.get(c,'contact.parent.parent.parent') &&
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
        Utils.addDate(dueDate, event.end+1).getTime()) ||
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
      return (extras.get(user,'parent.type')==='health_center') &&
             extras.get(c,'contact.parent.parent.parent') &&
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
      return (extras.get(user,'parent.type')==='health_center') &&
             extras.get(c,'contact.parent.parent.parent') &&
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
      return  (extras.get(user,'parent.type')==='health_center') &&
         extras.get(c,'contact.parent.parent.parent') &&
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
        Utils.addDate(dueDate, event.end+1).getTime()) ||
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
      return extras.get(user,'parent.type')==='health_center' && extras.isCurrentlyPregnant(c) &&
        extras.isOver5MonthsPregnant(c);
    },
    appliesToType: ['person'],
    actions: [{
      form: 'pregnancy',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPregnancyVisitType(c);
        content.client_EDD = extras.getRecentEDDForThisPregnancy(c);
        content.due_date = extras.getPregnancyDueDate(c).getTime(); 
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
          const EDD = new Date(extras.getRecentEDDForThisPregnancy(c));
          const dueDate = new Date(EDD.setDate(EDD.getDate() - (13 * extras.week)));
          return dueDate;
        },
        start: (extras.week * 4.5),
        end: (extras.week * 4.5) - 1
      },
      {
        id: 'pregnancy_over_7_months_visit',
        dueDate: function (event, c) {
          const EDD = new Date(extras.getRecentEDDForThisPregnancy(c));
          const dueDate = new Date(EDD.setDate(EDD.getDate() - (4 * extras.week)));
          return dueDate;
        },
        start: (extras.week * 4.5),
        //Set end date to 2 years from now so that the CHV can come back at anytime at finish the last visit
        end: (extras.month * 24)
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'pregnancy',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end+1).getTime()) ||
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
      return extras.get(user,'parent.type')==='health_center' && extras.didClientDeliver(c);
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
        content.delivery_date = extras.getDeliveryDate(c); 
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
      return extras.get(user,'parent.type')==='health_center' &&
             extras.didClientDeliver(c) && !(extras.noPostpartumVisitsCurrentPregnancy(c));
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
        content.delivery_date = extras.getDeliveryDate(c); 
      }
    }],
    events: [
      {
        id: 'postpartum_visit_3_or_more_days',
        dueDate: function (event, c) {
          const dueDate = Utils.addDate(extras.getDeliveryDate(c), 5);
          return dueDate;
        },
        start: (extras.day * 2),
        end: (extras.month * 60),  //setting end date high so that CHV gets ample of time to complete
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'postpartum',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end+1).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
      return isResolved;
    }
  }, 
  //Reminder task to remind CHVs to perform pregnancy outcomes & postpartum visits 
  {
    name: 'pregnancy_outcomes_reminder_visit',
    icon: 'follow-up',
    title: 'task.pregnancy_outcomes_reminder_visit',
    appliesTo: 'reports',
    appliesIf: function (c,r) {
      return extras.get(user,'parent.type')==='health_center' && 
             extras.isCurrentlyPregnant(c) &&
             extras.isInPostpartumReminderTimeWindow(c) && 
             extras.isMostRecentReport(c,r,['pregnancy','pregnancy_outcomes_reminder']);
    },
    appliesToType: ['pregnancy','pregnancy_outcomes_reminder'], 
    actions: [{
      form: 'pregnancy_outcomes_reminder',
      modifyContent: function (content) {
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
        id: 'pregnancy_outcomes_reminder',
        dueDate: function (event,c) {
          return new Date(extras.getRecentEDDForThisPregnancy(c));
        },
        start: 14,
        end: (extras.week * 6) //task will appear for 6 weeks after EDD (22 total reminders) 
      },
    ],
    resolvedIf: function (c) {

      const edd = new Date(extras.getRecentEDDForThisPregnancy(c));
      const now = new Date();
      const remindedSince = now > edd ? 2 : 14;

      // Resolved if the outcomes  form is submitted for the current pregnancy or 
      //reminder form is submitted in the time window or person id dead or muted  
      return extras.isPregnancyOutcomesSubmitted(c) ||
        Utils.isFormSubmittedInWindow(c.reports, 'pregnancy_outcomes_reminder',
          Utils.addDate(now, -remindedSince).getTime(),
          now.getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
    }
  },
  {
    name: 'quality-monitoring-task',
    icon: 'general',
    title: 'task.quality_monitoring',
    appliesTo: 'reports',
    appliesIf: function() {
      return  user.parent && user.parent.type === 'district_hospital';
    },
    appliesToType: ['quality_monitoring_planning'],
    actions: [ 
      { 
        type: 'report',
        form: 'chv_quality_monitoring' 
      } 
    ],
    events: [
      {
        id: 'quality-monitoring-1',
        dueDate: function (event, contact, report) {
          return extras.get(report,'fields.visit_details.planned_visit_date')?
            new Date(report.fields.visit_details.planned_visit_date):
            new Date();
        },
        start: 2,
        end: 2,
      }
    ]
  },



  {
    name: 'shadowing-reminder-task',
    icon: 'general',
    title: 'task.shadowing_reminder',
    appliesTo: 'reports',
    appliesIf: function() {
      return user.parent && user.parent.type === 'health_center';
    },
    appliesToType: [ 'quality_monitoring_planning' ],
    actions: [ 
      { 
        type: 'report',
        form: 'shadowing_reminder',
        modifyContent: function(content, contact, report) {
          content.t_planned_visit_date = extras.get(report,'fields.visit_details.planned_visit_date')?
            report.fields.visit_details.planned_visit_date:
            'the planned visit date.';
        }
      } 
    ],
    events: [
      {
        id: 'shadowing-reminder-1',
        dueDate: function (report) {
          return extras.get(report,'fields.visit_details.planned_visit_date')?
            new Date(report.fields.visit_details.planned_visit_date): 
            new Date();
        },
        start:2,
        end:2,
      }
    ]
  },
  {
    name: 'chw-monthly-meeting-task-1', 
    icon: 'confirm-meeting',
    title: 'task.chw_monthly_meeting',
    appliesTo: 'reports',
    appliesToType: [ 'chw_monthly_meeting' ],
    appliesIf: function(contact,report) {
      return extras.get(report,'fields.next_meeting_details.next_meeting_date') && 
      user.parent && user.parent.type === 'district_hospital';
    },
    actions: [ 
      { 
        type: 'report',
        form: 'chw_monthly_meeting' 
      } 
    ],
    events: [
      {
        id: 'chw-monthly-meeting-1',
        dueDate: function (event,contact,report) {
          let meetingDate = '';
          if (report.fields 
            && report.fields.next_meeting_details 
            && report.fields.next_meeting_details.next_meeting_date) {
            meetingDate = new Date(report.fields.next_meeting_details.next_meeting_date);                                    
          } else {
            meetingDate = new Date();
          }
          return meetingDate;
        },
        start:3,
        end:3,
      }
    ]
  },
  {
    name: 'chw-monthly-meeting-task-2',
    icon: 'confirm-meeting',
    title: 'task.chw_monthly_meeting',
    appliesTo: 'contacts',
    appliesToType: [ 'district_hospital' ],
    appliesIf: function() {
      return user.parent && user.parent.type === 'district_hospital';
    },
    actions: [ 
      { 
        type: 'report',
        form: 'chw_monthly_meeting' 
      } 
    ],
    resolvedIf: function (contact) {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'chw_monthly_meeting',
        firstDay,
        lastDay
      );
    },
    events: [
      {
        id: 'chw-monthly-meeting-1',
        dueDate: function () {
          const date = new Date();
          const meetingDate = new Date(date.getFullYear(), date.getMonth(), 3);
          return meetingDate;
        },
        start:3,
        end:3,
      }
    ]
  },
  {
    name: 'quality-monitoring-follow-up-task-1',
    icon: 'general',
    title: 'task.quality_monitoring_follow_up',
    appliesTo: 'reports',
    appliesIf: function (contact, report) {
      if (report.fields &&
        report.fields.group_summary &&
        report.fields.group_summary.follow_up_again) {
        return report.fields.group_summary.follow_up_again === 'yes' && user.parent && user.parent.type === 'district_hospital';
      }
      return false;
    },
    appliesToType: [ 'chv_quality_monitoring' ],
    actions: [ 
      {
        type: 'report',
        form: 'quality_monitoring_follow_up',
        modifyContent: function (content, contact, report) {
          content.t_follow_up_areas = extras.get(report, 'fields.c_follow_up_areas') || '';
          content.t_follow_up_areas_sw = extras.get(report, 'fields.c_follow_up_areas_sw') || '';
        }
      } 
    ],
    events: [
      {
        id: 'quality-monitoring-follow-up-1',
        dueDate: function (event, contact, report) {
          return extras.get(report,'fields.group_summary.next_follow_up_date')?
            new Date(report.fields.group_summary.next_follow_up_date): 
            new Date();
        },
        start:2,
        end:2,
      }
    ]
  },
  {
    name: 'quality-monitoring-follow-up-task-2',
    icon: 'general',
    title: 'task.quality_monitoring_follow_up',
    appliesTo: 'reports',
    appliesIf: function (contact, report) {
      return report.fields && report.fields.follow_up_details &&
		report.fields.follow_up_details.follow_up_again === 'yes' &&
		user.parent && user.parent.type === 'district_hospital';
    },
    appliesToType: [ 'quality_monitoring_follow_up' ],
    actions: [ 
      { 
        type: 'report',
        form: 'quality_monitoring_follow_up' 
      } 
    ],
    events: [
      {
        id: 'quality-monitoring-follow-up-1',
        dueDate: function (event, contact, report) {
          if (report.fields && report.fields.follow_up_details && report.fields.follow_up_details.next_follow_up_date) {
            return new Date(report.fields.follow_up_details.next_follow_up_date);
          } else {
            return new Date();
          }
        },
        start:2,
        end:2,
      }
    ]
  }, 
  // TB result follow-up as a result of TB Investigation 

  //This task is triggered when a TB Investigation form with referral is submitted. 
  
  {
    name: 'tb-result-follow-up',
    icon: 'cough',
    title: 'task.tb_result_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c,r) { 
      return  (extras.get(user,'parent.type')==='health_center') &&
              extras.hasTBReferral(r) === '1'; 
    },
    appliesToType: ['tb_investigation','result_follow_up'],
    actions: [{
      form: 'result_follow_up'  
    }],
    events: [
      {
        id: 'result_followup',
        dueDate: function (event,contact,report) { 
          var newDate = Utils.addDate(new Date(report.reported_date), 3);
          console.log('New date iss ', newDate); 
          return newDate;
        }, 
        start: 3,
        end: 30
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c,r,event,dueDate) {
     const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'result_follow_up',
      Utils.addDate(dueDate, -4).getTime(),
      Utils.addDate(dueDate, event.end+1).getTime()); 
   //  console.log('Is resolved for result followup',c.contact.name,r.form,isResolved); 
      return isResolved; 
    }
  },

  // First treatment follow-up (Triggered after result followup is submitted and is positive)
  {
    name: 'tb-first-treatment-follow-up',
    icon: 'tb-treatment-followup',
    title: 'task.first_treatment_followup',
    appliesTo: 'reports',
    appliesIf: function (c,r) {
      // console.log('appliefIf user.parent.type', (extras.get(user,'parent.type')==='health_center')); 
     // console.log('r in appliesIf', r); 
      return  (extras.get(user,'parent.type')==='health_center') &&
              extras.hasTB(r) === '1' || extras.restartTreatmentForDefaulter(c,r); 
    },
    appliesToType: ['result_follow_up','first_treatment_followup','second_treatment_followup'],
    actions: [{
      form: 'first_treatment_followup', 
      modifyContent: function (content,contact) {
       content.first_treatment_date_constraint=extras.getFirstTreatmentDateConstraint(contact); 
      } 
    }],
    events: [
      {
        id: 'first_treatment_followup',
        dueDate: function (event,contact,report) { 
          var newDate = Utils.addDate(new Date(report.reported_date), 3);
          console.log('New date iss ', newDate); 
          return newDate;
        }, 
        start: 3,
        end: 30
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c,r,event,dueDate) {
     //console.log('resolvedIf', extras.isContactDeceased(c) || extras.isContactMuted(c) ||  extras.countReportsSubmitted(c, 'tb_result_follow_up') > 0); 
      console.log('Event start', c.contact.name,r.form,Utils.addDate(dueDate, -3)); 
      console.log('Event end',c.contact.name,r.form,Utils.addDate(dueDate, event.end+1)); 
      console.log(new Date(r.reported_date)); 
     const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'first_treatment_followup',
        Utils.addDate(dueDate, -4).getTime(),
        Utils.addDate(dueDate, event.end+1).getTime()) ||
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c);
        console.log('Resolved if in first treatment followup task',c.contact.name, isResolved); 
      return isResolved;
    }
  },

   //Second treatment followup to appear bi-weekly for the first two months (56 days) 
  //  {
  //   name: 'second_treatment_followup_biweekly',
  //   icon: 'follow-up',
  //   title: 'task.second_treatment_followup_biweekly',
  //   appliesTo: 'reports',
  //    appliesIf: function (c,r) {
  //     console.log('Inside appliesIf of second trmt followup biweekly'); 
  //   //  console.log('appliesIf second treatment submitted',c.contact.name,extras.hasSecondTreatmentFollowupSubmitted(c,14)); 
  //    console.log('r.form',r.form, 'for', c.contact.name); 
  //    console.log('appliedIf biweekly', 'for', c.contact.name, extras.get(user,'parent.type')==='health_center' && 
  //    extras.showSecondTreatmentFollowup(c,r,14)); 
  //   return extras.get(user,'parent.type')==='health_center' && 
  //            extras.showSecondTreatmentFollowup(c,r,14);//&& 
  //           // extras.isWithinBiweeklyPeriod(c)
  //   },
  //   appliesToType: ['first_treatment_followup','second_treatment_followup'],
  //   actions: [{
  //     form: 'second_treatment_followup',
  //     modifyContent: function (content) {
  //       content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
  //         weekday: 'long',
  //         year: 'numeric',
  //         month: 'long',
  //         day: 'numeric'
  //       });
  //     }
  //   }],
  //   events: [
  //     {
  //       id: 'second_treatment_followup_biweekly',
  //       dueDate: function (event,c) {  
  //         console.log('trmt start date in bi weekly task',extras.getTBTreatmentStartDate(c)); 
  //         return extras.getTBTreatmentStartDate(c); 
  //       },
  //       start:0,
  //       end: 56 //the task disappears if submitted and recur bi-weekly but will appear for 56 days if not submitted at all
  //     },
  //   ],
  //   resolvedIf: function (c,r,event,dueDate) {
  //     let resolvedIf =  
  //       extras.isContactDeceased(c) ||
  //       extras.isContactMuted(c);
  //       console.log('Resolve if for reminder task',resolvedIf); 

  //       return resolvedIf; 
  //   }
  // },

  //Second treatment followup to appear bi-weekly for the first two months (56 days) 
  //with missed dosage days
  {
    name: 'second_treatment_followup',
    icon: 'follow-up',
    title: 'task.second_treatment_followup',
    appliesTo: 'reports',
     appliesIf: function (c,r) {
    
     console.log('Applies if in secondtrtmt followup',extras.get(user,'parent.type')==='health_center' && 
     extras.showSecondTreatmentFollowup(c,r)); 
    return extras.get(user,'parent.type')==='health_center' && 
             extras.showSecondTreatmentFollowup(c,r); 
    },
    appliesToType: ['first_treatment_followup','second_treatment_followup'],
    actions: [{
      form: 'second_treatment_followup',
      modifyContent: function (content,contact) {
        
        let lastVisitDate = extras.getRecentSecondTrmtReportedDate(contact); 
         console.log('lastvisitdate in task',lastVisitDate,contact.contact.name);
        content.last_visit_date = lastVisitDate?lastVisitDate.toLocaleDateString('sw', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }):'';

        console.log('content.last_visit_sate',content.last_visit_date,contact.contact.name); 
      }
    }],
    events: [
      {
        id: 'second_treatment_followup',
        dueDate: function (event,c) {  
          console.log('trmt start date in bi weekly task',extras.getTBTreatmentStartDate(c)); 
          return extras.getTBTreatmentStartDate(c); 
        },
        start:0,
        end: 200 //the task disappears if submitted and recur bi-weekly but will appear for 56 days if not submitted at all
      },
    ],
    resolvedIf: function (c,r,event,dueDate) {
      let resolvedIf =  
        extras.isContactDeceased(c) ||
        extras.isContactMuted(c) || 
        extras.shouldResolveSecondTreatmentFollowup(c);
        console.log('Resolve if for reminder task',r.form,c.contact.name,resolvedIf); 

        return resolvedIf; 
    }
  },

//Second treatment followup to appear monthly from day 57 - 168 of treatment period 
  // {
  //   name: 'second_treatment_followup_monthly',
  //   icon: 'follow-up',
  //   title: 'task.second_treatment_followup_monthly',
  //   appliesTo: 'reports',
  //   appliesIf: function (c,r) {
  //     return extras.get(user,'parent.type')==='health_center' && 
  //            extras.showSecondTreatmentFollowup(c,r,28)
  //   },
  //   appliesToType:  ['first_treatment_followup','second_treatment_followup'],
  //   actions: [{
  //     form: 'second_treatment_followup',
  //     modifyContent: function (content) {
  //       content.due_date_human_readable = new Date(content.due_date).toLocaleDateString('sw', {
  //         weekday: 'long',
  //         year: 'numeric',
  //         month: 'long',
  //         day: 'numeric'
  //       });
  //     }
  //   }],
  //   events: [
  //     {
  //       id: 'second_treatment_followup_monthly',
  //       dueDate: function (event,c) {  
  //         let startDate = extras.getTBTreatmentStartDate(c); 
  //          console.log('due date for reminder in second trmt monthly ', startDate);
  //         return startDate && Utils.addDate(extras.getTBTreatmentStartDate(c), 57);

  //       },
  //       start:0,
  //       end: 111  //168 -57 = 111 
  //     },
  //   ],
  //   resolvedIf: function (c,r,event,dueDate) {
  //     let resolvedIf =  
  //       extras.isContactDeceased(c) ||
  //       extras.isContactMuted(c);
  //       console.log('Resolve if in second treatment monthyl for reminder task',resolvedIf); 

  //       return resolvedIf; 
  //   }
  // },

  // // TB result follow-up as a result of Contact Investigation > 5 
  // {
  //   name: 'tb-result-follow-up-contact-gt-5',
  //   icon: 'cough',
  //   title: 'task.tb_result_follow_up_contact_gt_5',
  //   appliesTo: 'reports',
  //   appliesIf: function (c,r) {
  //     console.log('Inside appliesIf of', r.form); 
  //     // console.log('appliefIf user.parent.type', (extras.get(user,'parent.type')==='health_center')); 
  //     // console.log('r in appliesIf', r.fields.refer_tb_client); 
  //     return  (extras.get(user,'parent.type')==='health_center') &&
  //             extras.hasTBReferral(r) === '1'; 
  //   },
  //   appliesToType: ['contact_investigation_above_5','result_follow_up_contact_above_5'],
  //   actions: [{
  //     form: 'result_follow_up_contact_above_5'  
  //   }],
  //   events: [
  //     {
  //       id: 'result_followup_contact_above_5',
  //       dueDate: function (event,contact,report) { 
  //         var newDate = Utils.addDate(new Date(report.reported_date), 3);
  //         console.log('New date iss ', newDate); 
  //         return newDate;
  //       }, 
  //       start: 3,
  //       end: 30
  //     }
  //   ],
  //   priority: {
  //     level: 'high',
  //     label: 'task.referral.high_priority'
  //   },
  //   resolvedIf: function (c,r,event,dueDate) {
  //    // console.log('resolvedIf', extras.isContactDeceased(c) || extras.isContactMuted(c) ||  extras.countReportsSubmitted(c, 'tb_result_follow_up') > 0); 
  //     console.log('Event start',Utils.addDate(dueDate, -4)); 
  //     console.log('Event end',Utils.addDate(dueDate, event.end+1)); 

  //    const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'result_follow_up_contact_above_5',
  //       Utils.addDate(dueDate, -3).getTime(),
  //       Utils.addDate(dueDate, event.end+1).getTime()) ||
  //       extras.isContactDeceased(c) ||
  //       extras.isContactMuted(c);
  //       console.log('Resolved if', isResolved); 
  //     return isResolved;
  //   }
  // },
   //  // Second TB result follow-up triggered after second treatment followup is submitted
  //this is no longer needed as second treatment followup does not trigger any referral
  //  {
  //   name: 'second-teeatment-result-follow-up',
  //   icon: 'cough',
  //   title: 'task.second_treatment_result_follow_up',
  //   appliesTo: 'reports',
  //   appliesIf: function (c,r) {
  //     // console.log('appliefIf user.parent.type', (extras.get(user,'parent.type')==='health_center')); 
  //     // console.log('r in appliesIf', r.fields.refer_tb_client); 
  //     console.log('Applies if in second result followup',extras.get(user,'parent.type')==='health_center' &&
  //     extras.hasReferralFromSecondTreatmentFollowup(c,r) === '1'); 

  //     return  (extras.get(user,'parent.type')==='health_center') &&
  //             extras.hasReferralFromSecondTreatmentFollowup(c,r) === '1'; 
  //   },
  //   appliesToType: ['second_treatment_followup','second_treatment_result_followup'],
  //   actions: [{
  //     form: 'second_treatment_result_followup', 
  //     modifyContent: function (content, contact, report) {
  //       content.refer_flag_medicine=extras.isClientTakingMedicine(report); 
  //       content.refer_flag_side_effects=extras.isClientHavingSideEffects(report); 
  //       content.refer_flag_monitoring_results=extras.isClientMonitoringResults(report); 
  //       content.last_visit_date = report.reported_date;
  //     }
  //   }],
  //   events: [
  //     {
  //       id: 'second_treatment_result_followup',
  //       dueDate: function (event,contact,report) { 
  //         var newDate = Utils.addDate(new Date(report.reported_date), 3);
  //         return newDate;
  //       }, 
  //       start: 3,
  //       end: 30
  //     }
  //   ],
  //   priority: {
  //     level: 'high',
  //     label: 'task.referral.high_priority'
  //   },
  //   resolvedIf: function (c,r,event,dueDate) {
  //    // console.log('resolvedIf', extras.isContactDeceased(c) || extras.isContactMuted(c) ||  extras.countReportsSubmitted(c, 'tb_result_follow_up') > 0); 
  //     // console.log('Event start',Utils.addDate(dueDate, -4)); 
  //     // console.log('Event end',Utils.addDate(dueDate, event.end+1)); 

  //    const isResolved = Utils.isFormSubmittedInWindow(c.reports, 'second_treatment_result_followup',
  //       Utils.addDate(dueDate, -3).getTime(),
  //       Utils.addDate(dueDate, event.end+1).getTime()) ||
  //       extras.isContactDeceased(c) ||
  //       extras.isContactMuted(c);
  //      console.log('Resolved if in second result followup', isResolved); 
  //     return isResolved;
  //   }
  // },
];