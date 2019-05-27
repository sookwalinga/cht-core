module.exports = [

  // P4P: NUMBER OF CLIENTS ENROLLED THIS MONTH 
  {
    id: 'clients-enrolled-this-month',                              
    type: 'count',                                       
    icon: 'icon-people-family',                  
    goal: 2,                                             
    translation_key: 'targets.client_enrolled_this_month.title',         
    subtitle_translation_key: 'targets.this_month.subtitle', 
    date: 'reported',                                            //this month 
    appliesTo: 'contacts',                                  
    appliesToType: 'person',  
    // Exclude CHV count
    appliesIf: function(c) { return c.contact && c.contact.parent && c.contact.parent.parent && c.contact.parent.parent.parent;}
  },

  // P4P: NUMBER OF CHILDREN VISITED - ALL TIME 
  {
    id: 'children-under-5-visited-all-time',                               
    type: 'count',                                       
    icon: 'icon-people-child',                  
    goal: 20,                                                  //TBD                                       
    translation_key: 'targets.children_u5_visited.title',        
    subtitle_translation_key: 'targets.all_time.subtitle', 
    appliesTo: 'reports', 
    appliesIf: function (c) { return extras.isChildUnder5(c); }, //calculates the denominator
    passesIf: function (c) {
      if (!c) {
        return false;
      }
      return extras.getVisitCount(c) > 0; 
    },
    date: 'now'
  }
];
