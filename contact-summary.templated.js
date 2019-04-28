
context= {
     count_under_five_visits: 6,     
     current_year: 2019,
     greeting: 'Hello World!'
                                                         
  };

  fields= [
    { appliesToType:'person',  label:'contact.age', value:contact.date_of_birth, width: 4, filter: 'age' },
    { appliesToType:'person',  label:'contact.sex', value:contact.sex, width: 4},
    { appliesToType:'person',  label:'contact.phone', value:contact.phone, width: 4, filter:'phone'},
    { appliesToType:'person',  label:'contact.parent', value:lineage, filter: 'lineage' }
     
  ];

  cards= [
    {
      label: 'contact.profile.cohort',
      appliesTo: 'contacts',
      appliesToType: 'person',            
      appliesIf: function(){return true;}, 
      fields: [
      {
          label: 'contact.profile.isunderfive',
          value:  isChildUnder5(contact)?'contact.summary.yes':'contact.summary.no',   
          translate: true,    
          width: 6,            
        }
         
      ],
     
    },
    
    {
      label: 'contact.profile.visit',
      appliesTo:'contacts',
     appliesToType: 'person',              
      appliesIf: isAgeUnderFive,    
      fields: [
      {
          label: 'contact.profile.visit',
          value: 'contact.profile.visits.of',
          
          translate: true,    
          width: 6,            
           context: {
            count: function() { return  getVisitCount(reports);},
            total: 4,
          },
          
        }
      ],
     
    }
  ];
