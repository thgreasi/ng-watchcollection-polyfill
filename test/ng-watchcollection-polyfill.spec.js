'use strict';

describe('ng.watchcollection.polyfill', function() {

  beforeEach(module('ng.watchcollection.polyfill'));

  /* jshint unused:false */
  beforeEach(inject(function(ngWatchCollectionPolyfillService) { }));

  it('should have a polyfill method', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(typeof ngWatchCollectionPolyfillService.polyfill).toBe('function');
  }));

  it('should have a isPolyfilled method', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(typeof ngWatchCollectionPolyfillService.isPolyfilled).toBe('function');
  }));

  it('should be polyfilled', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(ngWatchCollectionPolyfillService.isPolyfilled()).toBe(true);
  }));

  it('should add watchcollection to rootScope', inject(function($rootScope) {
    expect($rootScope.$watchCollection).not.toBe(undefined);
    expect(typeof $rootScope.$watchCollection).toBe('function');
  }));

  it('should add watchcollection to a new scope', inject(function($rootScope) {
    var newScope = $rootScope.$new();
    expect(newScope.$watchCollection).not.toBe(undefined);
    expect(typeof newScope.$watchCollection).toBe('function');
  }));

  it('should add watchcollection to a new isolated scope', inject(function($rootScope) {
    var newScope = $rootScope.$new(true);
    expect(!!newScope.$watchCollection).toBe(true);
  }));

  it('extra calls to polyfill should not have effects', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    var watchCollectionArray = [$rootScope.$watchCollection];
    var newScopeArray = [$rootScope.$new];

    ngWatchCollectionPolyfillService.polyfill();

    watchCollectionArray.push($rootScope.$watchCollection);
    newScopeArray.push($rootScope.$new);

    expect(watchCollectionArray[0]).toBe(watchCollectionArray[1]);
    expect(newScopeArray[0]).toBe(newScopeArray[1]);
  }));
});