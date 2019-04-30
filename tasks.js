[
  // first infant-child visit
  // FIXME add translation key 'task.infant_child'
  {
    icon: 'child',
    title: [ {locale: 'en', content: 'Infant-Child visit'} ],
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from tasks ...", c);
      return c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent && isChildUnder5(c);
    },
    appliesToType: [ 'person' ],
    actions: [{
      form: 'infant_child',
      modifyContent: function(c, content) {
        content.child_consent = hasGivenConsent(c);
        content.num_child_visits = countReportsSubmitted(c, 'infant_child');
        content.small_baby = isSmallBaby(c);
        content.bcg = getBcg(c);
        content.bopv0 = getBopv0(c);
        content.bopv1 = getBopv1(c);
        content.dtp_hepb_hib1 = getDtp_hepb_hib1(c);
        content.pcvi1 = getPcvi1(c);
        content.rota1 = getRota1(c);
        content.bopv2 = getBopv2(c);
        content.dtp_hepb_hib2 = getDtp_hepb_hib2(c);
        content.pcvi2 = getPcvi2(c);
        content.rota2 = getRota2(c);
        content.bopv3 = getBopv3(c);
        content.dtp_hepb_hib3 = getDtp_hepb_hib3(c);
        content.pcvi3 = getPciv3(c);
        content.surua_rubella1 = getSurua_rubella1(c);
        content.surua_rubella2 = getSurua_rubella2(c);
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
  }
]
