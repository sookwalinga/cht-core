const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
const path = require('path');
const { peerMentorChecklist } = require('../form-inputs');
const harness = new TestHarness({
    xformFolderPath: path.join(__dirname, '../../forms/app'),
    logFormErrors: false
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

    it(`Should be submitted succesfully when all responses are yes`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_yes_response);
        expect(result.errors).to.be.empty;
    });

    it(`Should be submitted succesfully when all responses are average`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_average_response);
        expect(result.errors).to.be.empty;
    });

    it(`Should display the reason text field for each option when response is NO and form should get submitted succesfully`, async () => {
        var result = await harness.fillForm(formName, ...peerMentorChecklist.fill_form_with_no_response);
        expect(result.errors).to.be.empty;
    });

    it(`Should not be submitted when CHV enters incorrect phone number`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.entered_wrong_phone_format);
        //Ensure that there is one error 
        expect(result.errors.length).equals(1);
        //Ensure the phone validation message exists
        expect(result.errors[0].msg).equals("Use the following format 0XXXXXXXXX");
    });

    it(`Should not be submitted when CHV enters invalid names and shehia`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.less_than_two_characters);
        //Ensure that there are four errors 
        expect(result.errors.length).equals(4);
        //Ensure the name validation messages exist
        expect(result.errors[0].msg).equals("Enter a first name");
        expect(result.errors[1].msg).equals("Enter a middle name");
        expect(result.errors[2].msg).equals("Enter a last name");
        expect(result.errors[3].msg).equals("Enter the shehia");
    });

    it(`Should not be submittted if all the options in the multi-select list are chosen`, async () => {
        var result = await harness.fillForm(formName, ...peerMentorChecklist.select_all_multiselect_options);
        //Ensure that there is one error 
        expect(result.errors.length).equals(1);
        //Ensure the validation messages exists
        expect(result.errors[0].msg).equals("Cannot select \"No support needed\" and another option.");
    });

    it(`Should not be submittted if any input field is left blank`, async () => {
        const result = await harness.fillForm(formName, ...peerMentorChecklist.fill_empty_form);
        //Check if there are 19 error messages corresponding to the 19 questions + 1 generic empty form error message 
        expect(result.errors.length).equals(20);
    });
});