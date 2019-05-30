module.exports = [
   // HOUSEHOLD REGISTERED ALL TIME 
   {
    id: 'households-registered-all-time',                              
    type: 'count',                                       
    icon: 'medic-clinic',                  
    goal: -1,                                             
    translation_key: 'targets.households_registered_all_time.title',         
    date: 'now',                                            
    appliesTo: 'contacts',                                  
    appliesToType: 'clinic',  
    appliesIf: function(c) { return c.contact && c.contact.parent && c.contact.parent.parent;}
  },

   // HOUSEHOLD REGISTERED THIS MONTH 
   {
    id: 'households-registered-this-month',                              
    type: 'count',                                       
    icon: 'medic-clinic',                  
    goal: -1,                                             
    translation_key: 'targets.households_registered_this_month.title',          
    date: 'reported',                                            
    appliesTo: 'contacts',                                  
    appliesToType: 'clinic',  
    appliesIf: function(c) { return c.contact && c.contact.parent && c.contact.parent.parent;}
  },

   // CHILDREN UNDER FIVE REGISTERED ALL TIME
  {
    id: 'children-under-5-all-time',                             
    type: 'count',                                        
    icon: 'child',                   
    goal: -1,                                            
    translation_key: 'targets.children_u5_all_time.title',         
    date: 'now',                                         
    appliesTo: 'contacts',                                   
    appliesToType: 'person', 
    appliesIf: extras.isChildUnder5
  },

    // CHILDREN UNDER FIVE REGISTERED THIS MONTH
    {
      id: 'children-under-5-this-month',                             
      type: 'count',                                        
      icon: 'child',                   
      goal: -1,                                            
      translation_key: 'targets.children_u5_this_month.title',         
      date: 'reported',                                         
      appliesTo: 'contacts',                                   
      appliesToType: 'person', 
      appliesIf: extras.isChildUnder5
    },
 
];
