const test = require('node:test');
const assert = require('node:assert/strict');

const {buildTimeSeriesData} = require('../lib/index.js');

test('buildTimeSeriesDataUsesPlanIdOnlyForMetricIdentity', () => {
  const firstPlan = {id: 'plan-123', name: 'Plan Name A'};
  const renamedPlan = {id: 'plan-123', name: 'Plan Name B'};
  const journeyExecutions = [
    {status: 'passed'},
    {status: 'failed'},
    {status: 'failed'}
  ];

  const firstSeries = buildTimeSeriesData(firstPlan, journeyExecutions);
  const renamedSeries = buildTimeSeriesData(renamedPlan, journeyExecutions);

  assert.equal(
    firstSeries.metric.type,
    'custom.googleapis.com/mabl/failingTests/plan-123'
  );
  assert.equal(renamedSeries.metric.type, firstSeries.metric.type);
  assert.equal(firstSeries.points[0].value.doubleValue, 2);
  assert.equal(renamedSeries.points[0].value.doubleValue, 2);
  assert.ok(!('labels' in firstSeries.metric));
  assert.ok(!('labels' in renamedSeries.metric));
});
