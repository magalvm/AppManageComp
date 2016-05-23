// Для работы данного примера необходимо устаноивть http://deployd.com/


angular.module("exampleApp", [])
.directive('collection', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            collection: '='
        },
        template: "<ul><member ng-repeat='member in collection' member='member'></member></ul>"
    };
})

.directive('member', function ($compile) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            member: '='
        },
        template: "<li>{{member.name}} <span> {{member.price|currency}}<span></li>",
        link: function (scope, element, attrs) {
            if (angular.isArray(scope.member.children)) {
                element.append("<collection collection='member.children'></collection>");
                $compile(element.contents())(scope);
            }
             

        }
    };
})
.constant("baseUrl", "http://localhost:2403/items/")
.controller("treviewCtrl",function($scope, $http,baseUrl){
    $scope.refresh1 = function () {
        // HTTP GET
        // получение всех данных через GET запрос по адрес хранящемуся в baseUrl
        $http.get(baseUrl).success(function (data) {
            $scope.items = data;
            $scope.roleList = getNestedChildren($scope.items, "0");
            
        });
        $scope.currentView = "table";
    }
    function getNestedChildren(arr, parent) {
        var total=0;
        // console.log(arr);
        var out = [];
        for (var i in arr) {
          
            if (arr[i].parentId === parent) {
                var children = getNestedChildren(arr, arr[i].id)

                if (children.length) {
                    arr[i].children = children;
                }
                out.push(arr[i]);
            }
        }


        //  console.log(out);
        return out;
        function getSumm(i) {
            var total=0;
            return i;
        }
    }
    $scope.refresh1();
})
.controller("defaultCtrl", function ($scope, $http, baseUrl) {

    // текущее педставление
    $scope.currentView = "table";

    // получение всех данных из модели
    $scope.refresh = function () {
        // HTTP GET
        // получение всех данных через GET запрос по адрес хранящемуся в baseUrl
      
        $http.get(baseUrl).success(function (data) {
            $scope.items = data;
           
           // $scope.refresh1();
        });
    }

  //  $scope.nested_array_stingified = JSON.stringify($scope.roleList);
    // создание нового элемента
    $scope.create_new = function (item) {
        // HTTP POST
        // Отправка POST запроса для создания новой записи на сервере
        console.log(item);
        if (!item.id) {
            item.parentId = "0";
        }
        
        $http.post(baseUrl, item).success(function (item) {
            $scope.items.push(item);
            $scope.currentView = "table";
        });
    }

    $scope.create_sub = function (item) {
        // HTTP POST
        // Отправка POST запроса для создания новой записи на сервере
        console.log(item);
        

        $http.post(baseUrl, item).success(function (item) {
            $scope.items.push(item);
            $scope.currentView = "table";
        });
    }

    // обновление элемента
    $scope.update = function (item) {
        // HTTP PUT
        // Отправка PUT запроса для обновления определенной записи на сервере
        $http({
            url: baseUrl + item.id,
            method: "PUT",
            data: item
        }).success(function (modifiedItem) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].id == modifiedItem.id) {
                    $scope.items[i] = modifiedItem;
                    break;
                }
            }
            $scope.currentView = "table";
        });
    }
    $scope.selected = function () {
        var arr = [];
        arr = $scope.items;
        return arr[0];
    }
    // удаление элемента из модели
    $scope.delete = function (item) {
        // HTTP DELETE
        // отправка DELETE запроса по адресу http://localhost:2403/items/id что приводит к удалению записей на сервере
        $http({
            method: "DELETE",
            url: baseUrl + item.id
        }).success(function () {
            $scope.items.splice($scope.items.indexOf(item), 1);
        });
    }

    // редеактирование существующего или создание нового элемента
    $scope.create = function (item) {
        $scope.currentItem = item ? angular.copy(item) : {};
        $scope.currentView = "new";
    }
    $scope.edit = function (item) {
        $scope.currentItem = item ? angular.copy(item) : {};
        $scope.currentView = "edit";
    }

    $scope.getid = function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    }
    // сохранение изменений
    $scope.saveEdit = function (item) {
        // Если у элемента есть свойство id выполняем редактирование
        // В данной реализации новые элементы не получают свойство id поэтому редактировать их невозможно (будет исправленно в слудующих примерах)
        var a=$scope.items;
        if (angular.isDefined(item.id)) {
            console.log("" + item);
            for(i in a)
                if (item.id === a[i].id) {
                    item.parentId = item.id;
                    item.id = $scope.guid();
                    console.log(item);
                    $scope.create_sub(item);
                }else $scope.update(item);
        } else {
            $scope.create_new(item);
        }
    }

    // отмена изменений и возврат в представление table
    $scope.cancelEdit = function () {
      
        $scope.currentItem = {};
        $scope.currentView = "table";
    }

    $scope.refresh();
    $scope.repeatSelect = true;

    $scope.getsumm = function (item) {
        if ($scope.mainSumm(item) === item.price) {
            return "";
        } else return "$"+$scope.mainSumm(item);
    }
    
    $scope.mainSumm = function (item) {
       var total=item.price;
       var a=$scope.items;
         
           for (var i in a) {
               if (item.id === a[i].parentId) {
                   total += $scope.mainSumm(a[i]);
               }
           }
          
           return total;
    }
   
   // $scope.roleList = getNestedChildren($scope.items, "0");
});