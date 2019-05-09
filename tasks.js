module.exports = [
  // first infant-child visit
  {
    icon: 'child',
    title: 'task.infant_child',
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from first infant-child task ...", c);
      return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && extras.isChildUnder5(c);
    },
    appliesToType: [ 'person' ],
    actions: [{
      form: 'infant_child',
      modifyContent: function(c, content) {
        content.child_consent = extras.hasGivenConsent(c);
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
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
      }
    }],
    events: [
      {
        id:'infant_child_first_visit', days:0, start:0, end:21,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return Utils.isFormSubmittedInWindow(c.reports, 'infant_child',
                 Utils.addDate(dueDate, -event.start).getTime(),
                 Utils.addDate(dueDate,  event.end+1).getTime());
    },
  },

  // referral follow-up
  {
    icon: 'followup-general', // maybe not the best icon, but the best in the set
    title: 'task.referral_follow_up',
    appliesTo: 'reports',
    appliesIf: function(c, r) {
      console.log("Logging from referral_follow_up hasReferral: ", extras.hasReferral(r));
      console.log("Logging from referral_follow_up SmallBaby:, ", extras.getSmallBabyFlag(r));
      // if infant_child sets has_referral, we can eliminate the other checks
      return extras.hasReferral(r) ||
        extras.getSmallBabyFlag(r) ||
        extras.getNeonatalDangerSignFlag(r) ||
        extras.getChildDangerSignFlag(r) ||
        extras.getMUACFlag(r) ||
        extras.getPalmPallorFlag(r) ||
        extras.getVaccinesFlag(r) ||
        extras.getSlowToLearnSpecificsFlag(r);
    },
    appliesToType: [ 'infant_child', 'referral_follow_up' ],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function(content, contact, report) {
        content.last_visit_date = new Date(report.reported_date).toDateString();
        content.refer_flag_small_baby = extras.getSmallBabyFlag(report);
        content.refer_neonatal_danger_sign_flag = extras.getNeonatalDangerSignFlag(report);
        content.refer_child_danger_sign_flag = extras.getChildDangerSignFlag(report);
        content.refer_muac_flag = extras.getMUACFlag(report);
        content.refer_refer_palm_pallor_flag = extras.getPalmPallorFlag(report);
        content.refer_vaccines_flag = extras.getVaccinesFlag(report);
        content.refer_slow_to_learn_specifics_flag = extras.getSlowToLearnSpecificsFlag(report);
      }
    }],
    events: [
      {
        id:'referral_follow_up',
        dueDate: function(event, contact, report) {
          var days = 3; // default referral follow-up three days after issuing referral
          if (
            report.fields &&
            report.fields.referral_days
          ) {
            days = report.fields.referral_days;
          }
          return Utils.addDate(new Date(report.reported_date), days);
        },
        start:3, // this is just for testing, in production should change this to maybe 1
        end:7,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      // Assumption: only one referral open for client
      // return false;
      // console.log('Logging from resolvedIf', r);
      // console.log('Logging from resolvedIf', dueDate);
      // console.log('Logging from resolvedIf', r.form);
      // console.log('Logging from resolvedIf', Utils.isFormSubmittedInWindow(c.reports, 'referral_follow_up',
      // Utils.addDate(dueDate, -event.start).getTime(),
      // Utils.addDate(dueDate,  event.end+1).getTime()));
//      if (r.form === 'infant_child')
      return Utils.isFormSubmittedInWindow(c.reports, 'referral_follow_up',
                  Utils.addDate(dueDate, -event.start).getTime(),
                  Utils.addDate(dueDate,  event.end+1).getTime());
    },
  },

  // Subsequent infant-child visits, triggered only following a first visit where consent was granted
  {
    icon: 'child',
    title: [ {locale: 'en', content: 'Infant-Child visit'} ],
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from tasks ...", c);
      return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && extras.isChildUnder5(c) && extras.countConsentingInfantChildVisits(c) > 0;
    },
    appliesToType: [ 'person' ],
    actions: [{
      form: 'infant_child',
      modifyContent: function(c, content) {
        content.child_consent = extras.hasGivenConsent(c);
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
        content.surua_rubella1 = extras.getSurua_rubella1(c);
        content.surua_rubella2 = extras.getSurua_rubella2(c);
      }
    }],
    events: [
      // First possible visit for this task is the SECOND infant-child visit.
      // One event for that and then another for each infant-child visit thereafter
      {
        id:'infant_child_3_7_day_pp_visit',
        dueDate: function(c, r, event){
          return extras.daysAfterBirth(c, 5);
        },
        start:2,
        end:2
      }

      // Further infant-child visits go here

    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return extras.isFormSubmittedInWindow(c.reports, 'infant_child',
                 Utils.addDate(dueDate, -event.start).getTime(),
                 Utils.addDate(dueDate,  event.end+1).getTime());
    },
  }
];
