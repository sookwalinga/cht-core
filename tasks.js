[
  // first infant-child visit
  // FIXME add translation key 'task.infant_child'
  {
    icon: 'child',
    title: [ {locale: 'en', content: 'Infant-Child visit'} ],
    appliesTo: 'contacts',
    appliesIf: function(c) {
      console.log("Logging from tasks ...", c);
      return isChildUnder5(c);
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
  }
]
