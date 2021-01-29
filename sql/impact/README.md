# D-Tree Impact Monitoring Queries. 

## Tier 1:

|Category|Metric|Query|
|-|-|-|
|Activity|Total Number of HWs who have been active in the app at least once in a given month.  | [count_reported_by](activity/hwactivity.sql)
|Activity| Total number of health worker actions in a given month | [count_any_interaction](activity/hwactivity.sql)
|Activity|Total number of health workers trained for a specific use case in a given month|[Salesforce](https://medicmobile.lightning.force.com/lightning/r/Project__c/a021Q0000166ZtOQAU/view)
UHC|Total number of households registered|[hh_registered](uhc/hh_registered.sql)
UHC|Total number of new households registered|[hh_visited](uhc/hh_visited.sql)
