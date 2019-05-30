module.exports = {
  context: {
  },

  fields: [
    { appliesToType:'person',  label:'contact.age', value:contact.date_of_birth, width: 4, filter: 'age' },
    { appliesToType:'person',  label:'contact.sex', value:contact.sex, width: 4},
    { appliesToType:'person',  appliesIf:function() { return contact.phone; }, label:'contact.phone', value:contact.phone, width: 4, filter:'phone'},
    { appliesToType:'person',  appliesIf:function() { return contact.parent && !contact.phone && lineage[1] && lineage[1].parent;},label:'contact.phone',value: lineage[0] && lineage[0].contact?lineage[0].contact.phone:'',width: 4,filter:'phone'},
    { appliesToType:'person',  label:'contact.parent', value:lineage, filter: 'lineage' }

  ],

  cards: [
    {
      label: 'contact.profile.cohort',
      appliesTo: 'contacts',
      appliesToType: 'person',
      appliesIf: function(){return true;},
      fields: [
        {
          label: 'contact.profile.isunderfive',
          // FIXME PLEASE REVIEW
          value:  extras.isChildUnder5(contact)?'contact.summary.yes':'contact.summary.no',
          translate: true,
          width: 6,
        }
      ],
    },

    {
      label: 'contact.profile.visit',
      appliesTo:'contacts',
      appliesToType: 'person',
      // FIXME PLEASE REVIEW
      appliesIf: extras.isChildUnder5,
      fields: [
        {
          label: 'contact.profile.visit',
          value: 'contact.profile.visits.of',

          translate: true,
          width: 6,
          context: {
            count: function() { return extras.getVisitCount(reports);},
            total: 4,
          },

        }
      ],
    }
  ]
};
