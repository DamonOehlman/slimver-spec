(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var mercury = require('mercury');
var slim = require('slimver');
var app = document.querySelector('.encoder');
var h = mercury.h;

// create the range tester
var range = mercury.value('1.0.0');
var rangeChange = mercury.input();

rangeChange(function(data) {
  range.set(data.version);
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
        name: 'version'
      })
    ]),
    h('div', [
      h('label', 'Encoded: '),
      h('code', '' + (encoded !== null ? encoded : ''))
    ])
  ]);
}

mercury.app(app, range, renderRange);

},{"mercury":5,"slimver":87}],2:[function(require,module,exports){
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

},{"mercury":5,"slimver":87}],3:[function(require,module,exports){
require('./app/encoder');
require('./app/rangetester');

},{"./app/encoder":1,"./app/rangetester":2}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
var SingleEvent = require("geval/single")
var MultipleEvent = require("geval/multiple")

/*
    Pro tip: Don't require `mercury` itself.
      require and depend on all these modules directly!
*/
var mercury = module.exports = {
    // Entry
    main: require("main-loop"),
    app: app,

    // Input
    Delegator: require("dom-delegator"),
    input: input,
    event: require("value-event/event"),
    valueEvent: require("value-event/value"),
    submitEvent: require("value-event/submit"),
    changeEvent: require("value-event/change"),
    keyEvent: require("value-event/key"),

    // State
    array: require("observ-array"),
    struct: require("observ-struct"),
    // alias struct as hash for back compat
    hash: require("observ-struct"),
    varhash: require("observ-varhash"),
    value: require("observ"),

    // Render
    diff: require("virtual-dom/diff"),
    patch: require("virtual-dom/patch"),
    partial: require("vdom-thunk"),
    create: require("virtual-dom/create-element"),
    h: require("virtual-hyperscript"),
    svg: require("virtual-hyperscript/svg"),

    // Utilities
    computed: require("observ/computed"),
    watch: require("observ/watch")
}

function input(names) {
    if (!names) {
        return SingleEvent()
    }

    return MultipleEvent(names)
}

function app(elem, observ, render, opts) {
    mercury.Delegator(opts);
    var loop = mercury.main(observ(), render, opts)
    observ(loop.update)
    elem.appendChild(loop.target)
}

},{"dom-delegator":8,"geval/multiple":20,"geval/single":21,"main-loop":22,"observ":41,"observ-array":26,"observ-struct":29,"observ-varhash":32,"observ/computed":40,"observ/watch":42,"value-event/change":43,"value-event/event":44,"value-event/key":45,"value-event/submit":51,"value-event/value":52,"vdom-thunk":53,"virtual-dom/create-element":54,"virtual-dom/diff":55,"virtual-dom/patch":59,"virtual-hyperscript":79,"virtual-hyperscript/svg":86}],6:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = addEvent

function addEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        ds[type] = handler
    } else if (Array.isArray(events)) {
        if (events.indexOf(handler) === -1) {
            events.push(handler)
        }
    } else if (events !== handler) {
        ds[type] = [events, handler]
    }
}

},{"data-set":11}],7:[function(require,module,exports){
var globalDocument = require("global/document")
var DataSet = require("data-set")

var addEvent = require("./add-event.js")
var removeEvent = require("./remove-event.js")
var ProxyEvent = require("./proxy-event.js")

module.exports = DOMDelegator

function DOMDelegator(document) {
    document = document || globalDocument

    this.target = document.documentElement
    this.events = {}
    this.rawEventListeners = {}
    this.globalListeners = {}
}

DOMDelegator.prototype.addEventListener = addEvent
DOMDelegator.prototype.removeEventListener = removeEvent

DOMDelegator.prototype.addGlobalEventListener =
    function addGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName]
        if (!listeners) {
            listeners = this.globalListeners[eventName] = []
        }

        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn)
        }
    }

DOMDelegator.prototype.removeGlobalEventListener =
    function removeGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName]
        if (!listeners) {
            return
        }

        var index = listeners.indexOf(fn)
        if (index !== -1) {
            listeners.splice(index, 1)
        }
    }

DOMDelegator.prototype.listenTo = function listenTo(eventName) {
    if (this.events[eventName]) {
        return
    }

    this.events[eventName] = true
    listen(this, eventName)
}

DOMDelegator.prototype.unlistenTo = function unlistenTo(eventName) {
    if (!this.events[eventName]) {
        return
    }

    this.events[eventName] = false
    unlisten(this, eventName)
}

function listen(delegator, eventName) {
    var listener = delegator.rawEventListeners[eventName]

    if (!listener) {
        listener = delegator.rawEventListeners[eventName] =
            createHandler(eventName, delegator.globalListeners)
    }

    delegator.target.addEventListener(eventName, listener, true)
}

function unlisten(delegator, eventName) {
    var listener = delegator.rawEventListeners[eventName]

    if (!listener) {
        throw new Error("dom-delegator#unlistenTo: cannot " +
            "unlisten to " + eventName)
    }

    delegator.target.removeEventListener(eventName, listener, true)
}

function createHandler(eventName, globalListeners) {
    return handler

    function handler(ev) {
        var globalHandlers = globalListeners[eventName] || []
        var listener = getListener(ev.target, eventName)

        var handlers = globalHandlers
            .concat(listener ? listener.handlers : [])
        if (handlers.length === 0) {
            return
        }

        var arg = new ProxyEvent(ev, listener)

        handlers.forEach(function (handler) {
            typeof handler === "function" ?
                handler(arg) : handler.handleEvent(arg)
        })
    }
}

function getListener(target, type) {
    // terminate recursion if parent is `null`
    if (target === null) {
        return null
    }

    var ds = DataSet(target)
    // fetch list of handler fns for this event
    var handler = ds[type]
    var allHandler = ds.event

    if (!handler && !allHandler) {
        return getListener(target.parentNode, type)
    }

    var handlers = [].concat(handler || [], allHandler || [])
    return new Listener(target, handlers)
}

function Listener(target, handlers) {
    this.currentTarget = target
    this.handlers = handlers
}

},{"./add-event.js":6,"./proxy-event.js":17,"./remove-event.js":18,"data-set":11,"global/document":14}],8:[function(require,module,exports){
var Individual = require("individual")
var cuid = require("cuid")

var DOMDelegator = require("./dom-delegator.js")

var delegatorCache = Individual("__DOM_DELEGATOR_CACHE@8", {
    delegators: {}
})
var commonEvents = [
    "blur", "change", "click",  "contextmenu", "dblclick",
    "error","focus", "focusin", "focusout", "input", "keydown",
    "keypress", "keyup", "load", "mousedown", "mouseup",
    "resize", "scroll", "select", "submit", "unload"
]

/*  Delegator is a thin wrapper around a singleton `DOMDelegator`
        instance.

    Only one DOMDelegator should exist because we do not want
        duplicate event listeners bound to the DOM.

    `Delegator` will also `listenTo()` all events unless 
        every caller opts out of it
*/
module.exports = Delegator

function Delegator(opts) {
    opts = opts || {}
    var document = opts.document

    var cacheKey = document ? 
        document["__DOM_DELEGATOR_CACHE_TOKEN@8"] : "global"

    if (!cacheKey) {
        cacheKey =
            document["__DOM_DELEGATOR_CACHE_TOKEN@8"] = cuid()
    }

    var delegator = delegatorCache.delegators[cacheKey]

    if (!delegator) {
        delegator = delegatorCache.delegators[cacheKey] =
            new DOMDelegator(document)
    }

    if (opts.defaultEvents !== false) {
        for (var i = 0; i < commonEvents.length; i++) {
            delegator.listenTo(commonEvents[i])
        }
    }

    return delegator
}



},{"./dom-delegator.js":7,"cuid":9,"individual":15}],9:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],10:[function(require,module,exports){
module.exports = createHash

function createHash(elem) {
    var attributes = elem.attributes
    var hash = {}

    if (attributes === null || attributes === undefined) {
        return hash
    }

    for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i]

        if (attr.name.substr(0,5) !== "data-") {
            continue
        }

        hash[attr.name.substr(5)] = attr.value
    }

    return hash
}

},{}],11:[function(require,module,exports){
var createStore = require("weakmap-shim/create-store")
var Individual = require("individual")

var createHash = require("./create-hash.js")

var hashStore = Individual("__DATA_SET_WEAKMAP@3", createStore())

module.exports = DataSet

function DataSet(elem) {
    var store = hashStore(elem)

    if (!store.hash) {
        store.hash = createHash(elem)
    }

    return store.hash
}

},{"./create-hash.js":10,"individual":15,"weakmap-shim/create-store":12}],12:[function(require,module,exports){
var hiddenStore = require('./hidden-store.js');

module.exports = createStore;

function createStore() {
    var key = {};

    return function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            throw new Error('Weakmap-shim: Key must be object')
        }

        var store = obj.valueOf(key);
        return store && store.identity === key ?
            store : hiddenStore(obj, key);
    };
}

},{"./hidden-store.js":13}],13:[function(require,module,exports){
module.exports = hiddenStore;

function hiddenStore(obj, key) {
    var store = { identity: key };
    var valueOf = obj.valueOf;

    Object.defineProperty(obj, "valueOf", {
        value: function (value) {
            return value !== key ?
                valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

},{}],14:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":4}],15:[function(require,module,exports){
(function (global){
var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(require,module,exports){
var inherits = require("inherits")

var ALL_PROPS = [
    "altKey", "bubbles", "cancelable", "ctrlKey",
    "eventPhase", "metaKey", "relatedTarget", "shiftKey",
    "target", "timeStamp", "type", "view", "which"
]
var KEY_PROPS = ["char", "charCode", "key", "keyCode"]
var MOUSE_PROPS = [
    "button", "buttons", "clientX", "clientY", "layerX",
    "layerY", "offsetX", "offsetY", "pageX", "pageY",
    "screenX", "screenY", "toElement"
]

var rkeyEvent = /^key|input/
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/

module.exports = ProxyEvent

function ProxyEvent(ev, listener) {
    if (!(this instanceof ProxyEvent)) {
        return new ProxyEvent(ev, listener)
    }

    if (rkeyEvent.test(ev.type)) {
        return new KeyEvent(ev, listener)
    } else if (rmouseEvent.test(ev.type)) {
        return new MouseEvent(ev, listener)
    }

    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

ProxyEvent.prototype.preventDefault = function () {
    this._rawEvent.preventDefault()
}

function MouseEvent(ev, listener) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j]
        this[mousePropKey] = ev[mousePropKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

inherits(MouseEvent, ProxyEvent)

function KeyEvent(ev, listener) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j]
        this[keyPropKey] = ev[keyPropKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

inherits(KeyEvent, ProxyEvent)

},{"inherits":16}],18:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = removeEvent

function removeEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        return
    } else if (Array.isArray(events)) {
        var index = events.indexOf(handler)
        if (index !== -1) {
            events.splice(index, 1)
        }
    } else if (events === handler) {
        ds[type] = null
    }
}

},{"data-set":11}],19:[function(require,module,exports){
module.exports = Event

function Event() {
    var listeners = []

    return { broadcast: broadcast, listen: event }

    function broadcast(value) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](value)
        }
    }

    function event(listener) {
        listeners.push(listener)

        return removeListener

        function removeListener() {
            var index = listeners.indexOf(listener)
            if (index !== -1) {
                listeners.splice(index, 1)
            }
        }
    }
}

},{}],20:[function(require,module,exports){
var event = require("./single.js")

module.exports = multiple

function multiple(names) {
    return names.reduce(function (acc, name) {
        acc[name] = event()
        return acc
    }, {})
}

},{"./single.js":21}],21:[function(require,module,exports){
var Event = require('./event.js')

module.exports = Single

function Single() {
    var tuple = Event()

    return function event(value) {
        if (typeof value === "function") {
            return tuple.listen(value)
        } else {
            return tuple.broadcast(value)
        }
    }
}

},{"./event.js":19}],22:[function(require,module,exports){
var raf = require("raf/polyfill")
var vdomCreate = require("virtual-dom/create-element")
var vdomDiff = require("virtual-dom/diff")
var vdomPatch = require("virtual-dom/patch")

module.exports = main

function main(initialState, view, opts) {
    opts = opts || {}

    var currentState = initialState
    var create = opts.create || vdomCreate
    var diff = opts.diff || vdomDiff
    var patch = opts.patch || vdomPatch
    var redrawScheduled = false

    var tree = view(currentState)
    var target = create(tree, opts)

    currentState = null

    return {
        target: target,
        update: update
    }

    function update(state) {
        if (currentState === null && !redrawScheduled) {
            redrawScheduled = true
            raf(redraw)
        }

        currentState = state
    }

    function redraw() {
        redrawScheduled = false;
        if (currentState === null) {
            return
        }

        var newTree = view(currentState)

        if (opts.createOnly) {
            create(newTree, opts)
        } else {
            var patches = diff(tree, newTree, opts)
            patch(target, patches, opts)
        }

        tree = newTree
        currentState = null
    }
}

},{"raf/polyfill":23,"virtual-dom/create-element":54,"virtual-dom/diff":55,"virtual-dom/patch":59}],23:[function(require,module,exports){
var global = typeof window === 'undefined' ? this : window

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

module.exports = _raf

},{}],24:[function(require,module,exports){
module.exports = addListener

function addListener(observArray, observ) {
    var list = observArray._list

    return observ(function (value) {
        var valueList =  observArray().slice()
        var index = list.indexOf(observ)

        // This code path should never hit. If this happens
        // there's a bug in the cleanup code
        if (index === -1) {
            var message = "observ-array: Unremoved observ listener"
            var err = new Error(message)
            err.list = list
            err.index = index
            err.observ = observ
            throw err
        }

        valueList.splice(index, 1, value)
        valueList._diff = [index, 1, value]

        observArray.set(valueList)
    })
}

},{}],25:[function(require,module,exports){
var ObservArray = require("./index.js")

var slice = Array.prototype.slice

var ARRAY_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

var methods = ARRAY_METHODS.map(function (name) {
    return [name, function () {
        var res = this._list[name].apply(this._list, arguments)

        if (res && Array.isArray(res)) {
            res = ObservArray(res)
        }

        return res
    }]
})

module.exports = ArrayMethods

function ArrayMethods(obs) {
    obs.push = observArrayPush
    obs.pop = observArrayPop
    obs.shift = observArrayShift
    obs.unshift = observArrayUnshift
    obs.reverse = notImplemented
    obs.sort = notImplemented

    methods.forEach(function (tuple) {
        obs[tuple[0]] = tuple[1]
    })
    return obs
}



function observArrayPush() {
    var args = slice.call(arguments)
    args.unshift(this._list.length, 0)
    this.splice.apply(this, args)

    return this._list.length
}
function observArrayPop() {
    return this.splice(this._list.length - 1, 1)[0]
}
function observArrayShift() {
    return this.splice(0, 1)[0]
}
function observArrayUnshift() {
    var args = slice.call(arguments)
    args.unshift(0, 0)
    this.splice.apply(this, args)

    return this._list.length
}


function notImplemented() {
    throw new Error("Pull request welcome")
}

},{"./index.js":26}],26:[function(require,module,exports){
var Observ = require("observ")

// circular dep between ArrayMethods & this file
module.exports = ObservArray

var splice = require("./splice.js")
var ArrayMethods = require("./array-methods.js")
var addListener = require("./add-listener.js")

/*  ObservArray := (Array<T>) => Observ<
        Array<T> & { _diff: Array }
    > & {
        splice: (index: Number, amount: Number, rest...: T) =>
            Array<T>,
        push: (values...: T) => Number,
        filter: (lambda: Function, thisValue: Any) => Array<T>,
        indexOf: (item: T, fromIndex: Number) => Number
    }

    Fix to make it more like ObservHash.

    I.e. you write observables into it. 
        reading methods take plain JS objects to read
        and the value of the array is always an array of plain
        objsect.

        The observ array instance itself would have indexed 
        properties that are the observables
*/
function ObservArray(initialList) {
    // list is the internal mutable list observ instances that
    // all methods on `obs` dispatch to.
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = splice

    obs.get = get
    obs.getLength = getLength
    obs.put = put

    // you better not mutate this list directly
    // this is the list of observs instances
    obs._list = list

    var removeListeners = list.map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    });
    // this is a list of removal functions that must be called
    // when observ instances are removed from `obs.list`
    // not calling this means we do not GC our observ change
    // listeners. Which causes rage bugs
    obs._removeListeners = removeListeners

    return ArrayMethods(obs, list)
}

function get(index) {
    return this._list[index]
}

function put(index, value) {
    this.splice(index, 1, value)
}

function getLength() {
    return this._list.length
}

},{"./add-listener.js":24,"./array-methods.js":25,"./splice.js":28,"observ":27}],27:[function(require,module,exports){
module.exports = Observable

function Observable(value) {
    var listeners = []
    value = value === undefined ? null : value

    observable.set = function (v) {
        value = v
        listeners.forEach(function (f) {
            f(v)
        })
    }

    return observable

    function observable(listener) {
        if (!listener) {
            return value
        }

        listeners.push(listener)

        return function remove() {
            listeners.splice(listeners.indexOf(listener), 1)
        }
    }
}

},{}],28:[function(require,module,exports){
var slice = Array.prototype.slice

var addListener = require("./add-listener.js")

module.exports = splice

// `obs.splice` is a mutable implementation of `splice()`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function splice(index, amount) {
    var obs = this
    var args = slice.call(arguments, 0)
    var valueList = obs().slice()

    // generate a list of args to mutate the internal
    // list of only obs
    var valueArgs = args.map(function (value, index) {
        if (index === 0 || index === 1) {
            return value
        }

        // must unpack observables that we are adding
        return typeof value === "function" ? value() : value
    })

    valueList.splice.apply(valueList, valueArgs)
    // we remove the observs that we remove
    var removed = obs._list.splice.apply(obs._list, args)

    var extraRemoveListeners = args.slice(2).map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    })
    extraRemoveListeners.unshift(args[0], args[1])
    var removedListeners = obs._removeListeners.splice
        .apply(obs._removeListeners, extraRemoveListeners)

    removedListeners.forEach(function (removeObservListener) {
        if (removeObservListener) {
            removeObservListener()
        }
    })

    valueList._diff = valueArgs

    obs.set(valueList)
    return removed
}

},{"./add-listener.js":24}],29:[function(require,module,exports){
var Observ = require("observ")
var extend = require("xtend")

/* ObservStruct := (Object<String, Observ<T>>) => 
    Object<String, Observ<T>> &
        Observ<Object<String, T> & {
            _diff: Object<String, Any>
        }>

*/
module.exports = ObservStruct

function ObservStruct(struct) {
    var keys = Object.keys(struct)

    var initialState = {}

    keys.forEach(function (key) {
        if (key === "name") {
            throw new Error("cannot create an observ-struct " +
                "with a key named 'name'. Clashes with " +
                "`Function.prototype.name`.");
        }

        var observ = struct[key]
        initialState[key] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    keys.forEach(function (key) {
        var observ = struct[key]
        obs[key] = observ

        if (typeof observ === "function") {
            observ(function (value) {
                var state = extend(obs())
                state[key] = value
                var diff = {}
                diff[key] = value && value._diff ?
                    value._diff : value
                state._diff = diff
                obs.set(state)
            })
        }
    })

    return obs
}

},{"observ":30,"xtend":31}],30:[function(require,module,exports){
module.exports=require(27)
},{}],31:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],32:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var Observ, ObservVarhash, Tombstone, checkKey, diff, extend, getKeyError, methods, watch;

  Observ = require('observ');

  extend = require('xtend');

  ObservVarhash = function(hash, createValue) {
    var initialState, k, key, obs, observ, v, _ref;
    createValue || (createValue = function(obj) {
      return obj;
    });
    initialState = {};
    for (key in hash) {
      observ = hash[key];
      checkKey(key);
      initialState[key] = (typeof observ === "function" ? observ() : void 0) || observ;
    }
    obs = Observ(initialState);
    obs._removeListeners = {};
    _ref = methods(createValue);
    for (k in _ref) {
      v = _ref[k];
      obs[k] = v;
    }
    for (key in hash) {
      observ = hash[key];
      obs[key] = createValue(observ, key);
      obs._removeListeners[key] = typeof obs[key] === "function" ? obs[key](watch(obs, key)) : void 0;
    }
    return obs;
  };

  methods = function(createValue) {
    return {
      get: function(key) {
        return this[key];
      },
      put: function(key, val) {
        var observ, state, _base;
        checkKey(key);
        observ = createValue(val, key);
        state = extend(this());
        state[key] = (typeof observ === "function" ? observ() : void 0) || observ;
        if (typeof (_base = this._removeListeners)[key] === "function") {
          _base[key]();
        }
        this._removeListeners[key] = typeof observ === "function" ? observ(watch(this, key)) : void 0;
        state._diff = diff(key, state[key]);
        this.set(state);
        this[key] = observ;
        return this;
      },
      "delete": function(key) {
        var state, _base;
        state = extend(this());
        if (typeof (_base = this._removeListeners)[key] === "function") {
          _base[key]();
        }
        delete this._removeListeners[key];
        delete state[key];
        state._diff = diff(key, ObservVarhash.Tombstone);
        this.set(state);
        return this;
      }
    };
  };

  watch = function(obs, key) {
    return function(value) {
      var state;
      state = extend(obs());
      state[key] = value;
      state._diff = diff(key, value);
      return obs.set(state);
    };
  };

  diff = function(key, value) {
    var obj;
    obj = {};
    obj[key] = value && value._diff ? value._diff : value;
    return obj;
  };

  checkKey = function(key) {
    var msg;
    if (msg = getKeyError(key)) {
      throw new Error(msg);
    }
  };

  getKeyError = function(key) {
    var reason;
    reason = (function() {
      switch (key) {
        case 'name':
          return 'Clashes with `Function.prototype.name`.';
        case 'get':
        case 'put':
        case 'delete':
        case '_removeListeners':
          return 'Clashes with observ-varhash method';
      }
    })();
    if (!reason) {
      return '';
    }
    return "cannot create an observ-varhash with key `" + key + "`, " + reason;
  };

  Tombstone = function() {};

  Tombstone.prototype.toString = function() {
    return '[object Tombstone]';
  };

  Tombstone.prototype.toJSON = function() {
    return '[object Tombstone]';
  };

  Tombstone.prototype.inspect = function() {
    return '[object Tombstone]';
  };

  ObservVarhash.Tombstone = new Tombstone();

  module.exports = ObservVarhash;

}).call(this);

},{"observ":33,"xtend":35}],33:[function(require,module,exports){
module.exports=require(27)
},{}],34:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],35:[function(require,module,exports){
var Keys = require("object-keys")
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

},{"./has-keys":34,"object-keys":37}],36:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var isFunction = function (fn) {
	var isFunc = (typeof fn === 'function' && !(fn instanceof RegExp)) || toString.call(fn) === '[object Function]';
	if (!isFunc && typeof window !== 'undefined') {
		isFunc = fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt;
	}
	return isFunc;
};

