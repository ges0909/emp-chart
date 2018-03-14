// Asserting Results
QUnit.skip('hello test', function (assert) {
  var actual = 'abc';
  assert.expect(5); // optional
  assert.ok(true);
  assert.ok(1 == '1', 'Passed!');
  assert.equal(actual, 'abc'); // ==
  assert.deepEqual(actual, 'abc'); // ===
  var actualObj = { first: 'James', last: 'Bond' };
  assert.deepEqual(actualObj, { first: 'James', last: 'Bond' }); // 'deepEqual' is in general the better choice
});

// Synchronous Callbacks
QUnit.skip('a click test', function (assert) {
  assert.expect(1);
  var $body = $('body');
  $body.on('click', function () {
    assert.ok(true, 'body was clicked!');
  });
  $body.trigger('click');
});

// Asynchronous Callbacks
QUnit.skip('asynchronous test: async input focus', function (assert) {
  var done = assert.async();
  var input = $('#test-input').focus();
  setTimeout(function () {
    assert.equal(document.activeElement, input[0], 'Input was focused');
    done();
  }, 1000);
});

// Testing User Actions
function KeyLogger(target) { // helper class
  this.target = target;
  this.log = [];
  var that = this;
  this.target.off('keydown').on('keydown', function (event) {
    that.log.push(event.keyCode);
  });
}

QUnit.skip('keylogger api behavior', function (assert) {
  var doc = $(document), keys = new KeyLogger(doc);
  // Trigger the key event
  doc.trigger($.Event('keydown', { keyCode: 9 }));
  // Verify expected behavior
  assert.deepEqual(keys.log, [9], 'correct key was logged');
});

QUnit.test('Number Formatting Test', function (assert) {
  let number = 123456789;
  assert.equal(number.toLocaleString(), '123.456.789');
});
