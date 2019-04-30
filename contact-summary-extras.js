
function isAgeUnderFive() {
console.log(contact); 

    var oneDay = 24 * 60 * 60 * 1000;
    
    var today = new Date();
   
    var birthDate = new Date(contact.date_of_birth);
  
    var ageInYears =  Math.round(Math.abs((today - birthDate)/ (oneDay * 7 * 52)));
   
   if(ageInYears < 5) 
     return true; 
     
  return false; 
} 

function getVisitCount() { 
console.debug(reports); 

    var count = []; 
    
    count = reports.filter(function(r){
    
         return r.form === "infant_child";
                			
    });
    
    return count.length; 
    }	
