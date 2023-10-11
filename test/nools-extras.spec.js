const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const chai = require('chai');
const extras = require('../nools-extras');
const path = require('path');
const harness = new TestHarness();


describe('Testing isClient function', () => {
    const contact = Object.assign({}, harness.content); 
    let missingFirstLevelParent = JSON.parse(JSON.stringify(contact)); 
    delete missingFirstLevelParent.contact.parent;
    let missingSecondLevelParent = JSON.parse(JSON.stringify(contact)); 
    delete missingSecondLevelParent.contact.parent.parent;
    let missingThirdlevelParent = JSON.parse(JSON.stringify(contact)); 
    delete missingThirdlevelParent.contact.parent.parent.parent;
    it('Should return true if contact has great grand parent', async () => {
        expect(extras.isClient(contact)).to.eq(true);
    });
    const desc = ['null', 'missingFirstLevelParent','missingSecondLevelParent','missingThirdlevelParent'];
    [null, missingFirstLevelParent,missingSecondLevelParent, missingThirdlevelParent]
        .forEach((d, i) => {
            it(`Should return false if document is ${desc[i]}`, async () => {
                expect(extras.isClient(d)).to.eq(false);
            });
        });
});

describe('Testing isChildUnder5 years function', () => {
    let ageLessThan60Months = JSON.parse(JSON.stringify(harness.content));  
    ageLessThan60Months.contact.date_of_birth = new Date(); 

    let ageGreaterThan60Months = JSON.parse(JSON.stringify(harness.content)); 
    let date = new Date();
    date.setMonth(date.getMonth() - 61);
    ageGreaterThan60Months.contact.date_of_birth = date;

    let ageEqualTo60Months =  JSON.parse(JSON.stringify(harness.content)); 
    date = new Date();
    date.setMonth(date.getMonth() - 60);
    ageEqualTo60Months.contact.date_of_birth = date;

    let noBirthDate = JSON.parse(JSON.stringify(harness.content)); 
    delete noBirthDate.contact.date_of_birth;
    let emptyContact = {"contact": {}}; 

    it('Should return true for age < 60 months', async () => {
        const ageLessThan60Months = Object.assign({}, harness.content);
        ageLessThan60Months.contact.date_of_birth = new Date();
        expect(extras.isChildUnder5(ageLessThan60Months)).to.eq(true);
    });
    const desc= ['ageEqualTo60Months','noBirthDate','ageLessThan60Months','emptyContact','null']; 
    [ageEqualTo60Months,noBirthDate,ageGreaterThan60Months,emptyContact,null].forEach((d,i) => { 
        it(`Should return false if document  has ${desc[i]}`, async () => {
            expect(extras.isChildUnder5(d)).to.eq(false);
        });
    });
});

describe('Testing isChildUnder20Days function', () => {
    let ageLessThan20Days = JSON.parse(JSON.stringify(harness.content));  
    ageLessThan20Days.contact.date_of_birth = new Date(); 

    let ageGreaterThan20Days = JSON.parse(JSON.stringify(harness.content)); 
    let date = new Date();
    date.setDate(date.getDate() - 21);
    ageGreaterThan20Days.contact.date_of_birth = date;

    let ageEqualTo20Days =  JSON.parse(JSON.stringify(harness.content)); 
    date = new Date();
    date.setDate(date.getDate() - 20);
    ageEqualTo20Days.contact.date_of_birth = date;

    let noBirthDate = JSON.parse(JSON.stringify(harness.content)); 
    delete noBirthDate.contact.date_of_birth;
    let emptyContact = {"contact": {}}; 

    it('Should return true for age < 20 days', async () => {
        const ageLessThan20Days = JSON.parse(JSON.stringify(harness.content));
        ageLessThan20Days.contact.date_of_birth = new Date();
        expect(extras.isChildUnder20Days(ageLessThan20Days)).to.eq(true);
    });
    const desc= ['ageEqualTo20Days','noBirthDate','ageGreaterThan20Days','emptyContact','null']; 
    [ageEqualTo20Days,noBirthDate,ageGreaterThan20Days,emptyContact,null].forEach((d,i) => { 
        it(`Should return false if document ${desc[i]}`, async () => {
            expect(extras.isChildUnder20Days(d)).to.eq(false);
        });
    });
});

