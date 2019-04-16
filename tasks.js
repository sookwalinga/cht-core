[
  {
    icon: 'family',
    title: 'task.family_survey.title',
    appliesTo: 'contacts',
    appliesToType: [ 'clinic' ],
    actions: [ { form:'family_survey' } ],
    events: [ {
      id: 'family-survey',
      days:0, start:0, end:14,
    } ],
    resolvedIf: function(c, r, event, dueDate) {
      // Resolved if there a family survey received in time window
      return isFormFromArraySubmittedInWindow(c.reports, 'family_survey',
                 Utils.addDate(dueDate, -event.start).getTime(),
                 Utils.addDate(dueDate,  event.end+1).getTime());
    },
  }
]
