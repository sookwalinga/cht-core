# Running Tests With Contact Summary Tests

Contact Summary test will load your contact-settings.js or contact-summary-templated.js. Then it will loop through the folders in your contact summary json exmaple folders. Then execute your contact.json, lineage.json, and reports.json  against the contact-summary. This returns an output json which is then compared against the expected.json in your test folders. 

### Via command line
 
 `medic-contact-summary-test path_to_contact-summary.js path_to_tests_contact_summary_json`

### An example using the standard config tests
  
   `medic-contact-summary-test medic-webapp/tree/master/config/standard medic-webapp/tree/master/config/standard/tests/contact-summary`


# Expected Files

## Folder Structure

The json files need to be in this directory structure to be looped over and tested against the contact-summary that gets loaded. 

**NOTE: Lineage and reports files are required but not required to contain data.**

```
── contact-summary
│   ├── immunization
│   │   ├── contact.json
│   │   ├── expected-output.json
│   │   ├── lineage.json
│   │   └── reports.json
```

### Contact JSON
This file is a representation of data that would be submitted through the app via a form. It should mimic the data collected 

### Reports JSON
A json file that represents a report that is being submitted through the application. When the contact summary is executed it will affect the output based on conditions set.

### Lineage

Represents the lineage for a contact and the available use cases, vaccines, and other details. Used when processing through the contact summary. 

### Expected Output
This file contains the data as if it were processed through the app and contact summary details were applied to it. Returning expected fields, cards, and context. 

