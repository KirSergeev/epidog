'use strict';

/* Services */

// Define your services here if necessary
var appServices = angular.module('app.services', ['ngStorage']);

/**
 * Override default angular exception handler to log and alert info if debug mode
 */
appServices.factory('$exceptionHandler', function ($log) {
    return function (exception, cause) {
        var errors = JSON.parse(localStorage.getItem('sing-angular-errors')) || {};
        errors[new Date().getTime()] = arguments;
        localStorage.setItem('sing-angular-errors', JSON.stringify(errors));
        app.debug && $log.error.apply($log, arguments);
        app.debug && alert('check errors');
    };
});

/**
 * Sing Script loader. Loads script tags asynchronously and in order defined in a page
 */
appServices.factory('scriptLoader', ['$q', '$timeout', function($q, $timeout) {

    /**
     * Naming it processedScripts because there is no guarantee any of those have been actually loaded/executed
     * @type {Array}
     */
    var processedScripts = [];
    return {
        /**
         * Parses 'data' in order to find & execute script tags asynchronously as defined.
         * Called for partial views.
         * @param data
         * @returns {*} promise that will be resolved when all scripts are loaded
         */
        loadScriptTagsFromData: function(data) {
            var deferred = $q.defer();
            var $contents = $($.parseHTML(data, document, true)),
                $scripts = $contents.filter('script[data-src][type="text/javascript-lazy"]').add($contents.find('script[data-src][type="text/javascript-lazy"]')),
                scriptLoader = this;

            scriptLoader.loadScripts($scripts.map(function(){ return $(this).attr('data-src')}).get())
                .then(function(){
                    deferred.resolve(data);
                });

            return deferred.promise;
        },


        /**
         * Sequentially and asynchronously loads scripts (without blocking) if not already loaded
         * @param scripts an array of url to create script tags from
         * @returns {*} promise that will be resolved when all scripts are loaded
         */
        loadScripts: function(scripts) {
            var previousDefer = $q.defer();
            previousDefer.resolve();
            scripts.forEach(function(script){
                if (processedScripts[script]){
                    if (processedScripts[script].processing){
                        previousDefer = processedScripts[script];
                    }
                    return
                }

                var scriptTag = document.createElement('script'),
                    $scriptTag = $(scriptTag),
                    defer = $q.defer();
                scriptTag.src = script;
                defer.processing = true;

                $scriptTag.load(function(){
                    $timeout(function(){
                        defer.resolve();
                        defer.processing = false;
                        Pace.restart();
                    })
                });

                previousDefer.promise.then(function(){
                    document.body.appendChild(scriptTag);
                });

                processedScripts[script] = previousDefer = defer;
            });

            return previousDefer.promise;
        }
    }
}]);

// Use $localStorage or $sessionStorage up to you
appServices.factory('auth', ['$log', '$localStorage', '$http', function($log, $storage, $http){

    $storage.$default({
        profile: null
    });

    return {
        check: check,
        login: login,
        logout: logout,
        getProfile: getProfile
    };

    // Get user info
    function getProfile(){
        return $storage.profile || null;
    }

    // Check is user authorize
    function check(){
        return $storage.profile !== null;
    }

    // Logout user
    function logout(){
        $storage.$reset({
            profile: null
        });
    }

    // Login user
    function login(credentials){

        return $http
            .post('http://epidog.net/server/?authenticate', credentials )
            .success(function (data) {
                $storage.profile = data;
            });

    }

}]);


// Use $localStorage or $sessionStorage up to you
appServices.factory('auth', ['$log', '$localStorage', '$http', function($log, $storage, $http) {

    $storage.$default({
        profile: null
    });

    return {
        check: check,
        login: login,
        logout: logout,
        getProfile: getProfile
    };

    // Get user info
    function getProfile(){
        return $storage.profile || null;
    }

    // Check is user authorize
    function check(){
        return $storage.profile !== null;
    }

    // Logout user
    function logout(){
        $storage.$reset({
            profile: null
        });
    }

    // Login user
    function login(credentials){

        return $http
            .post('http://epidog.net/server/?authenticate', credentials )
            .success(function (data) {
                $storage.profile = data;
            });

    }

}]);


appServices.factory("Data", ['$http', '$location',
    function ($http, $q, $location) {

        var serviceBase = 'http://epidog.net/api/v1/';

        var obj = {};

        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        return obj;
}]);

