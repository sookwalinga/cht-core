var isCatchmentInML=require('./catchments.js').isCatchmentInML;
let mitigationSet = new Set(); 
let manual_high_risk = false; 
let riskFactorNames = []; 
let riskFactorSwahiliNames = []; 

module.exports = {

  week: 7,

  isChildUnder5: function () {
    if (contact && contact.date_of_birth) {
      var birthDate = new Date(contact.date_of_birth);
      var ageInMs = new Date(Date.now() - birthDate.getTime());
      var ageInMonths = (Math.abs(ageInMs.getFullYear() - 1970) * 12) + ageInMs.getMonth();
      return ageInMonths < 60;
    }
    return false;
  },

  isEnrolledInML: function(){  
    if(contact && contact.parent && contact.parent.parent && contact.parent.parent.parent)
    { 
     // console.log('inside enrolled ml'); 
      return isCatchmentInML(contact.parent.parent.parent._id); 
    // return true;
    }
   
  },

  getVisitCount: function () {
    var count = [];
    count = reports.filter(function (r) {
      return r.form === 'infant_child';
    });
    return count.length;
  },

  getContactHouseholdHead: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.name) {
        return lineage[0].contact.name;
      }
    }
    return null;
  },

  getContactHouseNumber: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].house_number) {
        return lineage[0].house_number;
      }
    }
    return null;
  },

  getContactHouseKitongoji: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].kitongoji) {
        console.log('inside kitongoji'); 
        return lineage[0].kitongoji;
      }
    }
    return null;
  },

  getContactPhone: function () {
    if (contact && contact.parent && contact.parent.parent && contact.parent.parent.parent) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.phone) {
        return lineage[0].contact.phone;
      }
    }
    return null;
  },

  getPositiveConsentingPregnancyRegistrations: function () {
    var positiveConsentingPregnancyRegistrations = [];
    positiveConsentingPregnancyRegistrations = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent === 'yes';
    });
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function () {
    var deliveryOutcomes = [];
    var earlyTerminations = [];
    deliveryOutcomes = reports.filter(function (r) {
      return r.form === 'pregnancy_outcomes' &&
        r.fields &&
        r.fields.confirm_delivery &&
        r.fields.confirm_delivery.pregnancy_outcome &&
        ((r.fields.confirm_delivery.pregnancy_outcome === 'did_deliver') ||
        (r.fields.confirm_delivery.pregnancy_outcome === 'miscarriage_or_stillbirth'));
    });
    earlyTerminations = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.visit_introduction &&
        r.fields.visit_introduction.viable_pregnancy &&
        r.fields.visit_introduction.viable_pregnancy === 'no';
    });
    return deliveryOutcomes.length + earlyTerminations.length;
  },

  currentlyPregnant: function () {
    if (this.getPositiveConsentingPregnancyRegistrations() > this.getPregnancyOutcomes()) {
      return true;
    }
    else {
      return false;
    }
  },

  getMostRecentReport: function (filteredReports, form) {
    var result = null;
    filteredReports.forEach(function (r) {
      if (form === r.form &&
        !r.deleted &&
        (!result || r.reported_date > result.reported_date)) {
        result = r;
      }
    });
    return result;
  },

  getMostRecentPregnancyConsentDate: function () {
    var reportedDate = '';
    var reportsFound = [];
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.fields &&
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent &&
        r.fields.pregnancy_consent.consent === 'yes';
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      reportedDate = report.reported_date;
    }
    return reportedDate;
  },

  countTotalVisitsThisPregnancy: function () {
    return this.countPregnancyVisitsForThisPregnancy() + this.countPostpartumVisitsForThisPregnancy();
  },

  countPregnancyVisitsForThisPregnancy: function () {
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        ((r.fields.pregnancy_consent && r.fields.pregnancy_consent.consent &&
          r.fields.pregnancy_consent.consent === 'yes') ||
          (r.fields.visit_introduction &&
            r.fields.visit_introduction.has_given_birth &&
            r.fields.visit_introduction.has_given_birth === 'no'));
    });
    return reportsFound.length;
  },

  countPostpartumVisitsForThisPregnancy: function () {
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'postpartum' &&
        r.reported_date >= recentConsentReportDate;
    });
    return reportsFound.length;
  },

  shouldResearchQnsBeShown: function () {
    var totalVisitsThisPregnancy = this.countTotalVisitsThisPregnancy();
    if (totalVisitsThisPregnancy === 1)
      return true;
    return false;

  },

  getRecentANCCountForThisPregnancy: function () {
    var ancCount = 0;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.anc_screening_and_counseling &&
        r.fields.anc_screening_and_counseling.num_anc_visits;
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      ancCount = report.fields.anc_screening_and_counseling.num_anc_visits;
    }
    return ancCount;
  },
  
  showPMTCT: function () {
    var previous_hiv_status = false;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.pmtct &&
        r.fields.pmtct.hiv_status;
    });
    if (reportsFound.length > 0) {
      var report = this.getMostRecentReport(reportsFound, 'pregnancy');
      if (report.fields.pmtct.hiv_status === 'hiv_positive') {
        previous_hiv_status = true;
      }
    }
    return previous_hiv_status;
  },

  showPregnancyEDDEstimation: function () {
    var previousRchCard = false;
    var reportsFound = [];
    var recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return r.form === 'pregnancy' &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.rch_card &&
        r.fields.rch_card.is_rch_card_available === 'yes' &&
        r.fields.rch_card.is_delivery_date_written === 'yes';
    });
    if (reportsFound.length > 0) {
      previousRchCard = true;
    }
    return previousRchCard;
  },

  getRecentPregnancyReport: function () {
    var report = '';
    var reportsFound = [];
    var recentReportDate = this.getMostRecentPregnancyConsentDate();
    if (recentReportDate !== '') {
      reportsFound = reports.filter(function (r) {
        return r.form === 'pregnancy' &&
          r.reported_date >= recentReportDate;
      });
    }
    if (reportsFound.length > 0) {
      report = this.getMostRecentReport(reportsFound, 'pregnancy');
    }
    return report;
  },

  hideLastLMPOrEstimatedMonthsPregnant: function () {
    var report = this.getRecentPregnancyReport();
    if (report && report.fields &&
      report.fields.rch_card &&
      report.fields.rch_card.is_rch_card_available &&
      ((report.fields.rch_card.is_rch_card_available === 'no') ||
        (report.fields.rch_card.is_rch_card_available === 'yes' &&
          report.fields.rch_card.is_delivery_date_written && report.fields.rch_card.is_delivery_date_written === 'no'))) {
      return true;
    }
    return false;
  },

  isContactDeceased: function () {
    var isDeceased = false;
    if (contact && contact.date_of_death) {
      isDeceased = true;
    }
    return isDeceased;
  },

  isContactMuted: function () {
    var isMuted = false;
    if (contact && contact.muted) {
      isMuted = true;
    }
    return isMuted;
  },


  getPregnancyRiskFactors: function(){ 
      var report = this.getRecentPregnancyReport();
      var riskFactors = []; 
      if (report && report.fields && report.fields.pregnant_woman_information)
      {
        if(report.fields.pregnant_woman_information.previous_pregnancies > 5)
          riskFactors.push('previous_pregnancies');
          riskFactorNames.push('Previous Pregnancies'); 
          riskFactorSwahiliNames.push('Kupata mimba zaidi ya mara 5'); 
        if(report.fields.pregnant_woman_information.previous_delivery_by_c_section === 'yes') 
        { 
          riskFactors.push('previous_delivery_by_c_section'); 
          riskFactorNames.push('Previous Delivery by C-Section'); 
          riskFactorSwahiliNames.push('Kujifungua kwa kupasuliwa'); 
          mitigationSet.add('facility_delivery'); 
        }
        
        if(report.fields.pregnant_woman_information.previous_delivery_by_vacuum === 'yes'){ 
          riskFactors.push('previous_delivery_by_vacuum'); 
          riskFactorNames.push('Previous Delivery by Vacuum');
          riskFactorSwahiliNames.push('Kujifungua kwa kusaidiwa kuvutwa na mashine'); 
          mitigationSet.add('facility_delivery'); 
        }
          
        if(report.fields.pregnant_woman_information.previous_stillbirth === 'yes'){ 
          riskFactors.push('previous_stillbirth');
          riskFactorNames.push('Previous stillbirth');
          riskFactorSwahiliNames.push('Kupoteza mtoto wakati wa kujifungua'); 
          mitigationSet.add('facility_delivery'); 
        }
          
       if(report.fields.pregnant_woman_information.local_herbs === 'yes'){ 
        riskFactors.push('local_herbs');
        riskFactorNames.push('Use of local herbs');
        riskFactorSwahiliNames.push('Kutumia dawa za mitishamba'); 
        mitigationSet.add('local_herb_risks');
       }
          
       if(report.fields.pregnant_woman_information.ten_or_more_years === 'yes'){ 
        riskFactors.push('ten_or_more_years');
        riskFactorNames.push('Last pregnancy 10 or more years ago');
        riskFactorSwahiliNames.push('Mimba iliyopita ilikuwa miaka kumi ilopita au zaidi'); 
        mitigationSet.add('facility_delivery'); 
       }
         
        if(report.fields.pregnant_woman_information.delivery_complications)
        { 
          var deliveryComplications = (report.fields.pregnant_woman_information.delivery_complications).toString(); 
          var hasProlongedLabor = deliveryComplications.includes('prolonged_labor'); 
          var hasPerinealTear =  deliveryComplications.includes('large_perineal_tear'); 
          var hasRetainedPlacenta = deliveryComplications.includes('retained_placenta'); 
          var hasAPH = deliveryComplications.includes('aph'); 
          var hasPostpartumHemorrage = deliveryComplications.includes('postpartum_hemorrage'); 
          var hasEnclampsia = deliveryComplications.includes('enclampsia'); 
          var hasBigBaby = deliveryComplications.includes('big_baby'); 
          if(hasProlongedLabor){ 
            riskFactors.push('prolonged_labor');
            riskFactorNames.push('Prolonged labor (12 hours or more)');
            riskFactorSwahiliNames.push('Uchungu wa muda mrefu( Zaidi ya masaa 12)'); 
            mitigationSet.add('facility_delivery');
          }
            
          if(hasPerinealTear){ 
            riskFactors.push('large_perineal_tear');
            riskFactorNames.push('Large perineal tear (close to anus)');
            riskFactorSwahiliNames.push('Previous PregnanciesKuchanika njia ya uzazi(karibia ya njia ya choo kikubwa)'); 
            mitigationSet.add('facility_delivery');
          } 
            
          if(hasRetainedPlacenta){ 
            riskFactors.push('retained_placenta');
            riskFactorNames.push('Retained placenta');
            riskFactorSwahiliNames.push('Kondo la nyuma kukataa kutoka'); 
            mitigationSet.add('facility_delivery');
          }
          
          if(hasAPH){
            riskFactors.push('aph'); 
            riskFactorNames.push('APH');
            riskFactorSwahiliNames.push('Kutokwa na damu nyingi kabla ya kujifungua'); 
            mitigationSet.add('facility_delivery');
          }
           
          if(hasPostpartumHemorrage){ 
            riskFactors.push('postpartum_hemorrage');
            riskFactorNames.push('Postpartum hemorrhage');
            riskFactorSwahiliNames.push('Kutokwa damu nyingi baada ya kujifungua'); 
            mitigationSet.add('facility_delivery');
          }
             
          if(hasEnclampsia){
            riskFactors.push('enclampsia'); 
            riskFactorNames.push('Eclampsia');
            riskFactorSwahiliNames.push('Kifafa cha mimba'); 
            mitigationSet.add('facility_delivery');
          }
            
          if(hasBigBaby){ 
            riskFactors.push('big_baby');
            riskFactorNames.push('Big baby in previous or current (more than 4 kg)'); 
            riskFactorSwahiliNames.push('Kujifungua mtoto mkubwa ( zaidi ya kilo 4) (mimba hii au kabla)'); 
            mitigationSet.add('facility_delivery');
          }
        }

        if(report.fields.pregnant_woman_information.previous_miscarriages > 0){ 
          riskFactors.push('previous_miscarriages');
          riskFactorNames.push('Miscarriage/abortion'); 
          riskFactorSwahiliNames.push('Mimba kuharibika'); 
          mitigationSet.add('rest'); 
          mitigationSet.add('balanced_diet'); 
          mitigationSet.add('family_planning'); 
          mitigationSet.add('no_heavy_work'); 
        }
         
      } 
      if(report && report.fields && report.fields.rch_card) 
      { 
        if(report.fields.rch_card.multiple_pregnancy === 'yes'){ 
          riskFactors.push('multiple_pregnancy');
          riskFactorNames.push('Multiple pregnancy'); 
          riskFactorSwahiliNames.push('Kutarajia kuwa na mapacha'); 
          mitigationSet.add('rest'); 
          mitigationSet.add('balanced_diet'); 
          mitigationSet.add('no_heavy_work'); 
        }
          
        if(report.fields.rch_card.malpresentation === 'yes'){ 
          riskFactors.push('malpresentation');
          riskFactorNames.push('Malpresentation');
          riskFactorSwahiliNames.push(''); 
          mitigationSet.add('facility_delivery'); 
        }
          
        if(report.fields.rch_card.breech_position === 'yes'){ 
          riskFactors.push('breech_position'); 
          riskFactorNames.push('Breech position');
          riskFactorSwahiliNames.push('Mtoto kutanguliza makalio'); 
          mitigationSet.add('facility_delivery');
        }
         
        if(report.fields.rch_card.big_baby === 'yes'){ 
          riskFactors.push('big_baby'); 
          riskFactorNames.push('Big baby in previous or current (more than 4 kg)');
          riskFactorSwahiliNames.push('Big baby in previous or current (more than 4 kg)'); 
          mitigationSet.add('facility_delivery');
        }
          
        if(report.fields.rch_card.higher_facility_delivery === 'yes'){ 
          riskFactors.push('higher_facility_delivery');
          riskFactorNames.push('Has been advised to deliver at higher-level facility');
          riskFactorSwahiliNames.push('Kushauriwa kujifungua katika kituo cha afya kikubwa'); 
          mitigationSet.add('facility_delivery');
        }

        if(report.fields.rch_card.medical_condition) 
        { 
          var medicalCondition = (report.fields.rch_card.medical_condition).toString(); 
          var hasDiabetes = medicalCondition.includes('diabetes'); 
          var hasSickleCell = medicalCondition.includes('sickle_cell'); 
          var hasHighBloodPressure = medicalCondition.includes('high_blood_pressure');
          var hasCardiacDisease = medicalCondition.includes('cardiac_disease');

          if(hasDiabetes) 
          { 
            riskFactors.push('diabetes');
            riskFactorNames.push('Diabetes');
            riskFactorSwahiliNames.push('Kisukari'); 
            mitigationSet.add('anc_visits');
          }
          if(hasSickleCell) 
          { 
            riskFactors.push('sickle_cell');
            riskFactorNames.push('Sickle Cell');
            riskFactorSwahiliNames.push('Seli Mundu'); 
            mitigationSet.add('anc_visits');
          }
          if(hasHighBloodPressure) 
          { 
            riskFactors.push('high_blood_pressure');
            riskFactorNames.push('High Blood Pressure');
            riskFactorSwahiliNames.push('Shinikizo la damu'); 
            mitigationSet.add('anc_visits');
          }
          if(hasCardiacDisease) 
          { 
            riskFactors.push('cardiac_disease'); 
            riskFactorNames.push('Cardiac Disease');
            riskFactorSwahiliNames.push('maradhi ya moyo'); 
            mitigationSet.add('anc_visits'); 
          }
        }
         
      }     

      if(report && report.fields && report.fields.maternal_nutrition) 
      { 
          if(report.fields.maternal_nutrition.nutrition_restrictions === 'yes'){ 
            riskFactors.push('nutrition_restrictions');
            riskFactorNames.push('Follows nutrition restrictions');
            riskFactorSwahiliNames.push('Kuepuka kula baadhi ya vyakula'); 
            mitigationSet.add('balanced_diet');
          }
          if(report.fields.maternal_nutrition.anemia_tablets === 'no'){ 
            riskFactors.push('anemia');
            riskFactorNames.push('Anemia');
            riskFactorSwahiliNames.push('Upungufu wa damu'); 
            mitigationSet.add('balanced_diet');
          }
      } 

      if(report && report.fields && report.fields.facility_delivery_importance && 
        report && report.fields && 
        report.fields.facility_delivery_importance.allow_partner_to_deliver_facility === 'no'){ 
          mitigationSet.add('facility_delivery');
          riskFactors.push('allow_partner_to_deliver_facility');
          riskFactorSwahiliNames.push('Kujifungulia kituo cha afya'); 
        }
       if(riskFactors.length >= 1) 
         manual_high_risk = true; 
       return riskFactors; 
  }, 

  isHighRiskPregnancy: function(){   
   console.log('Manual high risk is ' + manual_high_risk); 
   return manual_high_risk; 
  },

  getMitigationList: function(){ 
    return [...mitigationSet].join(' '); 
  },

  getRiskFactorNames: function(){ 
    return riskFactorNames.join(', '); 
  },

  getRiskFactorNamesSwahili: function(){ 
    return riskFactorSwahiliNames.join(', '); 
  },
  getMitigationListLength: function(){ 
    return mitigationSet.size;
  }
};
