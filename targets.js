module.exports = [

  // General: Total under 5 registrations this month + pregnant women registration this month
  {
    id: 'u5-and-pregnant-registrations-this-month',
    translation_key: 'targets.u5-and-pregnant-women-registration.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 4,
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (c) {    
     return extras.consentingVisitsThisMonth(c,'infant_child') || extras.consentingVisitsThisMonth(c,'pregnancy');
    }
  },

   // General: Total under 5 visits this month + Pregnancy Visits this month
   {
    id: 'u5-and-anc-visits-this-month',
    translation_key: 'targets.u5-and-pregnant-women-visits.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 16,
    appliesTo: 'reports',
    appliesToType: ['infant_child'],
    idType: 'report',  //counts multiple reports per contact
    appliesIf: function (c) {    
     return extras.isFormSubmittedThisMonth(c,'infant_child') || extras.isFormSubmittedThisMonth(c,'pregnancy'); 
    }
  }
];
