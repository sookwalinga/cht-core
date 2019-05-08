module.exports = [
  // first infant-child visit
  // FIXME add translation key 'task.first_infant_child'
  //{
  //   icon: 'child',
  //   title: 'task.first_infant_child',
  //   appliesTo: 'contacts',
  //   appliesIf: function (c) {
  //     if (c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && extras.isChildUnder5(c) && extras.countReportsSubmitted(c, 'infant_child') === 0){
  //       console.log('Triggering initial infant-child visit for ', c.contact.name);
  //     }
  //     return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && extras.isChildUnder5(c) && extras.countReportsSubmitted(c, 'infant_child') === 0;
  //   },
  //   appliesToType: ['person'],
  //   actions: [{
  //     form: 'infant_child',
  //     modifyContent: function (content, c) {
  //       content.child_consent = extras.hasGivenConsent(c);
  //       content.num_child_visits = extras.countConsentingInfantChildVisits(c);
  //       content.small_baby = extras.isSmallBaby(c);
  //       content.bcg = extras.getBcg(c);
  //       content.bopv0 = extras.getBopv0(c);
  //       content.bopv1 = extras.getBopv1(c);
  //       content.dtp_hepb_hib1 = extras.getDtp_hepb_hib1(c);
  //       content.pcvi1 = extras.getPcvi1(c);
  //       content.rota1 = extras.getRota1(c);
  //       content.bopv2 = extras.getBopv2(c);
  //       content.dtp_hepb_hib2 = extras.getDtp_hepb_hib2(c);
  //       content.pcvi2 = extras.getPcvi2(c);
  //       content.rota2 = extras.getRota2(c);
  //       content.bopv3 = extras.getBopv3(c);
  //       content.dtp_hepb_hib3 = extras.getDtp_hepb_hib3(c);
  //       content.pcvi3 = extras.getPciv3(c);
  //       content.surua_rubella1 = extras.getSurua_rubella1(c);
  //       content.surua_rubella2 = extras.getSurua_rubella2(c);
  //     }
  //   }],
  //   events: [
  //     {
  //       id: 'infant_child_first_visit', days: 0, start: 0, end: 21,
  //     }
  //   ],
  //   resolvedIf: function (c, r, event, dueDate) {
  //     // Resolved if there is a form submitted within the time window
  //     if (extras.isFormSubmittedInWindow(c.reports, 'infant_child',
  //     Utils.addDate(dueDate, -event.start).getTime(),
  //     Utils.addDate(dueDate, event.end + 1).getTime())) {
  //       console.log('Resolving initial infant-child visit task for ', c.contact.name);
  //     }

  //     return extras.isFormSubmittedInWindow(c.reports, 'infant_child',
  //       Utils.addDate(dueDate, -event.start).getTime(),
  //       Utils.addDate(dueDate, event.end + 1).getTime());
  //   },
  // },

  // All infant-child visits, triggered either 
  {
    icon: 'child',
    title: 'task.infant_child',
    appliesTo: 'contacts',
    appliesIf: function (c) {
      // Task applies in one of two conditions:
      //  1. Person is under 5 and has had no infant-child forms submitted at all - this is for the first infant-child visit
      //  2. Person is under 5, has had an infant-child form submitted, and has a positive number of consenting visits.  This person has given consent
      //     and will continue to receive infant-child visits. 
      return ((
        c.contact.parent && 
        c.contact.parent.parent && 
        c.contact.parent.parent.parent && 
        extras.isChildUnder5(c) && 
        extras.countConsentingInfantChildVisits(c) > 0
      ) || (
        c.contact.parent && 
        c.contact.parent.parent && 
        c.contact.parent.parent.parent &&
        extras.isChildUnder5(c) &&
        extras.countReportsSubmitted(c, 'infant_child') === 0
      ));
    },
    appliesToType: ['person'],
    actions: [{
      form: 'infant_child',
      modifyContent: function (content, c) {
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
      // One event for each potential infant-child visit.  Allowed timing spans until relevancy of following visit
      {
        id: 'infant_child_0_2_day_pp_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.day * 1));
        },
        start: (extras.day * 1),
        end: (extras.day * 1)
      },
      {
        id: 'infant_child_3_7_day_pp_visit',
        dueDate: function (event, c) {
          return extras.daysAfterBirth(c, (extras.day * 5));
        },
        start: (extras.day * 2),
        end: (extras.day * 2)
      },
      {
        id: 'infant_child_day_20_week_11_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.week * 4));
        },
        start: (extras.day * 8),
        end: (extras.week * 7) - 1
      }, 
      {
        id: 'infant_child_week_11_week_15_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.week * 11));
        },
        start: 0,
        end: (extras.week * 15) - 1
      }, 
      {
        id: 'infant_child_week_15_month_6_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.week * 16));
        },
        start: (extras.week * 1),
        end: (extras.month * 6) - 1
      }, 
      {
        id: 'infant_child_month_6_month_9_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.week * 26));
        },
        start: (extras.days * 2),
        end: (extras.month * 9) - 1
      }, 
      {
        id: 'infant_child_month_9_month_12_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.week * 42));
        },
        start: (extras.days * 24),
        end: (extras.month * 12) - 1
      }, 
      {
        id: 'infant_child_month_12_month_15_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 13));
        },
        start: (extras.month * 1),
        end: (extras.month * 2) - 1
      }, 
      {
        id: 'infant_child_month_15_month_18_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 16));
        },
        start: (extras.month * 1),
        end: (extras.month * 2) - 1
      }, 
      {
        id: 'infant_child_month_18_month_24_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 20));
        },
        start: (extras.month * 2),
        end: (extras.month * 4) - 1
      },
      {
        id: 'infant_child_year_2_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 24));
        },
        start: 0,
        end: (extras.month * 12) - 1
      },
      {
        id: 'infant_child_year_3_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 39));
        },
        start: (extras.month * 3),
        end: (extras.month * 9) - 1
      },
      {
        id: 'infant_child_year_4_visit',
        dueDate: function(event, c){
          return extras.daysAfterBirth(c, (extras.month * 51));
        },
        start: (extras.month * 3),
        end: (extras.month * 9) - 1
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      // Resolved if there is a form submitted within the time window
      return extras.isFormSubmittedInWindow(c.reports, 'infant_child',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end).getTime());
    },
  }
];
