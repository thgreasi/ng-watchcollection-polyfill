(function(window, angular, undefined) {
  'use strict';

  angular.module('ng.watchcollection.polyfill', [])
    .factory('ngWatchCollectionPolyfillService',
      ['$rootScope', '$parse', function(rootScope, parse) {
        var originalNewScope,
            $polyfilledWatchCollection = $watchCollectionProvider(parse);

        var service = {
          polyfill: function() {
            rootScope.$watchCollection = rootScope.$watchCollection || $polyfilledWatchCollection;

            if (!originalNewScope && this.isPolyfilled()) {
              originalNewScope = rootScope.$new;
              rootScope.$new = function() {
                var newScope = originalNewScope.apply(this, arguments);
                newScope.$watchCollection = newScope.$watchCollection || $polyfilledWatchCollection;
                return newScope;
              };
            }
          },
          isPolyfilled: function() {
            return rootScope.$watchCollection === $polyfilledWatchCollection;
          }
        };

        service.polyfill();

        return service;
      }]);

  function $watchCollectionProvider($parse) {
    var isArray = angular.isArray;
    /**
     * @private
     * @param {*} obj
     * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
     *                   String ...)
     */
    function isArrayLike(obj) {
      if (obj == null || isWindow(obj)) {
        return false;
      }

      var length = obj.length;

      if (obj.nodeType === 1 && length) {
        return true;
      }

      return isString(obj) || isArray(obj) || length === 0 ||
             typeof length === 'number' && length > 0 && (length - 1) in obj;
    }
    var isObject = angular.isObject;
    var isString = angular.isString;
    /**
     * Checks if `obj` is a window object.
     *
     * @private
     * @param {*} obj Object to check
     * @returns {boolean} True if `obj` is a window obj.
     */
    function isWindow(obj) {
      return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }
    
    
    // Thanks angular.js v1.2
    /**
     * @ngdoc method
     * @name $rootScope.Scope#$watchCollection
     * @kind function
     *
     * @description
     * Shallow watches the properties of an object and fires whenever any of the properties change
     * (for arrays, this implies watching the array items; for object maps, this implies watching
     * the properties). If a change is detected, the `listener` callback is fired.
     *
     * - The `obj` collection is observed via standard $watch operation and is examined on every
     *   call to $digest() to see if any items have been added, removed, or moved.
     * - The `listener` is called whenever anything within the `obj` has changed. Examples include
     *   adding, removing, and moving items belonging to an object or array.
     *
     *
     * # Example
     * ```js
        $scope.names = ['igor', 'matias', 'misko', 'james'];
        $scope.dataCount = 4;

        $scope.$watchCollection('names', function(newNames, oldNames) {
          $scope.dataCount = newNames.length;
        });

        expect($scope.dataCount).toEqual(4);
        $scope.$digest();

        //still at 4 ... no changes
        expect($scope.dataCount).toEqual(4);

        $scope.names.pop();
        $scope.$digest();

        //now there's been a change
        expect($scope.dataCount).toEqual(3);
     * ```
     *
     *
     * @param {string|function(scope)} obj Evaluated as {@link guide/expression expression}. The
     *    expression value should evaluate to an object or an array which is observed on each
     *    {@link ng.$rootScope.Scope#$digest $digest} cycle. Any shallow change within the
     *    collection will trigger a call to the `listener`.
     *
     * @param {function(newCollection, oldCollection, scope)} listener a callback function called
     *    when a change is detected.
     *    - The `newCollection` object is the newly modified data obtained from the `obj` expression
     *    - The `oldCollection` object is a copy of the former collection data.
     *      Due to performance considerations, the`oldCollection` value is computed only if the
     *      `listener` function declares two or more arguments.
     *    - The `scope` argument refers to the current scope.
     *
     * @returns {function()} Returns a de-registration function for this listener. When the
     *    de-registration function is executed, the internal watch operation is terminated.
     */
    var $watchCollection = function(obj, listener) {
      var self = this;
      // the current value, updated on each dirty-check run
      var newValue;
      // a shallow copy of the newValue from the last dirty-check run,
      // updated to match newValue during dirty-check run
      var oldValue;
      // a shallow copy of the newValue from when the last change happened
      var veryOldValue;
      // only track veryOldValue if the listener is asking for it
      var trackVeryOldValue = (listener.length > 1);
      var changeDetected = 0;
      var objGetter = $parse(obj);
      var internalArray = [];
      var internalObject = {};
      var initRun = true;
      var oldLength = 0;

      function $watchCollectionWatch() {
        newValue = objGetter(self);
        var newLength, key, bothNaN;

        if (!isObject(newValue)) { // if primitive
          if (oldValue !== newValue) {
            oldValue = newValue;
            changeDetected++;
          }
        } else if (isArrayLike(newValue)) {
          if (oldValue !== internalArray) {
            // we are transitioning from something which was not an array into array.
            oldValue = internalArray;
            oldLength = oldValue.length = 0;
            changeDetected++;
          }

          newLength = newValue.length;

          if (oldLength !== newLength) {
            // if lengths do not match we need to trigger change notification
            changeDetected++;
            oldValue.length = oldLength = newLength;
          }
          // copy the items to oldValue and look for changes.
          for (var i = 0; i < newLength; i++) {
            bothNaN = (oldValue[i] !== oldValue[i]) &&
                (newValue[i] !== newValue[i]);
            if (!bothNaN && (oldValue[i] !== newValue[i])) {
              changeDetected++;
              oldValue[i] = newValue[i];
            }
          }
        } else {
          if (oldValue !== internalObject) {
            // we are transitioning from something which was not an object into object.
            oldValue = internalObject = {};
            oldLength = 0;
            changeDetected++;
          }
          // copy the items to oldValue and look for changes.
          newLength = 0;
          for (key in newValue) {
            if (newValue.hasOwnProperty(key)) {
              newLength++;
              if (oldValue.hasOwnProperty(key)) {
                bothNaN = (oldValue[key] !== oldValue[key]) &&
                    (newValue[key] !== newValue[key]);
                if (!bothNaN && (oldValue[key] !== newValue[key])) {
                  changeDetected++;
                  oldValue[key] = newValue[key];
                }
              } else {
                oldLength++;
                oldValue[key] = newValue[key];
                changeDetected++;
              }
            }
          }
          if (oldLength > newLength) {
            // we used to have more keys, need to find them and destroy them.
            changeDetected++;
            for(key in oldValue) {
              if (oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key)) {
                oldLength--;
                delete oldValue[key];
              }
            }
          }
        }
        return changeDetected;
      }

      function $watchCollectionAction() {
        if (initRun) {
          initRun = false;
          listener(newValue, newValue, self);
        } else {
          listener(newValue, veryOldValue, self);
        }

        // make a copy for the next time a collection is changed
        if (trackVeryOldValue) {
          if (!isObject(newValue)) {
            //primitive
            veryOldValue = newValue;
          } else if (isArrayLike(newValue)) {
            veryOldValue = new Array(newValue.length);
            for (var i = 0; i < newValue.length; i++) {
              veryOldValue[i] = newValue[i];
            }
          } else { // if object
            veryOldValue = {};
            for (var key in newValue) {
              if (hasOwnProperty.call(newValue, key)) {
                veryOldValue[key] = newValue[key];
              }
            }
          }
        }
      }

      return this.$watch($watchCollectionWatch, $watchCollectionAction);
    };

    return $watchCollection;
  }
})(window, window.angular);
