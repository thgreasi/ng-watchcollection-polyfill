'use strict';

// Thanks angular.js v1.2
describe('Scope', function() {

  describe('$watch/$digest', function() {
    // it('should clean up stable watches from $watchCollection', inject(function($rootScope) {
    //   $rootScope.$watchCollection('::foo', function() {});
    //   expect($rootScope.$$watchers.length).toEqual(1);

    //   $rootScope.$digest();
    //   expect($rootScope.$$watchers.length).toEqual(1);

    //   $rootScope.foo = [];
    //   $rootScope.$digest();
    //   expect($rootScope.$$watchers.length).toEqual(0);
    // }));

    describe('$watchCollection', function() {
      var log, $rootScope, deregister;

      beforeEach(inject(function(_$rootScope_, _log_) {
        $rootScope = _$rootScope_;
        log = _log_;
        deregister = $rootScope.$watchCollection('obj', function logger(newVal, oldVal) {
          var msg = {newVal: newVal, oldVal: oldVal};

          if (newVal === oldVal) {
            msg.identical = true;
          }

          log(msg);
        });
      }));


      it('should not trigger if nothing change', inject(function($rootScope) {
        $rootScope.$digest();
        expect(log).toEqual([{ newVal: undefined, oldVal: undefined, identical: true }]);
        log.reset();

        $rootScope.$digest();
        expect(log).toEqual([]);
      }));


      it('should allow deregistration', function() {
        $rootScope.obj = [];
        $rootScope.$digest();
        expect(log.toArray().length).toBe(1);
        log.reset();

        $rootScope.obj.push('a');
        deregister();

        $rootScope.$digest();
        expect(log).toEqual([]);
      });


      describe('array', function() {

        it('should return oldCollection === newCollection only on the first listener call',
            inject(function($rootScope, log) {

          // first time should be identical
          $rootScope.obj = ['a', 'b'];
          $rootScope.$digest();
          expect(log).toEqual([{newVal: ['a', 'b'], oldVal: ['a', 'b'], identical: true}]);
          log.reset();

          // second time should be different
          $rootScope.obj[1] = 'c';
          $rootScope.$digest();
          expect(log).toEqual([{newVal: ['a', 'c'], oldVal: ['a', 'b']}]);
        }));


        it('should trigger when property changes into array', function() {
          $rootScope.obj = 'test';
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: "test", oldVal: "test", identical: true}]);

          $rootScope.obj = [];
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: [], oldVal: "test"}]);

          $rootScope.obj = {};
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {}, oldVal: []}]);

          $rootScope.obj = [];
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: [], oldVal: {}}]);

          $rootScope.obj = undefined;
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: undefined, oldVal: []}]);
        });


        it('should not trigger change when object in collection changes', function() {
          $rootScope.obj = [{}];
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: [{}], oldVal: [{}], identical: true}]);

          $rootScope.obj[0].name = 'foo';
          $rootScope.$digest();
          expect(log).toEqual([]);
        });


        it('should watch array properties', function() {
          $rootScope.obj = [];
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: [], oldVal: [], identical: true}]);

          $rootScope.obj.push('a');
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: ['a'], oldVal: []}]);

          $rootScope.obj[0] = 'b';
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: ['b'], oldVal: ['a']}]);

          $rootScope.obj.push([]);
          $rootScope.obj.push({});
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: ['b', [], {}], oldVal: ['b']}]);

          var temp = $rootScope.obj[1];
          $rootScope.obj[1] = $rootScope.obj[2];
          $rootScope.obj[2] = temp;
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: ['b', {}, []], oldVal: ['b', [], {}]}]);

          $rootScope.obj.shift();
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: [{}, []], oldVal: ['b', {}, []]}]);
        });

        it('should not infinitely digest when current value is NaN', function() {
          $rootScope.obj = [NaN];
          expect(function() {
            $rootScope.$digest();
          }).not.toThrow();
        });

        it('should watch array-like objects like arrays', function() {
          var arrayLikelog = [];
          $rootScope.$watchCollection('arrayLikeObject', function logger(obj) {
            forEach(obj, function(element) {
              arrayLikelog.push(element.name);
            });
          });
          document.body.innerHTML = "<p>" +
                                      "<a name='x'>a</a>" +
                                      "<a name='y'>b</a>" +
                                    "</p>";

          $rootScope.arrayLikeObject =  document.getElementsByTagName('a');
          $rootScope.$digest();
          expect(arrayLikelog).toEqual(['x', 'y']);
        });
      });


      describe('object', function() {

        it('should return oldCollection === newCollection only on the first listener call',
            inject(function($rootScope, log) {

          $rootScope.obj = {'a': 'b'};
          // first time should be identical
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {'a': 'b'}, oldVal: {'a': 'b'}, identical: true}]);

          // second time not identical
          $rootScope.obj.a = 'c';
          $rootScope.$digest();
          expect(log).toEqual([{newVal: {'a': 'c'}, oldVal: {'a': 'b'}}]);
        }));


        it('should trigger when property changes into object', function() {
          $rootScope.obj = 'test';
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: 'test', oldVal: 'test', identical: true}]);

          $rootScope.obj = {};
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {}, oldVal: 'test'}]);
        });


        it('should not trigger change when object in collection changes', function() {
          $rootScope.obj = {name: {}};
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {name: {}}, oldVal: {name: {}}, identical: true}]);

          $rootScope.obj.name.bar = 'foo';
          $rootScope.$digest();
          expect(log.empty()).toEqual([]);
        });


        it('should watch object properties', function() {
          $rootScope.obj = {};
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {}, oldVal: {}, identical: true}]);

          $rootScope.obj.a= 'A';
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {a: 'A'}, oldVal: {}}]);

          $rootScope.obj.a = 'B';
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {a: 'B'}, oldVal: {a: 'A'}}]);

          $rootScope.obj.b = [];
          $rootScope.obj.c = {};
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {a: 'B', b: [], c: {}}, oldVal: {a: 'B'}}]);

          var temp = $rootScope.obj.a;
          $rootScope.obj.a = $rootScope.obj.b;
          $rootScope.obj.c = temp;
          $rootScope.$digest();
          expect(log.empty()).
              toEqual([{newVal: {a: [], b: {}, c: 'B'}, oldVal: {a: 'B', b: [], c: {}}}]);

          delete $rootScope.obj.a;
          $rootScope.$digest();
          expect(log.empty()).toEqual([{newVal: {b: {}, c: 'B'}, oldVal: {a: [], b: {}, c: 'B'}}]);
        });

        it('should not infinitely digest when current value is NaN', function() {
          $rootScope.obj = {a: NaN};
          expect(function() {
            $rootScope.$digest();
          }).not.toThrow();
        });

      });
    });

  });

});
