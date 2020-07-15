angular.module('starter.filters', [])
  .filter('assessmentFilter', function () {
    function match(item, val, filters) {
      let regex = new RegExp(val, 'i');
      let retval = true;
      let checkboxFilterFlag = false;

      if (filters.taskname) {
        retval = item.parentTaskName.search(regex) === 0;
      }

      if (filters.missed) {
        checkboxFilterFlag |= item.Status === 'Missed';
      }

      if (filters.done) {
        checkboxFilterFlag |= item.Status === 'Done';
      }

      return retval && checkboxFilterFlag;
    }

    return function (assessmentList, filters) {
      let filtered = [];

      if (!filters.taskname && filters.missed && filters.done) {
        return assessmentList;
      }

      angular.forEach(assessmentList, function (assessment) {
        let matched = true;
        filters.taskname.split(' ').forEach((token) => {
          matched &= match(assessment, token, filters);
        });
        if (matched) {
          filtered.push(assessment);
        }
      });

      return filtered;
    };
  });
