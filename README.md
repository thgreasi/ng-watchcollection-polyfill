# Angular WatchCollection Polyfill
[![Build Status](https://travis-ci.org/thgreasi/ng-watchcollection-polyfill.svg)](https://travis-ci.org/thgreasi/ng-watchcollection-polyfill) [![Coverage Status](https://img.shields.io/coveralls/thgreasi/ng-watchcollection-polyfill.svg?branch=master)](https://coveralls.io/r/thgreasi/ng-watchcollection-polyfill?branch=master) [![npm](https://img.shields.io/npm/dm/ng-watchcollection-polyfill.svg)](https://www.npmjs.com/package/ng-watchcollection-polyfill)

A module that backports $watchCollection to pre 1.2 AngularJS.

## Requirements

- AngularJS <= 1.0.x (will not run or break later versions)

## Usage

Load the script file: ng-watchcollection-polyfill.js in your application:

```html
<script type="text/javascript" src="modules/ng-watchcollection-polyfill.js"></script>
```

Add the ng.watchcollection.polyfill module as a dependency to your application module:

```js
var myAppModule = angular.module('MyApp', ['ng.watchcollection.polyfill'])
```

Inject the ngWatchCollectionPolyfillService service to a controller of your app (preferably the outermost):

```js
myapp.controller('demoController', function ($scope, ngWatchCollectionPolyfillService) {
```

You are ready. Happy collection watching.
