angular.module('starter.controllers', [])

  //HOME CONTROLLERS
  .controller('HomeController', function (UserFactory, TaskFactory, AssessmentFactory, ModalFactory, $scope, $state, $ionicLoading, $ionicPlatform, $ionicPopup) {
    let isLoggedIn = false;
    $scope.error = '';

    /*  General functions   */
    function showData() {
      $scope.taskList = TaskFactory.getMostRecent();

      for (let i = 0; i < $scope.taskList.length; i++) {
        let assessment = AssessmentFactory.getLatestByTask($scope.taskList[i].Id);

        if (assessment !== undefined) {
          $scope.taskList[i].assessment = assessment;
        }

        $scope.taskList[i].scoreList = AssessmentFactory.getScoreOptions($scope.taskList[i].Method);
        $scope.taskList[i].selectedScore = {
          'score': $scope.taskList[i].assessment.Score,
        };
      }

      $scope.$apply();
    }

    /*  Main view functions   */
    $scope.$on('$ionicView.enter', () => {
      if (!isLoggedIn) {
        $scope.loginModal();
      } else {
        showData();
      }
    });

    $scope.doRefresh = async () => {
      await TaskFactory.initializeData(UserFactory.getUser().Id);
      await AssessmentFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.updateAssessmentScore = async (task) => {
      $ionicLoading.show();
      task.assessment.Score = task.selectedScore.score;
      await AssessmentFactory.updateAssessmentScore(task.assessment);
      await AssessmentFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $ionicLoading.hide();
    };

    /*  Modal setup  */
    $scope.loginModal = () => {
      //hide previous modal if there was one
      if ($scope.modal) {
        $scope.modal.hide();
      }

      $scope.error = '';
      $scope.loginValues = {
        Id: null, //ng-model default if number input is empty
        Name: '' //ng-model default if text input is empty
      };

      ModalFactory
        .Initialize('templates/modal-login.html', $scope)
        .then((modal) => modal.show());
    };

    $scope.newUserModal = () => {
      //hide previous modal
      $scope.modal.hide();
      $scope.error = '';

      $scope.newUser = {
        Id: null,
        Ttl: 10,
        Name: ''
      };

      //initialize new one
      ModalFactory
        .Initialize('templates/modal-login-newUser.html', $scope)
        .then((modal) => modal.show());
    };

    /*  Modal functions   */
    $scope.login = async function () {
      let user = await UserFactory.InitializeUser($scope.loginValues.Id, $scope.loginValues.Name);

      if (!user) {
        $scope.error = UserFactory.getError();
        $scope.$apply();
      } else {
        $ionicLoading.show();
        await TaskFactory.initializeData(user.Id);
        await AssessmentFactory.initializeData(user.Id);
        isLoggedIn = true;
        showData();
        $ionicLoading.hide();
        $scope.modal.hide();
      }
    };

    $scope.CreateAndLogin = async function () {
      let user = await UserFactory.addUser($scope.newUser.Name);

      if (!user) {
        $scope.error = UserFactory.getError();
        $scope.$apply();
      } else {
        $scope.newUser.Id = user.Id;
        $scope.$apply();
        let ttlBeforeLogin = setInterval(() => {
          if ($scope.newUser.Ttl-- === 1) {
            $scope.modal.hide();
            clearInterval(ttlBeforeLogin);
          }
          $scope.$apply();

        }, 1000);
        isLoggedIn = true;
        showData();
      }
    };

    //Custom hardware backbutton implementation
    $ionicPlatform.registerBackButtonAction(() => {
      if ($state.current.name === 'tab.home') {
        $ionicPopup.confirm({
          title: 'System warning',
          template: 'Exit app?'
        }).then(function (res) {
          if (res) {
            ionic.Platform.exitApp();
          }
        });
      } else {
        navigator.app.backHistory();
      }

    }, 1000);
  })

  //CATEGORY CONTROLLER
  .controller('CategoryController', function (CategoryFactory, ModalFactory, UserFactory, $scope, $ionicLoading) {
    /*  General functions   */
    function showData() {
      $scope.categoryList = CategoryFactory.getAll();
      $scope.$apply();
    }

    /*  Main view functions   */
    $scope.$on('$ionicView.enter', async function () {
      /*  Initial startup   */
      $ionicLoading.show();

      //If the category list has never been loaded, load it.
      if (CategoryFactory.getAll().length === 0) {
        await CategoryFactory.initializeData(UserFactory.getUser().Id);
      }

      showData();
      $ionicLoading.hide();
    });

    $scope.doRefresh = async () => {
      await CategoryFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.$broadcast('scroll.refreshComplete');
    };

    /*  Modal setup  */
    $scope.NewCategoryModal = () => {
      $scope.newCategory = {
        name: '',
        parentId: null,
        userid: UserFactory.getUser().Id
      };

      ModalFactory.Initialize('templates/modal-categoryAdd.html', $scope)
        .then((modal) => modal.show());
    };

    /*  Modal functions  */
    $scope.CreateCategory = async () => {
      $ionicLoading.show();
      await CategoryFactory.addCategory($scope.newCategory);
      await CategoryFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.modal.hide();
      $ionicLoading.hide();
    };
  })
  .controller('SubCategoryController', function (CategoryFactory, TaskFactory, UserFactory, ModalFactory, $scope, $stateParams, $ionicPopover, $ionicLoading) {
    if ($stateParams.catId === undefined || $stateParams.catId === null) {
      return;
    }

    $scope.parentCategory = CategoryFactory.get(parseInt($stateParams.catId));

    /*  General functions   */
    function showData() {
      let parentId = parseInt($stateParams.catId);

      $scope.parentCategory = CategoryFactory.get(parseInt(parentId));
      $scope.categoryList = CategoryFactory.getAllChildren(parentId);
      $scope.taskList = TaskFactory.getAllUnderCat(parentId);

      $scope.$apply();
    }

    /*  Main view functions   */
    $scope.doRefresh = async () => {
      await TaskFactory.initializeData(UserFactory.getUser().Id);
      await CategoryFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.$on('$ionicView.enter', async function () {
      $ionicLoading.show();
      //If the task list has never been loaded, load it.
      if (TaskFactory.getAll().length === 0) {
        await TaskFactory.initializeData(UserFactory.getUser().Id);
      }
      showData();
      $ionicLoading.hide();
    });

    /*  Popover setup  */
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });

    /*  Modal setup  */
    $scope.NewTaskModal = () => {
      $scope.newTask = {
        name: '',
        startdate: new Date(),
        method: 'Numeric',
        catid: $scope.parentCategory.Id,
        description: null,
        enddate: null
      };

      $scope.popover.hide()
        .then(() =>
          ModalFactory.Initialize('templates/modal-taskAdd.html', $scope)
          .then((modal) => modal.show()));
    };

    $scope.NewCategoryModal = () => {
      $scope.newCategory = {
        name: '',
        parentId: $scope.parentCategory.Id,
        userid: UserFactory.getUser().Id
      };

      $scope.popover.hide()
        .then(() =>
          ModalFactory.Initialize('templates/modal-categoryAdd.html', $scope)
          .then((modal) => modal.show()));
    };

    /*  Modal fnctions  */
    $scope.CreateCategory = async () => {
      $ionicLoading.show();
      await CategoryFactory.addCategory($scope.newCategory);
      await CategoryFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.modal.hide();
      $ionicLoading.hide();
    };

    $scope.CreateTask = async () => {
      $ionicLoading.show();
      await TaskFactory.addTask($scope.newTask);
      await TaskFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.modal.hide();
      $ionicLoading.hide();
    };
  })

  //TASK CONTROLLERS
  .controller('TaskDescriptionController', function (TaskFactory, UserFactory, ModalFactory, $scope, $stateParams, $ionicLoading) {
    if ($stateParams.taskId === undefined || $stateParams.taskId === null) {
      return;
    }

    /*  General functions   */
    function showData() {
      let taskId = parseInt($stateParams.taskId);
      $scope.task = TaskFactory.get(taskId);

      //Fill the copied object
      //ng-model requires date objects for date input instead of a formatted string
      $scope.newValues = {
        name: $scope.task.Name,
        startdate: new Date($scope.task.StartDate),
        enddate: ($scope.task.EndDate === null) ? null : new Date($scope.task.EndDate),
        description: $scope.task.Description
      };

      //These are also changed so we can used the .getTime() function in ng-class to notice value changes
      $scope.task.StartDate = new Date($scope.task.StartDate);
      $scope.task.EndDate = ($scope.task.EndDate === null) ? null : new Date($scope.task.EndDate);

      $scope.$apply();
    }

    /*  Main view functions   */
    $scope.$on('$ionicView.enter', () => {
      showData();
    });

    $scope.doRefresh = async () => {
      await TaskFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.$broadcast('scroll.refreshComplete');
    };

    /*  Modal setup */
    ModalFactory.Initialize('templates/modal-taskEdit.html', $scope);

    /*  Modal functions  */
    $scope.saveChanges = async () => {
      $ionicLoading.show();

      //Finalize the object so it can be updated
      $scope.newValues.id = $scope.task.Id;

      //If the description field is left empty then send a null so the default value will be assigned by the DB.
      if ($scope.newValues.description === '') {
        $scope.newValues.description = null;
      }

      await TaskFactory.updateTask($scope.newValues);
      await TaskFactory.initializeData(UserFactory.getUser().Id);
      showData();

      $ionicLoading.hide();
      $scope.modal.hide();
    };
  })

  //ASSESSMENTS CONTROLLERS
  .controller('AssessmentsController', function (AssessmentFactory, TaskFactory, UserFactory, $scope, $ionicLoading) {
    $scope.filters = {
      taskname: '',
      missed: true,
      done: true
    };

    /*  General functions   */
    function showData() {
      $scope.assessmentList = AssessmentFactory.getAll();
      for (let i = 0; i < $scope.assessmentList.length; i++) {
        $scope.assessmentList[i].scoreList = AssessmentFactory.getScoreOptions(TaskFactory.get($scope.assessmentList[i].TaskId).Method);
        $scope.assessmentList[i].parentTaskName = TaskFactory.get($scope.assessmentList[i].TaskId).Name;
        $scope.assessmentList[i].selectedScore = {
          'score': $scope.assessmentList[i].Score,
        };
      }

      $scope.$apply();
    }

    /*  Main view functions   */
    $scope.doRefresh = async () => {
      await AssessmentFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.$on('$ionicView.enter', () => {
      showData();
    });

    $scope.updateAssessmentScore = async (assessment) => {
      $ionicLoading.show();
      assessment.Score = assessment.selectedScore.score;
      await AssessmentFactory.updateAssessmentScore(assessment);
      await AssessmentFactory.initializeData(UserFactory.getUser().Id);
      showData();
      $ionicLoading.hide();
    };
  })

  //STATISTICS CONTROLLERS
  .controller('StatisticsController', function ($scope) {});
