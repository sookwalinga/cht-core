var extras = require('./contact-summary-extras.js');
module.exports = {
  context: {
    household_head: extras.getContactHouseholdHead(),
    house_number: extras.getContactHouseNumber(),
    kitongoji: extras.getContactHouseKitongoji(),
    phone: extras.getContactPhone(),
    currently_pregnant: extras.currentlyPregnant(),
    n_pregnancy_visits: extras.countPregnancyVisitsForThisPregnancy(),
    show_research_questions: extras.shouldResearchQnsBeShown(),
    n_previous_anc_visits: extras.getRecentANCCountForThisPregnancy(),
    previous_hiv_status: extras.showPMTCT(),
    previous_rchcard_status: extras.showPregnancyEDDEstimation(),
    hide_lmp_or_months_pregnant: extras.hideLastLMPOrEstimatedMonthsPregnant(),
    enabel: extras.isEnrolledInML(), 
    risk_factor_names: extras.getPregnancyRiskFactors(),
    risk_factor_labels: extras.getRiskFactorNames(), 
    risk_factor_labels_swahili:extras.getRiskFactorNamesSwahili(),
    mitigation_list: extras.getMitigationList(),
    high_risk_manual: extras.isHighRiskPregnancy()
  },

  fields: [
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, label: 'contact.age', value: contact.date_of_birth, width: 4, filter: 'age' },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, label: 'contact.sex', value: contact.sex === 'male' ? 'Mwanamme' : 'Mwanamke', width: 4 },
    { appliesToType: 'person', appliesIf: function () { return contact.phone; }, label: 'contact.phone', value: contact.phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && !contact.phone && lineage[1] && lineage[1].parent; }, label: 'contact.phone', value: lineage[0] && lineage[0].contact ? lineage[0].contact.phone : '', width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: function () { return contact.parent && lineage[1]; }, label: 'contact.parent', value: lineage[0], filter: 'lineage' },
    { appliesToType: 'person', appliesIf: function () { return !contact.parent.parent.parent; }, label: 'contact.grandparent', value: lineage[0], filter: 'lineage' },
    { appliesToType: 'person', appliesIf: function () { return (contact.temp_hh_member === 'temporary' && !extras.isContactDeceased() && !extras.isContactMuted());}, label: 'contact.temporary_member', icon: 'moving'},
    { appliesToType: 'person', appliesIf: function () { return (extras.isChildUnder5() && !extras.isContactDeceased() && !extras.isContactMuted()); }, label: 'contact.child_under_5', icon: 'child'},
    { appliesToType: 'person', appliesIf: function () { return (extras.currentlyPregnant() && !extras.isContactDeceased() && !extras.isContactMuted()); }, label: 'contact.is_pregnant', icon: 'pregnancy-1'}
  ],

  cards: [
  ]
};
