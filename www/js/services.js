let apiAddr = 'https://webandmobilefme.000webhostapp.com/api.php?';
let options = {
  method: 'POST',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'omit',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

angular.module('starter.services', [])

  //FACTORY FOR CREATING MODALS
  /*
    This is used to reduce repetitious code in the controllers.
    Also to have a centralized place where modals can be set up and managed
  */
  .factory('ModalFactory', function ($ionicModal, $rootScope) {

    return {
      Initialize: function (templateFromUrl, $scope) {
        let promise;
        $scope = $scope || $rootScope.$new();

        promise = $ionicModal.fromTemplateUrl(templateFromUrl, {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.modal = modal;
          return modal;
        });

        $scope.openModal = function () {
          $scope.modal.show();
        };

        $scope.closeModal = function () {
          switch (templateFromUrl) {
            case 'templates/modal-login.html':
              ionic.Platform.exitApp();
              break;
          }
          $scope.modal.hide();
        };

        $scope.$on('$destroy', function () {
          $scope.modal.remove();
        });

        return promise;
      }
    };
  })

  //FACTORY FOR USER & RELATED DATA
  .factory('UserFactory', function () {
    let currentUser = null;
    let errorMsg = '';

    return {
      InitializeUser: async function (id, name) {
        options.body = JSON.stringify({
          operation: 'getUser',
          id: id,
          name: name
        });

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then((responseData) => {
            if (responseData.status >= 200 && responseData.status <= 299) {
              currentUser = responseData.data[0];
              return currentUser;
            } else {
              errorMsg = responseData.data;
            }
          }).catch(() => {
            errorMsg = 'Could not connect due to unknown error';
          });
      },
      getUser: function () {
        return currentUser;
      },
      addUser: async function (name) {
        options.body = JSON.stringify({
          operation: 'addUser',
          name: name
        });

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (responseData.status >= 200 && responseData.status <= 299) {
              currentUser = responseData.data[0];
              return currentUser;
            } else {
              errorMsg = responseData.data;
            }
          });
      },
      getError: function () {
        return errorMsg;
      }
    };
  })

  //FACTORY FOR CATEGORIES & RELATED DATA
  .factory('CategoryFactory', function () {
    let categoryList = [];
    let errorMsg = '';

    return {
      initializeData: async function (id) {
        options.body = JSON.stringify({
          operation: 'getCategories',
          userid: id
        });

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (responseData.status >= 200 || responseData.status <= 299) {
              categoryList = responseData.data;
            } else {
              alert('Bad status: ' + responseData.data);
            }
          })
          .catch((err) => alert(err));
      },
      getAll: function () {
        return categoryList;
      },
      get: function (id) {
        for (const category of categoryList) {
          if (category.Id === id) {
            return category;
          }
        }
      },
      getAllChildren: function (parentId) {
        let retVal = [];
        for (const category of categoryList) {
          if (category.ParentCategoryId === parentId) {
            retVal.push(category);
          }
        }
        return retVal;
      },
      addCategory: async function (newCategory) {
        let finalBody = {
          operation: 'addCategory',
          name: newCategory.name,
          userid: newCategory.userid
        };

        if (newCategory.parentId) {
          finalBody.parentid = newCategory.parentId;
        }

        options.body = JSON.stringify(finalBody);

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (!(responseData.status >= 200 || responseData.status <= 299)) {
              errorMsg = responseData.data;
            }
          })
          .catch((err) => alert(err));
      }
    };
  })

  //FACTORY FOR TASsKS & RELATED DATA
  .factory('TaskFactory', function () {
    let taskList = [];

    return {
      initializeData: async function (id) {
        options.body = JSON.stringify({
          operation: 'getTasks',
          userid: id
        });

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (responseData.status >= 200 || responseData.status <= 299) {
              taskList = responseData.data;
            } else {
              alert('Bad status: ' + responseData.data);
            }
          })
          .catch((err) => alert(err));
      },
      getAll: function () {
        return taskList;
      },
      get: function (id) {
        for (const task of taskList) {
          if (task.Id === id) {
            return task;
          }
        }
      },
      getAllUnderCat: function (id) {
        let retval = [];
        for (const task of taskList) {
          if (task.CategoryId === id) {
            retval.push(task);
          }
        }
        return retval;
      },
      updateTask: async function (updatedValues) {
        /*
          The API expects dates in a yyyy-mm-dd formatted string, not JS date objects
          UpdatedValues is a reference to newValues in the controller with its values bound to the inputs on the modal
          So a copy created with converted dates, changing them on updatedValues creates errors since ng-model requires a
          date object on HTML date inputs
        */
        //enddate is optional, therefor a check is required before doing date conversion
        let end = updatedValues.enddate;

        if (end) {
          end = updatedValues.enddate.getFullYear() +
            '-' + String(updatedValues.enddate.getMonth() + 1).padStart(2, '0') +
            '-' + String(updatedValues.enddate.getDate()).padStart(2, '0');
        }

        let finalValues = {
          name: updatedValues.name,
          startdate: updatedValues.startdate.getFullYear() +
            '-' + String(updatedValues.startdate.getMonth() + 1).padStart(2, '0') +
            '-' + String(updatedValues.startdate.getDate()).padStart(2, '0'),
          enddate: end,
          description: updatedValues.description,
          id: updatedValues.id,
          operation: 'updateTask'
        };

        options.body = JSON.stringify(finalValues);

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            return responseData.data;
          });
      },
      getMostRecent: function () {
        let retval = [];
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const task of taskList) {
          let startdate = new Date(task.StartDate);
          startdate.setHours(0, 0, 0, 0);
          if (task.Status === 'Busy' && today > startdate) {
            retval.push(task);
          }
        }

        return retval;
      },
      addTask: async function (newTask) {
        let errorMsg = '';

        let finalBody = {
          operation: 'addTask',
          name: newTask.name,
          startdate: newTask.startdate.getFullYear() +
            '-' + String(newTask.startdate.getMonth() + 1).padStart(2, '0') +
            '-' + String(newTask.startdate.getDate()).padStart(2, '0'),
          enddate: null,
          description: null,
          method: newTask.method,
          catid: newTask.catid,
        };

        if (newTask.enddate) {
          finalBody.enddate = newTask.enddate.getFullYear() +
            '-' + String(newTask.enddate.getMonth() + 1).padStart(2, '0') +
            '-' + String(newTask.enddate.getDate()).padStart(2, '0');
        }
        if (newTask.description !== '' || !newTask.description) {
          finalBody.description = newTask.description;
        }

        options.body = JSON.stringify(finalBody);

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (!(responseData.status >= 200 || responseData.status <= 299)) {
              errorMsg = responseData.data;
            }
          })
          .catch((err) => alert(err));
      }
    };
  })

  //FACTORY FOR ASSESSMENTS & RELATED DATA
  .factory('AssessmentFactory', function () {
    let assessmentList = [];

    return {
      initializeData: async function (id) {
        options.body = JSON.stringify({
          operation: 'getAssessments',
          userid: id
        });

        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            if (responseData.status >= 200 && responseData.status <= 299) {
              assessmentList = responseData.data;
            } else {
              alert('Bad status: ' + responseData.data);
            }
          })
          .catch((err) => alert(err));
      },
      getAll: function () {
        return assessmentList;
      },
      get: function (id) {
        for (const assessment of assessmentList) {
          if (assessment.Id === id) {
            return assessment;
          }
        }
      },
      getLatestByTask: function (id) {
        //The assessment list is sorted in the API
        for (const assessment of assessmentList) {
          if (assessment.TaskId === id) {
            return assessment;
          }
        }
      },
      getAllUnderTask: function (id) {
        let retval = [];
        for (const assessment of assessmentList) {
          if (assessment.TaskId === id) {
            retval.push(assessment);
          }
        }
        return retval;
      },
      updateAssessmentScore: async function (assessment) {
        let finalValues = {
          id: assessment.Id,
          score: assessment.Score,
          operation: 'updateAssessment'
        };

        options.body = JSON.stringify(finalValues);
        return fetch(apiAddr, options)
          .then((response) => response.json())
          .then(function (responseData) {
            return responseData.data;
          });
      },
      getScoreOptions: function (method) {
        //A switch for 2 possible values may seem out of place, but will be helpfull when more score options are added in the future
        switch (method) {
          case 'Numeric':
            return [{
              'value': 0,
              'score': 0
            }, {
              'value': 1,
              'score': 1
            }, {
              'value': 2,
              'score': 2
            }, {
              'value': 3,
              'score': 3
            }, {
              'value': 4,
              'score': 4
            }, {
              'value': 5,
              'score': 5
            }, {
              'value': 6,
              'score': 6
            }, {
              'value': 7,
              'score': 7
            }, {
              'value': 8,
              'score': 8
            }, {
              'value': 9,
              'score': 9
            }, {
              'value': 10,
              'score': 10
            }];
          case 'Descriptive':
            return [{
              'value': 'Skipped',
              'score': 0
            }, {
              'value': 'Extremely bad',
              'score': 1
            }, {
              'value': 'Very bad',
              'score': 2
            }, {
              'value': 'Bad',
              'score': 3
            }, {
              'value': 'Could be better',
              'score': 4
            }, {
              'value': 'Could be worse',
              'score': 5
            }, {
              'value': 'Alright',
              'score': 6
            }, {
              'value': 'Good',
              'score': 7
            }, {
              'value': 'Very good',
              'score': 8
            }, {
              'value': 'Extremely good',
              'score': 9
            }, {
              'value': 'Perfect',
              'score': 10
            }];
        }
      }
    };
  });
