angular.module( 'services.user', [] )

.factory( 'userService', function( $http, $ionicLoading, $state, $ionicHistory ){
    
    var user_token;
    var get_user_token = function(){
        return user_token;
    };
    var set_user_token = function(ut){
        user_token = ut;
    }
    
    var u_id;
    var get_u_id = function(){
        return u_id;
    }
    var set_u_id = function( ui ){
        u_id = ui;
    }
    
    var c_id;
    var get_c_id = function(){
        return c_id;
    }
    var set_c_id = function( ci ){
        c_id = ci;
    }
    
    var first_name;
    var get_first_name = function( ){
        return first_name;
    }
    var set_first_name = function( fn ){
        first_name = fn;
    }
    
    var last_name;
    var get_last_name = function(){
        return last_name;
    }
    var set_last_name = function( ln ){
        last_name = ln;
    }
    

    var login = function( username, password, device, token, success, failed ){
        var param = {
            action : 'login',
            device_id : device,
            email : username,
            password : password,
            token : token,
        };

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><br><span class="nowrap">Sign in</span>',
        });

        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/User',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){
            
            $ionicLoading.hide();
            
            if( res == null || res.u_id == null || res.u_id == '' ){
                failed();
                return;
            }
            
            user_token = res.user_token;
            u_id = res.u_id;
            c_id = res.c_id;
            first_name = res.first_name;
            last_name = res.last_name;
            
            success(res);

        }).error(function(error){
            $ionicLoading.hide();
            console.log(error);
            failed( error );
        });
    }
    
    var logout = function(){
        $ionicHistory.clearHistory();
        $state.go( 'login' );
    }

    return {
        'login': login,
        'logout': logout,
        'get_user_token': get_user_token,
        'set_user_token': set_user_token,
        'get_u_id': get_u_id,
        'set_u_id': set_u_id,
        'get_c_id': get_c_id,
        'set_c_id': set_c_id,
        'get_first_name': get_first_name,
        'set_first_name': set_first_name,
        'get_last_name': get_last_name,
        'set_last_name': set_last_name,
    }
} );