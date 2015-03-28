exports.config = {
  specs: ['src/end_to_end_tests.js'],
  allScriptsTmeout: 120000,
  directConnect: true, // only works with Chrome and Firefox
  capabilities: {
    'browserName': 'chrome'
  },
  baseUrl: 'http://localhost:32232/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 150000
  }
};
