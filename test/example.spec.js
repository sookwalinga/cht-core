const { expect } = require('chai');
const TestHarness = require('medic-conf-test-harness');
const harness = new TestHarness();

describe('example test suite', () => {
  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => { return await harness.clear(); });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('example test', async () => {
    expect(!!'true').to.be.true;
  });
});
