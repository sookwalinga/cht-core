const _ = require('lodash');
const assert = require('chai').assert;
const NootilsManager = require('medic-nootils/src/node/test-wrapper');
const now = NootilsManager.BASE_DATE;
const generate = require('../test/generate-test-data');

// Correcting for time zone issues
process.env.TZ = 'UTC';

describe('Infant-child visit task scheduleing', function() {
    
    let nootilsManager;
    let Contact;
    let session;

    before(function() {
        nootilsManager = NootilsManager();
        Contact = nootilsManager.Contact;
        session = nootilsManager.session;
    });

    afterEach(function() {
        nootilsManager.afterEach();
    });

    after(function() { 
        nootilsManager.after();
    });

    describe('Testing first infant-child visit task (0-2 days of age)', function() {
        
        it('Should be a proper first infant-child visit under 20 days task', function() {
            let oneDayOld = new Contact(generate.oneDayOld());
            session.assert(oneDayOld);
            return session.emitTasks()
                .then(function(tasks) {
                    // Should have one task
                    assert.equal(1,tasks.length);
                    
                    // Should be of type 'task.infant_child.first_visit_under_20_days'
                    let task = tasks[0];
                    assert.equal('task.infant_child.first_visit_under_20_days', task.title);
                    
                    // Should be high priority
                    assert.equal('high', task.priority);
                    
                    // System due date should be equal to the contact reported date
                    assert.equal(new Date(task.date).getDate(), new Date(task.contact.reported_date).getDate());
                    
                    // Task should not be resolved
                    assert.isFalse(task.resolved);

                    let content = task.actions[0].content;
                    
                    // Task source is a task
                    assert.equal('task', content.source);
                    
                    // Source id is 'contact-1'
                    assert.equal('contact-1', content.source_id);
                    
                    // Visit id should be 'infant_child_0_2_day_pp_visit'
                    assert.equal('infant_child_0_2_day_pp_visit',content.visit_id);
                    
                    // Due date passed to form should be equal to system task due date
                    assert.equal(new Date(task.date).getDate(), new Date(content.due_date).getDate());
               });            
        });
        it('Second infant-child task not triggered when the first infant-child task is overdue', function() {
            let fiveDayOldUnresolved = new Contact(generate.fiveDayOldUnresolved());
            session.assert(fiveDayOldUnresolved);

            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm only one task is triggered in this situation
                    assert.equal(1, tasks.length);

                    // Confirm that task is of type 'task.infant_child.first_visit_under_20_days'
                    let task = tasks[0];
                    assert.equal('task.infant_child.first_visit_under_20_days', task.title);

                    // Confirm that task is unresolved
                    assert.isFalse(task.resolved);
            });
        });
        it('Infant-child tasks properly triggered and resolved on single form submission', function() {
            let fiveDayOldResolved = new Contact(generate.fiveDayOldResolved());
            session.assert(fiveDayOldResolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks are triggered
                    assert.equal(2, tasks.length);
                
                    // Confirm first task is of type 'task.infant_child.first_visit_under_20_days'
                    let task0 = tasks[0];
                    let task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_under_20_days', task0.title);
                    // Confirm second task is of type 'task.infant_child.second_visit_under_20_days'
                    assert.equal('task.infant_child.second_visit_under_20_days', task1.title);
                    
                    // Both tasks should be high priority
                    assert.equal('high', task0.priority);
                    assert.equal('high', task1.priority);
                    
                    // first task due date equal to contact reported date
                    assert.equal(new Date(task0.date).getDate(), new Date(task0.contact.reported_date).getDate());
                    // second task due date equal to five days after contact dob
                    let dueDate = new Date(task1.contact.date_of_birth);
                    dueDate.setDate(dueDate.getDate() + 5);
                    assert.equal(new Date(task1.date).getDate(), dueDate.getDate()); 
                    
                    // Both tasks should be resolved - by the single form submission
                    assert.isTrue(task0.resolved);
                    assert.isTrue(task1.resolved);
                    
                    // Both tasks source is a task
                    let content0 = task0.actions[0].content;
                    let content1 = task1.actions[0].content;
                    assert.equal('task', content0.source);
                    assert.equal('task', content1.source);
                    
                    // Both tasks source id is 'contact-1'
                    assert.equal('contact-1', content0.source_id);
                    assert.equal('contact-1', content1.source_id);
                    
                    // Both task visit ids should be 'infant_child_3_19_day_pp_visit'
                    assert.equal('infant_child_3_19_day_pp_visit', content0.visit_id);
                    assert.equal('infant_child_3_19_day_pp_visit', content1.visit_id);
                    
                    // Due dates passed to form should equal system visit due dates
                    assert.equal(new Date(task0.date).getDate(), new Date(content0.due_date).getDate());
                    assert.equal(new Date(task1.date).getDate(), new Date(content1.due_date).getDate());
            });  
        });
    });
    describe('Testing second infant-child visit task (3-19 days of age) following a first visit', function() {
        it('Is properly triggered with the correct parameters', function() {
            let tenDayOldWFirstVisit = new Contact(generate.tenDayOldWFirstVisit());
            session.assert(tenDayOldWFirstVisit);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks are emitted, a resolved first visit and an unresolved second visit
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_under_20_days', task0.title);
                    assert.isTrue(task0.resolved);
                    assert.equal('task.infant_child.second_visit_under_20_days', task1.title);
                    assert.isFalse(task1.resolved);

                    // Now focus on second task correctness
                    // Confirm unresolved task is of high priority
                    assert.equal('high', task1.priority);

                    // Task due date should be equal to five days after the contact's date of birth
                    let dueDate = new Date(task1.contact.date_of_birth);
                    dueDate.setDate(dueDate.getDate() + 5);
                    assert.equal(dueDate.getDate(), new Date(task1.date).getDate());

                    // Confirm task source is a task
                    content = task1.actions[0].content;
                    assert.equal('task', content.source);

                    // Confirm task source id is 'contact-1'
                    assert.equal('contact-1', content.source_id);

                    // Visit id should be 'infant_child_3_19_day_pp_visit'
                    assert.equal('infant_child_3_19_day_pp_visit', content.visit_id);

                    // Due date passed to form should equal system due date
                    assert.equal(new Date(task1.date).getDate(), new Date(content.due_date).getDate());
            });
        });
        it('Is properly resolved on submission of second infant_child form', function() {
            let tenDayOldWTwoVisits = new Contact(generate.tenDayOldWTwoVisits());
            session.assert(tenDayOldWTwoVisits);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks are emitted and of the expected type and both resolved
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_under_20_days', task0.title);
                    assert.isTrue(task0.resolved);
                    assert.equal('task.infant_child.second_visit_under_20_days', task1.title);
                    assert.isTrue(task1.resolved);
            });
        });
    });
    describe('Testing first infant_child visit task (20 - 105 days of age)', function() {
        it('Is properly triggered on registration of a child in the age range, with proper parameters', function() {
            let fiftyDayOldUnresolved = new Contact(generate.fiftyDayOldUnresolved());
            session.assert(fiftyDayOldUnresolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm that one task is emitted of the expected type and is not resolved and is regular priority
                    assert.equal(1, tasks.length);
                    task = tasks[0];
                    assert.equal('task.infant_child.first_visit_between_20_105_days', task.title);
                    assert.isFalse(task.resolved);
                    assert.doesNotHaveAnyKeys(task, ['priority']);

                    // Confirm that task due date is 7 days after contact reported date
                    let dueDate = new Date(task.contact.reported_date);
                    dueDate.setDate(dueDate.getDate() + 7);
                    assert.equal(dueDate.getDate(), new Date(task.date).getDate());

                    // Confirm task source is a task
                    content = task.actions[0].content;
                    assert.equal('task', content.source);

                    // Confirm task source id is 'contact-1'
                    assert.equal('contact-1', content.source_id);

                    // Visit id should be 'infant_child_day_20_week_11_visit'
                    assert.equal('infant_child_day_20_week_11_visit', content.visit_id);

                    // Due date passed to form should equal system due date
                    assert.equal(new Date(task.date).getDate(), new Date(content.due_date).getDate());
            });
        });
        it('Is resolved on submission of an infant_child form', function() {
            let fiftyDayOldResolved = new Contact(generate.fiftyDayOldResolved());
            session.assert(fiftyDayOldResolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks generated and resolved - first time and the follow up visit for corresponding window
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_between_20_105_days', task0.title);
                    assert.equal('task.infant_child.second_plus_visit_over_20_days', task1.title);   
                    assert.isTrue(task0.resolved);
                    assert.isTrue(task1.resolved);
            });
        });
    });
    describe('Testing first infant_child visit task (over 105 days of age)', function() {
        it('Is properly triggered on registration of a child in the age range, with the proper parameters', function() {
            let twoHundredDayOldUnresolved = new Contact(generate.twoHundredDayOldUnresolved());
            session.assert(twoHundredDayOldUnresolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm that one task is emitted of the expected type and is not resolved and is regular priority
                    assert.equal(1, tasks.length);
                    task = tasks[0];
                    assert.equal('task.infant_child.first_visit_over_105_days', task.title);
                    assert.isFalse(task.resolved);
                    assert.doesNotHaveAnyKeys(task, ['priority']);

                    // Confirm that task due date is 30 days after contact reported date
                    let dueDate = new Date(task.contact.reported_date);
                    dueDate.setDate(dueDate.getDate() + 30);
                    assert.equal(dueDate.getDate(), new Date(task.date).getDate());

                    // Confirm task source is a task
                    content = task.actions[0].content;
                    assert.equal('task', content.source);

                    // Confirm task source id is 'contact-1'
                    assert.equal('contact-1', content.source_id);

                    // Visit id should be 'infant_child_month_6_month_9_visit'
                    assert.equal('infant_child_month_6_month_9_visit', content.visit_id);

                    // Due date passed to form should equal system due date
                    assert.equal(new Date(task.date).getDate(), new Date(content.due_date).getDate());
            });
        });
        it('Is resolved on submission of an infant_child form', function() {
            let twoHundredDayOldResolved = new Contact(generate.twoHundredDayOldResolved());
            session.assert(twoHundredDayOldResolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks generated and resolved - first time and the follow up visit for corresponding window
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_over_105_days', task0.title);
                    assert.equal('task.infant_child.second_plus_visit_over_20_days', task1.title);   
                    assert.isTrue(task0.resolved);
                    assert.isTrue(task1.resolved);
            });
        });
    });
    describe('Testing repeat infant_child visit task (over 20 days of age)', function() {
        it('Is properly triggered when child moves into a relevant age window', function() {
            let finalWindowUnresolved = new Contact(generate.finalWindowUnresolved());
            session.assert(finalWindowUnresolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks generated - one for the first visit over 105 days, and one for final window
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_over_105_days', task0.title);
                    assert.equal('task.infant_child.second_plus_visit_over_20_days', task1.title);  
                    assert.isTrue(task0.resolved);
                    assert.isFalse(task1.resolved);

                    // Confirm that task due date is 51 months after contact date of birth
                    let dueDate = new Date(task1.contact.date_of_birth);
                    dueDate.setDate(dueDate.getDate() + (30 * 51));
                    assert.equal(dueDate.getDate(), new Date(task1.date).getDate());
                    
                    // Confirm that task is not high priority
                    assert.doesNotHaveAnyKeys(task1, ['priority']);

                    // Confirm task source is a task
                    content = task1.actions[0].content;
                    assert.equal('task', content.source);

                    // Confirm task source id is 'contact-1'
                    assert.equal('contact-1', content.source_id);

                    // Visit id should be 'infant_child_year_4_visit'
                    assert.equal('infant_child_year_4_visit', content.visit_id);

                    // Due date passed to form should equal system due date
                    assert.equal(new Date(task1.date).getDate(), new Date(content.due_date).getDate());
            });
        });
        it('Is properly resolved on form submission', function() {
            let finalWindowResolved = new Contact(generate.finalWindowResolved());
            session.assert(finalWindowResolved);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm two tasks generated and resolved - first time and the follow up visit for corresponding window
                    assert.equal(2, tasks.length);
                    task0 = tasks[0];
                    task1 = tasks[1];
                    assert.equal('task.infant_child.first_visit_over_105_days', task0.title);
                    assert.equal('task.infant_child.second_plus_visit_over_20_days', task1.title);   
                    assert.isTrue(task0.resolved);
                    assert.isTrue(task1.resolved);                     
            });
        });
    });
    describe('Nothing happening for children over 5, no matter if they have participated or not', function() {
        it('No tasks triggered for a new kid over 5', function() {
            let overFive = new Contact(generate.overFive());
            session.assert(overFive);
            return session.emitTasks()
                .then(function(tasks) {
                    // Confirm no tasks emitted in this case
                    assert.equal(0,tasks.length);
            });
        });
        it('No unresolved tasks for a kid over 5 with previous visits', function() {
            let overFivePriors = new Contact(generate.overFivePriors());
            session.assert(overFivePriors);
            return session.emitTasks()
                .then(function(tasks) {
                    assert.equal(0, tasks.length);
            });
        });
    });
});
