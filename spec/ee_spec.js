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

    it('should be called thrice', function() {
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

    it('should be called once', function() {
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

    it('should be called twice', function() {
      object
        .on('test', spy1, 2)
        .emit('test')
        .emit('test')
        .emit('test');

      expect(spy1).have.been.calledTwice;
    });

    it('should be called to order', function() {
      object
        .on('test', spy1)
        .first('test', spy2)
        .emit('test');

      expect(spy2).have.been.calledBefore(spy1);
    });
  });

  describe('#off', function() {
    var object, spy1, spy2;

    beforeEach(function() {
      object = new Ee();
      spy1 = sinon.spy();
      spy2 = sinon.spy();
    });

    it('should be removed (should be called once)', function() {
      object
        .on('test', spy1)
        .emit('test')
        .off('test', spy1)
        .emit('test');

      expect(spy1).have.been.calledOnce;
    });

    it('should not be removed (should be called twice)', function() {
      object
        .on('test', spy1)
        .emit('test')
        .off('test', spy2)
        .emit('test');

      expect(spy1).have.been.calledTwice;
    });

    it('should be removed all (should be called once)', function() {
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

    it('should be called on object context', function() {
      object
        .on('test', spy1)
        .emit('test');

      expect(spy1).have.been.calledOn(object);
    });

    it('should be called with instance of object.Event', function() {
      var spy = sinon.spy(function(e) {
        expect(e).to.be.instanceof(object.Event);
      });

      object
        .on('test', spy)
        .emit('test');

      expect(spy).have.been.called;
    });

    it('should be called with arguments', function() {
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

    it('should not be called if Event#stopped is called', function() {
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

    it('should be called with custom event', function() {
      var spy = sinon.spy(function(e) {
        expect(e).to.be.instanceof(CustomEvent);
      });

      var object = new Ee(CustomEvent);

      object
        .on('test', spy)
        .emit('test');

      expect(spy).have.been.called;
    });
  });

  describe('#defer', function() {
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

    it('should not be called', function() {
      object
        .on('test', spy1)
        .on('test', spy2)
        .defer('test');

      expect(spy1).have.been.called;
      expect(spy2).have.not.been.called;
    });

    it('should be called', function() {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .defer('test');

      expect(spy_call_next1).have.been.called;
      expect(spy_call_next2).have.been.called;
    });

    it('should be called with arguments', function() {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next2)
        .defer('test', ['argument1', 'argument2'], function(e) {
          expect(spy_call_next1).have.been.calledWith(e, 'argument1', 'argument2');
          expect(spy_call_next2).have.been.calledWith(e, 'argument1', 'argument2');
        });
    });

    it('should be called delayed', function(done) {
      object
        .on('test', spy_call_next_delay1)
        .on('test', spy_call_next_delay2)
        .defer('test', function(e) {
          expect(spy_call_next_delay2).have.been.called;
          done();
        });

      expect(spy_call_next_delay1).have.been.called;
      expect(spy_call_next_delay2).have.not.been.called;
    });

    it('should be called if Event#stop is called', function(done) {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next_delay1)
        .once('test', function(e) {
          e.stop();
        })
        .on('test', spy_call_next2)
        .on('test', spy_call_next_delay2)
        .defer('test', function(e) {
          expect(e.stopped).to.equal(true);
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next_delay1).have.been.called;
          expect(spy_call_next2).have.not.been.called;
          expect(spy_call_next_delay2).have.not.been.called;

          object.defer('test', function(e) {
            expect(e.stopped).to.equal(false);
            expect(spy_call_next1).have.been.called;
            expect(spy_call_next_delay1).have.been.called;
            expect(spy_call_next2).have.been.called;
            expect(spy_call_next_delay2).have.been.called;

            done();
          });
        });
    });

    it('should be called if Event#prevent is called', function(done) {
      object
        .on('test', spy_call_next1)
        .on('test', spy_call_next_delay1)
        .once('test', function(e) {
          e.prevent();
        })
        .on('test', spy_call_next2)
        .on('test', spy_call_next_delay2)
        .defer('test', function(e) {
          expect(e.prevented).to.equal(true);
          expect(spy_call_next1).have.been.called;
          expect(spy_call_next_delay1).have.been.called;
          expect(spy_call_next2).have.not.been.called;
          expect(spy_call_next_delay2).have.not.been.called;

          object.defer('test', function(e) {
            expect(e.prevented).to.equal(false);
            expect(spy_call_next1).have.been.called;
            expect(spy_call_next_delay1).have.been.called;
            expect(spy_call_next2).have.been.called;
            expect(spy_call_next_delay2).have.been.called;
            done();
          });
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
      object = new Ee();
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
