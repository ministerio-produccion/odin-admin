(function() {
    var app = angular.module('authentication-service', []);


    app.factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'UserService'];

    function AuthenticationService($http, $cookieStore, $rootScope, $timeout, UserService, $scope, Alertify) {
        var service = {};

        service.Login = Login;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;
        return service;

        function Login(data, callback) {
            /* Use this for real authenticationa
             ----------------------------------------------*/
            $http.post($rootScope.url + '/users/login', {
                    username: data.username,
                    password: data.password,
                    'g-recaptcha-response': data.recaptcha
                })
                .success(function(response) {
                    callback(response);
                })
                .error(function(response) {
                    response.message = 'El usuario y/o la contraseña son inválidos.';

                    if(!angular.isUndefined(response.data.success) && !response.data.success) {
                        response.message = 'Se olvidó de seleccionar el captcha.';
                    }
                    
                    callback(response);
                    //alert();

                });

        }

        function SetCredentials(username, password, token, user, role) {
            var authdata = Base64.encode(username + ':' + password);
            $rootScope.adminglob.currentUser = {
                username: username,
                authdata: authdata,
                token: token,
                user: user,
                role: role
            };

            $http.defaults.headers.common['x-admin-authorization'] = token;
            $cookieStore.put('adminglob', $rootScope.adminglob);
        }

        function ClearCredentials() {
            $rootScope.adminglob = {};
            $cookieStore.remove('adminglob');
            //$http.defaults.headers.common.Authorization = 'Basic';
            $http.defaults.headers.common['x-admin-authorization'] = '';
        }
    }

    // Base64 encoding service used by AuthenticationService
    var Base64 = {
        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };



})();