const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
const path = require('path');
const { peerMentorChecklist } = require('../form-inputs');
const harness = new TestHarness({
    xformFolderPath: path.join(__dirname, '../../forms/app')
});
const chai = require('chai');
chaiDateString = require('chai-date-string');
chai.use(chaiDateString);
const formName = 'peer_mentor_checklist';

describe('Getting started tests', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => { return await harness.clear(); });
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('Test for form existence', async () => {
        await harness.loadForm('peer_mentor_checklist');
        expect(harness.state.pageContent).to.include('id="peer_mentor_checklist"');
    });

    it(`CHV entered incorrect phone number`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.entered_wrong_phone_format);
        //Ensure that there is one error 
        expect(result.errors.length).equals(1);
        //Ensure the phone validation message exists
        expect(result.errors[0].msg).equals("Use the following format 0XXXXXXXXX");
    });

    it(`Should be submitted succesfully when all responses are yes`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_yes_response);
        expect(result.errors).to.be.empty;
    });

    it(`Should be submitted succesfully when all responses are average`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_average_response);
        expect(result.errors).to.be.empty;
    });

    it(`Should be submitted succesfully when all responses are no`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_no_response);
        expect(result.errors).to.be.empty;
    });


    it(`It should not submit the form when any input field is left blank`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_empty_form);
        //Check if there are 18 error messages corresponding to the 17 questions + 1 generic empty form error message 
        expect(result.errors.length).equals(18);
    });
});