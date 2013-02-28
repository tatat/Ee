(function(define) {
define([], function() {
  'use strict';

  var __index_of = !Array.prototype.indexOf ? function (array, search) {
    var length = array.length
      , from = Number(search) || 0;
    
    from = from < 0 ?
      Math.ceil(from) :
      Math.floor(from);

    if (from < 0)
      from += length;
    
    for (; from < length; from ++) {
      if(from in array && array[from] === search)
        return from;
    }
    
    return -1;
  } : function (array, search) {
    return array.indexOf(search);
  };

  var __for_each = !Array.prototype.forEach ? function (array, callback, self) {
    for (var i = 0, j = array.length; i < j; i++)
      if (i in array)
        callback.call(self, array[i], i, array);
  } : function (array, callback, self) {
    array.forEach(callback, self);
  };

  var __slice = Array.prototype.slice;

  var __to_string = Object.prototype.toString;

  var __next_tick = typeof process !== 'undefined' && typeof process.nextTick === 'function' ?
    function(callback) { process.nextTick(callback); } :
    function(callback) { setTimeout(callback, 0); };

  var __is_array = !Array.isArray ? function(value) {
    return __to_string.call(value) === '[object Array]';
  } : function(value) {
    return Array.isArray(value);
  };

  var __is_object = function(value) {
    return __to_string.call(value) === '[object Object]';
  };

  var __noop = function() {};

  /*
   * Ee
   * */
  var Ee = function(E, options) {
    if (E && typeof E !== 'function') {
      options = E;
      E = null;
    }

    this.__events = {};
    this.__emitted = {};
    this.__until = {};
    this.__listeners = null;

    options = options || {};
    this.new_listener = !! options.new_listener;

    if (options.data_store)
      Ee.DataStore.call(this);

    if (!E && options.Event)
      E = options.Event;

    if (E && E.prototype instanceof Ee.Event) {
      this.Event = E;
    } else if (!this.Event || !(this.Event.prototype instanceof Ee.Event)) {
      this.Event = Ee.Event;
    }
  };

  Ee.prototype.reserve = function(event_types) {
    if (!__is_array(event_types))
      event_types = [event_types];

    var events = this.__events;

    for (var i = 0, j = event_types.length; i < j; i ++) {
      if (!events.hasOwnProperty(event_types[i]))
        events[event_types[i]] = [];

      events[event_types[i]].reserved = true;
    }

    return this;
  };

  Ee.prototype.unreserve = function(event_types) {
    if (!__is_array(event_types))
      event_types = [event_types];

    var events = this.__events;

    for (var i = 0, j = event_types.length; i < j; i ++) {
      if (events.hasOwnProperty(event_types[i])) {
        if (events[event_types[i]].length) {
          delete events[event_types[i]].reserved;
        } else {
          delete events[event_types[i]];
        }
      }
    }

    return this;
  };

  Ee.prototype.lookup = function(search, callback, return_this) {
    if (typeof search === 'function') {
      return_this = callback;
      callback = search;
      search = null;
    }

    var events = this.__events
      , result = [];

    if (!(search instanceof RegExp)) {
      if (search == null)
        search = '';

      search = new RegExp(search);
    }

    for (var n in events)
      if (events.hasOwnProperty(n))
        search.test(n) && result.push(n);

    if (callback) {
      __for_each(result, callback, this);
      return return_this ? this : result;
    } else {
      return result;
    }
  };

  Ee.prototype.on = function(event_types, listeners, times, until, first) {
    if (!__is_array(event_types))
      event_types = [event_types];

    if (!__is_array(listeners))
      listeners = [listeners];

    times = times == null ? -1 : times - 0 || 0;

    var events = this.__events
      , new_listener = this.new_listener
      , method = first ? 'unshift' : 'push'
      , length = listeners.length
      , event_type
      , listener
      , object
      , objects = [];

    for (var i = 0, j = event_types.length, ii; i < j; i ++) {
      event_type = event_types[i];

      if (!events[event_type])
        events[event_type] = [];

      for (ii = 0; ii < length; ii ++) {
        listener = listeners[ii];

        object = {
            type: event_type
          , listener: listener
          , times: times
        };

        events[event_type][method](object);
        objects.push(object);

        if (new_listener)
          this.emit('newListener', event_type, listener, times, until, first);
      }
    }

    if (until != null) {
      if (!__is_array(until))
        until = [until];

      var till = this.__until, u;

      for (i = 0, j = until.length; i < j; i ++) {
        u = until[i];

        if (!till[u])
          till[u] = [];

        till[u].push.apply(till[u], objects);
      }
    }

    this.__listeners = objects;

    return this;
  };

  Ee.prototype.once = function(event_types, listeners, until, first) {
    return this.on(event_types, listeners, 1, until, first);
  };

  Ee.prototype.first = function(event_types, listeners, times, until) {
    return this.on(event_types, listeners, times, until, true);
  };

  Ee.prototype.until = function(until, event_types, listeners, times, first) {
    return this.on(event_types, listeners, times, until, first);
  };

  Ee.prototype.until_once = function(until, event_types, listeners, first) {
    return this.on(event_types, listeners, 1, until, first);
  };

  Ee.prototype.until_mutually = function(event_types, listeners, until, times, first) {
    if (__is_object(event_types)) {
      var options = event_types;

      event_types = options.event || options.events;
      listeners = options.listener || options.listeners;
      times = options.times;
      first = options.first;
      until = options.until;
    }

    if (!__is_array(until))
      until = until == null ? [] : [until];

    for (var i = 0, j = event_types.length, event_type, ii, _until; i < j; i ++) {
      for (_until = until.slice(), event_type = event_types[i], ii = 0; ii < j; ii ++)
        event_type !== event_types[ii] && _until.push(event_types[ii]);
      
      _until.length && this.on(event_type, listeners, times, _until, first);
    }

    return this;
  };

  Ee.prototype.until_once_mutually = function(event_types, listeners, until, first) {
    if (__is_object(event_types))
      event_types.times = 1;

    return this.until_mutually(event_types, listeners, until, 1, first);
  };

  Ee.prototype.within = function(ms, event_types, listeners, callback, times, until, first) {
    if (ms && typeof ms === 'object') {
      var options = ms;

      ms = options.within;
      event_types = options.event || options.events;
      listeners = options.listener || options.listeners;
      callback = options.callback;
      times = options.times;
      first = options.first;
      until = options.until;
    }

    var self = this
      , last_listeners = this.on(event_types, listeners, times, until, first).__listeners;

    setTimeout(function() {
      self.off(event_types, last_listeners);
      callback && callback.call(self, last_listeners);
    }, ms - 0 || 0);

    return this;
  };

  Ee.prototype.within_once = function(ms, event_types, listeners, callback, until, first) {
    if (ms && typeof ms === 'object')
      ms.times = 1;

    return this.within(ms, event_types, listeners, callback, 1, until, first);
  };

  Ee.prototype.off = function(event_type, listener) {
    var i, j;

    if (__is_array(event_type)) {
      for (i = 0, j = event_type.length; i < j; i ++)
        this.off(event_type[i], listener);
      return this;
    } else if (__is_array(listener)) {
      for (i = 0, j = listener.length; i < j; i ++)
        this.off(event_type, listener[i]);
      return this;
    }

    var events = this.__events
      , emitted = this.__emitted
      , index;

    if (!events[event_type])
      return this;

    if (listener == null) {
      if (events[event_type].reserved) {
        events[event_type].length = 0;
      } else {
        delete events[event_type];
      }
      
      return this;
    }

    if (typeof listener === 'function') {
      index = -1;

      for (var items = events[event_type], i = 0, j = items.length; i < j; i ++)
        if (items[i].listener === listener) {
          index = i;
          break;
        }
    } else {
      index = __index_of(events[event_type], listener);
    }

    if (index !== -1) {
      events[event_type].splice(index, 1);

      if (events[event_type].length === 0 && !events[event_type].reserved)
        delete events[event_type];
    }

    return this;
  };

  Ee.prototype.size = function(event_type) {
    return this.listeners(event_type, true).length
  };

  Ee.prototype.ever = function(event_type) {
    if (event_type == null) {
      var emitted = this.__emitted
        , count = 0;

      for (var n in emitted)
        if (emitted[n] != null)
          count += emitted[n];

      return count;
    } else {
      return this.__emitted[event_type] || 0;
    }
  };

  Ee.prototype.listeners = function(event_type, with_params) {
    var events = this.__events
      , target_events;

    var n, i, j;

    if (event_type == null) {
      target_events = [];

      for (n in events)
        for (i = 0, j = events[n].length; i < j; i ++)
          target_events.push(events[n][i]);
    } else {
      target_events = (events[event_type] || []).slice();
    }

    if (!with_params)
      for (i = 0, j = target_events.length; i < j; i ++)
        target_events[i] = target_events[i].listener;

    return target_events;
  };

  /**
   * @private
   * */
  Ee.prototype.__trigger = function(event_type, args, fn) {
    var e
      , events = this.__events
      , emitted = this.__emitted
      , until = this.__until
      , listeners;

    this.__listeners = null;

    if (event_type instanceof Ee.Event) {
      e = event_type;
      event_type = e.type;
    } else {
      e = new this.Event(event_type);
    }

    if (emitted[event_type] == null)
      emitted[event_type] = 0;

    emitted[event_type] ++;

    if (until[event_type]) {
      for (var till = until[event_type], i = 0, j = till.length; i < j; i ++)
        this.off(till[i].type, till[i]);

      delete until[event_type];
    }

    if (!events[event_type]) {
      if (event_type === 'error') {
        if (args[0]) {
          if (args[0] instanceof Error) {
            throw args[0];
          } else {
            throw new Error(args[0]);
          }
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
      } else {
        listeners = [];
      }
    } else {
      listeners = events[event_type].slice();
    }

    args.unshift(e);

    fn.call(this, event_type, e, listeners, args);

    return this;
  };

  Ee.prototype.emit = function(event_type /* , arg1, ..., argN */) {
    return this.__trigger(
        event_type
      , __slice.call(arguments, 1)
      , function(event_type, e, listeners, args) {
        e.abortable = true;

        for (var listener, i = 0, j = listeners.length; i < j && !e.aborted; i ++) {
          e.position = i;
          listener = listeners[i];

          if (listener.times !== -1 && -- listener.times === 0)
            this.off(event_type, listener);
          
          listener.listener.apply(this, args);
        }
      }
    );
  };

  /**
   * @private
   * */
  var __call_with_hook = function(self, event_type, e, listener, args, hook) {
    if (listener.times !== -1 && -- listener.times === 0)
      self.off(event_type, listener);

    if (hook) {
      if (hook.length > 3) {
        hook.call(self, listener, e, args, function() {
          listener.listener.apply(self, args);
        });
      } else {
        hook.call(self, listener, e, args);
        listener.listener.apply(self, args);
      }
    } else {
      listener.listener.apply(self, args);
    }
  };

  Ee.prototype.chain = function(event_type, args, complete, hook) {
    if (typeof args === 'function') {
      hook = complete;
      complete = args;
      args = [];
    }

    return this.__trigger(
        event_type
      , args || []
      , function(event_type, e, listeners, args) {
        var self = this
          , listener;

        e.abortable = true;
        e.preventable = true;
        e.position = -1;

        if (listeners.length === 0)
          return complete && complete.call(self, e);

        (function wrapper() {
          if (e.aborted || e.prevented || !(listener = listeners.shift()))
            return complete && complete.call(self, e);

          e.position ++;
          e.__next = wrapper;

          __call_with_hook(self, event_type, e, listener, args, hook);
        }).call(e);
      }
    );
  };

  Ee.prototype.parallel = function(event_type, args, complete, hook) {
    if (typeof args === 'function') {
      hook = complete;
      complete = args;
      args = [];
    }

    return this.__trigger(
      event_type
      , args || []
      , function(event_type, e, listeners, args) {
        var self = this;

        e.__complete = function() {
          complete && complete.call(self, e);
        };

        e.preventable = true;
        e.undone = listeners.length;

        if (listeners.length === 0)
          return __next_tick(e.__complete);

        __for_each(listeners, function(listener) {
          __next_tick(function() {
            __call_with_hook(self, event_type, e, listener, args, hook);
          });
        });
      }
    );
  };

  Ee.prototype.Event = null;

  /*
   * DataStore
   * */
  Ee.DataStore = function() {
    this.get = function(key, default_value) {
      if (!this.data)
        return default_value;

      return this.data.hasOwnProperty(key) ?
        this.data[key] : default_value;
    };

    this.set = function(key, value) {
      if (!this.data)
        this.data = {};

      this.data[key] = value;

      return this;
    };

    this.unset = function(key) {
      if (this.data)
        delete this.data[key];

      return this;
    };
  };

  /*
   * Event
   * */
  Ee.Event = function(type) {
    this.type = type;
    this.abortable = false;
    this.aborted = false;
    this.prevented = false;
    this.preventable = false;
    this.position = null;
    this.undone = null;
    this.__next = null;
    this.__complete = null;
  };

  Ee.Event.prototype = new Ee.DataStore();

  Ee.Event.prototype.stop = function() {
    if (this.abortable)
      this.aborted = true;

    if (this.preventable)
      this.prevented = true;

    return this.abortable || this.prevented ?
      this.next() : this;
  };

  Ee.Event.prototype.abort = function() {
    if (this.abortable) {
      this.aborted = true;
      this.next();
    }

    return this;
  };

  Ee.Event.prototype.prevent = function() {
    if (this.preventable) {
      this.prevented = true;
      this.next();
    }

    return this;
  };

  Ee.Event.prototype.next = function() {
    if (this.__next) {
      var next = this.__next;
      this.__next = null;
      next.call(this);
    }

    return this;
  };

  Ee.Event.prototype.done = function() {
    if (this.__complete && -- this.undone <= 0) {
      var complete = this.__complete;
      this.__complete = null;
      complete.call(this);
    }

    return this;
  };

  return Ee;
});
})(
  typeof define !== 'undefined' ? define :
    typeof module !== 'undefined' ? function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['Ee'] = factory(); }
);
