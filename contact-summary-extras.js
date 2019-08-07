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
  },

  getContactHouseholdHead: function() {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.name) {
        return lineage[0].contact.name;
      }
    }
    return null;
  },

  getContactHouseNumber: function() {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].house_number) {
        return lineage[0].house_number;
      }
    }
    return null;
  },

  getContactHouseKitongoji: function() {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].kitongoji) {
        return lineage[0].kitongoji;
      }
    }
    return null;
  },

  getContactPhone: function() {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.phone) {
        return lineage[0].contact.phone;
      }
    }
    return null;
  },

  getPositiveConsentingPregnancyRegistrations: function() {
    var positiveConsentingPregnancyRegistrations = [];
    positiveConsentingPregnancyRegistrations = reports.filter(function(r) {
      return r.form === 'pregnancy' &&
             r.form.fields &&
             r.form.fields.pregnancy_form &&
             r.form.fields.pregnancy_form.consent === 'yes';
    });
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function() {
    var deliveryOutcomes = [];
    var earlyTerminations = [];
    deliveryOutcomes = reports.filter(function(r) {
      return r.form === 'delivery_outcomes' &&
             r.form.fields &&
             r.form.fields.confirm_delivery &&
             (r.form.fields.confirm_delivery.did_deliver === 'yes' ||
             r.form.fields.confirm_delivery.pregnancy_viable === 'no');
    });
    earlyTerminations = reports.filter(function(r) {
      return r.form === 'pregnancy' &&
             r.form.fields &&
             r.form.fields.visit_introduction &&
             r.form.fields.visit_introduction.viable_pregnancy === 'no';
    });
    return deliveryOutcomes.length + earlyTerminations.length;
  },

  currentlyPregnant: function() {
    if (this.getPositiveConsentingPregnancyRegistrations() > this.getPregnancyOutcomes()) {
      return true;
    }
    else {
      return false;
    }
  },
};
