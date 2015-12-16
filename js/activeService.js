angular.module( 'services.active', [
    'services.user'
] )

.factory( 'activeService', function( $http, userService, $ionicLoading ){

    var can_be_load_more= true;
    var get_can_be_load_more = function(){
        return can_be_load_more;
    }
    var set_can_be_load_more = function( cb ){
        can_be_load_more = cb;
    }

    var selected;
    var get_selected = function(){
        return selected;
    }
    var set_selected = function( se ){
        selected = se;
    }

    var audits = [];
    var get_audits = function(){
        return audits;
    }

    var init = function(){
        audits = [];
        can_be_load_more = true;
    }
    
    var remove_selected = function(){
        var index = audits.indexOf(selected);
        if( index == -1 ){
            return true;
        }
        audits.splice( index, 1 );
    }

    var cancel = function( success, error ){
        var audit = selected;

        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
            token : '!@#H3W!@#H3W!@#H3W',
            query_type: 'cancel',
            id: audit.id,
        };
        
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><br><span class="nowrap">Canceling</span>',
        });
        
        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Audit',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){
            $ionicLoading.hide();
            if(res.message){
                success(res);
                return;
            }
            error(res);
        }).error(function(err){
            $ionicLoading.hide();
            error(err);
        });
    }

    var load = function( success, error ){

        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
        };

        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Active',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}

        }).success(function(res){
            audits = res;
            can_be_load_more = false;
            success( res );
        }).error(function(err){
            error( err );
        });

    };

    return {
        "load": load,
        "get_can_be_load_more": get_can_be_load_more,
        "set_can_be_load_more": set_can_be_load_more,
        "get_audits": get_audits,
        "get_selected" : get_selected,
        "set_selected" : set_selected,
        "init": init,
        "cancel": cancel,
        "remove_selected": remove_selected,
    }

} );