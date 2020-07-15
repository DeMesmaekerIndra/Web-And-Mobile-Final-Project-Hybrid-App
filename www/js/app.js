angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters'])
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.StatusBar) {
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');

    $stateProvider
      // Set an abstract state for the navigation bar
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Define every tab/view
      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeController'
          }
        }
      })
      .state('tab.home-taskDescription', {
        url: '/home/{taskId}',
        views: {
          'tab-home': {
            templateUrl: 'templates/taskDescription.html',
            controller: 'TaskDescriptionController'
          }
        }
      })
      .state('tab.tasks-categories-startCategories', {
        url: '/tasks/startCategories',
        views: {
          'tab-tasks': {
            templateUrl: 'templates/task-startCategories.html',
            controller: 'CategoryController'
          }
        }
      })
      .state('tab.tasks-subCategories', {
        url: '/tasks/{catId}',
        views: {
          'tab-tasks': {
            templateUrl: 'templates/task-subCategories.html',
            controller: 'SubCategoryController'
          }
        }
      })
      .state('tab.tasks-taskDescription', {
        url: '/tasks/task/{taskId}',
        views: {
          'tab-tasks': {
            templateUrl: 'templates/taskDescription.html',
            controller: 'TaskDescriptionController'
          }
        }
      })
      .state('tab.assessments', {
        url: '/assessments',
        views: {
          'tab-assessments': {
            templateUrl: 'templates/tab-assessments.html',
            controller: 'AssessmentsController'
          }
        }
      })
      .state('tab.statistics', {
        url: '/statistics',
        views: {
          'tab-statistics': {
            templateUrl: 'templates/tab-statistics.html',
            controller: 'StatisticsController'
          }
        }
      });

    // set a default view if none was set
    $urlRouterProvider.otherwise('/tab/home');
  });
