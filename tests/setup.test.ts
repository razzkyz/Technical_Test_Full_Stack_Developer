// Basic test to verify Jest configuration
describe('Setup Tests', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to fast-check', () => {
    const fc = require('fast-check');
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
  });
});
