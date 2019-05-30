module.exports = {
  isChildUnder5: function () {
    if(contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },
  
  
  getVisitCount: function() {
    var count = [];
    count = reports.filter(function(r){
      return r.form === "infant_child";
    });
    return count.length;
  }
};
