var mercury = require('mercury');
var slim = require('slimver');
var app = document.querySelector('.encoder');
var h = mercury.h;

// create the range tester
var range = mercury.value('1.0.0');
var rangeChange = mercury.input();

rangeChange(function(data) {
  range.set(data.range);
});


function renderRange(value) {
  var encoded = slim(value);

  return h('div', [
    h('h2', 'Encoding Tester'),
    h('div', [
      h('label', 'Version: '),
      h('input', {
        'ev-event': mercury.changeEvent(rangeChange),
        value: value,
        name: 'range'
      })
    ]),
    h('div', [
      h('label', 'Encoded: '),
      h('code', '' + (encoded !== null ? encoded : ''))
    ])
  ]);
}

mercury.app(app, range, renderRange);
