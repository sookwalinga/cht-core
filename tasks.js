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
        content.num_child_visits = extras.countReportsSubmitted(c, 'infant_child');
        content.small_baby = extras.isSmallBaby(c);
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
];
