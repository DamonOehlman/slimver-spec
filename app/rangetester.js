var mercury = require('mercury');
var slim = require('slimver');
var app = document.querySelector('.rangetester');
var h = mercury.h;

var keys = ['range', 'version'];
var events = mercury.input(keys);
var model = mercury.struct({
  range: mercury.value('^1.0.0'),
  version: mercury.value('1.0.0')
});

keys.forEach(function(key) {
  events[key](function(data) {
    model[key].set(data[key]);
  });
});

function render(data) {
  var satisfies = slim.satisfies(data.version, data.range);

  return h('div', [
    h('h2', 'Range Tester'),
    h('div', [
      h('label', 'Range: '),
      h('input', {
        'ev-event': mercury.changeEvent(events.range),
        value: data.range,
        name: 'range'
      })
    ]),
    h('div', [
      h('label', 'Version: '),
      h('input', {
        'ev-event': mercury.changeEvent(events.version),
        value: data.version,
        name: 'version'
      })
    ]),
    h('div', [
      h('label', 'Satisfies?: '),
      h('code', satisfies ? 'true' : 'false')
    ])
  ]);
}

mercury.app(app, model, render);
