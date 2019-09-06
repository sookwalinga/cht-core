module.exports = [

  // referral follow-up
  {
    icon: 'follow-up', // maybe not the best icon, but the best in the set
    title: 'task.referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      // if infant_child sets has_referral, we can eliminate the other checks
      return extras.hasReferral(r) ||
        extras.getSmallBabyFlag(r) === '1' ||
        extras.getNeonatalDangerSignFlag(r) === '1' ||
        extras.getSecondaryNeonatalDangerSignFlag(r) === '1' ||
        extras.getChildDangerSignFlag(r) === '1' ||
        extras.getMUACFlag(r) === '1' ||
        extras.getPalmPallorFlag(r) === '1' ||
        extras.getVaccinesFlag(r) === '1' ||
        extras.getSlowToLearnSpecificsFlag(r) === '1';
    },
    appliesToType: ['infant_child', 'referral_follow_up', 'pregnancy'],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function (content, contact, report) {
        content.source_form = report.form;
        content.source_id = report._id;
        content.last_visit_date = report.reported_date;
        content.refer_flag_small_baby = extras.getSmallBabyFlag(report);
        content.refer_neonatal_danger_sign_flag = extras.getNeonatalDangerSignFlag(report);
        content.refer_secondary_neonatal_danger_sign_flag = extras.getSecondaryNeonatalDangerSignFlag(report);
        content.refer_child_danger_sign_flag = extras.getChildDangerSignFlag(report);
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
        content.refer_flag_emergency_danger_sign = extras.getPregnancyEmergencyDangerSigns(report);
        content.refer_flag_pregnancy_issues = extras.getPregnancyIssues(report);
        content.refer_flag_pregnancy_complications = extras.getPregnancyComplications(report);
      }
    }],
    events: [
      {
        id: 'referral_follow_up',
        dueDate: function (event, contact, report) {
          var days = 3; // default referral follow-up three days after issuing referral
          if (
            report.fields &&
            report.fields.referral_days
          ) {
            days = Number(report.fields.referral_days);
          }
          return Utils.addDate(new Date(report.reported_date), days);
        },
        start: 3, // this is just for testing, in production should change this to maybe 1
        end: 7,
      }
    ],
    priority: {
      level: 'high',
      label: 'task.referral.high_priority'
    },
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if
      // the form is a referral form with no open referral
      // there is a 'referral_follow_up' form submitted that has the _id of the report set as source_id
      return (r.form === 'referral_follow_up' && !extras.hasReferral(r)) ||
        extras.isFormSubmittedForSource(c.reports, 'referral_follow_up', r._id);
    },
  },

  // First-time infant child visit for children registered at 19 days of age or younger.
  // Task triggers with the high priority flag set and a due date of the same day the child was registered
  {
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
        content.pcvi3 = extras.getPciv3(c);
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
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there are any infant-child forms submitted - this is a first time visit only
      return extras.countReportsSubmitted(c, 'infant_child') > 0;
    }
  },

  // Second infant child visit for children who got a first infant-child visit and are still under 20 days old.
  // Task triggers with the high priority flag set and a due date based on the child's dob and visit schedule
  {
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
        content.pcvi3 = extras.getPciv3(c);
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
        Utils.addDate(dueDate, event.end).getTime());
    }
  },

  // First-time infant child visit for children registered at between 20 and 105 (15 weeks) days of age.
  // Task triggers with normal priority and a due date of one week after the date of child registration
  {
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
        content.pcvi3 = extras.getPciv3(c);
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
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there are any infant-child forms submitted - this is a first time task only
      return extras.countReportsSubmitted(c, 'infant_child') > 0;
    }
  },

  // First-time infant child visit for children registered at over 105 (15 weeks) days of age.
  // Task triggers with normal priority and a due date of one month after the date of child registration
  {
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
        content.pcvi3 = extras.getPciv3(c);
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
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there are any infant-child forms submitted - this is a first time task only
      return extras.countReportsSubmitted(c, 'infant_child') > 0;
    }
  },

  // Second infant child visit for children who got a first infant-child visit but are older than 20 days.
  // Task triggers with the high priority flag set and a due date based on the child's dob and visit schedule
  {
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
        content.pcvi3 = extras.getPciv3(c);
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
        Utils.addDate(dueDate, event.end).getTime());
    }
  },


  //Trigger a task  for 5-7 months or 7-8 months 
  {
    icon: 'icon-pregnant',
    title: 'task.pregnancy',
    appliesTo: 'contacts',
    appliesIf: function (c, r) {
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
        Utils.addDate(dueDate, event.end).getTime());
      return isResolved;
    }
  },

  // 1st postpartum visit 
  {
    icon: 'mother-child',
    title: 'task.postpartum',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return extras.didClientDeliver(c);
    },
    appliesToType: ['delivery_outcomes'],
    actions: [{
      form: 'postpartum',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPostPartumVisitType(c);
        content.due_date = now;
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
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there are any postpartum forms submitted for the current pregnancy
      return !extras.noPostpartumVisitsCurrentPregnancy(c);
    }
  },

  // 2nd postpartum visit 
  {
    icon: 'mother-child',
    title: 'task.postpartum',
    appliesTo: 'reports',
    appliesIf: function (c, r) {
      return extras.didClientDeliver(c) && !(extras.noPostpartumVisitsCurrentPregnancy(c));
    },
    appliesToType: ['delivery_outcomes'],
    actions: [{
      form: 'postpartum',
      modifyContent: function (content, c) {
        content.visit_id = extras.mapPostPartumVisitType(c);
        content.due_date = Utils.addDate(extras.getDeliveryDate(c), 5);
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
        Utils.addDate(dueDate, event.end).getTime());
      return isResolved;
    }
  }
];
