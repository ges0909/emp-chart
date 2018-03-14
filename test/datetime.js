QUnit.test('1 // Current year', function (assert) {
  var startDate = moment().date(1).month(0).format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/01/2018');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('2 // Last year', function (assert) {
  var startDate = moment().subtract(1, 'year').startOf('year').format('DD/MM/YYYY');
  var endDate = moment().subtract(1, 'year').endOf('year').format('DD/MM/YYYY');
  assert.equal(startDate, '01/01/2017');
  assert.equal(endDate, '31/12/2017');
});

QUnit.test('3 // Last 12 month', function (assert) {
  var startDate = moment().subtract(1 + 12, 'month').startOf('month').format('DD/MM/YYYY');
  var endDate = moment().subtract(1, 'month').endOf('month').format('DD/MM/YYYY');
  assert.equal(startDate, '01/02/2017');
  assert.equal(endDate, '28/02/2018');
});

QUnit.test('4 // Last 3 years', function (assert) {
  var startDate = moment().subtract(3, 'year').startOf('year').format('DD/MM/YYYY');
  var endDate = moment().subtract(1, 'year').endOf('year').format('DD/MM/YYYY');
  assert.equal(startDate, '01/01/2015');
  assert.equal(endDate, '31/12/2017');
});

QUnit.test('5 // Current month', function (assert) {
  var startDate = moment().startOf('month').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/03/2018');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('6 // Last month', function (assert) {
  var startDate = moment().subtract(1, 'month').startOf('month').format('DD/MM/YYYY');
  var endDate = moment().subtract(1, 'month').endOf('month').format('DD/MM/YYYY');
  assert.equal(startDate, '01/02/2018');
  assert.equal(endDate, '28/02/2018');
});

QUnit.test('7 // Last 15 days', function (assert) {
  var startDate = moment().subtract(15, 'days').format('DD/MM/YYYY');
  var endDate = moment().subtract(1, 'days').format('DD/MM/YYYY');
  assert.equal(startDate, '27/02/2018');
  assert.equal(endDate, '13/03/2018');
});

QUnit.test('8 // Current + last year', function (assert) {
  var startDate = moment().subtract(1, 'year').startOf('year').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/01/2017');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('9 // Current + last 11 months', function (assert) {
  var startDate = moment().subtract(11, 'month').startOf('month').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/04/2017');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('10 // Current + last 3 years', function (assert) {
  var startDate = moment().subtract(3, 'year').startOf('year').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/01/2015');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('11 // Current + last month', function (assert) {
  var startDate = moment().subtract(1, 'month').startOf('month').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '01/02/2018');
  assert.equal(endDate, '14/03/2018');
});

QUnit.test('12 // Current + last 15 days', function (assert) {
  var startDate = moment().subtract(1 + 15, 'days').format('DD/MM/YYYY');
  var endDate = moment().format('DD/MM/YYYY');
  assert.equal(startDate, '26/02/2018');
  assert.equal(endDate, '14/03/2018');
});