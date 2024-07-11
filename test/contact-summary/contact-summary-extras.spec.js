const {
  isCHWPerformanceThisMonth
} = require('../../contact-summary-extras');
const expect = require('chai').expect;

//Mock data for a CHW
const c1 = {
  "type": "person",
  "name": "Test User",
  "short_name": "",
  "date_of_birth": "1993-04-19",
  "date_of_birth_method": "approx",
  "ephemeral_dob": {
    "age_label": "",
    "age_years": "30",
    "age_months": "",
    "dob_method": "approx",
    "ephemeral_months": "4",
    "ephemeral_years": "1993",
    "dob_approx": "1993-04-19",
    "dob_raw": "1993-04-19",
    "dob_iso": "1993-04-19"
  },
  "phone": "",
  "phone_alternate": "",
  "sex": "male",
  "role": "chw",
  "external_id": "",
  "notes": "",
  "meta": {
    "created_by": "admin",
    "created_by_person_uuid": "",
    "created_by_place_uuid": ""
  },
  "reported_date": 1681895691173,
  "parent": {
    "_id": "e2d6ed93-dc45-4c41-9bc8-64dddb52a21c",
    "parent": { "_id": "498c451e-1f1f-41ef-b5c0-105580da292f" }
  },
  "patient_id": "64684",
  "_id": "f974f632-1490-4da1-b16f-25f79590c53g",
  "_rev": "2-7997d03f2b7bdf8744808589234a3068",
  "muted": false
};

//Mock data for a patient
const c2 = {
  "first_name": "Dylan",
  "middle_name": "Kimani",
  "last_name": "Kimanzi",
  "name": "Dylan Kimani Chimanzee",
  "sex": "male",
  "exact_dob_known": "no",
  "date_of_birth": "1980-01-01",
  "phone": "0712345678",
  "phone_owner": "mine",
  "phone_owner_other": "",
  "alternate_phone": "",
  "is_head_of_household": "yes",
  "meta": {
    "created_by": "test_user",
    "created_by_person_uuid": "f974f632-1490-4da1-b16f-25f79590c50g",
    "created_by_place_uuid": "e2d6ed93-dc45-4c41-9bc8-64dddb52a21b"
  },
  "reported_date": 1683101106615,
  "type": "person",
  "parent": {
    "_id": "c84c3b37-9f39-436f-81cf-14c10e03c637",
    "parent": {
      "_id": "e2d6ed93-dc45-4c41-9bc8-64dddb52a21z",
      "parent": { "_id": "498c451e-1f1f-41ef-b5c0-105580da292f" }
    }
  },
  "patient_id": "30834",
  "_id": "3bb4223d-9205-4a5b-82d8-22d4e2657727",
  "_rev": "2-59f59b6f2a25b6d97949b1f0f15f6824",
  "muted": false
}

//Mock data for an empty contact
const c3 = {};

//Mock data for a CHW's targetDoc
const targetDocument1 = {
  _id: "target~2023-05~f974f632-1490-4da1-25f79590c50c~org.couchdb.user:patient_name",
  owner: "f974f632-1490-4da1-25f79590c50c",
  reporting_period: "2023-05",
  targets: [{ id: "u5-and-pregnant-registrations-this-month", value: { pass: 7, total: 7 }, type: "count", goal: 4 }, { id: "u5-and-pregnant-registrations-last-month", value: { pass: 1, total: 1 }, type: "count", goal: 4 }, { id: "u5-and-anc-visits-last-month", value: { pass: 0, total: 0 }, type: "count", goal: 16 }, { id: "u5-and-anc-visits-this-month", value: { pass: 9, total: 9 }, type: "count", goal: 16 }],
  type: "target",
  user: "org.couchdb.user:patient_name"
};

//Mock data for a user with targetDoc without targets
const targetDocument2 = {
  _id: "target~2023-05~f974f632-1490-4da1-25f79590c50c~org.couchdb.user:patient_name",
  owner: "f974f632-1490-4da1-25f79590c50c",
  reporting_period: "2023-05",
  type: "target",
  user: "org.couchdb.user:patient_name"
};

//For a patient who does not have targets
const targetDocument3 = {};

describe('isCHWPerformanceThisMonth function', function () {

  it('should return length of array as two if chw has a targets property', function () {

    expect(isCHWPerformanceThisMonth(targetDocument1,c1).length).to.eq(2);

  });

  it('should return length of array as zero for user with targetDoc without targets', function () {

    expect(isCHWPerformanceThisMonth(targetDocument2, c2).length).to.eq(2);

  });

  it('should return empty for user without a targetDoc ', function () {

    expect(isCHWPerformanceThisMonth(targetDocument3,c3).length).to.eq(2);
  });

});