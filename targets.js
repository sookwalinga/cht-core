var targets = [

// CHILDREN UNDER FIVE - ALL TIME 
  {
    id: 'children-under-5',                              // just create random but relevant id 
    type: 'count',                                       // either count or percentage 
    icon: 'icon-people-child',                  // Got it from the medic/icon-library 
    goal: 100,                                            // if no goals - set to -1, else set to a positive integer 
    translation_key: 'targets.children_u5.title',        // Got thisfrom the eng translations file (medic-webapp/config/standard/translations) 
    subtitle_translation_key: 'targets.all_time.subtitle',// Same as above
    date: 'now',                                          // Now means all time count. 
    appliesTo: 'contacts',                                  // Whether your target is associated with reports or contacts
    appliesToType: 'person' , // The type of contact for which this target is relevant. This is not a mandatory field but it is what displays
                             // the count. Without this field, the count remains as zero. 
     appliesIf: isAgeUnderFive
  },

  // CHILDREN UNDER FIVE WITH ATLEAST ONE VISIT- THIS MONTH
  {
    id: 'children-under-5-this-month',                              // just create random but relevant id 
    type: 'percent',                                       // either count or percent
    icon: 'icon-people-child',                  // Got it from the medic/icon-library 
    goal: 20,                                            // if no goals - set to -1, else set to a positive integer 
    translation_key: 'targets.children_u5_visited.title',        // Got thisfrom the eng translations file (medic-webapp/config/standard/translations) 
    subtitle_translation_key: 'targets.this_month.subtitle',// Same as above
    date: 'now',                                          // Now means all time count. 
    appliesTo: 'contacts',                                 // Whether your target is associated with reports or contacts
    appliesToType: 'person',  // The type of contact for which this target is relevant. This is not a mandatory field but it is what displays
                             // the count. Without this field, the count remains as zero. 
    appliesIf: function(c){return isAgeUnderFive(c);}, //calculates the denominator 
    passesIf: function(c){    //calculates the numerator 
    	
    		var date = new Date(); 
    		var thisMonth = date.getMonth(); 
    		var thisYear = date.getYear(); 
    		
    		var contactDate = new Date(c.contact.reported_date); 
    		
    		return (contactDate.getMonth() === thisMonth && contactDate.getYear() === thisYear && getVisitCount(c)>0);
    			    	   
    }
  },
  
  
  //PERCENT OF UNDER ONES VISITED TWICE OR MORE THIS MONTH 
   {
    id: 'under5-visitedtwiceormore-thismonth',                              // just create random but relevant id 
    type: 'percent',                                       // either count or percent
    icon: 'icon-people-child',                  // Got it from the medic/icon-library 
    goal: 20,                                            // if no goals - set to -1, else set to a positive integer 
    translation_key: 'targets.children_u1.multivisit',        // Got thisfrom the eng translations file (medic-webapp/config/standard/translations) 
    subtitle_translation_key: 'targets.this_month.subtitle',// Same as above
    date: 'now',                                          // Now means all time count. 
    appliesTo: 'contacts',                                 // Whether your target is associated with reports or contacts
    appliesToType: 'person',  // The type of contact for which this target is relevant. This is not a mandatory field but it is what displays
                             // the count. Without this field, the count remains as zero. 
    appliesIf: function(){//console.log("Inside appliesIf"); 
    return isAgeUnderOneAndVisited(c);} , //calculates the denominator 
    passesIf: function(c){    //calculates the numerator (visit >2 this month)
    	
    		var date = new Date(); 
    		var thisMonth = date.getMonth(); 
    		var thisYear = date.getYear(); 
    		
    		var contactDate = new Date(c.contact.reported_date); 
    		console.log("Skukuuu"); 
    		return (contactDate.getMonth() === thisMonth && contactDate.getYear() === thisYear && getVisitCount(c) >=2);
    			    	   
    }
  },
  
  //COUNT OF BIRTH AT HOME (INFANT_CHILD FORM)
  {
    id: 'children-born-at-home',                              // just create random but relevant id 
    type: 'count',                                       // either count or percentage 
    icon: 'icon-people-child',                  // Got it from the medic/icon-library 
    goal: 100,                                            // if no goals - set to -1, else set to a positive integer 
    translation_key: 'targets.born.athome',        // Got thisfrom the eng translations file (medic-webapp/config/standard/translations) 
    subtitle_translation_key: 'targets.all_time.subtitle',// Same as above
    date: 'now',                                          // Now means all time count. 
    appliesTo: 'reports',                                  // Whether your target is associated with reports or contacts
    appliesToType: 'infant_child' , // The type of contact for which this target is relevant. This is not a mandatory field but it is what displays
                             // the count. Without this field, the count remains as zero. 
     appliesIf: function(c, r){return c.contact && c.contact._id && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.delivery_location ==="at_home";}
  }



];
