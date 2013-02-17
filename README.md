Ee
====================

Event-Driven library inspired by the EventEmitter.

Install
--------------------

```bash
npm install ee
```

API
--------------------

### Ee

#### new Ee([Event])

`Event` defaults to Ee.Event

```js
var ee = new Ee();
```

`ee.Event === Ee.Event` is `true`

or

```js
var CustomEvent = function(event) {
  Ee.Event.call(this, event);
};

CustomEvent.prototype = Object.create(Ee.Event.prototype);
CustomEvent.prototype.nyan = function() {
  return 'nyan!';
};

var ee = new Ee(CustomEvent);
```

and

```js
ee.on('nyan', function(e) {
  console.log(e.nyan());
});
```

`ee.Event === CustomEvent` is `true`

#### ee.on(event, listener, [times], [first], [until]) -> ee

Adds a listener to the end of the listeners for the specified event.

#### ee.first(event, listener, [times], [until]) -> ee

Adds a listener to the beginning of the listeners for the specified event.

#### ee.once(event, listener, [first], [until]) -> ee

Adds a one time listener to the end of the listeners for the specified event.

#### ee.until(until, event, listener, [times], [first]) -> ee

Adds a listener will be removed when specified event is executed.

#### ee.within(ms, event, listener, [times], [first], [until]) -> ee

Adds a listener will be removed when specified time is reached.

```js
ee.on('nyan', function(e) {
  console.log('on nyan!');
}).once('nyan', function(e) {
  console.log('once nyan?');
}).first('nyan', function(e) {
  console.log('first nyan');
}).until('neko', 'nyan', function(e) {
  console.log('until neko nyan');
}).within(1000, 'nyan', function(e) {
  console.log('within 1000ms nyan');
});

ee.on('neko', function(e) {
  console.log(e instanceof ee.Event);
});
```

then

```js
ee.emit('nyan');
```

    first nyan
    on nyan!
    once nyan?
    until neko nyan
    within 1000ms nyan

```js
ee.emit('nyan');
```

    first nyan
    on nyan!
    until neko nyan
    within 1000ms nyan

```js
ee.emit('neko');
```

    true


```js
ee.emit('nyan');
```

    first nyan
    on nyan!
    within 1000ms nyan


```js
setTimeout(function() {
  ee.emit('nyan');
}, 2000);
```

    first nyan
    on nyan!

#### ee.off(event, [listener]) -> ee

Remove a listener or all listeners for the specified event.  


#### ee.size([event]) -> Number

Returns the number of listeners for the specified event or all listeners.


#### ee.ever([event]) -> Number

Returns number of executions for the specified event or for all events.


#### ee.listeners([event]) -> Array

Returns an array of listeners for the specified event. 


#### ee.emit(event, [argument1], [argument2], [...]) -> ee

Execute each of the listeners in order with the supplied arguments.  

```js
ee.on('nyan', function(e, argument1, argument2, argument3) {
  console.log(argument1);
  console.log(argument2);
  console.log(argument3);
});

ee.emit('nyan', 'nyan!', 'nyan?');
```

    nyan!
    nyan?
    undefined

Otherwise,

```js
ee.emit(new ee.Event('nyan'), 'nyan!', 'nyan?');
```

#### ee.chain(event, [arguments], [complete], [hook]) -> ee
#### ee.chain(event, [complete], [hook]) -> ee

Execute each of the listeners.

```js
ee.on('nyan', function(e, argument1, argument2, argument3) {
  console.log(argument1);
  console.log(argument2);
  console.log(argument3);

  setTimeout(function() {
    e.next(); // must be called
  }, 1000);
}).on('nyan', function(e, argument1) {
  console.log(argument1);
  e.next(); // must be called
});
```

then

```js
ee.chain('nyan', ['nyan!', 'nyan?'], function(e) { // complete
  console.log('complete!');
}, function(object, e, args) { // hook
  console.log('current listener expects ' + object.listener.length + ' arguments');
});

console.log('◡( ╹◡╹ )◡');
```

    current listener expects 4 arguments
    nyan!
    nyan?
    undefined
    ◡( ╹◡╹ )◡
    current listener expects 2 arguments
    nyan!
    complete!

