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

  var __slice = Array.prototype.slice;

  var Ee = function(E) {
    this.__events = {};
    this.__emitted = {};

    if (E && E.prototype instanceof Ee.Event) {
      this.Event = E;
    } else if (!this.Event) {
      this.Event = Ee.Event;
    }
  };

  Ee.prototype.on = function(event_type, listener, times, first) {
    var events = this.__events;

    if (!events[event_type])
      events[event_type] = [];

    events[event_type][first ? 'unshift' : 'push']({
          type: event_type
        , listener: listener
        , times: times == null ? -1 : times - 0 || 0
      });

    return this.emit('newListener', event_type, listener, times, first);
  };

  Ee.prototype.once = function(event_type, listener, first) {
    return this.on(event_type, listener, 1, first);
  };

  Ee.prototype.first = function(event_type, listener, times) {
    return this.on(event_type, listener, times, true);
  };

  Ee.prototype.off = function(event_type, listener) {
    var events = this.__events
      , emitted = this.__emitted
      , index;

    if (!events[event_type])
      return this;

    if (listener == null) {
      delete events[event_type];
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

      if (events[event_type].length === 0)
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

  Ee.prototype.emit = function(event_type /* , arg1, ..., argN */) {
    var e
      , events = this.__events
      , emitted = this.__emitted;

    if (event_type instanceof Ee.Event) {
      e = event_type;
      event_type = e.type;
    } else {
      e = new this.Event(event_type);
    }

    if (emitted[event_type] == null)
      emitted[event_type] = 0;

    emitted[event_type] ++;

    if (!events[event_type]) {
      if (event_type === 'error') {
        if (arguments[1]) {
          if (arguments[1] instanceof Error) {
            throw arguments[1];
          } else {
            throw new Error(arguments[1]);
          }
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
      } else {
        return this;
      }
    }

    var args = arguments.length === 1 ? [] : __slice.call(arguments, 1)
      , target_events = events[event_type].slice();

    args.unshift(e);

    for (var event, i = 0, j = target_events.length; i < j && !e.stopped; i ++) {
      event = target_events[i];
      event.listener.apply(this, args);

      if (event.times !== -1 && -- event.times === 0)
        this.off(event_type, event);
    }

    return this;
  };

  Ee.Event = function(type) {
    this.type = type;
    this.stopped = false;
  };

  Ee.Event.prototype.stop = function() {
    this.stopped = true;
  };

  return Ee;
});
})(
  typeof define !== 'undefined' ? define :
    typeof module !== 'undefined' ? function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['Ee'] = factory(); }
);
