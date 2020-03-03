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

   // General: Total under 5 visits this month + Pregnancy Visits this month.  No credit for visits that result in denial of consent
   {
    id: 'u5-and-anc-visits-this-month',
    translation_key: 'targets.u5-and-pregnant-women-visits.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    type: 'count',
    icon: 'icon-people-person-general',
    goal: 16,
    appliesTo: 'reports',
    appliesToType: ['infant_child', 'pregnancy'],
    appliesIf: function (c, r) {
      if (r.form && r.form === 'infant_child') {
        if (r.fields && ((r.fields.consent && r.fields.consent.child_consent_today && r.fields.consent.child_consent_today === 'yes') || !r.fields.consent)) {
          return true;
        } 
      }
      else if (r.form && r.form === 'pregnancy') {
        if (r.fields && ((r.fields.pregnancy_consent && r.fields.pregnancy_consent.consent && r.fields.pregnancy_consent.consent === 'yes') || !r.fields.pregnancy_consent)) {
          return true;
        } 
      }
      return false;
    },
    date: 'reported'
  }
];
