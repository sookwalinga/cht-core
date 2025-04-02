/* eslint-disable */
const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth();
const CURRENT_YEAR = NOW.getFullYear();

// Defining tarrif amounts
const tariffs = [
  { min: 2000, max: 2999, cost: 410 },
  { min: 3000, max: 3999, cost: 615 },
  { min: 4000, max: 4999, cost: 680 },
  { min: 5000, max: 6999, cost: 1010 },
  { min: 7000, max: 9999, cost: 1070 },
  { min: 10000, max: 14999, cost: 1578 },
  { min: 15000, max: 19999, cost: 1693 },
  { min: 20000, max: 29999, cost: 2233 },
  { min: 30000, max: 39999, cost: 2289 },
  { min: 40000, max: 49999, cost: 2949 },
  { min: 50000, max: 99999, cost: 3518 },
];

//Defining metrics for P4P metrics
function get(obj, field,defaultValue) {
  return obj && field && field.split('.')
    .reduce((a, b) => a && a[b]||defaultValue, obj);
}

module.exports = {
  week: 7,

  isMonthName: function (NOW) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonthName = months[NOW.getMonth()];
    let previousMonthName = months[NOW.getMonth()-1];
    if (CURRENT_MONTH === 0){
      previousMonthName = 'December';
    }
    return [currentMonthName, previousMonthName];
  },

  isCHVInProject: function (projectName) {
    return (
      projectName &&
      [contact, ...lineage]
        .map((l) => l && l.contact)
        .some(
          (c) =>
            c &&
            c.projects &&
            c.parent &&
            c.parent.parent &&
            !c.parent.parent.parent &&
            c.projects.includes(projectName)
        )
    );
  },

  isClientReportedDead: function () {
    return reports.filter((r) => r.form === "death_report").length > 0;
  },

   getAgeInMonths: function () {
    if (contact && contact.date_of_birth) {
      const birthDate = new Date(contact.date_of_birth);
      const ageInMs = new Date(Date.now() - birthDate.getTime());
      return Math.abs(ageInMs.getFullYear() - 1970) * 12 + ageInMs.getMonth();
    }
  },

  isChildUnder5: function () {
    const ageInMonths = this.getAgeInMonths(); 
    return ageInMonths !== null && ageInMonths < 60;
  },

  isChildAbove5: function () {
    const ageInMonths = this.getAgeInMonths(); 
    return ageInMonths !== null && ageInMonths > 60;
  },

  isChildBelow10: function () {
    const ageInMonths = this.getAgeInMonths(); 
    return ageInMonths !== null && ageInMonths < 120;
  },

  isActiveHouseholdMember: function(){
    return get(contact,'parent.parent.parent') &&
        contact.type === 'person' &&
        !contact.date_of_death &&
        !contact.muted;
  },

  isClientAdult: function(){
    const yearInMs = 365.25 * 24 * 60 * 60 * 1000;
    return (
      contact &&
      contact.date_of_birth &&
      new Date().getTime() - new Date(contact.date_of_birth).getTime() >=
        9 * yearInMs
    );
  },

  isContactRetired: function () {
    return lineage[0] && lineage[0].contact && lineage[0].contact.retired;
  },

  getVisitCount: function () {
    let count = [];
    count = reports.filter(function (r) {
      return r.form === "infant_child";
    });
    return count.length;
  },

  getQualityMonitoringCount: function () {
    return reports.filter((r) => r.form === "chv_quality_monitoring").length;
  },

  getContactHouseholdHead: function () {
    if (
      contact &&
      contact.parent &&
      contact.parent.parent &&
      contact.parent.parent.parent
    ) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.name) {
        return lineage[0].contact.name;
      }
    }
    return null;
  },

  getContactHouseNumber: function () {
    if (
      contact &&
      contact.parent &&
      contact.parent.parent &&
      contact.parent.parent.parent
    ) {
      if (lineage[0] && lineage[0].house_number) {
        return lineage[0].house_number;
      }
    }
    return null;
  },

  getContactHouseKitongoji: function () {
    if (
      contact &&
      contact.parent &&
      contact.parent.parent &&
      contact.parent.parent.parent
    ) {
      if (lineage[0] && lineage[0].kitongoji) {
        return lineage[0].kitongoji;
      }
    }
    return null;
  },

  getContactPhone: function () {
    if (
      contact &&
      contact.parent &&
      contact.parent.parent &&
      contact.parent.parent.parent
    ) {
      if (lineage[0] && lineage[0].contact && lineage[0].contact.phone) {
        return lineage[0].contact.phone;
      }
    }
    return null;
  },

  isParentHealthCenter: function () {
    return lineage[0] && lineage[0].type === "health_center";
  },

  getPositiveConsentingPregnancyRegistrations: function () {
    let positiveConsentingPregnancyRegistrations = [];
    positiveConsentingPregnancyRegistrations = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.fields &&
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent === "yes"
      );
    });
    return positiveConsentingPregnancyRegistrations.length;
  },

  getPregnancyOutcomes: function () {
    let deliveryOutcomes = [];
    let earlyTerminations = [];
    deliveryOutcomes = reports.filter(function (r) {
      return (
        r.form === "pregnancy_outcomes" &&
        r.fields &&
        r.fields.confirm_delivery &&
        r.fields.confirm_delivery.pregnancy_outcome &&
        (r.fields.confirm_delivery.pregnancy_outcome === "did_deliver" ||
          r.fields.confirm_delivery.pregnancy_outcome ===
            "miscarriage_or_stillbirth")
      );
    });
    earlyTerminations = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.fields &&
        r.fields.visit_introduction &&
        r.fields.visit_introduction.viable_pregnancy &&
        r.fields.visit_introduction.viable_pregnancy === "no"
      );
    });
    return deliveryOutcomes.length + earlyTerminations.length;
  },

  currentlyPregnant: function () {
    if (
      this.getPositiveConsentingPregnancyRegistrations() >
      this.getPregnancyOutcomes()
    ) {
      return true;
    } else {
      return false;
    }
  },

  getMostRecentReport: function (filteredReports, form) {
    let result = null;
    filteredReports.forEach(function (r) {
      if (
        form === r.form &&
        !r.deleted &&
        (!result || r.reported_date > result.reported_date)
      ) {
        result = r;
      }
    });
    return result;
  },

  getMostRecentPregnancyConsentDate: function () {
    let reportedDate = "";
    let reportsFound = [];
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.fields &&
        r.fields.pregnancy_consent &&
        r.fields.pregnancy_consent.consent &&
        r.fields.pregnancy_consent.consent === "yes"
      );
    });
    if (reportsFound.length > 0) {
      const report = this.getMostRecentReport(reportsFound, "pregnancy");
      reportedDate = report.reported_date;
    }
    return reportedDate;
  },

  countTotalVisitsThisPregnancy: function () {
    return (
      this.countPregnancyVisitsForThisPregnancy() +
      this.countPostpartumVisitsForThisPregnancy()
    );
  },

  countPregnancyVisitsForThisPregnancy: function () {
    let reportsFound = [];
    const recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        ((r.fields.pregnancy_consent &&
          r.fields.pregnancy_consent.consent &&
          r.fields.pregnancy_consent.consent === "yes") ||
          (r.fields.visit_introduction &&
            r.fields.visit_introduction.has_given_birth &&
            r.fields.visit_introduction.has_given_birth === "no"))
      );
    });
    return reportsFound.length;
  },

  countPostpartumVisitsForThisPregnancy: function () {
    let reportsFound = [];
    const recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "postpartum" && r.reported_date >= recentConsentReportDate
      );
    });
    return reportsFound.length;
  },

  shouldResearchQnsBeShown: function () {
    const totalVisitsThisPregnancy = this.countTotalVisitsThisPregnancy();
    if (totalVisitsThisPregnancy === 1) {
      return true;
    }
    return false;
  },

  getRecentANCCountForThisPregnancy: function () {
    let ancCount = 0;
    let reportsFound = [];
    const recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.anc_screening_and_counseling &&
        r.fields.anc_screening_and_counseling.num_anc_visits
      );
    });
    if (reportsFound.length > 0) {
      const report = this.getMostRecentReport(reportsFound, "pregnancy");
      ancCount = report.fields.anc_screening_and_counseling.num_anc_visits;
    }
    return ancCount;
  },

  getLastReportOfType: function (count, type) {
    return (
      reports &&
      count &&
      reports
        .filter((r) => type.includes(r.form))
        .sort((a, b) =>
          a.reported_date > b.reported_date
            ? -1
            : a.reported_date < b.reported_date
            ? 1
            : 0
        )
        .slice(0, 1)
    );
  },

  getLatestMonthlyMeetingDate: function () {
    return this.getLastReportOfType(1, "chw_monthly_meeting").map((r) => {
      const d = new Date(r.reported_date);
      return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    });
  },

  getLatestMonthlyMeetingTopic: function () {
    return this.getLastReportOfType(1, "chw_monthly_meeting").map((r) =>
      get(r, "fields.meeting_details.topics")
    );
  },

  getLatestMonthlyMeetingAbsentees: function () {
    return this.getLastReportOfType(1, "chw_monthly_meeting")
      .map((r) =>
        get(r, "fields.meeting_details.absent_chvs", []).map((d) => d.name)
      )
      .join(",");
    // .map(r => {
    //     return r &&
    //            r.fields &&
    //            r.fields.meeting_details &&
    //            r.fields.meeting_details.absent_chvs &&
    //            r.fields.meeting_details.absent_chvs.map(d=>d.name);
    // }).join(',');
  },

  showPMTCT: function () {
    let previous_hiv_status = false;
    let reportsFound = [];
    const recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.pmtct &&
        r.fields.pmtct.hiv_status
      );
    });
    if (reportsFound.length > 0) {
      const report = this.getMostRecentReport(reportsFound, "pregnancy");
      if (report.fields.pmtct.hiv_status === "hiv_positive") {
        previous_hiv_status = true;
      }
    }
    return previous_hiv_status;
  },

  showPregnancyEDDEstimation: function () {
    let previousRchCard = false;
    let reportsFound = [];
    const recentConsentReportDate = this.getMostRecentPregnancyConsentDate();
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "pregnancy" &&
        r.reported_date >= recentConsentReportDate &&
        r.fields &&
        r.fields.rch_card &&
        r.fields.rch_card.is_rch_card_available === "yes" &&
        r.fields.rch_card.is_delivery_date_written === "yes"
      );
    });
    if (reportsFound.length > 0) {
      previousRchCard = true;
    }
    return previousRchCard;
  },

  getRecentPregnancyReport: function () {
    let report = "";
    let reportsFound = [];
    const recentReportDate = this.getMostRecentPregnancyConsentDate();
    if (recentReportDate !== "") {
      reportsFound = reports.filter(function (r) {
        return r.form === "pregnancy" && r.reported_date >= recentReportDate;
      });
    }
    if (reportsFound.length > 0) {
      report = this.getMostRecentReport(reportsFound, "pregnancy");
    }
    return report;
  },

  hideLastLMPOrEstimatedMonthsPregnant: function () {
    const report = this.getRecentPregnancyReport();
    if (
      report &&
      report.fields &&
      report.fields.rch_card &&
      report.fields.rch_card.is_rch_card_available &&
      (report.fields.rch_card.is_rch_card_available === "no" ||
        (report.fields.rch_card.is_rch_card_available === "yes" &&
          report.fields.rch_card.is_delivery_date_written &&
          report.fields.rch_card.is_delivery_date_written === "no"))
    ) {
      return true;
    }
    return false;
  },

  isContactDeceased: function () {
    let isDeceased = false;
    if (contact && contact.date_of_death) {
      isDeceased = true;
    }
    return isDeceased;
  },

  isContactMuted: function () {
    let isMuted = false;
    if (contact && contact.muted) {
      isMuted = true;
    }
    return isMuted;
  },

  isFormSubmittedThisMonth: function (formName) {
    return this.getReportsThisMonth(reports, formName).length > 0;
  },

  CURRENT_MONTH: CURRENT_MONTH,
  CURRENT_YEAR: CURRENT_YEAR,
  getNewestReport: function (reports, form) {
    let newestReport;
    let currentReport;
    for (let i = 0; i < reports.length; i++) {
      currentReport = reports[i];
      if (!newestReport && currentReport.form === form) {
        newestReport = currentReport;
        continue;
      }
      if (
        currentReport.form === form &&
        newestReport.reported_date < currentReport.reported_date
      ) {
        newestReport = currentReport;
      }
    }
    return newestReport;
  },
  getReportsThisMonth: function (reports, forms) {
    return reports.filter(
      (r) =>
        forms.includes(r.form) &&
        new Date().toISOString().slice(0, 7) ===
          new Date(r.reported_date).toISOString().slice(0, 7)
    );
  },
  getMonthlyMeetingsThisMonth: function (reports, forms) {
    return this.getReportsThisMonth(reports, forms).filter(
      (r) => get(r, "fields.planned_meeting.meeting_option") === "now"
    );
  },
  //Finding number of registrations and visits last month
  isCHWPerformanceLastMonth(targetDoc, contact) {
    if (
      ((contact.type === "person" && contact.role === "chw") ||
        (contact.type === "person" && contact.role === "chv")) &&
      !!targetDoc
    ) {
      const target_in_array = targetDoc.targets;
      let enrolled_u5_pregnant_women_last_month = 0;
      let visited_u5_pregnant_women_last_month = 0;

      // Find the enrollment target for u5 and pregnant registrations last month
      const enrollment_target = target_in_array.find(
        (u) => u.id === "u5-and-pregnant-registrations-last-month"
      );
      if (enrollment_target !== undefined) {
        enrolled_u5_pregnant_women_last_month = enrollment_target.value.pass;
      }

      // Find the visit target for u5 and ANC visits last month
      const visit_target = target_in_array.find(
        (u) => u.id === "u5-and-anc-visits-last-month"
      );
      if (visit_target !== undefined) {
        visited_u5_pregnant_women_last_month = visit_target.value.pass;
      }

      return [
        enrolled_u5_pregnant_women_last_month,
        visited_u5_pregnant_women_last_month,
      ];
    }
    return [0, 0]; // Return 0 for both values if conditions are not met
  },
  // Finding number of registrations and visits this month
  isCHWPerformanceThisMonth(targetDoc, contact) {
    if (
      ((contact.type === "person" && contact.role === "chw") ||
        (contact.type === "person" && contact.role === "chv")) &&
      !!targetDoc
    ) {
      const target_in_array = targetDoc.targets;
      let enrolled_u5_pregnant_women_this_month = 0;
      let visited_u5_pregnant_women_this_month = 0;

      // Find the enrollment target for u5 and pregnant registrations this month
      const enrollment_target = target_in_array.find(
        (u) => u.id === "u5-and-pregnant-registrations-this-month"
      );
      if (enrollment_target !== undefined) {
        enrolled_u5_pregnant_women_this_month = enrollment_target.value.pass;
      }

      // Find the visit target for u5 and ANC visits this month
      const visit_target = target_in_array.find(
        (u) => u.id === "u5-and-anc-visits-this-month"
      );
      if (visit_target !== undefined) {
        visited_u5_pregnant_women_this_month = visit_target.value.pass;
      }

      return [
        enrolled_u5_pregnant_women_this_month,
        visited_u5_pregnant_women_this_month,
      ];
    }
    return [0, 0]; // Return 0 for both values if conditions are not met
  },
  // Getting payment for registering pregnant mothers who consent to receiving consequent services
  getCHWEnrollmentPay(answer) {
    if (answer.length !== 0) {
      const enrollment_pay_multiplier = 2500;
      const exact_enrollment_number = answer[0];
      if (exact_enrollment_number <= 3) {
        const enrollment_pay =
          exact_enrollment_number * enrollment_pay_multiplier;
        return enrollment_pay;
      } else {
        const enrollment_pay = 10000;
        return enrollment_pay;
      }
    }
    return 0;
  },
  getCHWVisitPay(answer) {
    if (answer.length !== 0) {
      const exact_visit_number = answer[1];
      const actual_visit_number = exact_visit_number;
      if (actual_visit_number >= 16) {
        const visit_pay = 35000;
        return visit_pay;
      } else if (actual_visit_number >= 12 && actual_visit_number <= 15) {
        const visit_pay = 20000;
        return visit_pay;
      } else if (actual_visit_number >= 5 && actual_visit_number <= 11) {
        const visit_pay = 10000;
        return visit_pay;
      } else {
        const visit_pay = 0;
        return visit_pay;
      }
    }
    return 0;
  },
  // Calculating Supervisor performance for last month
  isSupervisorPerformanceLastMonth(targetDoc) {
    if (
      contact.type === "person" &&
      contact.role === "supervisor" &&
      !!targetDoc
    ) {
      const target_in_array_for_supervisor = targetDoc.targets;
      const monthly_meetings_full_details_last_month =
        target_in_array_for_supervisor.find(
          (u) => u.id === "monthly-meetings-last-month"
        ).value;
      const quality_monitoring_full_details_last_month =
        target_in_array_for_supervisor.find(
          (u) => u.id === "quality-monitoring-last-month"
        ).value;
      const sup_monthly_meetings_last_month =
        monthly_meetings_full_details_last_month.pass;
      const sup_quality_monitoring_last_month =
        quality_monitoring_full_details_last_month.pass;
      return [
        sup_monthly_meetings_last_month,
        sup_quality_monitoring_last_month,
      ];
    }
    return [];
  },
  // Calculating Supervisor performance for this month
  isSupervisorPerformanceThisMonth(targetDoc) {
    if (
      contact.type === "person" &&
      contact.role === "supervisor" &&
      !!targetDoc
    ) {
      const target_in_array_for_supervisor = targetDoc.targets;
      const monthly_meetings_full_details_this_month =
        target_in_array_for_supervisor.find(
          (u) => u.id === "monthly-meetings-this-month"
        ).value;
      const quality_monitoring_full_details_this_month =
        target_in_array_for_supervisor.find(
          (u) => u.id === "quality-monitoring-this-month"
        ).value;
      const sup_monthly_meetings_this_month =
        monthly_meetings_full_details_this_month.pass;
      const sup_quality_monitoring_this_month =
        quality_monitoring_full_details_this_month.pass;
      return [
        sup_monthly_meetings_this_month,
        sup_quality_monitoring_this_month,
      ];
    }
    return [];
  },
  getSupervisorMeetingPay(this_sup_month_performance_metrics) {
    if (this_sup_month_performance_metrics.length !== 0) {
      const supervisor_monthly_meeting = this_sup_month_performance_metrics[0];
      if (supervisor_monthly_meeting > 0) {
        const supervisor_monthly_meeting_pay = 10000;
        return supervisor_monthly_meeting_pay;
      } else {
        const supervisor_monthly_meeting_pay = 0;
        return supervisor_monthly_meeting_pay;
      }
    }
    return 0;
  },
  getSupervisorVisitingPay(this_sup_month_performance_metrics) {
    if (this_sup_month_performance_metrics.length !== 0) {
      const supervisor_quality_monitoring =
        this_sup_month_performance_metrics[1];
      if (supervisor_quality_monitoring > 0) {
        const supervisor_quality_monitoring_pay = 10000;
        return supervisor_quality_monitoring_pay;
      } else {
        const supervisor_quality_monitoring_pay = 0;
        return supervisor_quality_monitoring_pay;
      }
    }
    return 0;
  },
  //Calculate tarrifs to be added to payment amount

  getTarrifCost(paymentAmount) {
    for (const tariff of tariffs) {
      if (paymentAmount >= tariff.min && paymentAmount <= tariff.max) {
        return tariff.cost;
      }
    }
    return 0; // or some default value if the amount doesn't match any range
  },

  getTBTreatmentStartDate: function () {
    let treatment_start_date = null;
    let reportsFound = [];

    reportsFound = reports.filter(function (r) {
      return (
        r.form === "first_treatment_followup" &&
        r.fields &&
        r.fields.first_followup &&
        r.fields.first_followup.treatment_start_date
      );
    });
    console.log("Reports found length", reportsFound.length);
    if (reportsFound.length > 0) {
      const report = this.getMostRecentReport(
        reportsFound,
        "first_treatment_followup"
      );
      treatment_start_date = report.fields.first_followup.treatment_start_date;
    }
    console.log("Treatment start date", treatment_start_date);
    return treatment_start_date;
  },

  getTBTreatmentEndDate: function () {
    let treatment_end_date = null;
    let reportsFound = [];
    reportsFound = reports.filter(function (r) {
      return (
        r.form === "first_treatment_followup" &&
        r.fields &&
        r.fields.first_followup &&
        r.fields.first_followup.treatment_end_date
      );
    });
    if (reportsFound.length > 0) {
      console.log("Inside reports found > 0");
      const report = this.getMostRecentReport(
        reportsFound,
        "first_treatment_followup"
      );
      treatment_end_date = report.fields.first_followup.treatment_end_date;
    }
    return treatment_end_date;
  },

  // If within 6 months and there is no tb investigation submitted with referral and submitted tb result
  //followup with either no tb or incomplete referral or submitted tb outcome
  //then can show tb investigation. Otherwise have to wait until after 6 months.
  shouldShowTBInvestigationForm: function () {
    let lookBackPeriod = Date.now() - 30 * 24 * 60 * 60 * 1000 * 6; // 6 months period
    let filteredReports = reports.filter(
      (r) =>
        r.form === "tb_investigation" &&
        r.fields.refer_tb_client === "1" &&
        r.reported_date > lookBackPeriod
    );
    let report = this.getMostRecentReport(filteredReports, "tb_investigation");
    console.log('show tb investigation?',
   
        filteredReports.length === 0 ||
        reports.some((r) => {
          return (
            ((r.form === "result_follow_up" &&
              get(r, "fields.tb_sample_results") &&
              (r.fields.tb_sample_results.includes("no_tb") ||
                r.fields.tb_sample_results.includes("incomplete_referral"))) ||
              r.form === "treatment_outcome") &&
            r.reported_date >= report.reported_date
          );
        })
      );
    
    return (
      filteredReports.length === 0 ||
      reports.some((r) => {
        return (
          ((r.form === "result_follow_up" &&
            get(r, "fields.tb_sample_results") &&
            (r.fields.tb_sample_results.includes("no_tb") ||
              r.fields.tb_sample_results.includes("incomplete_referral"))) ||
            r.form === "treatment_outcome") &&
          r.reported_date >= report.reported_date
        );
      })
    );
  },

  //Show if there is a result followup with positive result within 6 months and no treatment
  //outcome form submitted within 6 months ot there is one but submitted beyond 6 months period
  shouldShowTBTreatmentOutcomeForm: function () {
    let lookBackPeriod = Date.now() - 30 * 24 * 60 * 60 * 1000 * 6; // 6 months period

    let recentTreatmentOutcome = this.getMostRecentReport(
      reports,
      "treatment_outcome"
    );

    let filteredReports = reports.filter(
      (r) =>
        (r.form === "result_follow_up" &&
          (r.fields.tb_sample_results.includes("tb_in_sputum") ||
        r.fields.tb_sample_results.includes("tb_in_other_areas"))
    ));
  
    let recentResultFollowup = this.getMostRecentReport(
      filteredReports,
      "result_follow_up"
    );

    console.log('Recent result followup is ', recentResultFollowup);

    return  (
      (!recentTreatmentOutcome || recentTreatmentOutcome.reported_date <= lookBackPeriod) &&
      (recentResultFollowup &&  recentResultFollowup.reported_date >= lookBackPeriod)
    );
  },

  //get a most recent first treatment followup form whose treatment end date is within 200 days from today
  //and see if a there is second treatment followup form submitted within that period
  //if there is, return false else show the second treatment
  shouldShowSecondTreatmentFollowupForm: function () {
    let lookBackPeriod = Date.now() - 200 * 24 * 60 * 60 * 1000; // 200 days
    console.log("lookbackperiod", lookBackPeriod);
    let filteredReports = reports.filter(
      (r) =>
        r.form === "first_treatment_followup" &&
        new Date(r.fields.first_followup.treatment_start_date).getTime() >=
          lookBackPeriod
    );

    let report = this.getMostRecentReport(
      filteredReports,
      "first_treatment_followup"
    );

    return (
      filteredReports.length > 0 &&
      !reports.some(
        (r) =>
          r.form === "second_treatment_followup" &&
          r.reported_date >=
            new Date(
              report.fields.first_followup.treatment_start_date
            ).getTime() &&
          r.reported_date <=
            new Date(report.fields.first_followup.treatment_end_date).getTime()
      )
    );
  },

  //Show defaulter tracing if there is first treatment followup submitted within past month and no 
  //defaulter tracing form submitted within that period or submitted but later than one month
  shouldShowDefaulterTracingForm: function(){ 
    let lookBackPeriod = Date.now() - 30 * 24 * 60 * 60 * 1000; // 1 month period
    let recentFirstTreatmentFollowup = this.getMostRecentReport(
      reports,
      "first_treatment_followup"
    );
  
    let recentDefaulterTracing = this.getMostRecentReport(
      reports,
      "defaulter_tracing"
    );
     
    console.log('RecentFirstTrmtFollowup',recentFirstTreatmentFollowup); 
    console.log('RecentDefaulterTracing',recentDefaulterTracing); 
    console.log('Should show defaulter tracing?',
      (recentFirstTreatmentFollowup && recentFirstTreatmentFollowup.reported_date >= lookBackPeriod) &&
      (!recentDefaulterTracing ||  recentDefaulterTracing.reported_date < lookBackPeriod)
    );
    return (
      recentFirstTreatmentFollowup!=null && recentFirstTreatmentFollowup.reported_date >= lookBackPeriod &&
      (!recentDefaulterTracing ||  recentDefaulterTracing.reported_date < lookBackPeriod)
    );
  }, 
  countHouseholdMembers:function() {
    console.log('Inside countHousheoldMembers',contact); 
    
    if (contact && contact.type === 'clinic') {
      console.log('Inside if statement', contact); 

        return contact.number_hh_members;
    }
    return 0; // Return 0 if no members are found
}
  
};