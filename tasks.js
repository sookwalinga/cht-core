module.exports = [
  // first infant-child visit
  {
    icon: 'child',
    title: 'task.infant_child',
    appliesTo: 'contacts',
    appliesIf: function(c, r) {
      return isChildUnderFive(c);
    },
    appliesToType: [ 'person' ],
    actions: [{
      form: 'infant_child',
      modifyContent: function(content, c, r) {
        content.child_consent = hasGivenConsent(c);
        content.num_child_visits = countReportsSubmitted(c, 'infant_child');
        content.small_baby = isSmallBaby(c);
      }
    }],
    events: [
      {
        id:'infant_child_first_visit', days:0, start:0, end:300,
      }
    ]
  }
];
