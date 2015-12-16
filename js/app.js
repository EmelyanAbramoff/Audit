// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','starter.controllers'],

function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    /**
    * The workhorse; converts an object to x-www-form-urlencoded serialization.
    * @param {Object} obj
    * @return {String}
    */ 
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
} )

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        navigator.splashscreen.hide();

        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

/*.config(function( $ionicConfigProvider) {
$ionicConfigProvider.navBar.alignTitle('center');
}) */

.config(function($stateProvider, $urlRouterProvider ) {

    $urlRouterProvider.otherwise('/login')

    $stateProvider.state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'appCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl',
    })

    .state('app.home', {
        url: '/home',
        views:{
            'menuContent' :{
                templateUrl: 'templates/home.html',
                controller: 'homeCtrl',
            }
        },
    })

    .state('app.avail', {
        url: '/avail/:avail_path',
        views:{
            'menuContent' :{
                templateUrl: 'templates/avail.html',
                controller: 'availCtrl',
            }
        },
    })

    .state('app.avail_audits', {
        url: '/avail/avail_audits/:avail_path',
        views:{
            'menuContent' :{
                templateUrl: 'templates/avail_audits.html',
                controller: 'availAuditCtrl',
            }
        },
    })

    .state('app.active', {
        url: '/active',
        cache: false,
        views:{
            'menuContent' :{
                templateUrl: 'templates/active.html',
                controller: 'activeCtrl',
            }
        },
    })

    .state('app.active_audit', {
        url: '/active_audit',
        views:{
            'menuContent' :{
                templateUrl: 'templates/active_audit.html',
                controller: 'active_auditCtrl',
            }
        },
    })

    .state('app.audit_section', {
        url: '/audit_section',
        views:{
            'menuContent' :{
                templateUrl: 'templates/audit_section.html',
                controller: 'audit_sectionCtrl',
            }
        },
    })

    .state('app.audit_question', {
        url: '/audit_question/:nth',
        views:{
            'menuContent' :{
                templateUrl: 'templates/audit_question.html',
                controller: 'audit_questionCtrl',
            }
        },
    })
    
    .state('app.audit_map', {
        url: '/audit_map',
        views:{
            'menuContent' :{
                templateUrl: 'templates/map.html',
                controller: 'audit_mapCtrl',
            }
        },
    })
    
    .state( 'app.contact',{
        url: '/contact',
        views:{
            'menuContent': {
                templateUrl: 'templates/contact.html',
                controller: 'contactCtrl',
            }
        }
    } )
})