or

```js
ee.chain('nyan', ['nyan!', 'nyan?'], function(e) { // complete
  console.log('complete!');
}, function(object, e, args, call) { // hook
  console.log('current listener expects ' + object.listener.length + ' arguments');
  setTimeout(function() {
    call(); // must be called
  }, 100);
});

console.log('◡( ╹◡╹ )◡');
```

    current listener expects 4 arguments
    ◡( ╹◡╹ )◡
    nyan!
    nyan?
    undefined
    current listener expects 2 arguments
    nyan!
    complete!

*application*

```js
ee.on('nyan', function() {
  // something to do.
}).on('nyan', function(e, next) {
  setTimeout(function() {
    next();
  }, 1000);
}).on('nyan', function(e) {
  // something to do.
});

ee.chain('nyan', function(e) {
  console.log('complete!');
}, function(object, e, args, call) {
  if (object.listener.length < 2) {
    call();
    e.next();
  } else {
    if (typeof args[1] !== 'function') {
      args[1] = function() {
        e.next();
      };
    }

    call();
  }
});
```

    complete!

#### ee.parallel(event, [arguments], [complete], [hook]) -> ee
#### ee.parallel(event, [complete], [hook]) -> ee

Execute each of the listeners.

```js
ee.on('nyan', function(e) {
  setTimeout(function() {
    e.set('data 1', 'listener 1');
    e.done(); // must be called
  }, (Math.floor(Math.random() * 10) + 1) * 1000);
}).on('nyan', function(e) {
  setTimeout(function() {
    e.set('data 2', 'listener 2');
    e.done(); // must be called
  }, (Math.floor(Math.random() * 10) + 1) * 1000);
}).on('nyan', function(e) {
  setTimeout(function() {
    e.set('data 3', 'listener 3');
    e.done(); // must be called
  }, (Math.floor(Math.random() * 10) + 1) * 1000);
});

ee.parallel('nyan', function(e) {
  console.log(e.get('data 1'));
  console.log(e.get('data 2'));
  console.log(e.get('data 3'));
});
```

    listener 1
    listener 2
    listener 3

#### ee.reserve(event) -> ee

Reserve specified event.

#### ee.unreserve(event) -> ee

Cancel reservation of specified event.

#### ee.lookup([pattern], [callback]) -> Array
#### ee.lookup(pattern, callback, [return\_self]) -> Array | ee

Lookup events match to the specified pattern.  
when `return_self` is `true`, then return `ee`.

```js
ee.reserve('reserved')
  .on('reserved', function() {})
  .on('not reserved', function() {});

console.log(ee.lookup());
```

    [ 'reserved', 'not reserved' ]

```js
ee.off('reserved')
  .off('not reserved');

console.log(ee.lookup());
```

    [ 'reserved' ]

### Ee.Event

#### new Ee.Event(event)

Create a new instance.

#### e.abort() -> e

Set `e.aborted` to `true` and skip other listeners.

```js
ee.on('nyan', function(e) {
  console.log('first listener.');

  if (true)
    return e.abort(); // should be return.

  console.log('first listener!');
}).on('nyan', function(e) {
  console.log('second listener.');
});

ee.emit('nyan');
```

    first listener.

#### e.prevent() -> e

Set `e.prevented` to `true` and skip other listeners.

```js
ee.on('nyan', function(e) {
  e.next();
}).on('nyan', function(e) {
  if (confirm('do you nyan?')) {
    e.next();
  } else {
    e.prevent();
  }
});

ee.chain('nyan', function(e) {
  if (e.prevented) {
    // do nothing.
  } else {
    alert('にゃん♡');
  }
});
```

#### e.stop() -> e

Set `e.aborted` and `e.prevented` to `true` and skip other listeners.

#### e.next() -> e

Execute next listener.

#### e.get(key, [default_value]) -> mixed

Get value or `default_value`.

#### e.set(key, value) -> e

Set value for key.

#### e.unset(key) -> e

Unset key.

Licence
--------------------

The MIT License (MIT)

Copyright (c) 2013 tatあt <ioiioioloo@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.