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
      console.log("Logging from referral_follow_up 1:, ", extras.getSmallBabyFlag(r));
      console.log("Logging from referral_follow_up 2:, ", extras.getNeonatalDangerSignFlag(r));
      console.log("Logging from referral_follow_up 3:, ", extras.getChildDangerSignFlag(r));
      console.log("Logging from referral_follow_up 4:, ", extras.getMUACFlag(r));
      console.log("Logging from referral_follow_up 5:, ", extras.getPalmPallorFlag(r));
      console.log("Logging from referral_follow_up 6:, ", extras.getVaccinesFlag(r));
      console.log("Logging from referral_follow_up 7:, ", extras.getSlowToLearnSpecificsFlag(r));
      return extras.getSmallBabyFlag(r) ||
        extras.getNeonatalDangerSignFlag(r) ||
        extras.getChildDangerSignFlag(r) ||
        extras.getMUACFlag(r) ||
        extras.getPalmPallorFlag(r) ||
        extras.getVaccinesFlag(r) ||
        extras.getSlowToLearnSpecificsFlag(r);
    },
    appliesToType: [ 'infant_child' ],
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
        //dueDate: function(r) {
        //  return Utils.addDate(r.reported_date, 3); // assuming all referrals should be followed-up within 3 days
        //},
        days:0,
        start:1,
        end:40,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      //return false;
      return Utils.isFormSubmittedInWindow(c.reports, 'referral_follow_up',
                  Utils.addDate(dueDate, -event.start).getTime(),
                  Utils.addDate(dueDate,  event.end+1).getTime());
    },
  },
];