describe('Testing isChildInWindow3Or4 function', () => {
    let ageLessThan20Days = JSON.parse(JSON.stringify(harness.content));  
    ageLessThan20Days.contact.date_of_birth = new Date(); 

    let ageGreaterThan20Days = JSON.parse(JSON.stringify(harness.content)); 
    let date = new Date();
    date.setDate(date.getDate() - 21);
    ageGreaterThan20Days.contact.date_of_birth = date;

    let ageEqualTo20Days =  JSON.parse(JSON.stringify(harness.content)); 
    date = new Date();
    date.setDate(date.getDate() - 20);
    ageEqualTo20Days.contact.date_of_birth = date;

    let noBirthDate = JSON.parse(JSON.stringify(harness.content)); 
    delete noBirthDate.contact.date_of_birth;
    let emptyContact = {"contact": {}};
     
    let ageLessThan15Weeks = JSON.parse(JSON.stringify(harness.content));  
    date = new Date();
    date.setDate(date.getDate() - 104);
    ageLessThan15Weeks.contact.date_of_birth = date;

    let ageGreaterThan15Weeks = JSON.parse(JSON.stringify(harness.content)); 
    date = new Date();
    date.setDate(date.getDate() - 106);
    ageGreaterThan15Weeks.contact.date_of_birth = date;

    let ageEqualTo15Weeks = JSON.parse(JSON.stringify(harness.content)); 
    date = new Date();
    date.setDate(date.getDate() - 105);
    ageEqualTo15Weeks.contact.date_of_birth = date;
    

    var desc= ['ageEqualTo20Days','ageGreaterThan20Days','ageLessThan15Weeks']; 
    [ageEqualTo20Days,ageGreaterThan20Days,ageLessThan15Weeks].forEach((d,i) => { 
        it(`Should return true if document ${desc[i]}`, async () => {
            expect(extras.isChildInWindow3Or4(d)).to.eq(true);
        });
    });

    desc= ['ageLessThan20Days','ageEqualTo15Weeks','ageGreaterThan15Weeks','noBirthDate','emptyContact','null']; 
    [ageLessThan20Days,ageEqualTo15Weeks,ageGreaterThan15Weeks,noBirthDate,emptyContact,null].forEach((d,i) => { 
        it(`Should return false if document ${desc[i]}`, async () => {
            expect(extras.isChildInWindow3Or4(d)).to.eq(false);
        });
    });
});

describe('Testing isChildInWindow5Plus function', () => {   
        const ageEqualTo15Weeks =  JSON.parse(JSON.stringify(harness.content)); 
        let date = new Date();
        date.setDate(date.getDate() - 105);
        ageEqualTo15Weeks.contact.date_of_birth = date;
     
        const ageGreaterThan15Weeks =  JSON.parse(JSON.stringify(harness.content)); 
        date = new Date();
        date.setDate(date.getDate() - 106);
        ageGreaterThan15Weeks.contact.date_of_birth = date;
       
        const ageLessThan15Weeks = JSON.parse(JSON.stringify(harness.content));
        date = new Date();
        date.setDate(date.getDate() - 104);
        ageLessThan15Weeks.contact.date_of_birth = date;

        let noBirthDate = JSON.parse(JSON.stringify(harness.content)); 
        delete noBirthDate.contact.date_of_birth;
        let emptyContact = {"contact": {}}; 

    var desc= ['ageEqualTo15Weeks','ageGreaterThan15Weeks']; 
    [ageEqualTo15Weeks,ageGreaterThan15Weeks].forEach((d,i) => { 
        it(`Should return false if document ${desc[i]}`, async () => {
            expect(extras.isChildInWindow5Plus(d)).to.eq(true);
        });
    });

    desc= ['ageLessThan15Weeks','noBirthDate','emptyContact','null']; 
    [ageLessThan15Weeks,noBirthDate,emptyContact,null].forEach((d,i) => { 
        it(`Should return false if document ${desc[i]}`, async () => {
            expect(extras.isChildInWindow5Plus(d)).to.eq(false);
        });
    });
}); 

describe('Testing countReportSubmitted function', () => {
    it('Should return 1 when form is found', async () => {
        let contact = {reports: [{
                    form: 'pregnancy',
                    reported_date: 0,
                    fields: {}
                }]};
        expect(extras.countReportsSubmitted(contact, 'pregnancy')).to.eq(1);
    });

    it('Should return 0 when no forms found', async () => {
        let contact = {reports: [{
                    form: 'infant-child',
                    reported_date: 0,
                    fields: {}
                }]};
        expect(extras.countReportsSubmitted(contact, 'pregnancy')).to.eq(0);
    });

    it('Should return false when contact has no reports', async () => {
        let contact = {
        };
        expect(extras.countReportsSubmitted(contact, 'pregnancy')).to.eq(0);
    });

    it('Should return 0 when contact does not exist', async () => {
        expect(extras.countReportsSubmitted(null, 'pregnancy')).to.eq(0);
    });
});