[
  // first infant-child visit
  {
    icon: 'child',
    title: 'task.infant_child',
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from first infant-child task ...", c);
      return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && isChildUnder5(c);
    },
    appliesToType: [ 'person' ],
    actions: [{
      form: 'infant_child',
      modifyContent: function(c, content) {
        content.child_consent = hasGivenConsent(c);
        content.num_child_visits = countReportsSubmitted(c, 'infant_child');
        content.small_baby = isSmallBaby(c);
      }
    }],
    events: [
      {
        id:'infant_child_first_visit', days:0, start:0, end:21,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return isFormSubmittedInWindow(c.reports, 'infant_child',
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
      console.log("Logging from referral follow-up task ...", c);
      return referralMade(r, 'infant_child');
    },
    appliesToType: [ 'infant_child' ],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function(c, content, report) {
        content.last_visit_date = r.reported_date;
        content.referral_reasons = getReferralReasons(report);
      }
    }],
    events: [
      {
        id:'referral_follow_up',
        dueDate: function(r) {
          return Utils.addDate(r.reported_date, 3); // assuming all referrals should be followed-up within 3 days
        },
        start:1,
        end:3,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return isFormSubmittedInWindow(c.reports, 'referral_follow_up',
                  Utils.addDate(dueDate, -event.start).getTime(),
                  Utils.addDate(dueDate,  event.end+1).getTime());
    },
  },

  // referral follow-up test
  {
    icon: 'followup-general', // maybe not the best icon, but the best in the set
    title: 'task.referral_follow_up_test',
    appliesTo: 'reports',
    appliesIf: function(c, r) {
      console.log("Logging from referral follow-up test task ...", r);
      return true;
//      return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && referralMade(r, 'infant_child');
    },
    appliesToType: [ 'infant_child' ],
    actions: [{
      form: 'referral_follow_up',
      modifyContent: function(c, content, report) {
        content.last_visit_date = r.reported_date;
        content.referral_reasons = getReferralReasons(report);
      }
    }],
    events: [
      {
        id:'referral_follow_up',
        dueDate: function(r) {
          return Utils.addDate(r.reported_date, 3); // assuming all referrals should be followed-up within 3 days
        },
        start:1,
        end:3,
      }
    ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return isFormSubmittedInWindow(c.reports, 'referral_follow_up',
                  Utils.addDate(dueDate, -event.start).getTime(),
                  Utils.addDate(dueDate,  event.end+1).getTime());
    },
  }
]
