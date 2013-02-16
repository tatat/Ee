var sinon = require('sinon')
  , chai = require('chai').use(require('sinon-chai'))
  , expect = chai.expect
  , Ee = require('../lib/ee');

describe('Ee', function() {

  describe('#on, #once, $first', function() {
    var object, spy1, spy2;

    beforeEach(function() {
      object = new Ee();
      spy1 = sinon.spy();
      spy2 = sinon.spy();
    });

    it('should add listener called thrice', function() {
      object
        .on('test', spy1)
        .on('test', spy2)
        .emit('test')
        .emit('test')
        .emit('test')
        .emit('other')
        .emit('other')
        .emit('other');

      expect(spy1).have.been.calledThrice;
      expect(spy2).have.been.calledThrice;
    });

    it('should add listener called once', function() {
      object
        .on('test', spy1, 1)
        .emit('test')
        .emit('test');

      expect(spy1).have.been.calledOnce;

      object
        .once('test', spy2)
        .emit('test')
        .emit('test');

      expect(spy2).have.been.calledOnce;
    });

    it('should add listener called twice', function() {
      object
        .on('test', spy1, 2)
        .emit('test')
        .emit('test')
        .emit('test');

      expect(spy1).have.been.calledTwice;
    });

    it('should add listener called to order', function() {
      object
        .on('test', spy1)
        .first('test', spy2)
        .emit('test');

      expect(spy2).have.been.calledBefore(spy1);
    });

    it('should add and remove listeners by array', function() {
      object
        .on(['test1', 'test2'], [spy1, spy2])
        .emit('test1')
        .emit('test2');

      expect(spy1).have.been.calledTwice;
      expect(spy2).have.been.calledTwice;

      object
        .off(['test1', 'test2'], spy1)
        .emit('test1')
        .emit('test2');

      expect(spy1).have.been.calledTwice;
      expect(spy2).have.not.been.calledTwice;
    });
  });

  describe('#off', function() {
    var object, spy1, spy2;

    beforeEach(function() {
      object = new Ee();
      spy1 = sinon.spy();
      spy2 = sinon.spy();
    });

    it('should remove listener (listener should be called once)', function() {
      object
        .on('test', spy1)
        .emit('test')
        .off('test', spy1)
        .emit('test');

      expect(spy1).have.been.calledOnce;
    });

    it('should not remove other listener (listener should be called twice)', function() {
      object
        .on('test', spy1)
        .emit('test')
        .off('test', spy2)
        .emit('test');

      expect(spy1).have.been.calledTwice;
    });

    it('should remove all listeners', function() {
      object
        .on('test', spy1)
        .on('test', spy2)
        .emit('test')
        .off('test')
        .emit('test');

      expect(spy1).have.been.calledOnce;
      expect(spy2).have.been.calledOnce;
    });
  });

  describe('#emit', function() {
    var object, spy1, spy2, CustomEvent;

    before(function() {
      CustomEvent = function(type) {
        Ee.Event.call(this, type);
      };

      CustomEvent.prototype = Object.create(Ee.Event.prototype);
    });
    
    beforeEach(function() {
      object = new Ee();
      spy1 = sinon.spy();
      spy2 = sinon.spy();
    });

    it('should call listener on object context', function() {
      object
        .on('test', spy1)
        .emit('test');

      expect(spy1).have.been.calledOn(object);
    });

    it('should call listener with instance of object.Event', function() {
      var spy = sinon.spy(function(e) {
        expect(e).to.be.instanceof(object.Event);
      });

      object
        .on('test', spy)
        .emit('test');

      expect(spy).have.been.called;
    });

    it('should call listener with arguments', function() {
      var spy = sinon.spy(function(e, argument1, argument2, argument3) {
        expect(e).to.be.instanceof(object.Event);
        expect(argument1).to.equal('argument 1');
        expect(argument2).to.equal('argument 2');
        expect(argument3).to.equal('argument 3');
      });

      object
        .on('test', spy)
        .emit('test', 'argument 1', 'argument 2', 'argument 3');

      expect(spy).have.been.called;
    });

    it('should not call listener if Event#stop is called', function() {
      var spy = sinon.spy(function(e) {
        e.stop();
      });

      object
        .on('test', spy)
        .on('test', spy1)
        .on('test', spy2)
        .emit('test');

      expect(spy).have.been.called;
      expect(spy1).have.not.been.called;
      expect(spy2).have.not.been.called;
    });

    it('should emit with event', function() {
      object
        .on('test', spy1)
        .emit(new Ee.Event('test'));

      expect(spy1).have.been.called;
    });

    it('should emit with custom event', function() {
      object
        .on('test', spy1)
        .emit(new CustomEvent('test'));

      expect(spy1).have.been.called;
    });

    it('should call listener with custom event', function() {
      var spy = sinon.spy(function(e) {
        expect(e).to.be.instanceof(CustomEvent);
      });

      var object = new Ee(CustomEvent);

      object
        .on('test', spy)
        .emit('test');

      expect(spy).have.been.called;
    });

    it('should throw Error', function() {
      var block = function() {
        object.emit('error');
      };

      expect(block).have.throw(Error);
    });

    it('should not throw Error', function() {
      var block = function() {
        object
          .on('error', function(e) {})
          .emit('error');
      };

      expect(block).have.not.throw();
    });
  });

  describe('#chain', function() {
    var object, spy1, spy2;

    beforeEach(function() {
      object = new Ee();

      spy1 = sinon.spy();
      spy2 = sinon.spy();

      var call_next = function(e) {
        e.next();
      };

      spy_call_next1 = sinon.spy(call_next);
      spy_call_next2 = sinon.spy(call_next);

      var call_next_delay = function(e) {
        setTimeout(function() {
          e.next();
        }, 100);
      };

      spy_call_next_delay1 = sinon.spy(call_next_delay);
      spy_call_next_delay2 = sinon.spy(call_next_delay);
    });

    it('should not call listener if Event#next is not called', function() {
      object
        .on('test', spy1)
        .on('test', spy2)
        .chain('test');

      expect(spy1).have.been.called;
      expect(spy2).have.not.been.called;
    });

    it('should call listener', function() {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .chain('test');

      expect(spy_call_next1).have.been.called;
      expect(spy_call_next2).have.been.called;
    });

    it('should call listener in hook (with 3 arguments)', function() {
      var spy_complete = sinon.spy(function(e) {
        expect(spy_call_next1).have.been.called;
        expect(spy_call_next2).have.been.called;
      });

      var spy_hook = sinon.spy(function(listener, e, args) {
        expect(args).to.deep.equal([e, 'some argument']);
        expect(args[0]).to.deep.equal(e);

        switch (listener.listener) {
        case spy_call_next1:
          expect(spy_call_next1).have.not.been.called;
          break;
        case spy_call_next2:
          expect(spy_call_next2).have.not.been.called;
          break;
        }
      });

      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .chain('test', ['some argument'], spy_complete, spy_hook);

      expect(spy_complete).to.have.been.calledOnce;
      expect(spy_hook).to.have.been.calledTwice;
    });

    it('should call listener in hook (with 4 arguments)', function(done) {
      var spy_hook = sinon.spy(function(listener, e, args, call) {
        expect(args).to.deep.equal([e, 'some argument']);
        expect(args[0]).to.deep.equal(e);

        switch (listener.listener) {
        case spy_call_next1:
          expect(spy_call_next1).have.not.been.called;
          break;
        case spy_call_next2:
          expect(spy_call_next2).have.not.been.called;
          break;
        }

        setTimeout(call, 100);
      });

      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .chain('test', ['some argument'], function(e) {
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next2).have.been.called;
          expect(spy_hook).to.have.been.calledTwice;
          done();
        }, spy_hook);
    });

    it('should call listener with arguments', function() {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .chain('test', ['argument1', 'argument2'], function(e) {
          expect(spy_call_next1).have.been.calledWith(e, 'argument1', 'argument2');
          expect(spy_call_next2).have.been.calledWith(e, 'argument1', 'argument2');
        });
    });

    it('should call listener with delay', function(done) {
      object
        .on('test', spy_call_next_delay1)
        .on('test', spy_call_next_delay2)
        .chain('test', function(e) {
          expect(spy_call_next_delay2).have.been.called;
          done();
        });

      expect(spy_call_next_delay1).have.been.called;
      expect(spy_call_next_delay2).have.not.been.called;
    });

    it('should not call listener if Event#abort is called', function(done) {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next_delay1)
        .once('test', function(e) {
          e.abort();
        })
        .on('test', spy_call_next2)
        .on('test', spy_call_next_delay2)
        .chain('test', function(e) {
          expect(e.aborted).to.equal(true);
          expect(e.prevented).to.equal(false);
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next_delay1).have.been.called;
          expect(spy_call_next2).have.not.been.called;
          expect(spy_call_next_delay2).have.not.been.called;

          object.chain('test', function(e) {
            expect(e.aborted).to.equal(false);
            expect(e.prevented).to.equal(false);
            expect(spy_call_next2).have.been.called;
            expect(spy_call_next_delay2).have.been.called;
            done();
          });
        });
    });

    it('should not call listener if Event#prevent is called', function(done) {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next_delay1)
        .once('test', function(e) {
          e.prevent();
        })
        .on('test', spy_call_next2)
        .on('test', spy_call_next_delay2)
        .chain('test', function(e) {
          expect(e.aborted).to.equal(false);
          expect(e.prevented).to.equal(true);
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next_delay1).have.been.called;
          expect(spy_call_next2).have.not.been.called;
          expect(spy_call_next_delay2).have.not.been.called;

          object.chain('test', function(e) {
            expect(e.aborted).to.equal(false);
            expect(e.prevented).to.equal(false);
            expect(spy_call_next2).have.been.called;
            expect(spy_call_next_delay2).have.been.called;
            done();
          });
        });
    });

    it('should not call listener if Event#stop is called', function(done) {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next_delay1)
        .once('test', function(e) {
          e.stop();
        })
        .on('test', spy_call_next2)
        .on('test', spy_call_next_delay2)
        .chain('test', function(e) {
          expect(e.prevented).to.equal(true);
          expect(e.aborted).to.equal(true);
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next_delay1).have.been.called;
          expect(spy_call_next2).have.not.been.called;
          expect(spy_call_next_delay2).have.not.been.called;

          object.chain('test', function(e) {
            expect(e.prevented).to.equal(false);
            expect(e.aborted).to.equal(false);
            expect(spy_call_next2).have.been.called;
            expect(spy_call_next_delay2).have.been.called;
            done();
          });
        });
    });

    it('should call complete callback even if no listener is set', function(done) {
      object.chain('test', function(e) {
        done();
      });
    });

    it('can like this with hook', function(done) {
      var noop = function() {};

      var spy = sinon.spy(function(e, next) {
        next();
      });

      object
        .on('test', noop)
        .on('test', spy)
        .on('test', noop)
        .on('test', spy);

      object.chain('test', function(e) {
        expect(spy).have.been.calledTwice;
        done();
      }, function(listener, e, args, call) {
        if (listener.listener.length < 2) {
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
    });
  });

  describe('#parallel', function() {
    var object;

    beforeEach(function() {
      object = new Ee();
    });


    it('should call all listeners and data have been set', function(done) {
      var i = 0;

      var complete = function(e) {
        var timeout = 100 * ++ i;
        e.set(timeout, timeout);
        e.done();
      };

      var complete_delay = function(e) {
        var timeout = 100 * ++ i;

        setTimeout(function() {
          e.set(timeout, timeout);
          e.done();
        }, timeout);
      };

      var spy1 = sinon.spy(complete_delay)
        , spy2 = sinon.spy(complete)
        , spy3 = sinon.spy(complete_delay)
        , spy4 = sinon.spy(complete)
        , spy5 = sinon.spy(complete_delay);

      object
        .on('test', spy1)
        .on('test', spy2)
        .on('test', spy3)
        .on('test', spy4)
        .on('test', spy5)
        .parallel('test', function(e) {
          expect(spy1).have.been.called;
          expect(spy2).have.been.called;
          expect(spy3).have.been.called;
          expect(spy4).have.been.called;
          expect(spy5).have.been.called;
          expect(e.get('100')).to.equal(100);
          expect(e.get('200')).to.equal(200);
          expect(e.get('300')).to.equal(300);
          expect(e.get('400')).to.equal(400);
          expect(e.get('500')).to.equal(500);
          done();
        });
    });

    it('should not call any listeners in current event loop iteration', function(done) {
      var spy1 = sinon.spy(function(e) {
            e.done();
          })
        , spy2 = sinon.spy(function(e) {
            setTimeout(function() {
              e.done();
            }, 100);
          });

      object
        .on('test', spy1)
        .on('test', spy2)
        .parallel('test', function(e) {
          expect(spy1).have.been.called;
          expect(spy2).have.been.called;
          done();
        });

      expect(spy1).have.not.been.called;
      expect(spy2).have.not.been.called;
    });

    it('should call complete callback even if no listener is set', function(done) {
      object.chain('test', function(e) {
        done();
      });
    });
  });

  describe('#size', function() {
    var object;

    beforeEach(function() {
      object = new Ee();
    });

    it('should count listeners exactly', function() {
      var noop = function() {};

      object
        .on('1 listener', noop)
        .on('2 listeners', noop)
        .on('2 listeners', noop)
        .on('no listener', noop)
        .on('no listener', noop)
        .on('no listener', noop)
        .off('no listener');

      expect(object.size('unlistened event')).to.equal(0);
      expect(object.size('1 listener')).to.equal(1);
      expect(object.size('2 listeners')).to.equal(2);
      expect(object.size('no listener')).to.equal(0);
      expect(object.size()).to.equal(3);
    });
  });

  describe('#ever', function() {
    var object;

    beforeEach(function() {
      object = new Ee({
        new_listener: true
      });
    });

    it('should count how many times listeners have been called exactly', function() {
      var noop = function() {};

      object
        .on('emitted once', noop)
        .emit('emitted once')
        .off('emitted once');

      object
        .on('emitted twice', noop)
        .emit('emitted twice')
        .emit('emitted twice')
        .off('emitted twice');

      object
        .on('emitted thrice', noop)
        .emit('emitted thrice')
        .emit('emitted thrice')
        .emit('emitted thrice')
        .off('emitted thrice');

      expect(object.ever('not emitted')).to.equal(0);
      expect(object.ever('emitted once')).to.equal(1);
      expect(object.ever('emitted twice')).to.equal(2);
      expect(object.ever('emitted thrice')).to.equal(3);
      expect(object.ever('newListener')).to.equal(3);
      expect(object.ever()).to.equal(9);
    });
  });

  describe('#listeners', function() {
    var object;

    beforeEach(function() {
      object = new Ee();
    });

    it('should return array of listeners', function() {
      var noop = function() {};

      object
        .on('one listener', noop)
        .on('two listeners', noop)
        .on('two listeners', noop);

      expect(object.listeners('no listeners')).to.deep.equal([]);
      expect(object.listeners('one listener')).to.deep.equal([noop]);
      expect(object.listeners('two listeners')).to.deep.equal([noop, noop]);
      expect(object.listeners()).to.deep.equal([noop, noop, noop]);
    });
  });
});
