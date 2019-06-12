const NootilsManager = require('medic-nootils/src/node/test-wrapper');
const now = NootilsManager.BASE_DATE;

module.exports = {

    userTwoParents: function() {
        let json = {
            parent: {
                type: 'health_center',
                parent: {
                type: 'district_hospital'
                }
            }
        };

        return json;
    },

    oneDayOld: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 1);

        let json = {
            contact: {
                type: 'person',
                name: 'onedaykid',
                date_of_birth: dob,
                reported_date: now,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [] 
        };

        return json;
    },

    fiveDayOldUnresolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 5);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 4);

        // This represents a five day old registered at 1 day old but who never had an infant-child visit
        let json = {
            contact: {
                type: 'person',
                name: 'fivedaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [] 
        };

        return json;
    },

    fiveDayOldResolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 5);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 4);

        let json = {
            contact: {
                type: 'person',
                name: 'fivedaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: now,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }
            }] 
        };

        return json;
    },

    tenDayOldWFirstVisit: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 10);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 10);

        let firstVisitDate = new Date(now);
        firstVisitDate.setDate(firstVisitDate.getDate() - 9);

        let json = {
            contact: {
                type: 'person',
                name: 'tendaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: firstVisitDate,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }
            }] 
        };

        return json;
    },

    tenDayOldWTwoVisits: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 10);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 10);

        let firstVisitDate = new Date(now);
        firstVisitDate.setDate(firstVisitDate.getDate() - 9);

        let secondVisitDate = new Date(now);
        secondVisitDate.setDate(secondVisitDate.getDate() - 1);

        let json = {
            contact: {
                type: 'person',
                name: 'tendaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: firstVisitDate,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }
            },
            {
                form: 'infant_child',
                reported_date: secondVisitDate,
                _id: 'infant_child-1',
            }] 
        };

        return json;
    },

    fiftyDayOldUnresolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 50);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 7);

        let json = {
            contact: {
                type: 'person',
                name: 'fiftydaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [] 
        };

        return json;
    },

    fiftyDayOldResolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 50);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 7);

        let json = {
            contact: {
                type: 'person',
                name: 'fiftydaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: now,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }
            }] 
        };

        return json;
    },

    twoHundredDayOldUnresolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 200);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 7);

        let json = {
            contact: {
                type: 'person',
                name: 'twohundreddaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [] 
        };

        return json;
    },

    twoHundredDayOldResolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 200);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - 7);

        let json = {
            contact: {
                type: 'person',
                name: 'twohundreddaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: now,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }
            }] 
        };

        return json;
    },

    finalWindowUnresolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 1620);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(dob.getDate() + 1);
        
        let window1 = new Date(dob).setDate(dob.getDate() + 1);
        let window2 = new Date(dob).setDate(dob.getDate() + 5);
        let window3 = new Date(dob).setDate(dob.getDate() + (7 * 4));
        let window4 = new Date(dob).setDate(dob.getDate() + (7 * 11));
        let window5 = new Date(dob).setDate(dob.getDate() + (7 * 16));
        let window6 = new Date(dob).setDate(dob.getDate() + (7 * 26));
        let window7 = new Date(dob).setDate(dob.getDate() + (7 * 42));
        let window8 = new Date(dob).setDate(dob.getDate() + (30 * 13));
        let window9 = new Date(dob).setDate(dob.getDate() + (30 * 16));
        let window10 = new Date(dob).setDate(dob.getDate() + (30 * 20));
        let window11 = new Date(dob).setDate(dob.getDate() + (30 * 24));
        let window12 = new Date(dob).setDate(dob.getDate() + (30 * 39));

        let json = {
            contact: {
                type: 'person',
                name: 'finalwindow',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: window1,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }},
                {form: 'infant_child',
                reported_date: window2,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window3,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window4,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window5,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window6,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window7,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window8,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window9,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window10,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window11,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window12,
                _id: 'infant_child-1'}
            ] 
        };

        return json;

    },

    finalWindowResolved: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - 1620);

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(dob.getDate() + 1);
        
        let window1 = new Date(dob).setDate(dob.getDate() + 1);
        let window2 = new Date(dob).setDate(dob.getDate() + 5);
        let window3 = new Date(dob).setDate(dob.getDate() + (7 * 4));
        let window4 = new Date(dob).setDate(dob.getDate() + (7 * 11));
        let window5 = new Date(dob).setDate(dob.getDate() + (7 * 16));
        let window6 = new Date(dob).setDate(dob.getDate() + (7 * 26));
        let window7 = new Date(dob).setDate(dob.getDate() + (7 * 42));
        let window8 = new Date(dob).setDate(dob.getDate() + (30 * 13));
        let window9 = new Date(dob).setDate(dob.getDate() + (30 * 16));
        let window10 = new Date(dob).setDate(dob.getDate() + (30 * 20));
        let window11 = new Date(dob).setDate(dob.getDate() + (30 * 24));
        let window12 = new Date(dob).setDate(dob.getDate() + (30 * 39));
        let window13 = new Date(dob).setDate(dob.getDate() + (30 * 51));

        let json = {
            contact: {
                type: 'person',
                name: 'finalwindow',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: window1,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }},
                {form: 'infant_child',
                reported_date: window2,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window3,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window4,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window5,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window6,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window7,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window8,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window9,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window10,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window11,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window12,
                _id: 'infant_child-1'},
                {form: 'infant_child',
                reported_date: window13,
                _id: 'infant_child-1'}
            ] 
        };

        return json;

    },

    overFive: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - ((60 * 30) + 1));

        let json = {
            contact: {
                type: 'person',
                name: 'fiveandadaykid',
                date_of_birth: dob,
                reported_date: now,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [] 
        };

        return json;
    },
    overFivePriors: function() {
        let dob = new Date(now);
        dob.setDate(dob.getDate() - ((60 * 30) + 1));

        let contactReportedDate = new Date(now);
        contactReportedDate.setDate(contactReportedDate.getDate() - (60 * 30)) 

        let formReportedDate = new Date(now);
        formReportedDate.setDate(formReportedDate.getDate() - (60 * 15));

        let json = {
            contact: {
                type: 'person',
                name: 'fiveandadaykid',
                date_of_birth: dob,
                reported_date: contactReportedDate,
                _id: 'contact-1',
                parent: {
                    type: 'clinic',
                    parent: {
                        type: 'health_center',
                        parent: {
                            type: 'district_hospital'
                        }
                    }
                }
            },
            reports: [{
                form: 'infant_child',
                reported_date: formReportedDate,
                _id: 'infant_child-1',
                fields: {
                    consent: {
                        child_consent_today: 'yes'
                    }
                }}] 
        };

        return json;
    },
}