'use strict';

describe('ng.watchcollection.polyfill', function() {

  beforeEach(module('ng.watchcollection.polyfill'));

  it('should have a polyfill method', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(typeof ngWatchCollectionPolyfillService.polyfill).toBe('function');
  }));

  it('should have a isPolyfilled method', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(typeof ngWatchCollectionPolyfillService.isPolyfilled).toBe('function');
  }));

  it('should be polyfilled', inject(function($rootScope, ngWatchCollectionPolyfillService) {
    expect(ngWatchCollectionPolyfillService.isPolyfilled()).toBe(true);
  }));
});