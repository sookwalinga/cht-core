[
  {
    icon: 'mother-child',
    title: [ { locale:'en', content:'Postnatal visit needed' } ],
    appliesTo: 'reports',
    appliesToType: [ 'delivery' ],
    actions: [ { form:'postnatal_visit' } ],
    events: [
      {
        id: 'postnatal-visit-1',
        days:7, start:2, end:2,
      },
      {
        id: 'postnatal-visit-2',
        days:14, start:2, end:2,
      }
    ]
  }
]
