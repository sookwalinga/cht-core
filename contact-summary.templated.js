module.exports = {
  context: {
  },

  fields: [
    { appliesToType:'person', appliesIf:function() { return contact.parent && lineage[1];},  label:'contact.age', value:contact.date_of_birth, width: 4, filter: 'age' },
    { appliesToType:'person', appliesIf:function() { return contact.parent && lineage[1];}, label:'contact.sex', value:contact.sex === 'male'?'Mwanamme':'Mwanamke', width: 4},
    { appliesToType:'person',  appliesIf:function() { return contact.phone; }, label:'contact.phone', value:contact.phone, width: 4, filter:'phone'},
    { appliesToType:'person',  appliesIf:function() { return contact.parent && !contact.phone && lineage[1] && lineage[1].parent;},label:'contact.phone',value: lineage[0] && lineage[0].contact?lineage[0].contact.phone:'',width: 4,filter:'phone'},
    { appliesToType:'person', appliesIf:function() { return contact.parent && lineage[1];} , label:'contact.parent', value:lineage[0], filter: 'lineage' },
    { appliesToType:'person',appliesIf: function() { return !contact.parent.parent.parent;}, label:'contact.grandparent', value:lineage[0], filter: 'lineage' }
  ],

  cards: [
  ]
};