module.exports = function forEach(obj, fn) {
	if (!isFunction(fn)) {
		throw new TypeError('iterator must be a function');
	}
	var i, k,
		isString = typeof obj === 'string',
		l = obj.length,
		context = arguments.length > 2 ? arguments[2] : null;
	if (l === +l) {
		for (i = 0; i < l; i++) {
			if (context === null) {
				fn(isString ? obj.charAt(i) : obj[i], i, obj);
			} else {
				fn.call(context, isString ? obj.charAt(i) : obj[i], i, obj);
			}
		}
	} else {
		for (k in obj) {
			if (hasOwn.call(obj, k)) {
				if (context === null) {
					fn(obj[k], k, obj);
				} else {
					fn.call(context, obj[k], k, obj);
				}
			}
		}
	}
};


},{}],37:[function(require,module,exports){
module.exports = Object.keys || require('./shim');


},{"./shim":39}],38:[function(require,module,exports){
var toString = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toString.call(value);
	var isArguments = str === '[object Arguments]';
	if (!isArguments) {
		isArguments = str !== '[object Array]'
			&& value !== null
			&& typeof value === 'object'
			&& typeof value.length === 'number'
			&& value.length >= 0
			&& toString.call(value.callee) === '[object Function]';
	}
	return isArguments;
};


},{}],39:[function(require,module,exports){
(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		toString = Object.prototype.toString,
		forEach = require('./foreach'),
		isArgs = require('./isArguments'),
		hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
		hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		keysShim;

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object',
			isFunction = toString.call(object) === '[object Function]',
			isArguments = isArgs(object),
			theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError("Object.keys called on a non-object");
		}

		if (isArguments) {
			forEach(object, function (value) {
				theKeys.push(value);
			});
		} else {
			var name,
				skipProto = hasProtoEnumBug && isFunction;

			for (name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(name);
				}
			}
		}

		if (hasDontEnumBug) {
			var ctor = object.constructor,
				skipConstructor = ctor && ctor.prototype === object;

			forEach(dontEnums, function (dontEnum) {
				if (!(skipConstructor && dontEnum === 'constructor') && has.call(object, dontEnum)) {
					theKeys.push(dontEnum);
				}
			});
		}
		return theKeys;
	};

	module.exports = keysShim;
}());


},{"./foreach":36,"./isArguments":38}],40:[function(require,module,exports){
var Observable = require("./index.js")

module.exports = computed

function computed(observables, lambda) {
    var values = observables.map(function (o) {
        return o()
    })
    var result = Observable(lambda.apply(null, values))

    observables.forEach(function (o, index) {
        o(function (newValue) {
            values[index] = newValue
            result.set(lambda.apply(null, values))
        })
    })

    return result
}

},{"./index.js":41}],41:[function(require,module,exports){
module.exports=require(27)
},{}],42:[function(require,module,exports){
module.exports = watch

function watch(observable, listener) {
    var remove = observable(listener)
    listener(observable())
    return remove
}

},{}],43:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

module.exports = ChangeSinkHandler

function ChangeSinkHandler(sink, data) {
    if (!(this instanceof ChangeSinkHandler)) {
        return new ChangeSinkHandler(sink, data)
    }

    this.sink = sink
    this.data = data
    this.type = 'change'
    this.id = sink.id
}

ChangeSinkHandler.prototype.handleEvent = handleEvent

function handleEvent(ev) {
    var target = ev.target

    var isValid =
        (ev.type === 'change' && target.type === 'checkbox') ||
        (ev.type === 'input' && target.type === 'text') ||
        (ev.type === 'change' && target.type === 'range')

    if (!isValid) {
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    if (typeof this.sink === 'function') {
        this.sink(data)
    } else {
        this.sink.write(data)
    }
}

},{"form-data-set/element":47,"xtend":50}],44:[function(require,module,exports){
module.exports = SinkEventHandler

function SinkEventHandler(sink, data) {
    if (!(this instanceof SinkEventHandler)) {
        return new SinkEventHandler(sink, data)
    }

    this.sink = sink
    this.id = sink.id
    this.data = data
}

SinkEventHandler.prototype.handleEvent = handleEvent

function handleEvent(ev) {
    if (typeof this.sink === 'function') {
        this.sink(this.data)
    } else {
        this.sink.write(this.data)
    }
}

},{}],45:[function(require,module,exports){
module.exports = KeyEventHandler

function KeyEventHandler(fn, key, data) {
    if (!(this instanceof KeyEventHandler)) {
        return new KeyEventHandler(fn, key, data)
    }

    this.fn = fn
    this.data = data
    this.key = key
}

KeyEventHandler.prototype.handleEvent = handleEvent

function handleEvent(ev) {
    if (ev.keyCode === this.key) {
        this.fn(this.data)
    }
}

},{}],46:[function(require,module,exports){
var slice = Array.prototype.slice

module.exports = iterativelyWalk

function iterativelyWalk(nodes, cb) {
    if (!('length' in nodes)) {
        nodes = [nodes]
    }
    
    nodes = slice.call(nodes)

    while(nodes.length) {
        var node = nodes.shift(),
            ret = cb(node)

        if (ret) {
            return ret
        }

        if (node.childNodes.length) {
            nodes = slice.call(node.childNodes).concat(nodes)
        }
    }
}

},{}],47:[function(require,module,exports){
var walk = require('dom-walk')

var FormData = require('./index.js')

module.exports = getFormData

function buildElems(rootElem) {
    var hash = {}

    walk(rootElem, function (child) {
        if (child.name) {
            hash[child.name] = child
        }
    })


    return hash
}

function getFormData(rootElem) {
    var elements = buildElems(rootElem)

    return FormData(elements)
}

},{"./index.js":48,"dom-walk":46}],48:[function(require,module,exports){
/*jshint maxcomplexity: 10*/

module.exports = FormData

//TODO: Massive spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#constructing-form-data-set
function FormData(elements) {
    return Object.keys(elements).reduce(function (acc, key) {
        var elem = elements[key]

        acc[key] = valueOfElement(elem)

        return acc
    }, {})
}

function valueOfElement(elem) {
    if (typeof elem === "function") {
        return elem()
    } else if (containsRadio(elem)) {
        var elems = toList(elem)
        var checked = elems.filter(function (elem) {
            return elem.checked
        })[0] || null

        return checked ? checked.value : null
    } else if (Array.isArray(elem)) {
        return elem.map(valueOfElement).filter(filterNull)
    } else if (elem.tagName === undefined && elem.nodeType === undefined) {
        return FormData(elem)
    } else if (elem.tagName === "INPUT" && isChecked(elem)) {
        if (elem.hasAttribute("value")) {
            return elem.checked ? elem.value : null
        } else {
            return elem.checked
        }
    } else if (elem.tagName === "INPUT") {
        return elem.value
    } else if (elem.tagName === "TEXTAREA") {
        return elem.value
    } else if (elem.tagName === "SELECT") {
        return elem.value
    }
}

function isChecked(elem) {
    return elem.type === "checkbox" || elem.type === "radio"
}

function containsRadio(value) {
    if (value.tagName || value.nodeType) {
        return false
    }

    var elems = toList(value)

    return elems.some(function (elem) {
        return elem.tagName === "INPUT" && elem.type === "radio"
    })
}

function toList(value) {
    if (Array.isArray(value)) {
        return value
    }

    return Object.keys(value).map(prop, value)
}

function prop(x) {
    return this[x]
}

function filterNull(val) {
    return val !== null
}

},{}],49:[function(require,module,exports){
module.exports=require(34)
},{}],50:[function(require,module,exports){
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{"./has-keys":49}],51:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var ENTER = 13

module.exports = SubmitSinkHandler

function SubmitSinkHandler(sink, data) {
    if (!(this instanceof SubmitSinkHandler)) {
        return new SubmitSinkHandler(sink, data)
    }

    this.sink = sink
    this.data = data
    this.id = sink.id
    this.type = 'submit'
}

SubmitSinkHandler.prototype.handleEvent = handleEvent

function handleEvent(ev) {
    var target = ev.target

    var isValid =
        (ev.type === 'click' && target.tagName === 'BUTTON') ||
        (
            (target.type === 'text' || target.tagName === 'TEXTAREA') &&
            (ev.keyCode === ENTER && !ev.shiftKey && ev.type === 'keydown')
        )

    if (!isValid) {
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    if (typeof this.sink === 'function') {
        this.sink(data)
    } else {
        this.sink.write(data)
    }
}

},{"form-data-set/element":47,"xtend":50}],52:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

module.exports = ValueEventHandler

function ValueEventHandler(sink, data) {
    if (!(this instanceof ValueEventHandler)) {
        return new ValueEventHandler(sink, data)
    }

    this.sink = sink
    this.data = data
    this.id = sink.id
}

ValueEventHandler.prototype.handleEvent = handleEvent

function handleEvent(ev) {
    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    if (typeof this.sink === 'function') {
        this.sink(data)
    } else {
        this.sink.write(data)
    }
}

},{"form-data-set/element":47,"xtend":50}],53:[function(require,module,exports){
var createElement = require("virtual-dom/create-element")
var diff = require("virtual-dom/diff")
var patch = require("virtual-dom/patch")

var MESSAGE = "partial() cannot cache on values. " + 
    "You must specify object arguments. partial("

function copyOver(list, offset) {
    var newList = []
    for (var i = offset; i < list.length; i++) {
        newList[i - offset] = list[i]
    }
    return newList
}

module.exports = partial

function partial(fn) {
    var args = copyOver(arguments, 1)
    var firstArg = args[0]
    var hasObjects = args.length === 0
    var key

    if (typeof firstArg === "object" && firstArg !== null) {
        hasObjects = true
        if ("key" in firstArg) {
            key = firstArg.key
        } else if ("id" in firstArg) {
            key = firstArg.id
        }
    }

    for (var i = 1; !hasObjects && i < args.length; i++) {
        var arg = args[i];
        if (typeof arg === "object" && arg !== null) {
            hasObjects = true
        }
    }

    if (!hasObjects) {
        throw new Error(MESSAGE + args + ")")
    }

    return new Thunk(fn, args, key)
}

function Thunk(fn, args, key) {
    this.fn = fn
    this.args = args
    this.vnode = null
    this.key = key
}

Thunk.prototype.type = "immutable-thunk"
Thunk.prototype.update = update
Thunk.prototype.init = init

function shouldUpdate(current, previous) {
    if (current.fn !== previous.fn) {
        return true
    }

    var cargs = current.args
    var pargs = previous.args

    // fast case for args is zero case.
    if (cargs.length === 0 && pargs.length === 0) {
        return false
    }

    if (cargs.length !== pargs.length) {
        return true
    }

    var max = cargs.length > pargs.length ? cargs.length : pargs.length

    for (var i = 0; i < max; i++) {
        if (cargs[i] !== pargs[i]) {
            return true
        }
    }

    return false
}

function update(previous, domNode) {
    if (!shouldUpdate(this, previous)) {
        this.vnode = previous.vnode
        return
    }

    if (!this.vnode) {
        this.vnode = this.fn.apply(null, this.args)
    }

    var patches = diff(previous.vnode, this.vnode)
    patch(domNode, patches)
}

function init() {
    this.vnode = this.fn.apply(null, this.args)
    return createElement(this.vnode)
}

},{"virtual-dom/create-element":54,"virtual-dom/diff":55,"virtual-dom/patch":59}],54:[function(require,module,exports){
var createElement = require("./vdom/create-element")

module.exports = createElement

},{"./vdom/create-element":61}],55:[function(require,module,exports){
var diff = require("./vtree/diff")

module.exports = diff

},{"./vtree/diff":66}],56:[function(require,module,exports){
if (typeof document !== "undefined") {
    module.exports = document;
} else {
    module.exports = require("min-document");
}

},{"min-document":4}],57:[function(require,module,exports){
module.exports = isObject

function isObject(x) {
    return typeof x === "object" && x !== null
}

},{}],58:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],59:[function(require,module,exports){
var patch = require("./vdom/patch")

module.exports = patch

},{"./vdom/patch":64}],60:[function(require,module,exports){
var isObject = require("is-object")

var isHook = require("../vtree/is-vhook")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (isHook(propValue)) {
            propValue.hook(node,
                propName,
                previous ? previous[propName] : undefined)
        } else {
            if (isObject(propValue)) {
                if (!isObject(node[propName])) {
                    node[propName] = {}
                }

                for (var k in propValue) {
                    node[propName][k] = propValue[k]
                }
            } else if (propValue !== undefined) {
                node[propName] = propValue
            }
        }
    }
}

},{"../vtree/is-vhook":67,"is-object":57}],61:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vtree/is-vnode")
var isVText = require("../vtree/is-vtext")
var isWidget = require("../vtree/is-widget")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vtree/is-vnode":68,"../vtree/is-vtext":69,"../vtree/is-widget":70,"./apply-properties":60,"global/document":56}],62:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],63:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vtree/is-widget")
var VPatch = require("../vtree/vpatch")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.propeties)
            return domNode
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    if (updateWidget(leftVNode, widget)) {
        return widget.update(leftVNode, domNode) || domNode
    }

    var parentNode = domNode.parentNode
    var newWidget = render(widget, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newWidget, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newWidget
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    for (i = 0; i < len; i++) {
        var move = bIndex[i]
        if (move !== undefined) {
            var node = children[move]
            domNode.removeChild(node)
            domNode.insertBefore(node, childNodes[i])
        }
    }
}

},{"../vtree/is-widget":70,"../vtree/vpatch":73,"./apply-properties":60,"./create-element":61,"./update-widget":65}],64:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")

module.exports = patch

function patch(rootNode, patches) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument
    var renderOptions

    if (ownerDocument !== document) {
        renderOptions = {
            document: ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":62,"./patch-op":63,"global/document":56,"x-is-array":58}],65:[function(require,module,exports){
var isWidget = require("../vtree/is-widget")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("type" in a && "type" in b) {
            return a.type === b.type
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vtree/is-widget":70}],66:[function(require,module,exports){
var isArray = require("x-is-array")
var isObject = require("is-object")

var VPatch = require("./vpatch")
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        hooks(b, patch, index)
        return
    }

    var apply = patch[index]

    if (isWidget(b)) {
        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))

        if (!isWidget(a)) {
            destroyWidgets(a, patch, index)
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            destroyWidgets(a, patch, index)
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties, b.hooks)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                destroyWidgets(a, patch, index)
            }

            apply = diffChildren(a, b, patch, apply, index)
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            destroyWidgets(a, patch, index)
        }
    } else if (b == null) {
        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
        destroyWidgets(a, patch, index)
    }

    if (apply) {
        patch[index] = apply
    }
}

function diffProps(a, b, hooks) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            continue
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (hooks && aKey in hooks) {
            diff = diff || {}
            diff[aKey] = bValue
        } else {
            if (isObject(aValue) && isObject(bValue)) {
                if (getPrototype(bValue) !== getPrototype(aValue)) {
                    diff = diff || {}
                    diff[aKey] = bValue
                } else {
                    var objectDiff = diffProps(aValue, bValue)
                    if (objectDiff) {
                        diff = diff || {}
                        diff[aKey] = objectDiff
                    }
                }
            } else if (aValue !== bValue && bValue !== undefined) {
                diff = diff || {}
                diff[aKey] = bValue
            }
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else if (!rightNode) {
            if (leftNode) {
                // Excess nodes in a need to be removed
                patch[index] = new VPatch(VPatch.REMOVE, leftNode, null)
                destroyWidgets(leftNode, patch, index)
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = new VPatch(VPatch.REMOVE, vNode, null)
        }
    } else if (isVNode(vNode) && vNode.hasWidgets) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    }
}

