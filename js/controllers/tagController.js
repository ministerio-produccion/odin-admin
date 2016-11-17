var app = angular.module('odin.tagControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function TagListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Tag", "tags", $scope);
    
    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '',
        orderBy: 'createdAt',
        sort: 'DESC'
    };
    
    $scope.filtersView = [{
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true
        }];

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function(model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }
    
    $scope.config_key = 'adminPagination';
    ////factory configs
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }
        
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    });

    $scope.paging = function(event, page, pageSize, total) {
        usSpinnerService.spin('spinner');
        $scope.parameters.skip = (page - 1) * $scope.parameters.limit;
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
        if(!!$scope.parameters.conditions) {
            $scope.q += $scope.parameters.conditions;
        }
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    };
    
    $scope.findSort = function(type, cond) {
        usSpinnerService.spin('spinner');
        $scope.sortType = type; 
        
        var sort = 'DESC';
        if(cond) {
            sort = 'ASC';
        }
        $scope.sortReverse = cond;
        
        $scope.parameters.orderBy = type;
        $scope.parameters.sort = sort;
        
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    };
}

function TagViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("Tag", "tags", $scope);

    modelService.findOne($routeParams, $scope);


    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }
}

function TagCreateController($scope, rest, model, Flash, $location, modelService, Alertify, usSpinnerService) {
    modelService.initService("Tag", "tags", $scope);

    $scope.model = new model();
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');

                //if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('La etiqueta que quiere guardar ya existe.');
                //} else {
                //    Alertify.alert('Hubo un error al crear la etiqueta.');
                //}
            });
        }
    };
}

function TagEditController($scope, Flash, rest, $routeParams, model, $location, modelService, Alertify, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Tag", "tags", $scope);

    $scope.model = new model();
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');

                //if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('La etiqueta que quiere guardar ya existe.');
                //} else {
                //    Alertify.alert('Hubo un error al editar la etiqueta.');
                //}
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function() {
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();
}