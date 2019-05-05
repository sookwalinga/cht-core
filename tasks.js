module.exports = [
  // first infant-child visit
  // FIXME add translation key 'task.infant_child'
  {
    icon: 'child',
    title: [ {locale: 'en', content: 'Infant-Child visit'} ],
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from tasks ...", c);
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
      return extras.isFormSubmittedInWindow(c.reports, 'infant_child',
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
