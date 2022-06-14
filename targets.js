var extras = require('./nools-extras.js');
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
    appliesToType: ['infant_child', 'pregnancy','postpartum','pregnancy_outcomes'],
    idType: 'report',
    appliesIf: function (c, r) {
      switch (r && r.form) {
        case 'infant_child': return extras.get(r, 'fields.consent.child_consent_today') === 'yes' ||
          extras.get(r, 'fields.consent')===undefined;
        case 'pregnancy': return extras.get(r, 'fields.pregnancy_consent.consent') === 'yes' ||
          extras.get(r, 'fields.pregnancy_consent')===undefined;
        case 'postpartum': return true;
        case 'pregnancy_outcomes': return true;
        default: return false;
      }
    },
    date: 'reported'
  }
];
