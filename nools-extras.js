// HH: I copied this from a medic example
// This was identical to the ones in nootils, but now `form` can be an array, and can count for number of forms in the window. This needs to be ported to nootils.
function isFormSubmittedInWindow(reports, form, start, end, count) {
  var result = false;
  var reportsFound = 0;
  reports.forEach(function(r) {
    if (!result && form.indexOf(r.form) >= 0) {
      if (r.reported_date >= start && r.reported_date <= end) {
        reportsFound++;
        if (!count ||
            (r.fields && r.fields.follow_up_count > count) ||
            (reportsFound >= count) ) {
          result = true;
        }
      }
    }
  });
  return result;
}

function isChildUnder5(c) {
  if(c.contact && c.contact.date_of_birth) {
    var birthDate = new Date(c.contact.date_of_birth);
    var ageInMs = new Date(now - birthDate.getTime());
    var ageInMonths = Math.round(ageInMs / (1000*60*60*24*30)); //Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
    return ageInMonths < 60;
  }
  return false;
}

function countReportsSubmitted(c, form) {
  var reportsFound = [];
  if(c && c.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === form;
    });
    return reportsFound.length;
  }
  return 0;
}

function hasGivenConsent(c) {
  var consent = '';
  var reportsFound = [];
  if(c && c.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.consent && r.fields.consent.child_consent_today !== '';
    });
    if(reportsFound.length > 0){
      var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
      consent = report.fields.consent.child_consent_today;
    }
  }
  return consent;
}

function isSmallBaby(c) {
  var small;
  var reportsFound = [];
  if(c && c.reports) {
    reportsFound = c.reports.filter(function(r) {
      return r.form === 'infant_child' && r.fields && r.fields.first_visit_6_months && r.fields.first_visit_6_months.small_baby_today !== '';
    });
    if(reportsFound.length > 0){
      var report = Utils.getMostRecentReport(reportsFound, 'infant_child');
      small = report.fields.first_visit_6_months.small_baby_today;
    }
  }
  return small;
}

function isAgeUnderFive(c) {
    var oneDay = 24 * 60 * 60 * 1000;   
    var today = new Date();
    var birthDate = new Date(c.contact.date_of_birth);
    var ageInYears =  Math.round(Math.abs((today - birthDate)/ (oneDay * 7 * 52)));
   if(ageInYears < 5) 
     return true;   
  return false; 
} 

function isAgeUnderOne(c) {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds 
    var today = new Date();
    var birthDate = new Date(c.contact.date_of_birth);
    var ageInYears =  Math.round((today - birthDate)/ (oneDay * 7* 52));
   if(ageInYears < 1) {
   console.log("Inside ageInYrs < 1"); 
     return true; 
     }     
  return false; 
} 


function getVisitCount(r) { 
    var count = [];     
    count = r.reports.filter(function(r){  
         return r.form === "infant_child";              			
    });
    return count.length; 	
}

function isAgeUnderOneAndVisited(c)
{    
     return isAgeUnderOne(c) && getVisitCount(c) > 0; 
}