// Execute hooks when two nodes are identical
function hooks(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = new VPatch(VPatch.PROPS, vNode.hooks, vNode.hooks)
        }

        if (vNode.descendantHooks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                hooks(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    }
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var key in bKeys) {
        bMatch[bKeys[key]] = aKeys[key]
    }

    for (var key in aKeys) {
        aMatch[aKeys[key]] = bKeys[key]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = shuffle.moves = {}

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            moves[move] = moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                moves[freeIndex] = moveIndex++
                shuffle[i] = bChildren[freeIndex]
                freeIndex++
            }
        }
        i++
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"./is-vnode":68,"./is-vtext":69,"./is-widget":70,"./vpatch":73,"is-object":57,"x-is-array":58}],67:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook && typeof hook.hook === "function" &&
        !hook.hasOwnProperty("hook")
}

},{}],68:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualNode" && x.version === version
}

},{"./version":71}],69:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualText" && x.version === version
}

},{"./version":71}],70:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && typeof w.init === "function" && typeof w.update === "function"
}

},{}],71:[function(require,module,exports){
module.exports = "1"

},{}],72:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property)) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-vhook":67,"./is-vnode":68,"./is-widget":70,"./version":71}],73:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version.split(".")
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":71}],74:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":71}],75:[function(require,module,exports){
module.exports = AttributeHook;

function AttributeHook(value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(value);
    }

    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.value === this.value) {
        return;
    }

    node.setAttributeNS(null, prop, this.value)
}

},{}],76:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(5)

    ds[propName] = this.value;
};

},{"data-set":81}],77:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(3)

    ds[propName] = this.value;
};

},{"data-set":81}],78:[function(require,module,exports){
module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],79:[function(require,module,exports){
var VNode = require("virtual-dom/vtree/vnode.js")
var VText = require("virtual-dom/vtree/vtext.js")
var isVNode = require("virtual-dom/vtree/is-vnode")
var isVText = require("virtual-dom/vtree/is-vtext")
var isWidget = require("virtual-dom/vtree/is-widget")
var isHook = require("virtual-dom/vtree/is-vhook")

var parseTag = require("./parse-tag.js")
var softSetHook = require("./hooks/soft-set-hook.js")
var dataSetHook = require("./hooks/data-set-hook.js")
var evHook = require("./hooks/ev-hook.js")

module.exports = h

function h(tagName, properties, children) {
    var childNodes = []
    var tag, props, key, namespace

    if (!children && isChildren(properties)) {
        children = properties
        props = {}
    }

    props = props || properties || {}
    tag = parseTag(tagName, props)

    if (children) {
        addChild(children, childNodes)
    }

    // support keys
    if ("key" in props) {
        key = props.key
        props.key = undefined
    }

    // support namespace
    if ("namespace" in props) {
        namespace = props.namespace
        props.namespace = undefined
    }

    // fix cursor bug
    if (tag === "input" &&
        "value" in props &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value)
    }

    var keys = Object.keys(props)
    var propName, value
    for (var j = 0; j < keys.length; j++) {
        propName = keys[j]
        value = props[propName]
        if (isHook(value)) {
            continue
        }

        // add data-foo support
        if (propName.substr(0, 5) === "data-") {
            props[propName] = dataSetHook(value)
        }

        // add ev-foo support
        if (propName.substr(0, 3) === "ev-") {
            props[propName] = evHook(value)
        }
    }


    return new VNode(tag, props, childNodes, key, namespace)
}

function addChild(c, childNodes) {
    if (typeof c === "string") {
        childNodes.push(new VText(c))
    } else if (isChild(c)) {
        childNodes.push(c)
    } else if (Array.isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes)
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x) || isChild(x)
}

},{"./hooks/data-set-hook.js":76,"./hooks/ev-hook.js":77,"./hooks/soft-set-hook.js":78,"./parse-tag.js":85,"virtual-dom/vtree/is-vhook":67,"virtual-dom/vtree/is-vnode":68,"virtual-dom/vtree/is-vtext":69,"virtual-dom/vtree/is-widget":70,"virtual-dom/vtree/vnode.js":72,"virtual-dom/vtree/vtext.js":74}],80:[function(require,module,exports){
module.exports=require(10)
},{}],81:[function(require,module,exports){
module.exports=require(11)
},{"./create-hash.js":80,"individual":82,"weakmap-shim/create-store":83}],82:[function(require,module,exports){
module.exports=require(15)
},{}],83:[function(require,module,exports){
module.exports=require(12)
},{"./hidden-store.js":84}],84:[function(require,module,exports){
module.exports=require(13)
},{}],85:[function(require,module,exports){
var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/
var notClassId = /^\.|#/

module.exports = parseTag

function parseTag(tag, props) {
    if (!tag) {
        return "div"
    }

    var noId = !("id" in props)

    var tagParts = tag.split(classIdSplit)
    var tagName = null

    if (notClassId.test(tagParts[1])) {
        tagName = "div"
    }

    var classes, part, type, i
    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i]

        if (!part) {
            continue
        }

        type = part.charAt(0)

        if (!tagName) {
            tagName = part
        } else if (type === ".") {
            classes = classes || []
            classes.push(part.substring(1, part.length))
        } else if (type === "#" && noId) {
            props.id = part.substring(1, part.length)
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className)
        }

        props.className = classes.join(" ")
    }

    return tagName ? tagName.toLowerCase() : "div"
}

},{}],86:[function(require,module,exports){
var attributeHook = require("./hooks/attribute-hook.js")
var h = require("./index.js")

var BLACKLISTED_KEYS = {
    "style": true,
    "namespace": true,
    "key": true
}
var SVG_NAMESPACE = "http://www.w3.org/2000/svg"

module.exports = svg

function svg(tagName, properties, children) {
    if (!children && isChildren(properties)) {
        children = properties
        properties = {}
    }

    properties = properties || {}

    // set namespace for svg
    properties.namespace = SVG_NAMESPACE

    // for each key, if attribute & string, bool or number then
    // convert it into a setAttribute hook
    for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
            continue
        }

        if (BLACKLISTED_KEYS[key]) {
            continue
        }

        var value = properties[key]
        if (typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            continue
        }

        properties[key] = attributeHook(value)
    }

    return h(tagName, properties, children)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x)
}

},{"./hooks/attribute-hook.js":75,"./index.js":79}],87:[function(require,module,exports){
var OFFSET = Math.pow(2, 16);
var MAXSEG = OFFSET - 1;
var MAXVER = Math.pow(OFFSET, 3) - 1;

/**
  # slimver

  An experimental implementation for working with
  [slimver](https://github.com/DamonOehlman/slimver-spec).

  ## Reference

**/

/**
  ### slimver(version)

  Pack a `MAJOR.MINOR.PATCH` version string into a single numeric value.

  <<< examples/pack.js

**/
function slim(version) {
  var parts;

  if (typeof version == 'number') {
    return version;
  }

  parts = Array.isArray(version) ? version : split(version);
  return parts ?
    parts[0] * (OFFSET * OFFSET) + parts[1] * OFFSET + parts[2] :
    null;
}

function compatibleWith(version) {
  var parts = split(version);

  if (! parts) {
    return null;
  }

  return [slim(parts), slim([parts[0], MAXSEG, MAXSEG])];
}

function rangeFromPattern(parts) {
  var low = [].concat(parts);
  var high = [].concat(parts);

  if (! parts) {
    return null;
  }

  while (low.length < 3) {
    low.push(0);
  }

  while (high.length < 3) {
    high.push(MAXSEG);
  }

  return [slim(low), slim(high)];
}

function invert(value) {
  return value === null ? null : MAXVER - value;
}

/**
  ### slimver.range(expression)

  Return a 2-element array for [low, high] range of the version values that
  will satisfy the expression.

  <<< examples/range.js

**/
function range(expression) {
  var firstChar;
  var parts;
  var val;

  if (expression === 'any' || expression == '' || expression === '*') {
    return [0, MAXVER];
  }

  expression = ('' + expression).trim();
  firstChar = expression.charAt(0);

  if (firstChar === '^' || firstChar === '~') {
    return compatibleWith(expression.slice(1));
  }

  // split the string
  parts = expression.split('.').filter(function(part) {
    return !isNaN(+part);
  });

  // if we have exactly 3 parts, then range from and two the low to high value
  if (parts.length === 3) {
    val = slim(parts.join('.'));
    return [val, val];
  }

  return rangeFromPattern(parts);
}

/**
  ### slimver.satisfies(version, rangeExpr)

  Return true if the input version string satisfies the provided range
  expression.

  <<< examples/satisfies.js

**/
function satisfies(version, rangeExpr) {
  var bounds = range(rangeExpr);
  var v = slim(version);

  return v !== null && bounds && v >= bounds[0] && v <= bounds[1];
}

function split(version) {
  var invalid = false;
  var parts;

  if (typeof version == 'number') {
    version = (version | 0) + '.0.0';
  }

  if (! version) {
    return null;
  }

  // extract the parts and convert to numeric values
  parts = ('' + version).split('.').map(function(part) {
    var val = +part;

    invalid = invalid || isNaN(val) || (val >= OFFSET);
    return val;
  });

  // ensure we have enough parts
  while (parts.length < 3) {
    parts.push(0);
  }

  return invalid ? null : parts;
}

/**
  ### slimver.unpack(value)

  Convert a slimver numeric value back to it's `MAJOR.MINOR.PATCH` string format.

  <<< examples/unpack.js

**/
function unpack(value) {
  var parts;

  if (typeof value != 'number') {
    return null;
  }

  parts = new Uint16Array([
    value / OFFSET / OFFSET,
    value / OFFSET,
    value
  ]);

  return parts[0] + '.' + parts[1] + '.' + parts[2];
}

/* exports */

slim.invert = invert;
slim.range = range;
slim.satisfies = satisfies;
slim.unpack = slim.stringify = unpack;

module.exports = slim;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9hcHAvZW5jb2Rlci5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9hcHAvcmFuZ2V0ZXN0ZXIuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9hZGQtZXZlbnQuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvZG9tLWRlbGVnYXRvci5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZGF0YS1zZXQvY3JlYXRlLWhhc2guanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2RhdGEtc2V0L2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9kYXRhLXNldC9ub2RlX21vZHVsZXMvd2Vha21hcC1zaGltL2NyZWF0ZS1zdG9yZS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZGF0YS1zZXQvbm9kZV9tb2R1bGVzL3dlYWttYXAtc2hpbS9oaWRkZW4tc3RvcmUuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9wcm94eS1ldmVudC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9yZW1vdmUtZXZlbnQuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL2V2ZW50LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9tdWx0aXBsZS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZ2V2YWwvc2luZ2xlLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3AvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvcmFmL3BvbHlmaWxsLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYWRkLWxpc3RlbmVyLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktbWV0aG9kcy5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvbm9kZV9tb2R1bGVzL29ic2Vydi9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L3NwbGljZS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9ub2RlX21vZHVsZXMveHRlbmQvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi12YXJoYXNoL2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9ub2RlX21vZHVsZXMveHRlbmQvaGFzLWtleXMuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi12YXJoYXNoL25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXZhcmhhc2gvbm9kZV9tb2R1bGVzL3h0ZW5kL25vZGVfbW9kdWxlcy9vYmplY3Qta2V5cy9mb3JlYWNoLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9ub2RlX21vZHVsZXMveHRlbmQvbm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9ub2RlX21vZHVsZXMveHRlbmQvbm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2lzQXJndW1lbnRzLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9ub2RlX21vZHVsZXMveHRlbmQvbm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL3NoaW0uanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi9jb21wdXRlZC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2L3dhdGNoLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9jaGFuZ2UuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2V2ZW50LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9rZXkuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy9kb20td2Fsay9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvZWxlbWVudC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvc3VibWl0LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC92YWx1ZS5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vY3JlYXRlLWVsZW1lbnQuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL2RpZmYuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9pcy1vYmplY3QvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy94LWlzLWFycmF5L2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS9wYXRjaC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9hcHBseS1wcm9wZXJ0aWVzLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL2RvbS1pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9wYXRjaC1vcC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9wYXRjaC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS91cGRhdGUtd2lkZ2V0LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS9kaWZmLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS9pcy12aG9vay5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdnRyZWUvaXMtdm5vZGUuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL2lzLXZ0ZXh0LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS9pcy13aWRnZXQuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL3ZlcnNpb24uanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL3Zub2RlLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS92cGF0Y2guanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL3Z0ZXh0LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2F0dHJpYnV0ZS1ob29rLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2RhdGEtc2V0LWhvb2suanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaG9va3MvZXYtaG9vay5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9zb2Z0LXNldC1ob29rLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L2luZGV4LmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9EYW1vbk9laGxtYW4vc2xpbXZlci1zcGVjL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L3BhcnNlLXRhZy5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYy9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1oeXBlcnNjcmlwdC9zdmcuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL0RhbW9uT2VobG1hbi9zbGltdmVyLXNwZWMvbm9kZV9tb2R1bGVzL3NsaW12ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBOztBQ0ZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgbWVyY3VyeSA9IHJlcXVpcmUoJ21lcmN1cnknKTtcbnZhciBzbGltID0gcmVxdWlyZSgnc2xpbXZlcicpO1xudmFyIGFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lbmNvZGVyJyk7XG52YXIgaCA9IG1lcmN1cnkuaDtcblxuLy8gY3JlYXRlIHRoZSByYW5nZSB0ZXN0ZXJcbnZhciByYW5nZSA9IG1lcmN1cnkudmFsdWUoJzEuMC4wJyk7XG52YXIgcmFuZ2VDaGFuZ2UgPSBtZXJjdXJ5LmlucHV0KCk7XG5cbnJhbmdlQ2hhbmdlKGZ1bmN0aW9uKGRhdGEpIHtcbiAgcmFuZ2Uuc2V0KGRhdGEudmVyc2lvbik7XG59KTtcblxuXG5mdW5jdGlvbiByZW5kZXJSYW5nZSh2YWx1ZSkge1xuICB2YXIgZW5jb2RlZCA9IHNsaW0odmFsdWUpO1xuXG4gIHJldHVybiBoKCdkaXYnLCBbXG4gICAgaCgnaDInLCAnRW5jb2RpbmcgVGVzdGVyJyksXG4gICAgaCgnZGl2JywgW1xuICAgICAgaCgnbGFiZWwnLCAnVmVyc2lvbjogJyksXG4gICAgICBoKCdpbnB1dCcsIHtcbiAgICAgICAgJ2V2LWV2ZW50JzogbWVyY3VyeS5jaGFuZ2VFdmVudChyYW5nZUNoYW5nZSksXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgbmFtZTogJ3ZlcnNpb24nXG4gICAgICB9KVxuICAgIF0pLFxuICAgIGgoJ2RpdicsIFtcbiAgICAgIGgoJ2xhYmVsJywgJ0VuY29kZWQ6ICcpLFxuICAgICAgaCgnY29kZScsICcnICsgKGVuY29kZWQgIT09IG51bGwgPyBlbmNvZGVkIDogJycpKVxuICAgIF0pXG4gIF0pO1xufVxuXG5tZXJjdXJ5LmFwcChhcHAsIHJhbmdlLCByZW5kZXJSYW5nZSk7XG4iLCJ2YXIgbWVyY3VyeSA9IHJlcXVpcmUoJ21lcmN1cnknKTtcbnZhciBzbGltID0gcmVxdWlyZSgnc2xpbXZlcicpO1xudmFyIGFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yYW5nZXRlc3RlcicpO1xudmFyIGggPSBtZXJjdXJ5Lmg7XG5cbnZhciBrZXlzID0gWydyYW5nZScsICd2ZXJzaW9uJ107XG52YXIgZXZlbnRzID0gbWVyY3VyeS5pbnB1dChrZXlzKTtcbnZhciBtb2RlbCA9IG1lcmN1cnkuc3RydWN0KHtcbiAgcmFuZ2U6IG1lcmN1cnkudmFsdWUoJ14xLjAuMCcpLFxuICB2ZXJzaW9uOiBtZXJjdXJ5LnZhbHVlKCcxLjAuMCcpXG59KTtcblxua2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICBldmVudHNba2V5XShmdW5jdGlvbihkYXRhKSB7XG4gICAgbW9kZWxba2V5XS5zZXQoZGF0YVtrZXldKTtcbiAgfSk7XG59KTtcblxuZnVuY3Rpb24gcmVuZGVyKGRhdGEpIHtcbiAgdmFyIHNhdGlzZmllcyA9IHNsaW0uc2F0aXNmaWVzKGRhdGEudmVyc2lvbiwgZGF0YS5yYW5nZSk7XG5cbiAgcmV0dXJuIGgoJ2RpdicsIFtcbiAgICBoKCdoMicsICdSYW5nZSBUZXN0ZXInKSxcbiAgICBoKCdkaXYnLCBbXG4gICAgICBoKCdsYWJlbCcsICdSYW5nZTogJyksXG4gICAgICBoKCdpbnB1dCcsIHtcbiAgICAgICAgJ2V2LWV2ZW50JzogbWVyY3VyeS5jaGFuZ2VFdmVudChldmVudHMucmFuZ2UpLFxuICAgICAgICB2YWx1ZTogZGF0YS5yYW5nZSxcbiAgICAgICAgbmFtZTogJ3JhbmdlJ1xuICAgICAgfSlcbiAgICBdKSxcbiAgICBoKCdkaXYnLCBbXG4gICAgICBoKCdsYWJlbCcsICdWZXJzaW9uOiAnKSxcbiAgICAgIGgoJ2lucHV0Jywge1xuICAgICAgICAnZXYtZXZlbnQnOiBtZXJjdXJ5LmNoYW5nZUV2ZW50KGV2ZW50cy52ZXJzaW9uKSxcbiAgICAgICAgdmFsdWU6IGRhdGEudmVyc2lvbixcbiAgICAgICAgbmFtZTogJ3ZlcnNpb24nXG4gICAgICB9KVxuICAgIF0pLFxuICAgIGgoJ2RpdicsIFtcbiAgICAgIGgoJ2xhYmVsJywgJ1NhdGlzZmllcz86ICcpLFxuICAgICAgaCgnY29kZScsIHNhdGlzZmllcyA/ICd0cnVlJyA6ICdmYWxzZScpXG4gICAgXSlcbiAgXSk7XG59XG5cbm1lcmN1cnkuYXBwKGFwcCwgbW9kZWwsIHJlbmRlcik7XG4iLCJyZXF1aXJlKCcuL2FwcC9lbmNvZGVyJyk7XG5yZXF1aXJlKCcuL2FwcC9yYW5nZXRlc3RlcicpO1xuIixudWxsLCJ2YXIgU2luZ2xlRXZlbnQgPSByZXF1aXJlKFwiZ2V2YWwvc2luZ2xlXCIpXG52YXIgTXVsdGlwbGVFdmVudCA9IHJlcXVpcmUoXCJnZXZhbC9tdWx0aXBsZVwiKVxuXG4vKlxuICAgIFBybyB0aXA6IERvbid0IHJlcXVpcmUgYG1lcmN1cnlgIGl0c2VsZi5cbiAgICAgIHJlcXVpcmUgYW5kIGRlcGVuZCBvbiBhbGwgdGhlc2UgbW9kdWxlcyBkaXJlY3RseSFcbiovXG52YXIgbWVyY3VyeSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIEVudHJ5XG4gICAgbWFpbjogcmVxdWlyZShcIm1haW4tbG9vcFwiKSxcbiAgICBhcHA6IGFwcCxcblxuICAgIC8vIElucHV0XG4gICAgRGVsZWdhdG9yOiByZXF1aXJlKFwiZG9tLWRlbGVnYXRvclwiKSxcbiAgICBpbnB1dDogaW5wdXQsXG4gICAgZXZlbnQ6IHJlcXVpcmUoXCJ2YWx1ZS1ldmVudC9ldmVudFwiKSxcbiAgICB2YWx1ZUV2ZW50OiByZXF1aXJlKFwidmFsdWUtZXZlbnQvdmFsdWVcIiksXG4gICAgc3VibWl0RXZlbnQ6IHJlcXVpcmUoXCJ2YWx1ZS1ldmVudC9zdWJtaXRcIiksXG4gICAgY2hhbmdlRXZlbnQ6IHJlcXVpcmUoXCJ2YWx1ZS1ldmVudC9jaGFuZ2VcIiksXG4gICAga2V5RXZlbnQ6IHJlcXVpcmUoXCJ2YWx1ZS1ldmVudC9rZXlcIiksXG5cbiAgICAvLyBTdGF0ZVxuICAgIGFycmF5OiByZXF1aXJlKFwib2JzZXJ2LWFycmF5XCIpLFxuICAgIHN0cnVjdDogcmVxdWlyZShcIm9ic2Vydi1zdHJ1Y3RcIiksXG4gICAgLy8gYWxpYXMgc3RydWN0IGFzIGhhc2ggZm9yIGJhY2sgY29tcGF0XG4gICAgaGFzaDogcmVxdWlyZShcIm9ic2Vydi1zdHJ1Y3RcIiksXG4gICAgdmFyaGFzaDogcmVxdWlyZShcIm9ic2Vydi12YXJoYXNoXCIpLFxuICAgIHZhbHVlOiByZXF1aXJlKFwib2JzZXJ2XCIpLFxuXG4gICAgLy8gUmVuZGVyXG4gICAgZGlmZjogcmVxdWlyZShcInZpcnR1YWwtZG9tL2RpZmZcIiksXG4gICAgcGF0Y2g6IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS9wYXRjaFwiKSxcbiAgICBwYXJ0aWFsOiByZXF1aXJlKFwidmRvbS10aHVua1wiKSxcbiAgICBjcmVhdGU6IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS9jcmVhdGUtZWxlbWVudFwiKSxcbiAgICBoOiByZXF1aXJlKFwidmlydHVhbC1oeXBlcnNjcmlwdFwiKSxcbiAgICBzdmc6IHJlcXVpcmUoXCJ2aXJ0dWFsLWh5cGVyc2NyaXB0L3N2Z1wiKSxcblxuICAgIC8vIFV0aWxpdGllc1xuICAgIGNvbXB1dGVkOiByZXF1aXJlKFwib2JzZXJ2L2NvbXB1dGVkXCIpLFxuICAgIHdhdGNoOiByZXF1aXJlKFwib2JzZXJ2L3dhdGNoXCIpXG59XG5cbmZ1bmN0aW9uIGlucHV0KG5hbWVzKSB7XG4gICAgaWYgKCFuYW1lcykge1xuICAgICAgICByZXR1cm4gU2luZ2xlRXZlbnQoKVxuICAgIH1cblxuICAgIHJldHVybiBNdWx0aXBsZUV2ZW50KG5hbWVzKVxufVxuXG5mdW5jdGlvbiBhcHAoZWxlbSwgb2JzZXJ2LCByZW5kZXIsIG9wdHMpIHtcbiAgICBtZXJjdXJ5LkRlbGVnYXRvcihvcHRzKTtcbiAgICB2YXIgbG9vcCA9IG1lcmN1cnkubWFpbihvYnNlcnYoKSwgcmVuZGVyLCBvcHRzKVxuICAgIG9ic2Vydihsb29wLnVwZGF0ZSlcbiAgICBlbGVtLmFwcGVuZENoaWxkKGxvb3AudGFyZ2V0KVxufVxuIiwidmFyIERhdGFTZXQgPSByZXF1aXJlKFwiZGF0YS1zZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRFdmVudFxuXG5mdW5jdGlvbiBhZGRFdmVudCh0YXJnZXQsIHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgZHMgPSBEYXRhU2V0KHRhcmdldClcbiAgICB2YXIgZXZlbnRzID0gZHNbdHlwZV1cblxuICAgIGlmICghZXZlbnRzKSB7XG4gICAgICAgIGRzW3R5cGVdID0gaGFuZGxlclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShldmVudHMpKSB7XG4gICAgICAgIGlmIChldmVudHMuaW5kZXhPZihoYW5kbGVyKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGhhbmRsZXIpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2ZW50cyAhPT0gaGFuZGxlcikge1xuICAgICAgICBkc1t0eXBlXSA9IFtldmVudHMsIGhhbmRsZXJdXG4gICAgfVxufVxuIiwidmFyIGdsb2JhbERvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxudmFyIERhdGFTZXQgPSByZXF1aXJlKFwiZGF0YS1zZXRcIilcblxudmFyIGFkZEV2ZW50ID0gcmVxdWlyZShcIi4vYWRkLWV2ZW50LmpzXCIpXG52YXIgcmVtb3ZlRXZlbnQgPSByZXF1aXJlKFwiLi9yZW1vdmUtZXZlbnQuanNcIilcbnZhciBQcm94eUV2ZW50ID0gcmVxdWlyZShcIi4vcHJveHktZXZlbnQuanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBET01EZWxlZ2F0b3JcblxuZnVuY3Rpb24gRE9NRGVsZWdhdG9yKGRvY3VtZW50KSB7XG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudCB8fCBnbG9iYWxEb2N1bWVudFxuXG4gICAgdGhpcy50YXJnZXQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICB0aGlzLmV2ZW50cyA9IHt9XG4gICAgdGhpcy5yYXdFdmVudExpc3RlbmVycyA9IHt9XG4gICAgdGhpcy5nbG9iYWxMaXN0ZW5lcnMgPSB7fVxufVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudFxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRcblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5hZGRHbG9iYWxFdmVudExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBhZGRHbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBbXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGZuKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKGZuKVxuICAgICAgICB9XG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLnJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXVxuICAgICAgICBpZiAoIWxpc3RlbmVycykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihmbilcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgfVxuICAgIH1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5saXN0ZW5UbyA9IGZ1bmN0aW9uIGxpc3RlblRvKGV2ZW50TmFtZSkge1xuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSB0cnVlXG4gICAgbGlzdGVuKHRoaXMsIGV2ZW50TmFtZSlcbn1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS51bmxpc3RlblRvID0gZnVuY3Rpb24gdW5saXN0ZW5UbyhldmVudE5hbWUpIHtcbiAgICBpZiAoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IGZhbHNlXG4gICAgdW5saXN0ZW4odGhpcywgZXZlbnROYW1lKVxufVxuXG5mdW5jdGlvbiBsaXN0ZW4oZGVsZWdhdG9yLCBldmVudE5hbWUpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSBkZWxlZ2F0b3IucmF3RXZlbnRMaXN0ZW5lcnNbZXZlbnROYW1lXVxuXG4gICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lciA9IGRlbGVnYXRvci5yYXdFdmVudExpc3RlbmVyc1tldmVudE5hbWVdID1cbiAgICAgICAgICAgIGNyZWF0ZUhhbmRsZXIoZXZlbnROYW1lLCBkZWxlZ2F0b3IuZ2xvYmFsTGlzdGVuZXJzKVxuICAgIH1cblxuICAgIGRlbGVnYXRvci50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB1bmxpc3RlbihkZWxlZ2F0b3IsIGV2ZW50TmFtZSkge1xuICAgIHZhciBsaXN0ZW5lciA9IGRlbGVnYXRvci5yYXdFdmVudExpc3RlbmVyc1tldmVudE5hbWVdXG5cbiAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRvbS1kZWxlZ2F0b3IjdW5saXN0ZW5UbzogY2Fubm90IFwiICtcbiAgICAgICAgICAgIFwidW5saXN0ZW4gdG8gXCIgKyBldmVudE5hbWUpXG4gICAgfVxuXG4gICAgZGVsZWdhdG9yLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoZXZlbnROYW1lLCBnbG9iYWxMaXN0ZW5lcnMpIHtcbiAgICByZXR1cm4gaGFuZGxlclxuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihldikge1xuICAgICAgICB2YXIgZ2xvYmFsSGFuZGxlcnMgPSBnbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXVxuICAgICAgICB2YXIgbGlzdGVuZXIgPSBnZXRMaXN0ZW5lcihldi50YXJnZXQsIGV2ZW50TmFtZSlcblxuICAgICAgICB2YXIgaGFuZGxlcnMgPSBnbG9iYWxIYW5kbGVyc1xuICAgICAgICAgICAgLmNvbmNhdChsaXN0ZW5lciA/IGxpc3RlbmVyLmhhbmRsZXJzIDogW10pXG4gICAgICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFyZyA9IG5ldyBQcm94eUV2ZW50KGV2LCBsaXN0ZW5lcilcblxuICAgICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgICAgICBoYW5kbGVyKGFyZykgOiBoYW5kbGVyLmhhbmRsZUV2ZW50KGFyZylcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldExpc3RlbmVyKHRhcmdldCwgdHlwZSkge1xuICAgIC8vIHRlcm1pbmF0ZSByZWN1cnNpb24gaWYgcGFyZW50IGlzIGBudWxsYFxuICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICB2YXIgZHMgPSBEYXRhU2V0KHRhcmdldClcbiAgICAvLyBmZXRjaCBsaXN0IG9mIGhhbmRsZXIgZm5zIGZvciB0aGlzIGV2ZW50XG4gICAgdmFyIGhhbmRsZXIgPSBkc1t0eXBlXVxuICAgIHZhciBhbGxIYW5kbGVyID0gZHMuZXZlbnRcblxuICAgIGlmICghaGFuZGxlciAmJiAhYWxsSGFuZGxlcikge1xuICAgICAgICByZXR1cm4gZ2V0TGlzdGVuZXIodGFyZ2V0LnBhcmVudE5vZGUsIHR5cGUpXG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXJzID0gW10uY29uY2F0KGhhbmRsZXIgfHwgW10sIGFsbEhhbmRsZXIgfHwgW10pXG4gICAgcmV0dXJuIG5ldyBMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZXJzKVxufVxuXG5mdW5jdGlvbiBMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZXJzKSB7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzXG59XG4iLCJ2YXIgSW5kaXZpZHVhbCA9IHJlcXVpcmUoXCJpbmRpdmlkdWFsXCIpXG52YXIgY3VpZCA9IHJlcXVpcmUoXCJjdWlkXCIpXG5cbnZhciBET01EZWxlZ2F0b3IgPSByZXF1aXJlKFwiLi9kb20tZGVsZWdhdG9yLmpzXCIpXG5cbnZhciBkZWxlZ2F0b3JDYWNoZSA9IEluZGl2aWR1YWwoXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVAOFwiLCB7XG4gICAgZGVsZWdhdG9yczoge31cbn0pXG52YXIgY29tbW9uRXZlbnRzID0gW1xuICAgIFwiYmx1clwiLCBcImNoYW5nZVwiLCBcImNsaWNrXCIsICBcImNvbnRleHRtZW51XCIsIFwiZGJsY2xpY2tcIixcbiAgICBcImVycm9yXCIsXCJmb2N1c1wiLCBcImZvY3VzaW5cIiwgXCJmb2N1c291dFwiLCBcImlucHV0XCIsIFwia2V5ZG93blwiLFxuICAgIFwia2V5cHJlc3NcIiwgXCJrZXl1cFwiLCBcImxvYWRcIiwgXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCIsXG4gICAgXCJyZXNpemVcIiwgXCJzY3JvbGxcIiwgXCJzZWxlY3RcIiwgXCJzdWJtaXRcIiwgXCJ1bmxvYWRcIlxuXVxuXG4vKiAgRGVsZWdhdG9yIGlzIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhIHNpbmdsZXRvbiBgRE9NRGVsZWdhdG9yYFxuICAgICAgICBpbnN0YW5jZS5cblxuICAgIE9ubHkgb25lIERPTURlbGVnYXRvciBzaG91bGQgZXhpc3QgYmVjYXVzZSB3ZSBkbyBub3Qgd2FudFxuICAgICAgICBkdXBsaWNhdGUgZXZlbnQgbGlzdGVuZXJzIGJvdW5kIHRvIHRoZSBET00uXG5cbiAgICBgRGVsZWdhdG9yYCB3aWxsIGFsc28gYGxpc3RlblRvKClgIGFsbCBldmVudHMgdW5sZXNzIFxuICAgICAgICBldmVyeSBjYWxsZXIgb3B0cyBvdXQgb2YgaXRcbiovXG5tb2R1bGUuZXhwb3J0cyA9IERlbGVnYXRvclxuXG5mdW5jdGlvbiBEZWxlZ2F0b3Iob3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgdmFyIGRvY3VtZW50ID0gb3B0cy5kb2N1bWVudFxuXG4gICAgdmFyIGNhY2hlS2V5ID0gZG9jdW1lbnQgPyBcbiAgICAgICAgZG9jdW1lbnRbXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVfVE9LRU5AOFwiXSA6IFwiZ2xvYmFsXCJcblxuICAgIGlmICghY2FjaGVLZXkpIHtcbiAgICAgICAgY2FjaGVLZXkgPVxuICAgICAgICAgICAgZG9jdW1lbnRbXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVfVE9LRU5AOFwiXSA9IGN1aWQoKVxuICAgIH1cblxuICAgIHZhciBkZWxlZ2F0b3IgPSBkZWxlZ2F0b3JDYWNoZS5kZWxlZ2F0b3JzW2NhY2hlS2V5XVxuXG4gICAgaWYgKCFkZWxlZ2F0b3IpIHtcbiAgICAgICAgZGVsZWdhdG9yID0gZGVsZWdhdG9yQ2FjaGUuZGVsZWdhdG9yc1tjYWNoZUtleV0gPVxuICAgICAgICAgICAgbmV3IERPTURlbGVnYXRvcihkb2N1bWVudClcbiAgICB9XG5cbiAgICBpZiAob3B0cy5kZWZhdWx0RXZlbnRzICE9PSBmYWxzZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbW1vbkV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZWdhdG9yLmxpc3RlblRvKGNvbW1vbkV2ZW50c1tpXSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWxlZ2F0b3Jcbn1cblxuXG4iLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKiBcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLypnbG9iYWwgd2luZG93LCBuYXZpZ2F0b3IsIGRvY3VtZW50LCByZXF1aXJlLCBwcm9jZXNzLCBtb2R1bGUgKi9cbihmdW5jdGlvbiAoYXBwKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG5hbWVzcGFjZSA9ICdjdWlkJyxcbiAgICBjID0gMCxcbiAgICBibG9ja1NpemUgPSA0LFxuICAgIGJhc2UgPSAzNixcbiAgICBkaXNjcmV0ZVZhbHVlcyA9IE1hdGgucG93KGJhc2UsIGJsb2NrU2l6ZSksXG5cbiAgICBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBzaXplKSB7XG4gICAgICB2YXIgcyA9IFwiMDAwMDAwMDAwXCIgKyBudW07XG4gICAgICByZXR1cm4gcy5zdWJzdHIocy5sZW5ndGgtc2l6ZSk7XG4gICAgfSxcblxuICAgIHJhbmRvbUJsb2NrID0gZnVuY3Rpb24gcmFuZG9tQmxvY2soKSB7XG4gICAgICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICAgICAgICAgIGRpc2NyZXRlVmFsdWVzIDw8IDApXG4gICAgICAgICAgICAudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG4gICAgfSxcblxuICAgIHNhZmVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgYyA9IChjIDwgZGlzY3JldGVWYWx1ZXMpID8gYyA6IDA7XG4gICAgICBjKys7IC8vIHRoaXMgaXMgbm90IHN1YmxpbWluYWxcbiAgICAgIHJldHVybiBjIC0gMTtcbiAgICB9LFxuXG4gICAgYXBpID0gZnVuY3Rpb24gY3VpZCgpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHdpdGggYSBsb3dlcmNhc2UgbGV0dGVyIG1ha2VzXG4gICAgICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gICAgICB2YXIgbGV0dGVyID0gJ2MnLCAvLyBoYXJkLWNvZGVkIGFsbG93cyBmb3Igc2VxdWVudGlhbCBhY2Nlc3NcblxuICAgICAgICAvLyB0aW1lc3RhbXBcbiAgICAgICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgICAgIC8vIHRoYXQgdGhlIHVpZCB3YXMgY3JlYXRlZC5cbiAgICAgICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZyhiYXNlKSxcblxuICAgICAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgICAgICBjb3VudGVyLFxuXG4gICAgICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgICAgIC8vIGNsaWVudHMgKHNvIGRpZmZlcmVudCBjb21wdXRlcnMgYXJlIGZhciBsZXNzXG4gICAgICAgIC8vIGxpa2VseSB0byBnZW5lcmF0ZSB0aGUgc2FtZSBpZClcbiAgICAgICAgZmluZ2VycHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKSxcblxuICAgICAgICAvLyBHcmFiIHNvbWUgbW9yZSBjaGFycyBmcm9tIE1hdGgucmFuZG9tKClcbiAgICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgICAgICAgY291bnRlciA9IHBhZChzYWZlQ291bnRlcigpLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuXG4gICAgICByZXR1cm4gIChsZXR0ZXIgKyB0aW1lc3RhbXAgKyBjb3VudGVyICsgZmluZ2VycHJpbnQgKyByYW5kb20pO1xuICAgIH07XG5cbiAgYXBpLnNsdWcgPSBmdW5jdGlvbiBzbHVnKCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgICAgY291bnRlcixcbiAgICAgIHByaW50ID0gYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoMCwxKSArXG4gICAgICAgIGFwaS5maW5nZXJwcmludCgpLnNsaWNlKC0xKSxcbiAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gICAgICBjb3VudGVyID0gc2FmZUNvdW50ZXIoKS50b1N0cmluZygzNikuc2xpY2UoLTQpO1xuXG4gICAgcmV0dXJuIGRhdGUuc2xpY2UoLTIpICsgXG4gICAgICBjb3VudGVyICsgcHJpbnQgKyByYW5kb207XG4gIH07XG5cbiAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gZ2xvYmFsQ291bnQoKSB7XG4gICAgLy8gV2Ugd2FudCB0byBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG4gICAgdmFyIGNhY2hlID0gKGZ1bmN0aW9uIGNhbGMoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGkgaW4gd2luZG93KSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0oKSk7XG5cbiAgICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjYWNoZTsgfTtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH07XG5cbiAgYXBpLmZpbmdlcnByaW50ID0gZnVuY3Rpb24gYnJvd3NlclByaW50KCkge1xuICAgIHJldHVybiBwYWQoKG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoICtcbiAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICAgICAgYXBpLmdsb2JhbENvdW50KCkudG9TdHJpbmcoMzYpLCA0KTtcbiAgfTtcblxuICAvLyBkb24ndCBjaGFuZ2UgYW55dGhpbmcgZnJvbSBoZXJlIGRvd24uXG4gIGlmIChhcHAucmVnaXN0ZXIpIHtcbiAgICBhcHAucmVnaXN0ZXIobmFtZXNwYWNlLCBhcGkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcGk7XG4gIH0gZWxzZSB7XG4gICAgYXBwW25hbWVzcGFjZV0gPSBhcGk7XG4gIH1cblxufSh0aGlzLmFwcGxpdHVkZSB8fCB0aGlzKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUhhc2hcblxuZnVuY3Rpb24gY3JlYXRlSGFzaChlbGVtKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtLmF0dHJpYnV0ZXNcbiAgICB2YXIgaGFzaCA9IHt9XG5cbiAgICBpZiAoYXR0cmlidXRlcyA9PT0gbnVsbCB8fCBhdHRyaWJ1dGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGF0dHIgPSBhdHRyaWJ1dGVzW2ldXG5cbiAgICAgICAgaWYgKGF0dHIubmFtZS5zdWJzdHIoMCw1KSAhPT0gXCJkYXRhLVwiKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaGFzaFthdHRyLm5hbWUuc3Vic3RyKDUpXSA9IGF0dHIudmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaFxufVxuIiwidmFyIGNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIndlYWttYXAtc2hpbS9jcmVhdGUtc3RvcmVcIilcbnZhciBJbmRpdmlkdWFsID0gcmVxdWlyZShcImluZGl2aWR1YWxcIilcblxudmFyIGNyZWF0ZUhhc2ggPSByZXF1aXJlKFwiLi9jcmVhdGUtaGFzaC5qc1wiKVxuXG52YXIgaGFzaFN0b3JlID0gSW5kaXZpZHVhbChcIl9fREFUQV9TRVRfV0VBS01BUEAzXCIsIGNyZWF0ZVN0b3JlKCkpXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldFxuXG5mdW5jdGlvbiBEYXRhU2V0KGVsZW0pIHtcbiAgICB2YXIgc3RvcmUgPSBoYXNoU3RvcmUoZWxlbSlcblxuICAgIGlmICghc3RvcmUuaGFzaCkge1xuICAgICAgICBzdG9yZS5oYXNoID0gY3JlYXRlSGFzaChlbGVtKVxuICAgIH1cblxuICAgIHJldHVybiBzdG9yZS5oYXNoXG59XG4iLCJ2YXIgaGlkZGVuU3RvcmUgPSByZXF1aXJlKCcuL2hpZGRlbi1zdG9yZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVN0b3JlO1xuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSgpIHtcbiAgICB2YXIga2V5ID0ge307XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgb2JqID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYWttYXAtc2hpbTogS2V5IG11c3QgYmUgb2JqZWN0JylcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdG9yZSA9IG9iai52YWx1ZU9mKGtleSk7XG4gICAgICAgIHJldHVybiBzdG9yZSAmJiBzdG9yZS5pZGVudGl0eSA9PT0ga2V5ID9cbiAgICAgICAgICAgIHN0b3JlIDogaGlkZGVuU3RvcmUob2JqLCBrZXkpO1xuICAgIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGhpZGRlblN0b3JlO1xuXG5mdW5jdGlvbiBoaWRkZW5TdG9yZShvYmosIGtleSkge1xuICAgIHZhciBzdG9yZSA9IHsgaWRlbnRpdHk6IGtleSB9O1xuICAgIHZhciB2YWx1ZU9mID0gb2JqLnZhbHVlT2Y7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBcInZhbHVlT2ZcIiwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgIT09IGtleSA/XG4gICAgICAgICAgICAgICAgdmFsdWVPZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc3RvcmU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG59XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciByb290ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID9cbiAgICBnbG9iYWwgOiB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpdmlkdWFsXG5cbmZ1bmN0aW9uIEluZGl2aWR1YWwoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChyb290W2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHJvb3Rba2V5XVxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyb290LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB2YWx1ZVxufVxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZShcImluaGVyaXRzXCIpXG5cbnZhciBBTExfUFJPUFMgPSBbXG4gICAgXCJhbHRLZXlcIiwgXCJidWJibGVzXCIsIFwiY2FuY2VsYWJsZVwiLCBcImN0cmxLZXlcIixcbiAgICBcImV2ZW50UGhhc2VcIiwgXCJtZXRhS2V5XCIsIFwicmVsYXRlZFRhcmdldFwiLCBcInNoaWZ0S2V5XCIsXG4gICAgXCJ0YXJnZXRcIiwgXCJ0aW1lU3RhbXBcIiwgXCJ0eXBlXCIsIFwidmlld1wiLCBcIndoaWNoXCJcbl1cbnZhciBLRVlfUFJPUFMgPSBbXCJjaGFyXCIsIFwiY2hhckNvZGVcIiwgXCJrZXlcIiwgXCJrZXlDb2RlXCJdXG52YXIgTU9VU0VfUFJPUFMgPSBbXG4gICAgXCJidXR0b25cIiwgXCJidXR0b25zXCIsIFwiY2xpZW50WFwiLCBcImNsaWVudFlcIiwgXCJsYXllclhcIixcbiAgICBcImxheWVyWVwiLCBcIm9mZnNldFhcIiwgXCJvZmZzZXRZXCIsIFwicGFnZVhcIiwgXCJwYWdlWVwiLFxuICAgIFwic2NyZWVuWFwiLCBcInNjcmVlbllcIiwgXCJ0b0VsZW1lbnRcIlxuXVxuXG52YXIgcmtleUV2ZW50ID0gL15rZXl8aW5wdXQvXG52YXIgcm1vdXNlRXZlbnQgPSAvXig/Om1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnUpfGNsaWNrL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3h5RXZlbnRcblxuZnVuY3Rpb24gUHJveHlFdmVudChldiwgbGlzdGVuZXIpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJveHlFdmVudCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eUV2ZW50KGV2LCBsaXN0ZW5lcilcbiAgICB9XG5cbiAgICBpZiAocmtleUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBLZXlFdmVudChldiwgbGlzdGVuZXIpXG4gICAgfSBlbHNlIGlmIChybW91c2VFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VFdmVudChldiwgbGlzdGVuZXIpXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBTExfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3BLZXkgPSBBTExfUFJPUFNbaV1cbiAgICAgICAgdGhpc1twcm9wS2V5XSA9IGV2W3Byb3BLZXldXG4gICAgfVxuXG4gICAgdGhpcy5fcmF3RXZlbnQgPSBldlxuICAgIHRoaXMuY3VycmVudFRhcmdldCA9IGxpc3RlbmVyID8gbGlzdGVuZXIuY3VycmVudFRhcmdldCA6IG51bGxcbn1cblxuUHJveHlFdmVudC5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fcmF3RXZlbnQucHJldmVudERlZmF1bHQoKVxufVxuXG5mdW5jdGlvbiBNb3VzZUV2ZW50KGV2LCBsaXN0ZW5lcikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTU9VU0VfUFJPUFMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG1vdXNlUHJvcEtleSA9IE1PVVNFX1BST1BTW2pdXG4gICAgICAgIHRoaXNbbW91c2VQcm9wS2V5XSA9IGV2W21vdXNlUHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbGlzdGVuZXIgPyBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0IDogbnVsbFxufVxuXG5pbmhlcml0cyhNb3VzZUV2ZW50LCBQcm94eUV2ZW50KVxuXG5mdW5jdGlvbiBLZXlFdmVudChldiwgbGlzdGVuZXIpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEFMTF9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcHJvcEtleSA9IEFMTF9QUk9QU1tpXVxuICAgICAgICB0aGlzW3Byb3BLZXldID0gZXZbcHJvcEtleV1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IEtFWV9QUk9QUy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIga2V5UHJvcEtleSA9IEtFWV9QUk9QU1tqXVxuICAgICAgICB0aGlzW2tleVByb3BLZXldID0gZXZba2V5UHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbGlzdGVuZXIgPyBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0IDogbnVsbFxufVxuXG5pbmhlcml0cyhLZXlFdmVudCwgUHJveHlFdmVudClcbiIsInZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gcmVtb3ZlRXZlbnRcblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnQodGFyZ2V0LCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGRzID0gRGF0YVNldCh0YXJnZXQpXG4gICAgdmFyIGV2ZW50cyA9IGRzW3R5cGVdXG5cbiAgICBpZiAoIWV2ZW50cykge1xuICAgICAgICByZXR1cm5cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnRzKSkge1xuICAgICAgICB2YXIgaW5kZXggPSBldmVudHMuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudHMgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgZHNbdHlwZV0gPSBudWxsXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBFdmVudFxuXG5mdW5jdGlvbiBFdmVudCgpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gW11cblxuICAgIHJldHVybiB7IGJyb2FkY2FzdDogYnJvYWRjYXN0LCBsaXN0ZW46IGV2ZW50IH1cblxuICAgIGZ1bmN0aW9uIGJyb2FkY2FzdCh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGlzdGVuZXJzW2ldKHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXZlbnQobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG5cbiAgICAgICAgcmV0dXJuIHJlbW92ZUxpc3RlbmVyXG5cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcilcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGV2ZW50ID0gcmVxdWlyZShcIi4vc2luZ2xlLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gbXVsdGlwbGVcblxuZnVuY3Rpb24gbXVsdGlwbGUobmFtZXMpIHtcbiAgICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIG5hbWUpIHtcbiAgICAgICAgYWNjW25hbWVdID0gZXZlbnQoKVxuICAgICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG59XG4iLCJ2YXIgRXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGVcblxuZnVuY3Rpb24gU2luZ2xlKCkge1xuICAgIHZhciB0dXBsZSA9IEV2ZW50KClcblxuICAgIHJldHVybiBmdW5jdGlvbiBldmVudCh2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0dXBsZS5saXN0ZW4odmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHVwbGUuYnJvYWRjYXN0KHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHJhZiA9IHJlcXVpcmUoXCJyYWYvcG9seWZpbGxcIilcbnZhciB2ZG9tQ3JlYXRlID0gcmVxdWlyZShcInZpcnR1YWwtZG9tL2NyZWF0ZS1lbGVtZW50XCIpXG52YXIgdmRvbURpZmYgPSByZXF1aXJlKFwidmlydHVhbC1kb20vZGlmZlwiKVxudmFyIHZkb21QYXRjaCA9IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS9wYXRjaFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1haW5cblxuZnVuY3Rpb24gbWFpbihpbml0aWFsU3RhdGUsIHZpZXcsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fVxuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IGluaXRpYWxTdGF0ZVxuICAgIHZhciBjcmVhdGUgPSBvcHRzLmNyZWF0ZSB8fCB2ZG9tQ3JlYXRlXG4gICAgdmFyIGRpZmYgPSBvcHRzLmRpZmYgfHwgdmRvbURpZmZcbiAgICB2YXIgcGF0Y2ggPSBvcHRzLnBhdGNoIHx8IHZkb21QYXRjaFxuICAgIHZhciByZWRyYXdTY2hlZHVsZWQgPSBmYWxzZVxuXG4gICAgdmFyIHRyZWUgPSB2aWV3KGN1cnJlbnRTdGF0ZSlcbiAgICB2YXIgdGFyZ2V0ID0gY3JlYXRlKHRyZWUsIG9wdHMpXG5cbiAgICBjdXJyZW50U3RhdGUgPSBudWxsXG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGUoc3RhdGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gbnVsbCAmJiAhcmVkcmF3U2NoZWR1bGVkKSB7XG4gICAgICAgICAgICByZWRyYXdTY2hlZHVsZWQgPSB0cnVlXG4gICAgICAgICAgICByYWYocmVkcmF3KVxuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFN0YXRlID0gc3RhdGVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgIHJlZHJhd1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoY3VycmVudFN0YXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdUcmVlID0gdmlldyhjdXJyZW50U3RhdGUpXG5cbiAgICAgICAgaWYgKG9wdHMuY3JlYXRlT25seSkge1xuICAgICAgICAgICAgY3JlYXRlKG5ld1RyZWUsIG9wdHMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcGF0Y2hlcyA9IGRpZmYodHJlZSwgbmV3VHJlZSwgb3B0cylcbiAgICAgICAgICAgIHBhdGNoKHRhcmdldCwgcGF0Y2hlcywgb3B0cylcbiAgICAgICAgfVxuXG4gICAgICAgIHRyZWUgPSBuZXdUcmVlXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG51bGxcbiAgICB9XG59XG4iLCJ2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzIDogd2luZG93XG5cbnZhciBfcmFmID1cbiAgZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICBnbG9iYWwud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgZ2xvYmFsLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIGdsb2JhbC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIChnbG9iYWwuc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4sIGVsKSB7XG4gICAgc2V0SW1tZWRpYXRlKGZuKVxuICB9IDpcbiAgZnVuY3Rpb24oZm4sIGVsKSB7XG4gICAgc2V0VGltZW91dChmbiwgMClcbiAgfSlcblxubW9kdWxlLmV4cG9ydHMgPSBfcmFmXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFkZExpc3RlbmVyXG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKG9ic2VydkFycmF5LCBvYnNlcnYpIHtcbiAgICB2YXIgbGlzdCA9IG9ic2VydkFycmF5Ll9saXN0XG5cbiAgICByZXR1cm4gb2JzZXJ2KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gIG9ic2VydkFycmF5KCkuc2xpY2UoKVxuICAgICAgICB2YXIgaW5kZXggPSBsaXN0LmluZGV4T2Yob2JzZXJ2KVxuXG4gICAgICAgIC8vIFRoaXMgY29kZSBwYXRoIHNob3VsZCBuZXZlciBoaXQuIElmIHRoaXMgaGFwcGVuc1xuICAgICAgICAvLyB0aGVyZSdzIGEgYnVnIGluIHRoZSBjbGVhbnVwIGNvZGVcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIm9ic2Vydi1hcnJheTogVW5yZW1vdmVkIG9ic2VydiBsaXN0ZW5lclwiXG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICAgICAgICBlcnIubGlzdCA9IGxpc3RcbiAgICAgICAgICAgIGVyci5pbmRleCA9IGluZGV4XG4gICAgICAgICAgICBlcnIub2JzZXJ2ID0gb2JzZXJ2XG4gICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlTGlzdC5zcGxpY2UoaW5kZXgsIDEsIHZhbHVlKVxuICAgICAgICB2YWx1ZUxpc3QuX2RpZmYgPSBbaW5kZXgsIDEsIHZhbHVlXVxuXG4gICAgICAgIG9ic2VydkFycmF5LnNldCh2YWx1ZUxpc3QpXG4gICAgfSlcbn1cbiIsInZhciBPYnNlcnZBcnJheSA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG52YXIgQVJSQVlfTUVUSE9EUyA9IFtcbiAgICBcImNvbmNhdFwiLCBcInNsaWNlXCIsIFwiZXZlcnlcIiwgXCJmaWx0ZXJcIiwgXCJmb3JFYWNoXCIsIFwiaW5kZXhPZlwiLFxuICAgIFwiam9pblwiLCBcImxhc3RJbmRleE9mXCIsIFwibWFwXCIsIFwicmVkdWNlXCIsIFwicmVkdWNlUmlnaHRcIixcbiAgICBcInNvbWVcIiwgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCJcbl1cblxudmFyIG1ldGhvZHMgPSBBUlJBWV9NRVRIT0RTLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBbbmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzID0gdGhpcy5fbGlzdFtuYW1lXS5hcHBseSh0aGlzLl9saXN0LCBhcmd1bWVudHMpXG5cbiAgICAgICAgaWYgKHJlcyAmJiBBcnJheS5pc0FycmF5KHJlcykpIHtcbiAgICAgICAgICAgIHJlcyA9IE9ic2VydkFycmF5KHJlcylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheU1ldGhvZHNcblxuZnVuY3Rpb24gQXJyYXlNZXRob2RzKG9icykge1xuICAgIG9icy5wdXNoID0gb2JzZXJ2QXJyYXlQdXNoXG4gICAgb2JzLnBvcCA9IG9ic2VydkFycmF5UG9wXG4gICAgb2JzLnNoaWZ0ID0gb2JzZXJ2QXJyYXlTaGlmdFxuICAgIG9icy51bnNoaWZ0ID0gb2JzZXJ2QXJyYXlVbnNoaWZ0XG4gICAgb2JzLnJldmVyc2UgPSBub3RJbXBsZW1lbnRlZFxuICAgIG9icy5zb3J0ID0gbm90SW1wbGVtZW50ZWRcblxuICAgIG1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAodHVwbGUpIHtcbiAgICAgICAgb2JzW3R1cGxlWzBdXSA9IHR1cGxlWzFdXG4gICAgfSlcbiAgICByZXR1cm4gb2JzXG59XG5cblxuXG5mdW5jdGlvbiBvYnNlcnZBcnJheVB1c2goKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBhcmdzLnVuc2hpZnQodGhpcy5fbGlzdC5sZW5ndGgsIDApXG4gICAgdGhpcy5zcGxpY2UuYXBwbHkodGhpcywgYXJncylcblxuICAgIHJldHVybiB0aGlzLl9saXN0Lmxlbmd0aFxufVxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlQb3AoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BsaWNlKHRoaXMuX2xpc3QubGVuZ3RoIC0gMSwgMSlbMF1cbn1cbmZ1bmN0aW9uIG9ic2VydkFycmF5U2hpZnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BsaWNlKDAsIDEpWzBdXG59XG5mdW5jdGlvbiBvYnNlcnZBcnJheVVuc2hpZnQoKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBhcmdzLnVuc2hpZnQoMCwgMClcbiAgICB0aGlzLnNwbGljZS5hcHBseSh0aGlzLCBhcmdzKVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG5cblxuZnVuY3Rpb24gbm90SW1wbGVtZW50ZWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUHVsbCByZXF1ZXN0IHdlbGNvbWVcIilcbn1cbiIsInZhciBPYnNlcnYgPSByZXF1aXJlKFwib2JzZXJ2XCIpXG5cbi8vIGNpcmN1bGFyIGRlcCBiZXR3ZWVuIEFycmF5TWV0aG9kcyAmIHRoaXMgZmlsZVxubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZBcnJheVxuXG52YXIgc3BsaWNlID0gcmVxdWlyZShcIi4vc3BsaWNlLmpzXCIpXG52YXIgQXJyYXlNZXRob2RzID0gcmVxdWlyZShcIi4vYXJyYXktbWV0aG9kcy5qc1wiKVxudmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG5cbi8qICBPYnNlcnZBcnJheSA6PSAoQXJyYXk8VD4pID0+IE9ic2VydjxcbiAgICAgICAgQXJyYXk8VD4gJiB7IF9kaWZmOiBBcnJheSB9XG4gICAgPiAmIHtcbiAgICAgICAgc3BsaWNlOiAoaW5kZXg6IE51bWJlciwgYW1vdW50OiBOdW1iZXIsIHJlc3QuLi46IFQpID0+XG4gICAgICAgICAgICBBcnJheTxUPixcbiAgICAgICAgcHVzaDogKHZhbHVlcy4uLjogVCkgPT4gTnVtYmVyLFxuICAgICAgICBmaWx0ZXI6IChsYW1iZGE6IEZ1bmN0aW9uLCB0aGlzVmFsdWU6IEFueSkgPT4gQXJyYXk8VD4sXG4gICAgICAgIGluZGV4T2Y6IChpdGVtOiBULCBmcm9tSW5kZXg6IE51bWJlcikgPT4gTnVtYmVyXG4gICAgfVxuXG4gICAgRml4IHRvIG1ha2UgaXQgbW9yZSBsaWtlIE9ic2Vydkhhc2guXG5cbiAgICBJLmUuIHlvdSB3cml0ZSBvYnNlcnZhYmxlcyBpbnRvIGl0LiBcbiAgICAgICAgcmVhZGluZyBtZXRob2RzIHRha2UgcGxhaW4gSlMgb2JqZWN0cyB0byByZWFkXG4gICAgICAgIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGFycmF5IGlzIGFsd2F5cyBhbiBhcnJheSBvZiBwbGFpblxuICAgICAgICBvYmpzZWN0LlxuXG4gICAgICAgIFRoZSBvYnNlcnYgYXJyYXkgaW5zdGFuY2UgaXRzZWxmIHdvdWxkIGhhdmUgaW5kZXhlZCBcbiAgICAgICAgcHJvcGVydGllcyB0aGF0IGFyZSB0aGUgb2JzZXJ2YWJsZXNcbiovXG5mdW5jdGlvbiBPYnNlcnZBcnJheShpbml0aWFsTGlzdCkge1xuICAgIC8vIGxpc3QgaXMgdGhlIGludGVybmFsIG11dGFibGUgbGlzdCBvYnNlcnYgaW5zdGFuY2VzIHRoYXRcbiAgICAvLyBhbGwgbWV0aG9kcyBvbiBgb2JzYCBkaXNwYXRjaCB0by5cbiAgICB2YXIgbGlzdCA9IGluaXRpYWxMaXN0XG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IFtdXG5cbiAgICAvLyBjb3B5IHN0YXRlIG91dCBvZiBpbml0aWFsTGlzdCBpbnRvIGluaXRpYWxTdGF0ZVxuICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2LCBpbmRleCkge1xuICAgICAgICBpbml0aWFsU3RhdGVbaW5kZXhdID0gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIG9ic2VydigpIDogb2JzZXJ2XG4gICAgfSlcblxuICAgIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICAgIG9icy5zcGxpY2UgPSBzcGxpY2VcblxuICAgIG9icy5nZXQgPSBnZXRcbiAgICBvYnMuZ2V0TGVuZ3RoID0gZ2V0TGVuZ3RoXG4gICAgb2JzLnB1dCA9IHB1dFxuXG4gICAgLy8geW91IGJldHRlciBub3QgbXV0YXRlIHRoaXMgbGlzdCBkaXJlY3RseVxuICAgIC8vIHRoaXMgaXMgdGhlIGxpc3Qgb2Ygb2JzZXJ2cyBpbnN0YW5jZXNcbiAgICBvYnMuX2xpc3QgPSBsaXN0XG5cbiAgICB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gbGlzdC5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSk7XG4gICAgLy8gdGhpcyBpcyBhIGxpc3Qgb2YgcmVtb3ZhbCBmdW5jdGlvbnMgdGhhdCBtdXN0IGJlIGNhbGxlZFxuICAgIC8vIHdoZW4gb2JzZXJ2IGluc3RhbmNlcyBhcmUgcmVtb3ZlZCBmcm9tIGBvYnMubGlzdGBcbiAgICAvLyBub3QgY2FsbGluZyB0aGlzIG1lYW5zIHdlIGRvIG5vdCBHQyBvdXIgb2JzZXJ2IGNoYW5nZVxuICAgIC8vIGxpc3RlbmVycy4gV2hpY2ggY2F1c2VzIHJhZ2UgYnVnc1xuICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzID0gcmVtb3ZlTGlzdGVuZXJzXG5cbiAgICByZXR1cm4gQXJyYXlNZXRob2RzKG9icywgbGlzdClcbn1cblxuZnVuY3Rpb24gZ2V0KGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpc3RbaW5kZXhdXG59XG5cbmZ1bmN0aW9uIHB1dChpbmRleCwgdmFsdWUpIHtcbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIGdldExlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGlzdC5sZW5ndGhcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2YWJsZVxuXG5mdW5jdGlvbiBPYnNlcnZhYmxlKHZhbHVlKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IFtdXG4gICAgdmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHZhbHVlXG5cbiAgICBvYnNlcnZhYmxlLnNldCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhbHVlID0gdlxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgZih2KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBvYnNlcnZhYmxlXG5cbiAgICBmdW5jdGlvbiBvYnNlcnZhYmxlKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UobGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpLCAxKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbnZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2FkZC1saXN0ZW5lci5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNwbGljZVxuXG4vLyBgb2JzLnNwbGljZWAgaXMgYSBtdXRhYmxlIGltcGxlbWVudGF0aW9uIG9mIGBzcGxpY2UoKWBcbi8vIHRoYXQgbXV0YXRlcyBib3RoIGBsaXN0YCBhbmQgdGhlIGludGVybmFsIGB2YWx1ZUxpc3RgIHRoYXRcbi8vIGlzIHRoZSBjdXJyZW50IHZhbHVlIG9mIGBvYnNgIGl0c2VsZlxuZnVuY3Rpb24gc3BsaWNlKGluZGV4LCBhbW91bnQpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKClcblxuICAgIC8vIGdlbmVyYXRlIGEgbGlzdCBvZiBhcmdzIHRvIG11dGF0ZSB0aGUgaW50ZXJuYWxcbiAgICAvLyBsaXN0IG9mIG9ubHkgb2JzXG4gICAgdmFyIHZhbHVlQXJncyA9IGFyZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11c3QgdW5wYWNrIG9ic2VydmFibGVzIHRoYXQgd2UgYXJlIGFkZGluZ1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSgpIDogdmFsdWVcbiAgICB9KVxuXG4gICAgdmFsdWVMaXN0LnNwbGljZS5hcHBseSh2YWx1ZUxpc3QsIHZhbHVlQXJncylcbiAgICAvLyB3ZSByZW1vdmUgdGhlIG9ic2VydnMgdGhhdCB3ZSByZW1vdmVcbiAgICB2YXIgcmVtb3ZlZCA9IG9icy5fbGlzdC5zcGxpY2UuYXBwbHkob2JzLl9saXN0LCBhcmdzKVxuXG4gICAgdmFyIGV4dHJhUmVtb3ZlTGlzdGVuZXJzID0gYXJncy5zbGljZSgyKS5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSlcbiAgICBleHRyYVJlbW92ZUxpc3RlbmVycy51bnNoaWZ0KGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgdmFyIHJlbW92ZWRMaXN0ZW5lcnMgPSBvYnMuX3JlbW92ZUxpc3RlbmVycy5zcGxpY2VcbiAgICAgICAgLmFwcGx5KG9icy5fcmVtb3ZlTGlzdGVuZXJzLCBleHRyYVJlbW92ZUxpc3RlbmVycylcblxuICAgIHJlbW92ZWRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZW1vdmVPYnNlcnZMaXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgdmFsdWVMaXN0Ll9kaWZmID0gdmFsdWVBcmdzXG5cbiAgICBvYnMuc2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gcmVtb3ZlZFxufVxuIiwidmFyIE9ic2VydiA9IHJlcXVpcmUoXCJvYnNlcnZcIilcbnZhciBleHRlbmQgPSByZXF1aXJlKFwieHRlbmRcIilcblxuLyogT2JzZXJ2U3RydWN0IDo9IChPYmplY3Q8U3RyaW5nLCBPYnNlcnY8VD4+KSA9PiBcbiAgICBPYmplY3Q8U3RyaW5nLCBPYnNlcnY8VD4+ICZcbiAgICAgICAgT2JzZXJ2PE9iamVjdDxTdHJpbmcsIFQ+ICYge1xuICAgICAgICAgICAgX2RpZmY6IE9iamVjdDxTdHJpbmcsIEFueT5cbiAgICAgICAgfT5cblxuKi9cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2U3RydWN0XG5cbmZ1bmN0aW9uIE9ic2VydlN0cnVjdChzdHJ1Y3QpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHN0cnVjdClcblxuICAgIHZhciBpbml0aWFsU3RhdGUgPSB7fVxuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJuYW1lXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBjcmVhdGUgYW4gb2JzZXJ2LXN0cnVjdCBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aXRoIGEga2V5IG5hbWVkICduYW1lJy4gQ2xhc2hlcyB3aXRoIFwiICtcbiAgICAgICAgICAgICAgICBcImBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ic2VydiA9IHN0cnVjdFtrZXldXG4gICAgICAgIGluaXRpYWxTdGF0ZVtrZXldID0gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIG9ic2VydigpIDogb2JzZXJ2XG4gICAgfSlcblxuICAgIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBvYnNlcnYgPSBzdHJ1Y3Rba2V5XVxuICAgICAgICBvYnNba2V5XSA9IG9ic2VydlxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG9ic2VydihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSBleHRlbmQob2JzKCkpXG4gICAgICAgICAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSB7fVxuICAgICAgICAgICAgICAgIGRpZmZba2V5XSA9IHZhbHVlICYmIHZhbHVlLl9kaWZmID9cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuX2RpZmYgOiB2YWx1ZVxuICAgICAgICAgICAgICAgIHN0YXRlLl9kaWZmID0gZGlmZlxuICAgICAgICAgICAgICAgIG9icy5zZXQoc3RhdGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBvYnNcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuNy4xXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBPYnNlcnYsIE9ic2VydlZhcmhhc2gsIFRvbWJzdG9uZSwgY2hlY2tLZXksIGRpZmYsIGV4dGVuZCwgZ2V0S2V5RXJyb3IsIG1ldGhvZHMsIHdhdGNoO1xuXG4gIE9ic2VydiA9IHJlcXVpcmUoJ29ic2VydicpO1xuXG4gIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJyk7XG5cbiAgT2JzZXJ2VmFyaGFzaCA9IGZ1bmN0aW9uKGhhc2gsIGNyZWF0ZVZhbHVlKSB7XG4gICAgdmFyIGluaXRpYWxTdGF0ZSwgaywga2V5LCBvYnMsIG9ic2VydiwgdiwgX3JlZjtcbiAgICBjcmVhdGVWYWx1ZSB8fCAoY3JlYXRlVmFsdWUgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSk7XG4gICAgaW5pdGlhbFN0YXRlID0ge307XG4gICAgZm9yIChrZXkgaW4gaGFzaCkge1xuICAgICAgb2JzZXJ2ID0gaGFzaFtrZXldO1xuICAgICAgY2hlY2tLZXkoa2V5KTtcbiAgICAgIGluaXRpYWxTdGF0ZVtrZXldID0gKHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/IG9ic2VydigpIDogdm9pZCAwKSB8fCBvYnNlcnY7XG4gICAgfVxuICAgIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpO1xuICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzID0ge307XG4gICAgX3JlZiA9IG1ldGhvZHMoY3JlYXRlVmFsdWUpO1xuICAgIGZvciAoayBpbiBfcmVmKSB7XG4gICAgICB2ID0gX3JlZltrXTtcbiAgICAgIG9ic1trXSA9IHY7XG4gICAgfVxuICAgIGZvciAoa2V5IGluIGhhc2gpIHtcbiAgICAgIG9ic2VydiA9IGhhc2hba2V5XTtcbiAgICAgIG9ic1trZXldID0gY3JlYXRlVmFsdWUob2JzZXJ2LCBrZXkpO1xuICAgICAgb2JzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSA9IHR5cGVvZiBvYnNba2V5XSA9PT0gXCJmdW5jdGlvblwiID8gb2JzW2tleV0od2F0Y2gob2JzLCBrZXkpKSA6IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIG9icztcbiAgfTtcblxuICBtZXRob2RzID0gZnVuY3Rpb24oY3JlYXRlVmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNba2V5XTtcbiAgICAgIH0sXG4gICAgICBwdXQ6IGZ1bmN0aW9uKGtleSwgdmFsKSB7XG4gICAgICAgIHZhciBvYnNlcnYsIHN0YXRlLCBfYmFzZTtcbiAgICAgICAgY2hlY2tLZXkoa2V5KTtcbiAgICAgICAgb2JzZXJ2ID0gY3JlYXRlVmFsdWUodmFsLCBrZXkpO1xuICAgICAgICBzdGF0ZSA9IGV4dGVuZCh0aGlzKCkpO1xuICAgICAgICBzdGF0ZVtrZXldID0gKHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/IG9ic2VydigpIDogdm9pZCAwKSB8fCBvYnNlcnY7XG4gICAgICAgIGlmICh0eXBlb2YgKF9iYXNlID0gdGhpcy5fcmVtb3ZlTGlzdGVuZXJzKVtrZXldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBfYmFzZVtrZXldKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0gPSB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgPyBvYnNlcnYod2F0Y2godGhpcywga2V5KSkgOiB2b2lkIDA7XG4gICAgICAgIHN0YXRlLl9kaWZmID0gZGlmZihrZXksIHN0YXRlW2tleV0pO1xuICAgICAgICB0aGlzLnNldChzdGF0ZSk7XG4gICAgICAgIHRoaXNba2V5XSA9IG9ic2VydjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgXCJkZWxldGVcIjogZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhciBzdGF0ZSwgX2Jhc2U7XG4gICAgICAgIHN0YXRlID0gZXh0ZW5kKHRoaXMoKSk7XG4gICAgICAgIGlmICh0eXBlb2YgKF9iYXNlID0gdGhpcy5fcmVtb3ZlTGlzdGVuZXJzKVtrZXldID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBfYmFzZVtrZXldKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldO1xuICAgICAgICBkZWxldGUgc3RhdGVba2V5XTtcbiAgICAgICAgc3RhdGUuX2RpZmYgPSBkaWZmKGtleSwgT2JzZXJ2VmFyaGFzaC5Ub21ic3RvbmUpO1xuICAgICAgICB0aGlzLnNldChzdGF0ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgd2F0Y2ggPSBmdW5jdGlvbihvYnMsIGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIHN0YXRlO1xuICAgICAgc3RhdGUgPSBleHRlbmQob2JzKCkpO1xuICAgICAgc3RhdGVba2V5XSA9IHZhbHVlO1xuICAgICAgc3RhdGUuX2RpZmYgPSBkaWZmKGtleSwgdmFsdWUpO1xuICAgICAgcmV0dXJuIG9icy5zZXQoc3RhdGUpO1xuICAgIH07XG4gIH07XG5cbiAgZGlmZiA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgb2JqO1xuICAgIG9iaiA9IHt9O1xuICAgIG9ialtrZXldID0gdmFsdWUgJiYgdmFsdWUuX2RpZmYgPyB2YWx1ZS5fZGlmZiA6IHZhbHVlO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgY2hlY2tLZXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgbXNnO1xuICAgIGlmIChtc2cgPSBnZXRLZXlFcnJvcihrZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2V0S2V5RXJyb3IgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcmVhc29uO1xuICAgIHJlYXNvbiA9IChmdW5jdGlvbigpIHtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICAgIHJldHVybiAnQ2xhc2hlcyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAuJztcbiAgICAgICAgY2FzZSAnZ2V0JzpcbiAgICAgICAgY2FzZSAncHV0JzpcbiAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgY2FzZSAnX3JlbW92ZUxpc3RlbmVycyc6XG4gICAgICAgICAgcmV0dXJuICdDbGFzaGVzIHdpdGggb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJztcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIGlmICghcmVhc29uKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBcImNhbm5vdCBjcmVhdGUgYW4gb2JzZXJ2LXZhcmhhc2ggd2l0aCBrZXkgYFwiICsga2V5ICsgXCJgLCBcIiArIHJlYXNvbjtcbiAgfTtcblxuICBUb21ic3RvbmUgPSBmdW5jdGlvbigpIHt9O1xuXG4gIFRvbWJzdG9uZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgVG9tYnN0b25lXSc7XG4gIH07XG5cbiAgVG9tYnN0b25lLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgVG9tYnN0b25lXSc7XG4gIH07XG5cbiAgVG9tYnN0b25lLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0IFRvbWJzdG9uZV0nO1xuICB9O1xuXG4gIE9ic2VydlZhcmhhc2guVG9tYnN0b25lID0gbmV3IFRvbWJzdG9uZSgpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gT2JzZXJ2VmFyaGFzaDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gaGFzS2V5c1xuXG5mdW5jdGlvbiBoYXNLZXlzKHNvdXJjZSkge1xuICAgIHJldHVybiBzb3VyY2UgIT09IG51bGwgJiZcbiAgICAgICAgKHR5cGVvZiBzb3VyY2UgPT09IFwib2JqZWN0XCIgfHxcbiAgICAgICAgdHlwZW9mIHNvdXJjZSA9PT0gXCJmdW5jdGlvblwiKVxufVxuIiwidmFyIEtleXMgPSByZXF1aXJlKFwib2JqZWN0LWtleXNcIilcbnZhciBoYXNLZXlzID0gcmVxdWlyZShcIi4vaGFzLWtleXNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGlmICghaGFzS2V5cyhzb3VyY2UpKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleXMgPSBLZXlzKHNvdXJjZSlcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0ga2V5c1tqXVxuICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gc291cmNlW25hbWVdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCJ2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZuKSB7XG5cdHZhciBpc0Z1bmMgPSAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmICEoZm4gaW5zdGFuY2VvZiBSZWdFeHApKSB8fCB0b1N0cmluZy5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblx0aWYgKCFpc0Z1bmMgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRpc0Z1bmMgPSBmbiA9PT0gd2luZG93LnNldFRpbWVvdXQgfHwgZm4gPT09IHdpbmRvdy5hbGVydCB8fCBmbiA9PT0gd2luZG93LmNvbmZpcm0gfHwgZm4gPT09IHdpbmRvdy5wcm9tcHQ7XG5cdH1cblx0cmV0dXJuIGlzRnVuYztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG5cdGlmICghaXNGdW5jdGlvbihmbikpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblx0fVxuXHR2YXIgaSwgayxcblx0XHRpc1N0cmluZyA9IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnLFxuXHRcdGwgPSBvYmoubGVuZ3RoLFxuXHRcdGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG5cdGlmIChsID09PSArbCkge1xuXHRcdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcblx0XHRcdGlmIChjb250ZXh0ID09PSBudWxsKSB7XG5cdFx0XHRcdGZuKGlzU3RyaW5nID8gb2JqLmNoYXJBdChpKSA6IG9ialtpXSwgaSwgb2JqKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZuLmNhbGwoY29udGV4dCwgaXNTdHJpbmcgPyBvYmouY2hhckF0KGkpIDogb2JqW2ldLCBpLCBvYmopO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKGsgaW4gb2JqKSB7XG5cdFx0XHRpZiAoaGFzT3duLmNhbGwob2JqLCBrKSkge1xuXHRcdFx0XHRpZiAoY29udGV4dCA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGZuKG9ialtrXSwgaywgb2JqKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmbi5jYWxsKGNvbnRleHQsIG9ialtrXSwgaywgb2JqKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCByZXF1aXJlKCcuL3NoaW0nKTtcblxuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHR2YXIgc3RyID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cdHZhciBpc0FyZ3VtZW50cyA9IHN0ciA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cdGlmICghaXNBcmd1bWVudHMpIHtcblx0XHRpc0FyZ3VtZW50cyA9IHN0ciAhPT0gJ1tvYmplY3QgQXJyYXldJ1xuXHRcdFx0JiYgdmFsdWUgIT09IG51bGxcblx0XHRcdCYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCdcblx0XHRcdCYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInXG5cdFx0XHQmJiB2YWx1ZS5sZW5ndGggPj0gMFxuXHRcdFx0JiYgdG9TdHJpbmcuY2FsbCh2YWx1ZS5jYWxsZWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXHR9XG5cdHJldHVybiBpc0FyZ3VtZW50cztcbn07XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdC8vIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9lczUtc2hpbVxuXHR2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHR0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG5cdFx0Zm9yRWFjaCA9IHJlcXVpcmUoJy4vZm9yZWFjaCcpLFxuXHRcdGlzQXJncyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcblx0XHRoYXNEb250RW51bUJ1ZyA9ICEoeyd0b1N0cmluZyc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0XHRoYXNQcm90b0VudW1CdWcgPSAoZnVuY3Rpb24gKCkge30pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCdwcm90b3R5cGUnKSxcblx0XHRkb250RW51bXMgPSBbXG5cdFx0XHRcInRvU3RyaW5nXCIsXG5cdFx0XHRcInRvTG9jYWxlU3RyaW5nXCIsXG5cdFx0XHRcInZhbHVlT2ZcIixcblx0XHRcdFwiaGFzT3duUHJvcGVydHlcIixcblx0XHRcdFwiaXNQcm90b3R5cGVPZlwiLFxuXHRcdFx0XCJwcm9wZXJ0eUlzRW51bWVyYWJsZVwiLFxuXHRcdFx0XCJjb25zdHJ1Y3RvclwiXG5cdFx0XSxcblx0XHRrZXlzU2hpbTtcblxuXHRrZXlzU2hpbSA9IGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG5cdFx0dmFyIGlzT2JqZWN0ID0gb2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnLFxuXHRcdFx0aXNGdW5jdGlvbiA9IHRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcblx0XHRcdGlzQXJndW1lbnRzID0gaXNBcmdzKG9iamVjdCksXG5cdFx0XHR0aGVLZXlzID0gW107XG5cblx0XHRpZiAoIWlzT2JqZWN0ICYmICFpc0Z1bmN0aW9uICYmICFpc0FyZ3VtZW50cykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5rZXlzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG5cdFx0fVxuXG5cdFx0aWYgKGlzQXJndW1lbnRzKSB7XG5cdFx0XHRmb3JFYWNoKG9iamVjdCwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHRoZUtleXMucHVzaCh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIG5hbWUsXG5cdFx0XHRcdHNraXBQcm90byA9IGhhc1Byb3RvRW51bUJ1ZyAmJiBpc0Z1bmN0aW9uO1xuXG5cdFx0XHRmb3IgKG5hbWUgaW4gb2JqZWN0KSB7XG5cdFx0XHRcdGlmICghKHNraXBQcm90byAmJiBuYW1lID09PSAncHJvdG90eXBlJykgJiYgaGFzLmNhbGwob2JqZWN0LCBuYW1lKSkge1xuXHRcdFx0XHRcdHRoZUtleXMucHVzaChuYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0dmFyIGN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG5cdFx0XHRcdHNraXBDb25zdHJ1Y3RvciA9IGN0b3IgJiYgY3Rvci5wcm90b3R5cGUgPT09IG9iamVjdDtcblxuXHRcdFx0Zm9yRWFjaChkb250RW51bXMsIGZ1bmN0aW9uIChkb250RW51bSkge1xuXHRcdFx0XHRpZiAoIShza2lwQ29uc3RydWN0b3IgJiYgZG9udEVudW0gPT09ICdjb25zdHJ1Y3RvcicpICYmIGhhcy5jYWxsKG9iamVjdCwgZG9udEVudW0pKSB7XG5cdFx0XHRcdFx0dGhlS2V5cy5wdXNoKGRvbnRFbnVtKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGVLZXlzO1xuXHR9O1xuXG5cdG1vZHVsZS5leHBvcnRzID0ga2V5c1NoaW07XG59KCkpO1xuXG4iLCJ2YXIgT2JzZXJ2YWJsZSA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWRcblxuZnVuY3Rpb24gY29tcHV0ZWQob2JzZXJ2YWJsZXMsIGxhbWJkYSkge1xuICAgIHZhciB2YWx1ZXMgPSBvYnNlcnZhYmxlcy5tYXAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgcmV0dXJuIG8oKVxuICAgIH0pXG4gICAgdmFyIHJlc3VsdCA9IE9ic2VydmFibGUobGFtYmRhLmFwcGx5KG51bGwsIHZhbHVlcykpXG5cbiAgICBvYnNlcnZhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChvLCBpbmRleCkge1xuICAgICAgICBvKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICByZXN1bHQuc2V0KGxhbWJkYS5hcHBseShudWxsLCB2YWx1ZXMpKVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHdhdGNoXG5cbmZ1bmN0aW9uIHdhdGNoKG9ic2VydmFibGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIHJlbW92ZSA9IG9ic2VydmFibGUobGlzdGVuZXIpXG4gICAgbGlzdGVuZXIob2JzZXJ2YWJsZSgpKVxuICAgIHJldHVybiByZW1vdmVcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYW5nZVNpbmtIYW5kbGVyXG5cbmZ1bmN0aW9uIENoYW5nZVNpbmtIYW5kbGVyKHNpbmssIGRhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2hhbmdlU2lua0hhbmRsZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2hhbmdlU2lua0hhbmRsZXIoc2luaywgZGF0YSlcbiAgICB9XG5cbiAgICB0aGlzLnNpbmsgPSBzaW5rXG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICAgIHRoaXMudHlwZSA9ICdjaGFuZ2UnXG4gICAgdGhpcy5pZCA9IHNpbmsuaWRcbn1cblxuQ2hhbmdlU2lua0hhbmRsZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gaGFuZGxlRXZlbnRcblxuZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXYpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXYudGFyZ2V0XG5cbiAgICB2YXIgaXNWYWxpZCA9XG4gICAgICAgIChldi50eXBlID09PSAnY2hhbmdlJyAmJiB0YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JykgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdpbnB1dCcgJiYgdGFyZ2V0LnR5cGUgPT09ICd0ZXh0JykgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdjaGFuZ2UnICYmIHRhcmdldC50eXBlID09PSAncmFuZ2UnKVxuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIGlmICh0eXBlb2YgdGhpcy5zaW5rID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2luayhkYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2luay53cml0ZShkYXRhKVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gU2lua0V2ZW50SGFuZGxlclxuXG5mdW5jdGlvbiBTaW5rRXZlbnRIYW5kbGVyKHNpbmssIGRhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2lua0V2ZW50SGFuZGxlcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTaW5rRXZlbnRIYW5kbGVyKHNpbmssIGRhdGEpXG4gICAgfVxuXG4gICAgdGhpcy5zaW5rID0gc2lua1xuICAgIHRoaXMuaWQgPSBzaW5rLmlkXG4gICAgdGhpcy5kYXRhID0gZGF0YVxufVxuXG5TaW5rRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGhhbmRsZUV2ZW50XG5cbmZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNpbmsgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zaW5rKHRoaXMuZGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNpbmsud3JpdGUodGhpcy5kYXRhKVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gS2V5RXZlbnRIYW5kbGVyXG5cbmZ1bmN0aW9uIEtleUV2ZW50SGFuZGxlcihmbiwga2V5LCBkYXRhKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEtleUV2ZW50SGFuZGxlcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBLZXlFdmVudEhhbmRsZXIoZm4sIGtleSwgZGF0YSlcbiAgICB9XG5cbiAgICB0aGlzLmZuID0gZm5cbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gICAgdGhpcy5rZXkgPSBrZXlcbn1cblxuS2V5RXZlbnRIYW5kbGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGhhbmRsZUV2ZW50XG5cbmZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2KSB7XG4gICAgaWYgKGV2LmtleUNvZGUgPT09IHRoaXMua2V5KSB7XG4gICAgICAgIHRoaXMuZm4odGhpcy5kYXRhKVxuICAgIH1cbn1cbiIsInZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZXJhdGl2ZWx5V2Fsa1xuXG5mdW5jdGlvbiBpdGVyYXRpdmVseVdhbGsobm9kZXMsIGNiKSB7XG4gICAgaWYgKCEoJ2xlbmd0aCcgaW4gbm9kZXMpKSB7XG4gICAgICAgIG5vZGVzID0gW25vZGVzXVxuICAgIH1cbiAgICBcbiAgICBub2RlcyA9IHNsaWNlLmNhbGwobm9kZXMpXG5cbiAgICB3aGlsZShub2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlcy5zaGlmdCgpLFxuICAgICAgICAgICAgcmV0ID0gY2Iobm9kZSlcblxuICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbm9kZXMgPSBzbGljZS5jYWxsKG5vZGUuY2hpbGROb2RlcykuY29uY2F0KG5vZGVzKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHdhbGsgPSByZXF1aXJlKCdkb20td2FsaycpXG5cbnZhciBGb3JtRGF0YSA9IHJlcXVpcmUoJy4vaW5kZXguanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEZvcm1EYXRhXG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbXMocm9vdEVsZW0pIHtcbiAgICB2YXIgaGFzaCA9IHt9XG5cbiAgICB3YWxrKHJvb3RFbGVtLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkLm5hbWUpIHtcbiAgICAgICAgICAgIGhhc2hbY2hpbGQubmFtZV0gPSBjaGlsZFxuICAgICAgICB9XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIGhhc2hcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybURhdGEocm9vdEVsZW0pIHtcbiAgICB2YXIgZWxlbWVudHMgPSBidWlsZEVsZW1zKHJvb3RFbGVtKVxuXG4gICAgcmV0dXJuIEZvcm1EYXRhKGVsZW1lbnRzKVxufVxuIiwiLypqc2hpbnQgbWF4Y29tcGxleGl0eTogMTAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1EYXRhXG5cbi8vVE9ETzogTWFzc2l2ZSBzcGVjOiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9hc3NvY2lhdGlvbi1vZi1jb250cm9scy1hbmQtZm9ybXMuaHRtbCNjb25zdHJ1Y3RpbmctZm9ybS1kYXRhLXNldFxuZnVuY3Rpb24gRm9ybURhdGEoZWxlbWVudHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZWxlbWVudHMpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICAgICAgdmFyIGVsZW0gPSBlbGVtZW50c1trZXldXG5cbiAgICAgICAgYWNjW2tleV0gPSB2YWx1ZU9mRWxlbWVudChlbGVtKVxuXG4gICAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gdmFsdWVPZkVsZW1lbnQoZWxlbSkge1xuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtKClcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zUmFkaW8oZWxlbSkpIHtcbiAgICAgICAgdmFyIGVsZW1zID0gdG9MaXN0KGVsZW0pXG4gICAgICAgIHZhciBjaGVja2VkID0gZWxlbXMuZmlsdGVyKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5jaGVja2VkXG4gICAgICAgIH0pWzBdIHx8IG51bGxcblxuICAgICAgICByZXR1cm4gY2hlY2tlZCA/IGNoZWNrZWQudmFsdWUgOiBudWxsXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGVsZW0pKSB7XG4gICAgICAgIHJldHVybiBlbGVtLm1hcCh2YWx1ZU9mRWxlbWVudCkuZmlsdGVyKGZpbHRlck51bGwpXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IHVuZGVmaW5lZCAmJiBlbGVtLm5vZGVUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIEZvcm1EYXRhKGVsZW0pXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIiAmJiBpc0NoZWNrZWQoZWxlbSkpIHtcbiAgICAgICAgaWYgKGVsZW0uaGFzQXR0cmlidXRlKFwidmFsdWVcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNoZWNrZWQgPyBlbGVtLnZhbHVlIDogbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY2hlY2tlZFxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udmFsdWVcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDaGVja2VkKGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbS50eXBlID09PSBcImNoZWNrYm94XCIgfHwgZWxlbS50eXBlID09PSBcInJhZGlvXCJcbn1cblxuZnVuY3Rpb24gY29udGFpbnNSYWRpbyh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZS50YWdOYW1lIHx8IHZhbHVlLm5vZGVUeXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBlbGVtcyA9IHRvTGlzdCh2YWx1ZSlcblxuICAgIHJldHVybiBlbGVtcy5zb21lKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIiAmJiBlbGVtLnR5cGUgPT09IFwicmFkaW9cIlxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIHRvTGlzdCh2YWx1ZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpLm1hcChwcm9wLCB2YWx1ZSlcbn1cblxuZnVuY3Rpb24gcHJvcCh4KSB7XG4gICAgcmV0dXJuIHRoaXNbeF1cbn1cblxuZnVuY3Rpb24gZmlsdGVyTnVsbCh2YWwpIHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsXG59XG4iLCJ2YXIgaGFzS2V5cyA9IHJlcXVpcmUoXCIuL2hhcy1rZXlzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBpZiAoIWhhc0tleXMoc291cmNlKSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG52YXIgRU5URVIgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN1Ym1pdFNpbmtIYW5kbGVyXG5cbmZ1bmN0aW9uIFN1Ym1pdFNpbmtIYW5kbGVyKHNpbmssIGRhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3VibWl0U2lua0hhbmRsZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3VibWl0U2lua0hhbmRsZXIoc2luaywgZGF0YSlcbiAgICB9XG5cbiAgICB0aGlzLnNpbmsgPSBzaW5rXG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICAgIHRoaXMuaWQgPSBzaW5rLmlkXG4gICAgdGhpcy50eXBlID0gJ3N1Ym1pdCdcbn1cblxuU3VibWl0U2lua0hhbmRsZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gaGFuZGxlRXZlbnRcblxuZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXYpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXYudGFyZ2V0XG5cbiAgICB2YXIgaXNWYWxpZCA9XG4gICAgICAgIChldi50eXBlID09PSAnY2xpY2snICYmIHRhcmdldC50YWdOYW1lID09PSAnQlVUVE9OJykgfHxcbiAgICAgICAgKFxuICAgICAgICAgICAgKHRhcmdldC50eXBlID09PSAndGV4dCcgfHwgdGFyZ2V0LnRhZ05hbWUgPT09ICdURVhUQVJFQScpICYmXG4gICAgICAgICAgICAoZXYua2V5Q29kZSA9PT0gRU5URVIgJiYgIWV2LnNoaWZ0S2V5ICYmIGV2LnR5cGUgPT09ICdrZXlkb3duJylcbiAgICAgICAgKVxuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIGlmICh0eXBlb2YgdGhpcy5zaW5rID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2luayhkYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2luay53cml0ZShkYXRhKVxuICAgIH1cbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZhbHVlRXZlbnRIYW5kbGVyXG5cbmZ1bmN0aW9uIFZhbHVlRXZlbnRIYW5kbGVyKHNpbmssIGRhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVmFsdWVFdmVudEhhbmRsZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmFsdWVFdmVudEhhbmRsZXIoc2luaywgZGF0YSlcbiAgICB9XG5cbiAgICB0aGlzLnNpbmsgPSBzaW5rXG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICAgIHRoaXMuaWQgPSBzaW5rLmlkXG59XG5cblZhbHVlRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGhhbmRsZUV2ZW50XG5cbmZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2KSB7XG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnNpbmsgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zaW5rKGRhdGEpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaW5rLndyaXRlKGRhdGEpXG4gICAgfVxufVxuIiwidmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKFwidmlydHVhbC1kb20vY3JlYXRlLWVsZW1lbnRcIilcbnZhciBkaWZmID0gcmVxdWlyZShcInZpcnR1YWwtZG9tL2RpZmZcIilcbnZhciBwYXRjaCA9IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS9wYXRjaFwiKVxuXG52YXIgTUVTU0FHRSA9IFwicGFydGlhbCgpIGNhbm5vdCBjYWNoZSBvbiB2YWx1ZXMuIFwiICsgXG4gICAgXCJZb3UgbXVzdCBzcGVjaWZ5IG9iamVjdCBhcmd1bWVudHMuIHBhcnRpYWwoXCJcblxuZnVuY3Rpb24gY29weU92ZXIobGlzdCwgb2Zmc2V0KSB7XG4gICAgdmFyIG5ld0xpc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSBvZmZzZXQ7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5ld0xpc3RbaSAtIG9mZnNldF0gPSBsaXN0W2ldXG4gICAgfVxuICAgIHJldHVybiBuZXdMaXN0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFydGlhbFxuXG5mdW5jdGlvbiBwYXJ0aWFsKGZuKSB7XG4gICAgdmFyIGFyZ3MgPSBjb3B5T3Zlcihhcmd1bWVudHMsIDEpXG4gICAgdmFyIGZpcnN0QXJnID0gYXJnc1swXVxuICAgIHZhciBoYXNPYmplY3RzID0gYXJncy5sZW5ndGggPT09IDBcbiAgICB2YXIga2V5XG5cbiAgICBpZiAodHlwZW9mIGZpcnN0QXJnID09PSBcIm9iamVjdFwiICYmIGZpcnN0QXJnICE9PSBudWxsKSB7XG4gICAgICAgIGhhc09iamVjdHMgPSB0cnVlXG4gICAgICAgIGlmIChcImtleVwiIGluIGZpcnN0QXJnKSB7XG4gICAgICAgICAgICBrZXkgPSBmaXJzdEFyZy5rZXlcbiAgICAgICAgfSBlbHNlIGlmIChcImlkXCIgaW4gZmlyc3RBcmcpIHtcbiAgICAgICAgICAgIGtleSA9IGZpcnN0QXJnLmlkXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMTsgIWhhc09iamVjdHMgJiYgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaGFzT2JqZWN0cyA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaGFzT2JqZWN0cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoTUVTU0FHRSArIGFyZ3MgKyBcIilcIilcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRodW5rKGZuLCBhcmdzLCBrZXkpXG59XG5cbmZ1bmN0aW9uIFRodW5rKGZuLCBhcmdzLCBrZXkpIHtcbiAgICB0aGlzLmZuID0gZm5cbiAgICB0aGlzLmFyZ3MgPSBhcmdzXG4gICAgdGhpcy52bm9kZSA9IG51bGxcbiAgICB0aGlzLmtleSA9IGtleVxufVxuXG5UaHVuay5wcm90b3R5cGUudHlwZSA9IFwiaW1tdXRhYmxlLXRodW5rXCJcblRodW5rLnByb3RvdHlwZS51cGRhdGUgPSB1cGRhdGVcblRodW5rLnByb3RvdHlwZS5pbml0ID0gaW5pdFxuXG5mdW5jdGlvbiBzaG91bGRVcGRhdGUoY3VycmVudCwgcHJldmlvdXMpIHtcbiAgICBpZiAoY3VycmVudC5mbiAhPT0gcHJldmlvdXMuZm4pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICB2YXIgY2FyZ3MgPSBjdXJyZW50LmFyZ3NcbiAgICB2YXIgcGFyZ3MgPSBwcmV2aW91cy5hcmdzXG5cbiAgICAvLyBmYXN0IGNhc2UgZm9yIGFyZ3MgaXMgemVybyBjYXNlLlxuICAgIGlmIChjYXJncy5sZW5ndGggPT09IDAgJiYgcGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGlmIChjYXJncy5sZW5ndGggIT09IHBhcmdzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHZhciBtYXggPSBjYXJncy5sZW5ndGggPiBwYXJncy5sZW5ndGggPyBjYXJncy5sZW5ndGggOiBwYXJncy5sZW5ndGhcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgaWYgKGNhcmdzW2ldICE9PSBwYXJnc1tpXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiB1cGRhdGUocHJldmlvdXMsIGRvbU5vZGUpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSh0aGlzLCBwcmV2aW91cykpIHtcbiAgICAgICAgdGhpcy52bm9kZSA9IHByZXZpb3VzLnZub2RlXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgICB0aGlzLnZub2RlID0gdGhpcy5mbi5hcHBseShudWxsLCB0aGlzLmFyZ3MpXG4gICAgfVxuXG4gICAgdmFyIHBhdGNoZXMgPSBkaWZmKHByZXZpb3VzLnZub2RlLCB0aGlzLnZub2RlKVxuICAgIHBhdGNoKGRvbU5vZGUsIHBhdGNoZXMpXG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy52bm9kZSA9IHRoaXMuZm4uYXBwbHkobnVsbCwgdGhpcy5hcmdzKVxuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KHRoaXMudm5vZGUpXG59XG4iLCJ2YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoXCIuL3Zkb20vY3JlYXRlLWVsZW1lbnRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFbGVtZW50XG4iLCJ2YXIgZGlmZiA9IHJlcXVpcmUoXCIuL3Z0cmVlL2RpZmZcIilcblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmXG4iLCJpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibWluLWRvY3VtZW50XCIpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdFxuXG5mdW5jdGlvbiBpc09iamVjdCh4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcIm9iamVjdFwiICYmIHggIT09IG51bGxcbn1cbiIsInZhciBuYXRpdmVJc0FycmF5ID0gQXJyYXkuaXNBcnJheVxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUlzQXJyYXkgfHwgaXNBcnJheVxuXG5mdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIlxufVxuIiwidmFyIHBhdGNoID0gcmVxdWlyZShcIi4vdmRvbS9wYXRjaFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGNoXG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKFwiaXMtb2JqZWN0XCIpXG5cbnZhciBpc0hvb2sgPSByZXF1aXJlKFwiLi4vdnRyZWUvaXMtdmhvb2tcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVByb3BlcnRpZXNcblxuZnVuY3Rpb24gYXBwbHlQcm9wZXJ0aWVzKG5vZGUsIHByb3BzLCBwcmV2aW91cykge1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV1cblxuICAgICAgICBpZiAoaXNIb29rKHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICAgIHByb3BWYWx1ZS5ob29rKG5vZGUsXG4gICAgICAgICAgICAgICAgcHJvcE5hbWUsXG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPyBwcmV2aW91c1twcm9wTmFtZV0gOiB1bmRlZmluZWQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QocHJvcFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNPYmplY3Qobm9kZVtwcm9wTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0ge31cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIHByb3BWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXVtrXSA9IHByb3BWYWx1ZVtrXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHByb3BWYWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxuXG52YXIgYXBwbHlQcm9wZXJ0aWVzID0gcmVxdWlyZShcIi4vYXBwbHktcHJvcGVydGllc1wiKVxuXG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuLi92dHJlZS9pcy12bm9kZVwiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi4vdnRyZWUvaXMtdnRleHRcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuLi92dHJlZS9pcy13aWRnZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFbGVtZW50XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodm5vZGUsIG9wdHMpIHtcbiAgICB2YXIgZG9jID0gb3B0cyA/IG9wdHMuZG9jdW1lbnQgfHwgZG9jdW1lbnQgOiBkb2N1bWVudFxuICAgIHZhciB3YXJuID0gb3B0cyA/IG9wdHMud2FybiA6IG51bGxcblxuICAgIGlmIChpc1dpZGdldCh2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIHZub2RlLmluaXQoKVxuICAgIH0gZWxzZSBpZiAoaXNWVGV4dCh2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KVxuICAgIH0gZWxzZSBpZiAoIWlzVk5vZGUodm5vZGUpKSB7XG4gICAgICAgIGlmICh3YXJuKSB7XG4gICAgICAgICAgICB3YXJuKFwiSXRlbSBpcyBub3QgYSB2YWxpZCB2aXJ0dWFsIGRvbSBub2RlXCIsIHZub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSAodm5vZGUubmFtZXNwYWNlID09PSBudWxsKSA/XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50KHZub2RlLnRhZ05hbWUpIDpcbiAgICAgICAgZG9jLmNyZWF0ZUVsZW1lbnROUyh2bm9kZS5uYW1lc3BhY2UsIHZub2RlLnRhZ05hbWUpXG5cbiAgICB2YXIgcHJvcHMgPSB2bm9kZS5wcm9wZXJ0aWVzXG4gICAgYXBwbHlQcm9wZXJ0aWVzKG5vZGUsIHByb3BzKVxuXG4gICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNyZWF0ZUVsZW1lbnQoY2hpbGRyZW5baV0sIG9wdHMpXG4gICAgICAgIGlmIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGROb2RlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVcbn1cbiIsIi8vIE1hcHMgYSB2aXJ0dWFsIERPTSB0cmVlIG9udG8gYSByZWFsIERPTSB0cmVlIGluIGFuIGVmZmljaWVudCBtYW5uZXIuXG4vLyBXZSBkb24ndCB3YW50IHRvIHJlYWQgYWxsIG9mIHRoZSBET00gbm9kZXMgaW4gdGhlIHRyZWUgc28gd2UgdXNlXG4vLyB0aGUgaW4tb3JkZXIgdHJlZSBpbmRleGluZyB0byBlbGltaW5hdGUgcmVjdXJzaW9uIGRvd24gY2VydGFpbiBicmFuY2hlcy5cbi8vIFdlIG9ubHkgcmVjdXJzZSBpbnRvIGEgRE9NIG5vZGUgaWYgd2Uga25vdyB0aGF0IGl0IGNvbnRhaW5zIGEgY2hpbGQgb2Zcbi8vIGludGVyZXN0LlxuXG52YXIgbm9DaGlsZCA9IHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSW5kZXhcblxuZnVuY3Rpb24gZG9tSW5kZXgocm9vdE5vZGUsIHRyZWUsIGluZGljZXMsIG5vZGVzKSB7XG4gICAgaWYgKCFpbmRpY2VzIHx8IGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7fVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGljZXMuc29ydChhc2NlbmRpbmcpXG4gICAgICAgIHJldHVybiByZWN1cnNlKHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2RlcywgMClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlY3Vyc2Uocm9vdE5vZGUsIHRyZWUsIGluZGljZXMsIG5vZGVzLCByb290SW5kZXgpIHtcbiAgICBub2RlcyA9IG5vZGVzIHx8IHt9XG5cblxuICAgIGlmIChyb290Tm9kZSkge1xuICAgICAgICBpZiAoaW5kZXhJblJhbmdlKGluZGljZXMsIHJvb3RJbmRleCwgcm9vdEluZGV4KSkge1xuICAgICAgICAgICAgbm9kZXNbcm9vdEluZGV4XSA9IHJvb3ROb2RlXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdkNoaWxkcmVuID0gdHJlZS5jaGlsZHJlblxuXG4gICAgICAgIGlmICh2Q2hpbGRyZW4pIHtcblxuICAgICAgICAgICAgdmFyIGNoaWxkTm9kZXMgPSByb290Tm9kZS5jaGlsZE5vZGVzXG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJvb3RJbmRleCArPSAxXG5cbiAgICAgICAgICAgICAgICB2YXIgdkNoaWxkID0gdkNoaWxkcmVuW2ldIHx8IG5vQ2hpbGRcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEluZGV4ID0gcm9vdEluZGV4ICsgKHZDaGlsZC5jb3VudCB8fCAwKVxuXG4gICAgICAgICAgICAgICAgLy8gc2tpcCByZWN1cnNpb24gZG93biB0aGUgdHJlZSBpZiB0aGVyZSBhcmUgbm8gbm9kZXMgZG93biBoZXJlXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4SW5SYW5nZShpbmRpY2VzLCByb290SW5kZXgsIG5leHRJbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzZShjaGlsZE5vZGVzW2ldLCB2Q2hpbGQsIGluZGljZXMsIG5vZGVzLCByb290SW5kZXgpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcm9vdEluZGV4ID0gbmV4dEluZGV4XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZXNcbn1cblxuLy8gQmluYXJ5IHNlYXJjaCBmb3IgYW4gaW5kZXggaW4gdGhlIGludGVydmFsIFtsZWZ0LCByaWdodF1cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZShpbmRpY2VzLCBsZWZ0LCByaWdodCkge1xuICAgIGlmIChpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgbWluSW5kZXggPSAwXG4gICAgdmFyIG1heEluZGV4ID0gaW5kaWNlcy5sZW5ndGggLSAxXG4gICAgdmFyIGN1cnJlbnRJbmRleFxuICAgIHZhciBjdXJyZW50SXRlbVxuXG4gICAgd2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9ICgobWF4SW5kZXggKyBtaW5JbmRleCkgLyAyKSA+PiAwXG4gICAgICAgIGN1cnJlbnRJdGVtID0gaW5kaWNlc1tjdXJyZW50SW5kZXhdXG5cbiAgICAgICAgaWYgKG1pbkluZGV4ID09PSBtYXhJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtID49IGxlZnQgJiYgY3VycmVudEl0ZW0gPD0gcmlnaHRcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SXRlbSA8IGxlZnQpIHtcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMVxuICAgICAgICB9IGVsc2UgIGlmIChjdXJyZW50SXRlbSA+IHJpZ2h0KSB7XG4gICAgICAgICAgICBtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gICAgcmV0dXJuIGEgPiBiID8gMSA6IC0xXG59XG4iLCJ2YXIgYXBwbHlQcm9wZXJ0aWVzID0gcmVxdWlyZShcIi4vYXBwbHktcHJvcGVydGllc1wiKVxuXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdnRyZWUvaXMtd2lkZ2V0XCIpXG52YXIgVlBhdGNoID0gcmVxdWlyZShcIi4uL3Z0cmVlL3ZwYXRjaFwiKVxuXG52YXIgcmVuZGVyID0gcmVxdWlyZShcIi4vY3JlYXRlLWVsZW1lbnRcIilcbnZhciB1cGRhdGVXaWRnZXQgPSByZXF1aXJlKFwiLi91cGRhdGUtd2lkZ2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlQYXRjaFxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHZwYXRjaCwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciB0eXBlID0gdnBhdGNoLnR5cGVcbiAgICB2YXIgdk5vZGUgPSB2cGF0Y2gudk5vZGVcbiAgICB2YXIgcGF0Y2ggPSB2cGF0Y2gucGF0Y2hcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFZQYXRjaC5SRU1PVkU6XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSlcbiAgICAgICAgY2FzZSBWUGF0Y2guSU5TRVJUOlxuICAgICAgICAgICAgcmV0dXJuIGluc2VydE5vZGUoZG9tTm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLlZURVhUOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1BhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guV0lER0VUOlxuICAgICAgICAgICAgcmV0dXJuIHdpZGdldFBhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guVk5PREU6XG4gICAgICAgICAgICByZXR1cm4gdk5vZGVQYXRjaChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLk9SREVSOlxuICAgICAgICAgICAgcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIHBhdGNoKVxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICAgICAgY2FzZSBWUGF0Y2guUFJPUFM6XG4gICAgICAgICAgICBhcHBseVByb3BlcnRpZXMoZG9tTm9kZSwgcGF0Y2gsIHZOb2RlLnByb3BldGllcylcbiAgICAgICAgICAgIHJldHVybiBkb21Ob2RlXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSkge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCB2Tm9kZSk7XG5cbiAgICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudE5vZGUsIHZOb2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXIodk5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKG5ld05vZGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmVudE5vZGVcbn1cblxuZnVuY3Rpb24gc3RyaW5nUGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB2VGV4dCwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBuZXdOb2RlXG5cbiAgICBpZiAoZG9tTm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICBkb21Ob2RlLnJlcGxhY2VEYXRhKDAsIGRvbU5vZGUubGVuZ3RoLCB2VGV4dC50ZXh0KVxuICAgICAgICBuZXdOb2RlID0gZG9tTm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgICAgIG5ld05vZGUgPSByZW5kZXIodlRleHQsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIGxlZnRWTm9kZSlcblxuICAgIHJldHVybiBuZXdOb2RlXG59XG5cbmZ1bmN0aW9uIHdpZGdldFBhdGNoKGRvbU5vZGUsIGxlZnRWTm9kZSwgd2lkZ2V0LCByZW5kZXJPcHRpb25zKSB7XG4gICAgaWYgKHVwZGF0ZVdpZGdldChsZWZ0Vk5vZGUsIHdpZGdldCkpIHtcbiAgICAgICAgcmV0dXJuIHdpZGdldC51cGRhdGUobGVmdFZOb2RlLCBkb21Ob2RlKSB8fCBkb21Ob2RlXG4gICAgfVxuXG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgbmV3V2lkZ2V0ID0gcmVuZGVyKHdpZGdldCwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld1dpZGdldCwgZG9tTm9kZSlcbiAgICB9XG5cbiAgICBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIGxlZnRWTm9kZSlcblxuICAgIHJldHVybiBuZXdXaWRnZXRcbn1cblxuZnVuY3Rpb24gdk5vZGVQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHZOb2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgbmV3Tm9kZSA9IHJlbmRlcih2Tm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCBsZWZ0Vk5vZGUpXG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIHcpIHtcbiAgICBpZiAodHlwZW9mIHcuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiICYmIGlzV2lkZ2V0KHcpKSB7XG4gICAgICAgIHcuZGVzdHJveShkb21Ob2RlKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIGJJbmRleCkge1xuICAgIHZhciBjaGlsZHJlbiA9IFtdXG4gICAgdmFyIGNoaWxkTm9kZXMgPSBkb21Ob2RlLmNoaWxkTm9kZXNcbiAgICB2YXIgbGVuID0gY2hpbGROb2Rlcy5sZW5ndGhcbiAgICB2YXIgaVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goZG9tTm9kZS5jaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgbW92ZSA9IGJJbmRleFtpXVxuICAgICAgICBpZiAobW92ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IGNoaWxkcmVuW21vdmVdXG4gICAgICAgICAgICBkb21Ob2RlLnJlbW92ZUNoaWxkKG5vZGUpXG4gICAgICAgICAgICBkb21Ob2RlLmluc2VydEJlZm9yZShub2RlLCBjaGlsZE5vZGVzW2ldKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKFwieC1pcy1hcnJheVwiKVxuXG52YXIgZG9tSW5kZXggPSByZXF1aXJlKFwiLi9kb20taW5kZXhcIilcbnZhciBwYXRjaE9wID0gcmVxdWlyZShcIi4vcGF0Y2gtb3BcIilcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaFxuXG5mdW5jdGlvbiBwYXRjaChyb290Tm9kZSwgcGF0Y2hlcykge1xuICAgIHZhciBpbmRpY2VzID0gcGF0Y2hJbmRpY2VzKHBhdGNoZXMpXG5cbiAgICBpZiAoaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJvb3ROb2RlXG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gZG9tSW5kZXgocm9vdE5vZGUsIHBhdGNoZXMuYSwgaW5kaWNlcylcbiAgICB2YXIgb3duZXJEb2N1bWVudCA9IHJvb3ROb2RlLm93bmVyRG9jdW1lbnRcbiAgICB2YXIgcmVuZGVyT3B0aW9uc1xuXG4gICAgaWYgKG93bmVyRG9jdW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgICAgIHJlbmRlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkb2N1bWVudDogb3duZXJEb2N1bWVudFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlSW5kZXggPSBpbmRpY2VzW2ldXG4gICAgICAgIHJvb3ROb2RlID0gYXBwbHlQYXRjaChyb290Tm9kZSxcbiAgICAgICAgICAgIGluZGV4W25vZGVJbmRleF0sXG4gICAgICAgICAgICBwYXRjaGVzW25vZGVJbmRleF0sXG4gICAgICAgICAgICByZW5kZXJPcHRpb25zKVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHJvb3ROb2RlLCBkb21Ob2RlLCBwYXRjaExpc3QsIHJlbmRlck9wdGlvbnMpIHtcbiAgICBpZiAoIWRvbU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHJvb3ROb2RlXG4gICAgfVxuXG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmIChpc0FycmF5KHBhdGNoTGlzdCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRjaExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5ld05vZGUgPSBwYXRjaE9wKHBhdGNoTGlzdFtpXSwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgcm9vdE5vZGUgPSBuZXdOb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlID0gcGF0Y2hPcChwYXRjaExpc3QsIGRvbU5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICByb290Tm9kZSA9IG5ld05vZGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBwYXRjaEluZGljZXMocGF0Y2hlcykge1xuICAgIHZhciBpbmRpY2VzID0gW11cblxuICAgIGZvciAodmFyIGtleSBpbiBwYXRjaGVzKSB7XG4gICAgICAgIGlmIChrZXkgIT09IFwiYVwiKSB7XG4gICAgICAgICAgICBpbmRpY2VzLnB1c2goTnVtYmVyKGtleSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5kaWNlc1xufVxuIiwidmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Z0cmVlL2lzLXdpZGdldFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVwZGF0ZVdpZGdldFxuXG5mdW5jdGlvbiB1cGRhdGVXaWRnZXQoYSwgYikge1xuICAgIGlmIChpc1dpZGdldChhKSAmJiBpc1dpZGdldChiKSkge1xuICAgICAgICBpZiAoXCJ0eXBlXCIgaW4gYSAmJiBcInR5cGVcIiBpbiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS50eXBlID09PSBiLnR5cGVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhLmluaXQgPT09IGIuaW5pdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCJ2YXIgaXNBcnJheSA9IHJlcXVpcmUoXCJ4LWlzLWFycmF5XCIpXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKFwiaXMtb2JqZWN0XCIpXG5cbnZhciBWUGF0Y2ggPSByZXF1aXJlKFwiLi92cGF0Y2hcIilcbnZhciBpc1ZOb2RlID0gcmVxdWlyZShcIi4vaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4vaXMtdnRleHRcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuL2lzLXdpZGdldFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmZcblxuZnVuY3Rpb24gZGlmZihhLCBiKSB7XG4gICAgdmFyIHBhdGNoID0geyBhOiBhIH1cbiAgICB3YWxrKGEsIGIsIHBhdGNoLCAwKVxuICAgIHJldHVybiBwYXRjaFxufVxuXG5mdW5jdGlvbiB3YWxrKGEsIGIsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIGhvb2tzKGIsIHBhdGNoLCBpbmRleClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGFwcGx5ID0gcGF0Y2hbaW5kZXhdXG5cbiAgICBpZiAoaXNXaWRnZXQoYikpIHtcbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guV0lER0VULCBhLCBiKSlcblxuICAgICAgICBpZiAoIWlzV2lkZ2V0KGEpKSB7XG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVlRleHQoYikpIHtcbiAgICAgICAgaWYgKCFpc1ZUZXh0KGEpKSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WVEVYVCwgYSwgYikpXG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgIH0gZWxzZSBpZiAoYS50ZXh0ICE9PSBiLnRleHQpIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZURVhULCBhLCBiKSlcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWTm9kZShiKSkge1xuICAgICAgICBpZiAoaXNWTm9kZShhKSkge1xuICAgICAgICAgICAgaWYgKGEudGFnTmFtZSA9PT0gYi50YWdOYW1lICYmXG4gICAgICAgICAgICAgICAgYS5uYW1lc3BhY2UgPT09IGIubmFtZXNwYWNlICYmXG4gICAgICAgICAgICAgICAgYS5rZXkgPT09IGIua2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzUGF0Y2ggPSBkaWZmUHJvcHMoYS5wcm9wZXJ0aWVzLCBiLnByb3BlcnRpZXMsIGIuaG9va3MpXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzUGF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goVlBhdGNoLlBST1BTLCBhLCBwcm9wc1BhdGNoKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZOT0RFLCBhLCBiKSlcbiAgICAgICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFwcGx5ID0gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WTk9ERSwgYSwgYikpXG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGIgPT0gbnVsbCkge1xuICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIGEsIGIpKVxuICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGx5XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaWZmUHJvcHMoYSwgYiwgaG9va3MpIHtcbiAgICB2YXIgZGlmZlxuXG4gICAgZm9yICh2YXIgYUtleSBpbiBhKSB7XG4gICAgICAgIGlmICghKGFLZXkgaW4gYikpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYVZhbHVlID0gYVthS2V5XVxuICAgICAgICB2YXIgYlZhbHVlID0gYlthS2V5XVxuXG4gICAgICAgIGlmIChob29rcyAmJiBhS2V5IGluIGhvb2tzKSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGFWYWx1ZSkgJiYgaXNPYmplY3QoYlZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRQcm90b3R5cGUoYlZhbHVlKSAhPT0gZ2V0UHJvdG90eXBlKGFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3REaWZmID0gZGlmZlByb3BzKGFWYWx1ZSwgYlZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqZWN0RGlmZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBvYmplY3REaWZmXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFWYWx1ZSAhPT0gYlZhbHVlICYmIGJWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBiS2V5IGluIGIpIHtcbiAgICAgICAgaWYgKCEoYktleSBpbiBhKSkge1xuICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgIGRpZmZbYktleV0gPSBiW2JLZXldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZlxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpIHtcbiAgICB2YXIgYUNoaWxkcmVuID0gYS5jaGlsZHJlblxuICAgIHZhciBiQ2hpbGRyZW4gPSByZW9yZGVyKGFDaGlsZHJlbiwgYi5jaGlsZHJlbilcblxuICAgIHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBiTGVuID0gYkNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBsZW4gPSBhTGVuID4gYkxlbiA/IGFMZW4gOiBiTGVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBsZWZ0Tm9kZSA9IGFDaGlsZHJlbltpXVxuICAgICAgICB2YXIgcmlnaHROb2RlID0gYkNoaWxkcmVuW2ldXG4gICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICBpZiAoIWxlZnROb2RlKSB7XG4gICAgICAgICAgICBpZiAocmlnaHROb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhjZXNzIG5vZGVzIGluIGIgbmVlZCB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLklOU0VSVCwgbnVsbCwgcmlnaHROb2RlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghcmlnaHROb2RlKSB7XG4gICAgICAgICAgICBpZiAobGVmdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFeGNlc3Mgbm9kZXMgaW4gYSBuZWVkIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIGxlZnROb2RlLCBudWxsKVxuICAgICAgICAgICAgICAgIGRlc3Ryb3lXaWRnZXRzKGxlZnROb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YWxrKGxlZnROb2RlLCByaWdodE5vZGUsIHBhdGNoLCBpbmRleClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1ZOb2RlKGxlZnROb2RlKSAmJiBsZWZ0Tm9kZS5jb3VudCkge1xuICAgICAgICAgICAgaW5kZXggKz0gbGVmdE5vZGUuY291bnRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChiQ2hpbGRyZW4ubW92ZXMpIHtcbiAgICAgICAgLy8gUmVvcmRlciBub2RlcyBsYXN0XG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLk9SREVSLCBhLCBiQ2hpbGRyZW4ubW92ZXMpKVxuICAgIH1cblxuICAgIHJldHVybiBhcHBseVxufVxuXG4vLyBQYXRjaCByZWNvcmRzIGZvciBhbGwgZGVzdHJveWVkIHdpZGdldHMgbXVzdCBiZSBhZGRlZCBiZWNhdXNlIHdlIG5lZWRcbi8vIGEgRE9NIG5vZGUgcmVmZXJlbmNlIGZvciB0aGUgZGVzdHJveSBmdW5jdGlvblxuZnVuY3Rpb24gZGVzdHJveVdpZGdldHModk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChpc1dpZGdldCh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2Tm9kZS5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHBhdGNoW2luZGV4XSA9IG5ldyBWUGF0Y2goVlBhdGNoLlJFTU9WRSwgdk5vZGUsIG51bGwpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUodk5vZGUpICYmIHZOb2RlLmhhc1dpZGdldHMpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgdmFyIGxlbiA9IGNoaWxkcmVuLmxlbmd0aFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhjaGlsZCwgcGF0Y2gsIGluZGV4KVxuXG4gICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICBpbmRleCArPSBjaGlsZC5jb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBFeGVjdXRlIGhvb2tzIHdoZW4gdHdvIG5vZGVzIGFyZSBpZGVudGljYWxcbmZ1bmN0aW9uIGhvb2tzKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoaXNWTm9kZSh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHZOb2RlLmhvb2tzKSB7XG4gICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBuZXcgVlBhdGNoKFZQYXRjaC5QUk9QUywgdk5vZGUuaG9va3MsIHZOb2RlLmhvb2tzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZOb2RlLmRlc2NlbmRhbnRIb29rcykge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICAgICAgICAgIGhvb2tzKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY2hpbGQuY291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIExpc3QgZGlmZiwgbmFpdmUgbGVmdCB0byByaWdodCByZW9yZGVyaW5nXG5mdW5jdGlvbiByZW9yZGVyKGFDaGlsZHJlbiwgYkNoaWxkcmVuKSB7XG5cbiAgICB2YXIgYktleXMgPSBrZXlJbmRleChiQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWJLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYUtleXMgPSBrZXlJbmRleChhQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWFLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYk1hdGNoID0ge30sIGFNYXRjaCA9IHt9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gYktleXMpIHtcbiAgICAgICAgYk1hdGNoW2JLZXlzW2tleV1dID0gYUtleXNba2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBhS2V5cykge1xuICAgICAgICBhTWF0Y2hbYUtleXNba2V5XV0gPSBiS2V5c1trZXldXG4gICAgfVxuXG4gICAgdmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGxlbiA9IGFMZW4gPiBiTGVuID8gYUxlbiA6IGJMZW5cbiAgICB2YXIgc2h1ZmZsZSA9IFtdXG4gICAgdmFyIGZyZWVJbmRleCA9IDBcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbW92ZUluZGV4ID0gMFxuICAgIHZhciBtb3ZlcyA9IHNodWZmbGUubW92ZXMgPSB7fVxuXG4gICAgd2hpbGUgKGZyZWVJbmRleCA8IGxlbikge1xuICAgICAgICB2YXIgbW92ZSA9IGFNYXRjaFtpXVxuICAgICAgICBpZiAobW92ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzaHVmZmxlW2ldID0gYkNoaWxkcmVuW21vdmVdXG4gICAgICAgICAgICBtb3Zlc1ttb3ZlXSA9IG1vdmVJbmRleCsrXG4gICAgICAgIH0gZWxzZSBpZiAoaSBpbiBhTWF0Y2gpIHtcbiAgICAgICAgICAgIHNodWZmbGVbaV0gPSB1bmRlZmluZWRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChiTWF0Y2hbZnJlZUluZGV4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZnJlZUluZGV4KytcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZyZWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgICAgIG1vdmVzW2ZyZWVJbmRleF0gPSBtb3ZlSW5kZXgrK1xuICAgICAgICAgICAgICAgIHNodWZmbGVbaV0gPSBiQ2hpbGRyZW5bZnJlZUluZGV4XVxuICAgICAgICAgICAgICAgIGZyZWVJbmRleCsrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgfVxuXG4gICAgcmV0dXJuIHNodWZmbGVcbn1cblxuZnVuY3Rpb24ga2V5SW5kZXgoY2hpbGRyZW4pIHtcbiAgICB2YXIgaSwga2V5c1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cbiAgICAgICAgaWYgKGNoaWxkLmtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBrZXlzID0ga2V5cyB8fCB7fVxuICAgICAgICAgICAga2V5c1tjaGlsZC5rZXldID0gaVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXNcbn1cblxuZnVuY3Rpb24gYXBwZW5kUGF0Y2goYXBwbHksIHBhdGNoKSB7XG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIGlmIChpc0FycmF5KGFwcGx5KSkge1xuICAgICAgICAgICAgYXBwbHkucHVzaChwYXRjaClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGx5ID0gW2FwcGx5LCBwYXRjaF1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcHBseVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXRjaFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNIb29rXG5cbmZ1bmN0aW9uIGlzSG9vayhob29rKSB7XG4gICAgcmV0dXJuIGhvb2sgJiYgdHlwZW9mIGhvb2suaG9vayA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICFob29rLmhhc093blByb3BlcnR5KFwiaG9va1wiKVxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaXNWaXJ0dWFsTm9kZVxuXG5mdW5jdGlvbiBpc1ZpcnR1YWxOb2RlKHgpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB4LnR5cGUgPT09IFwiVmlydHVhbE5vZGVcIiAmJiB4LnZlcnNpb24gPT09IHZlcnNpb25cbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVmlydHVhbFRleHRcblxuZnVuY3Rpb24gaXNWaXJ0dWFsVGV4dCh4KSB7XG4gICAgaWYgKCF4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4geC50eXBlID09PSBcIlZpcnR1YWxUZXh0XCIgJiYgeC52ZXJzaW9uID09PSB2ZXJzaW9uXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzV2lkZ2V0XG5cbmZ1bmN0aW9uIGlzV2lkZ2V0KHcpIHtcbiAgICByZXR1cm4gdyAmJiB0eXBlb2Ygdy5pbml0ID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHcudXBkYXRlID09PSBcImZ1bmN0aW9uXCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gXCIxXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNWSG9vayA9IHJlcXVpcmUoXCIuL2lzLXZob29rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbE5vZGVcblxudmFyIG5vUHJvcGVydGllcyA9IHt9XG52YXIgbm9DaGlsZHJlbiA9IFtdXG5cbmZ1bmN0aW9uIFZpcnR1YWxOb2RlKHRhZ05hbWUsIHByb3BlcnRpZXMsIGNoaWxkcmVuLCBrZXksIG5hbWVzcGFjZSkge1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWVcbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IG5vUHJvcGVydGllc1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiB8fCBub0NoaWxkcmVuXG4gICAgdGhpcy5rZXkgPSBrZXkgIT0gbnVsbCA/IFN0cmluZyhrZXkpIDogdW5kZWZpbmVkXG4gICAgdGhpcy5uYW1lc3BhY2UgPSAodHlwZW9mIG5hbWVzcGFjZSA9PT0gXCJzdHJpbmdcIikgPyBuYW1lc3BhY2UgOiBudWxsXG5cbiAgICB2YXIgY291bnQgPSAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB8fCAwXG4gICAgdmFyIGRlc2NlbmRhbnRzID0gMFxuICAgIHZhciBoYXNXaWRnZXRzID0gZmFsc2VcbiAgICB2YXIgZGVzY2VuZGFudEhvb2tzID0gZmFsc2VcbiAgICB2YXIgaG9va3NcblxuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgaWYgKGlzVkhvb2socHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFob29rcykge1xuICAgICAgICAgICAgICAgICAgICBob29rcyA9IHt9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaG9va3NbcHJvcE5hbWVdID0gcHJvcGVydHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkpIHtcbiAgICAgICAgICAgIGRlc2NlbmRhbnRzICs9IGNoaWxkLmNvdW50IHx8IDBcblxuICAgICAgICAgICAgaWYgKCFoYXNXaWRnZXRzICYmIGNoaWxkLmhhc1dpZGdldHMpIHtcbiAgICAgICAgICAgICAgICBoYXNXaWRnZXRzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWRlc2NlbmRhbnRIb29rcyAmJiAoY2hpbGQuaG9va3MgfHwgY2hpbGQuZGVzY2VuZGFudEhvb2tzKSkge1xuICAgICAgICAgICAgICAgIGRlc2NlbmRhbnRIb29rcyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFzV2lkZ2V0cyAmJiBpc1dpZGdldChjaGlsZCkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGQuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaGFzV2lkZ2V0cyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY291bnQgPSBjb3VudCArIGRlc2NlbmRhbnRzXG4gICAgdGhpcy5oYXNXaWRnZXRzID0gaGFzV2lkZ2V0c1xuICAgIHRoaXMuaG9va3MgPSBob29rc1xuICAgIHRoaXMuZGVzY2VuZGFudEhvb2tzID0gZGVzY2VuZGFudEhvb2tzXG59XG5cblZpcnR1YWxOb2RlLnByb3RvdHlwZS52ZXJzaW9uID0gdmVyc2lvblxuVmlydHVhbE5vZGUucHJvdG90eXBlLnR5cGUgPSBcIlZpcnR1YWxOb2RlXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5WaXJ0dWFsUGF0Y2guTk9ORSA9IDBcblZpcnR1YWxQYXRjaC5WVEVYVCA9IDFcblZpcnR1YWxQYXRjaC5WTk9ERSA9IDJcblZpcnR1YWxQYXRjaC5XSURHRVQgPSAzXG5WaXJ0dWFsUGF0Y2guUFJPUFMgPSA0XG5WaXJ0dWFsUGF0Y2guT1JERVIgPSA1XG5WaXJ0dWFsUGF0Y2guSU5TRVJUID0gNlxuVmlydHVhbFBhdGNoLlJFTU9WRSA9IDdcblxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsUGF0Y2hcblxuZnVuY3Rpb24gVmlydHVhbFBhdGNoKHR5cGUsIHZOb2RlLCBwYXRjaCkge1xuICAgIHRoaXMudHlwZSA9IE51bWJlcih0eXBlKVxuICAgIHRoaXMudk5vZGUgPSB2Tm9kZVxuICAgIHRoaXMucGF0Y2ggPSBwYXRjaFxufVxuXG5WaXJ0dWFsUGF0Y2gucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uLnNwbGl0KFwiLlwiKVxuVmlydHVhbFBhdGNoLnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsUGF0Y2hcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFRleHRcblxuZnVuY3Rpb24gVmlydHVhbFRleHQodGV4dCkge1xuICAgIHRoaXMudGV4dCA9IFN0cmluZyh0ZXh0KVxufVxuXG5WaXJ0dWFsVGV4dC5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxUZXh0LnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsVGV4dFwiXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEF0dHJpYnV0ZUhvb2s7XG5cbmZ1bmN0aW9uIEF0dHJpYnV0ZUhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQXR0cmlidXRlSG9vaykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkF0dHJpYnV0ZUhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcCwgcHJldikge1xuICAgIGlmIChwcmV2ICYmIHByZXYudmFsdWUgPT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5vZGUuc2V0QXR0cmlidXRlTlMobnVsbCwgcHJvcCwgdGhpcy52YWx1ZSlcbn1cbiIsInZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldEhvb2s7XG5cbmZ1bmN0aW9uIERhdGFTZXRIb29rKHZhbHVlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERhdGFTZXRIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGFTZXRIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkRhdGFTZXRIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIHZhciBkcyA9IERhdGFTZXQobm9kZSlcbiAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eU5hbWUuc3Vic3RyKDUpXG5cbiAgICBkc1twcm9wTmFtZV0gPSB0aGlzLnZhbHVlO1xufTtcbiIsInZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldEhvb2s7XG5cbmZ1bmN0aW9uIERhdGFTZXRIb29rKHZhbHVlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERhdGFTZXRIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGFTZXRIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkRhdGFTZXRIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIHZhciBkcyA9IERhdGFTZXQobm9kZSlcbiAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eU5hbWUuc3Vic3RyKDMpXG5cbiAgICBkc1twcm9wTmFtZV0gPSB0aGlzLnZhbHVlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gU29mdFNldEhvb2s7XG5cbmZ1bmN0aW9uIFNvZnRTZXRIb29rKHZhbHVlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNvZnRTZXRIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNvZnRTZXRIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblNvZnRTZXRIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIGlmIChub2RlW3Byb3BlcnR5TmFtZV0gIT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgbm9kZVtwcm9wZXJ0eU5hbWVdID0gdGhpcy52YWx1ZTtcbiAgICB9XG59O1xuIiwidmFyIFZOb2RlID0gcmVxdWlyZShcInZpcnR1YWwtZG9tL3Z0cmVlL3Zub2RlLmpzXCIpXG52YXIgVlRleHQgPSByZXF1aXJlKFwidmlydHVhbC1kb20vdnRyZWUvdnRleHQuanNcIilcbnZhciBpc1ZOb2RlID0gcmVxdWlyZShcInZpcnR1YWwtZG9tL3Z0cmVlL2lzLXZub2RlXCIpXG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS92dHJlZS9pcy12dGV4dFwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcInZpcnR1YWwtZG9tL3Z0cmVlL2lzLXdpZGdldFwiKVxudmFyIGlzSG9vayA9IHJlcXVpcmUoXCJ2aXJ0dWFsLWRvbS92dHJlZS9pcy12aG9va1wiKVxuXG52YXIgcGFyc2VUYWcgPSByZXF1aXJlKFwiLi9wYXJzZS10YWcuanNcIilcbnZhciBzb2Z0U2V0SG9vayA9IHJlcXVpcmUoXCIuL2hvb2tzL3NvZnQtc2V0LWhvb2suanNcIilcbnZhciBkYXRhU2V0SG9vayA9IHJlcXVpcmUoXCIuL2hvb2tzL2RhdGEtc2V0LWhvb2suanNcIilcbnZhciBldkhvb2sgPSByZXF1aXJlKFwiLi9ob29rcy9ldi1ob29rLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaFxuXG5mdW5jdGlvbiBoKHRhZ05hbWUsIHByb3BlcnRpZXMsIGNoaWxkcmVuKSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBbXVxuICAgIHZhciB0YWcsIHByb3BzLCBrZXksIG5hbWVzcGFjZVxuXG4gICAgaWYgKCFjaGlsZHJlbiAmJiBpc0NoaWxkcmVuKHByb3BlcnRpZXMpKSB7XG4gICAgICAgIGNoaWxkcmVuID0gcHJvcGVydGllc1xuICAgICAgICBwcm9wcyA9IHt9XG4gICAgfVxuXG4gICAgcHJvcHMgPSBwcm9wcyB8fCBwcm9wZXJ0aWVzIHx8IHt9XG4gICAgdGFnID0gcGFyc2VUYWcodGFnTmFtZSwgcHJvcHMpXG5cbiAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgYWRkQ2hpbGQoY2hpbGRyZW4sIGNoaWxkTm9kZXMpXG4gICAgfVxuXG4gICAgLy8gc3VwcG9ydCBrZXlzXG4gICAgaWYgKFwia2V5XCIgaW4gcHJvcHMpIHtcbiAgICAgICAga2V5ID0gcHJvcHMua2V5XG4gICAgICAgIHByb3BzLmtleSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIC8vIHN1cHBvcnQgbmFtZXNwYWNlXG4gICAgaWYgKFwibmFtZXNwYWNlXCIgaW4gcHJvcHMpIHtcbiAgICAgICAgbmFtZXNwYWNlID0gcHJvcHMubmFtZXNwYWNlXG4gICAgICAgIHByb3BzLm5hbWVzcGFjZSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIC8vIGZpeCBjdXJzb3IgYnVnXG4gICAgaWYgKHRhZyA9PT0gXCJpbnB1dFwiICYmXG4gICAgICAgIFwidmFsdWVcIiBpbiBwcm9wcyAmJlxuICAgICAgICBwcm9wcy52YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICFpc0hvb2socHJvcHMudmFsdWUpXG4gICAgKSB7XG4gICAgICAgIHByb3BzLnZhbHVlID0gc29mdFNldEhvb2socHJvcHMudmFsdWUpXG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwcm9wcylcbiAgICB2YXIgcHJvcE5hbWUsIHZhbHVlXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHByb3BOYW1lID0ga2V5c1tqXVxuICAgICAgICB2YWx1ZSA9IHByb3BzW3Byb3BOYW1lXVxuICAgICAgICBpZiAoaXNIb29rKHZhbHVlKSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBkYXRhLWZvbyBzdXBwb3J0XG4gICAgICAgIGlmIChwcm9wTmFtZS5zdWJzdHIoMCwgNSkgPT09IFwiZGF0YS1cIikge1xuICAgICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGF0YVNldEhvb2sodmFsdWUpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgZXYtZm9vIHN1cHBvcnRcbiAgICAgICAgaWYgKHByb3BOYW1lLnN1YnN0cigwLCAzKSA9PT0gXCJldi1cIikge1xuICAgICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZXZIb29rKHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICByZXR1cm4gbmV3IFZOb2RlKHRhZywgcHJvcHMsIGNoaWxkTm9kZXMsIGtleSwgbmFtZXNwYWNlKVxufVxuXG5mdW5jdGlvbiBhZGRDaGlsZChjLCBjaGlsZE5vZGVzKSB7XG4gICAgaWYgKHR5cGVvZiBjID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChuZXcgVlRleHQoYykpXG4gICAgfSBlbHNlIGlmIChpc0NoaWxkKGMpKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChjKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZENoaWxkKGNbaV0sIGNoaWxkTm9kZXMpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2hpbGQoeCkge1xuICAgIHJldHVybiBpc1ZOb2RlKHgpIHx8IGlzVlRleHQoeCkgfHwgaXNXaWRnZXQoeClcbn1cblxuZnVuY3Rpb24gaXNDaGlsZHJlbih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN0cmluZ1wiIHx8IEFycmF5LmlzQXJyYXkoeCkgfHwgaXNDaGlsZCh4KVxufVxuIiwidmFyIGNsYXNzSWRTcGxpdCA9IC8oW1xcLiNdP1thLXpBLVowLTlfOi1dKykvXG52YXIgbm90Q2xhc3NJZCA9IC9eXFwufCMvXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VUYWdcblxuZnVuY3Rpb24gcGFyc2VUYWcodGFnLCBwcm9wcykge1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIHJldHVybiBcImRpdlwiXG4gICAgfVxuXG4gICAgdmFyIG5vSWQgPSAhKFwiaWRcIiBpbiBwcm9wcylcblxuICAgIHZhciB0YWdQYXJ0cyA9IHRhZy5zcGxpdChjbGFzc0lkU3BsaXQpXG4gICAgdmFyIHRhZ05hbWUgPSBudWxsXG5cbiAgICBpZiAobm90Q2xhc3NJZC50ZXN0KHRhZ1BhcnRzWzFdKSkge1xuICAgICAgICB0YWdOYW1lID0gXCJkaXZcIlxuICAgIH1cblxuICAgIHZhciBjbGFzc2VzLCBwYXJ0LCB0eXBlLCBpXG4gICAgZm9yIChpID0gMDsgaSA8IHRhZ1BhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSB0YWdQYXJ0c1tpXVxuXG4gICAgICAgIGlmICghcGFydCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSBwYXJ0LmNoYXJBdCgwKVxuXG4gICAgICAgIGlmICghdGFnTmFtZSkge1xuICAgICAgICAgICAgdGFnTmFtZSA9IHBhcnRcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIi5cIikge1xuICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMgfHwgW11cbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCkpXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCIjXCIgJiYgbm9JZCkge1xuICAgICAgICAgICAgcHJvcHMuaWQgPSBwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgIGlmIChwcm9wcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwcm9wcy5jbGFzc05hbWUpXG4gICAgICAgIH1cblxuICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oXCIgXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZ05hbWUgPyB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgOiBcImRpdlwiXG59XG4iLCJ2YXIgYXR0cmlidXRlSG9vayA9IHJlcXVpcmUoXCIuL2hvb2tzL2F0dHJpYnV0ZS1ob29rLmpzXCIpXG52YXIgaCA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbnZhciBCTEFDS0xJU1RFRF9LRVlTID0ge1xuICAgIFwic3R5bGVcIjogdHJ1ZSxcbiAgICBcIm5hbWVzcGFjZVwiOiB0cnVlLFxuICAgIFwia2V5XCI6IHRydWVcbn1cbnZhciBTVkdfTkFNRVNQQUNFID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cbm1vZHVsZS5leHBvcnRzID0gc3ZnXG5cbmZ1bmN0aW9uIHN2Zyh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbikge1xuICAgIGlmICghY2hpbGRyZW4gJiYgaXNDaGlsZHJlbihwcm9wZXJ0aWVzKSkge1xuICAgICAgICBjaGlsZHJlbiA9IHByb3BlcnRpZXNcbiAgICAgICAgcHJvcGVydGllcyA9IHt9XG4gICAgfVxuXG4gICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge31cblxuICAgIC8vIHNldCBuYW1lc3BhY2UgZm9yIHN2Z1xuICAgIHByb3BlcnRpZXMubmFtZXNwYWNlID0gU1ZHX05BTUVTUEFDRVxuXG4gICAgLy8gZm9yIGVhY2gga2V5LCBpZiBhdHRyaWJ1dGUgJiBzdHJpbmcsIGJvb2wgb3IgbnVtYmVyIHRoZW5cbiAgICAvLyBjb252ZXJ0IGl0IGludG8gYSBzZXRBdHRyaWJ1dGUgaG9va1xuICAgIGZvciAodmFyIGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmICghcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEJMQUNLTElTVEVEX0tFWVNba2V5XSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWx1ZSA9IHByb3BlcnRpZXNba2V5XVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgIT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSAhPT0gXCJib29sZWFuXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvcGVydGllc1trZXldID0gYXR0cmlidXRlSG9vayh2YWx1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gaCh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbilcbn1cblxuZnVuY3Rpb24gaXNDaGlsZHJlbih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN0cmluZ1wiIHx8IEFycmF5LmlzQXJyYXkoeClcbn1cbiIsInZhciBPRkZTRVQgPSBNYXRoLnBvdygyLCAxNik7XG52YXIgTUFYU0VHID0gT0ZGU0VUIC0gMTtcbnZhciBNQVhWRVIgPSBNYXRoLnBvdyhPRkZTRVQsIDMpIC0gMTtcblxuLyoqXG4gICMgc2xpbXZlclxuXG4gIEFuIGV4cGVyaW1lbnRhbCBpbXBsZW1lbnRhdGlvbiBmb3Igd29ya2luZyB3aXRoXG4gIFtzbGltdmVyXShodHRwczovL2dpdGh1Yi5jb20vRGFtb25PZWhsbWFuL3NsaW12ZXItc3BlYykuXG5cbiAgIyMgUmVmZXJlbmNlXG5cbioqL1xuXG4vKipcbiAgIyMjIHNsaW12ZXIodmVyc2lvbilcblxuICBQYWNrIGEgYE1BSk9SLk1JTk9SLlBBVENIYCB2ZXJzaW9uIHN0cmluZyBpbnRvIGEgc2luZ2xlIG51bWVyaWMgdmFsdWUuXG5cbiAgPDw8IGV4YW1wbGVzL3BhY2suanNcblxuKiovXG5mdW5jdGlvbiBzbGltKHZlcnNpb24pIHtcbiAgdmFyIHBhcnRzO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9XG5cbiAgcGFydHMgPSBBcnJheS5pc0FycmF5KHZlcnNpb24pID8gdmVyc2lvbiA6IHNwbGl0KHZlcnNpb24pO1xuICByZXR1cm4gcGFydHMgP1xuICAgIHBhcnRzWzBdICogKE9GRlNFVCAqIE9GRlNFVCkgKyBwYXJ0c1sxXSAqIE9GRlNFVCArIHBhcnRzWzJdIDpcbiAgICBudWxsO1xufVxuXG5mdW5jdGlvbiBjb21wYXRpYmxlV2l0aCh2ZXJzaW9uKSB7XG4gIHZhciBwYXJ0cyA9IHNwbGl0KHZlcnNpb24pO1xuXG4gIGlmICghIHBhcnRzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gW3NsaW0ocGFydHMpLCBzbGltKFtwYXJ0c1swXSwgTUFYU0VHLCBNQVhTRUddKV07XG59XG5cbmZ1bmN0aW9uIHJhbmdlRnJvbVBhdHRlcm4ocGFydHMpIHtcbiAgdmFyIGxvdyA9IFtdLmNvbmNhdChwYXJ0cyk7XG4gIHZhciBoaWdoID0gW10uY29uY2F0KHBhcnRzKTtcblxuICBpZiAoISBwYXJ0cykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgd2hpbGUgKGxvdy5sZW5ndGggPCAzKSB7XG4gICAgbG93LnB1c2goMCk7XG4gIH1cblxuICB3aGlsZSAoaGlnaC5sZW5ndGggPCAzKSB7XG4gICAgaGlnaC5wdXNoKE1BWFNFRyk7XG4gIH1cblxuICByZXR1cm4gW3NsaW0obG93KSwgc2xpbShoaWdoKV07XG59XG5cbmZ1bmN0aW9uIGludmVydCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgPyBudWxsIDogTUFYVkVSIC0gdmFsdWU7XG59XG5cbi8qKlxuICAjIyMgc2xpbXZlci5yYW5nZShleHByZXNzaW9uKVxuXG4gIFJldHVybiBhIDItZWxlbWVudCBhcnJheSBmb3IgW2xvdywgaGlnaF0gcmFuZ2Ugb2YgdGhlIHZlcnNpb24gdmFsdWVzIHRoYXRcbiAgd2lsbCBzYXRpc2Z5IHRoZSBleHByZXNzaW9uLlxuXG4gIDw8PCBleGFtcGxlcy9yYW5nZS5qc1xuXG4qKi9cbmZ1bmN0aW9uIHJhbmdlKGV4cHJlc3Npb24pIHtcbiAgdmFyIGZpcnN0Q2hhcjtcbiAgdmFyIHBhcnRzO1xuICB2YXIgdmFsO1xuXG4gIGlmIChleHByZXNzaW9uID09PSAnYW55JyB8fCBleHByZXNzaW9uID09ICcnIHx8IGV4cHJlc3Npb24gPT09ICcqJykge1xuICAgIHJldHVybiBbMCwgTUFYVkVSXTtcbiAgfVxuXG4gIGV4cHJlc3Npb24gPSAoJycgKyBleHByZXNzaW9uKS50cmltKCk7XG4gIGZpcnN0Q2hhciA9IGV4cHJlc3Npb24uY2hhckF0KDApO1xuXG4gIGlmIChmaXJzdENoYXIgPT09ICdeJyB8fCBmaXJzdENoYXIgPT09ICd+Jykge1xuICAgIHJldHVybiBjb21wYXRpYmxlV2l0aChleHByZXNzaW9uLnNsaWNlKDEpKTtcbiAgfVxuXG4gIC8vIHNwbGl0IHRoZSBzdHJpbmdcbiAgcGFydHMgPSBleHByZXNzaW9uLnNwbGl0KCcuJykuZmlsdGVyKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICByZXR1cm4gIWlzTmFOKCtwYXJ0KTtcbiAgfSk7XG5cbiAgLy8gaWYgd2UgaGF2ZSBleGFjdGx5IDMgcGFydHMsIHRoZW4gcmFuZ2UgZnJvbSBhbmQgdHdvIHRoZSBsb3cgdG8gaGlnaCB2YWx1ZVxuICBpZiAocGFydHMubGVuZ3RoID09PSAzKSB7XG4gICAgdmFsID0gc2xpbShwYXJ0cy5qb2luKCcuJykpO1xuICAgIHJldHVybiBbdmFsLCB2YWxdO1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlRnJvbVBhdHRlcm4ocGFydHMpO1xufVxuXG4vKipcbiAgIyMjIHNsaW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlRXhwcilcblxuICBSZXR1cm4gdHJ1ZSBpZiB0aGUgaW5wdXQgdmVyc2lvbiBzdHJpbmcgc2F0aXNmaWVzIHRoZSBwcm92aWRlZCByYW5nZVxuICBleHByZXNzaW9uLlxuXG4gIDw8PCBleGFtcGxlcy9zYXRpc2ZpZXMuanNcblxuKiovXG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2VFeHByKSB7XG4gIHZhciBib3VuZHMgPSByYW5nZShyYW5nZUV4cHIpO1xuICB2YXIgdiA9IHNsaW0odmVyc2lvbik7XG5cbiAgcmV0dXJuIHYgIT09IG51bGwgJiYgYm91bmRzICYmIHYgPj0gYm91bmRzWzBdICYmIHYgPD0gYm91bmRzWzFdO1xufVxuXG5mdW5jdGlvbiBzcGxpdCh2ZXJzaW9uKSB7XG4gIHZhciBpbnZhbGlkID0gZmFsc2U7XG4gIHZhciBwYXJ0cztcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT0gJ251bWJlcicpIHtcbiAgICB2ZXJzaW9uID0gKHZlcnNpb24gfCAwKSArICcuMC4wJztcbiAgfVxuXG4gIGlmICghIHZlcnNpb24pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGV4dHJhY3QgdGhlIHBhcnRzIGFuZCBjb252ZXJ0IHRvIG51bWVyaWMgdmFsdWVzXG4gIHBhcnRzID0gKCcnICsgdmVyc2lvbikuc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgIHZhciB2YWwgPSArcGFydDtcblxuICAgIGludmFsaWQgPSBpbnZhbGlkIHx8IGlzTmFOKHZhbCkgfHwgKHZhbCA+PSBPRkZTRVQpO1xuICAgIHJldHVybiB2YWw7XG4gIH0pO1xuXG4gIC8vIGVuc3VyZSB3ZSBoYXZlIGVub3VnaCBwYXJ0c1xuICB3aGlsZSAocGFydHMubGVuZ3RoIDwgMykge1xuICAgIHBhcnRzLnB1c2goMCk7XG4gIH1cblxuICByZXR1cm4gaW52YWxpZCA/IG51bGwgOiBwYXJ0cztcbn1cblxuLyoqXG4gICMjIyBzbGltdmVyLnVucGFjayh2YWx1ZSlcblxuICBDb252ZXJ0IGEgc2xpbXZlciBudW1lcmljIHZhbHVlIGJhY2sgdG8gaXQncyBgTUFKT1IuTUlOT1IuUEFUQ0hgIHN0cmluZyBmb3JtYXQuXG5cbiAgPDw8IGV4YW1wbGVzL3VucGFjay5qc1xuXG4qKi9cbmZ1bmN0aW9uIHVucGFjayh2YWx1ZSkge1xuICB2YXIgcGFydHM7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnbnVtYmVyJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcGFydHMgPSBuZXcgVWludDE2QXJyYXkoW1xuICAgIHZhbHVlIC8gT0ZGU0VUIC8gT0ZGU0VULFxuICAgIHZhbHVlIC8gT0ZGU0VULFxuICAgIHZhbHVlXG4gIF0pO1xuXG4gIHJldHVybiBwYXJ0c1swXSArICcuJyArIHBhcnRzWzFdICsgJy4nICsgcGFydHNbMl07XG59XG5cbi8qIGV4cG9ydHMgKi9cblxuc2xpbS5pbnZlcnQgPSBpbnZlcnQ7XG5zbGltLnJhbmdlID0gcmFuZ2U7XG5zbGltLnNhdGlzZmllcyA9IHNhdGlzZmllcztcbnNsaW0udW5wYWNrID0gc2xpbS5zdHJpbmdpZnkgPSB1bnBhY2s7XG5cbm1vZHVsZS5leHBvcnRzID0gc2xpbTtcbiJdfQ==
