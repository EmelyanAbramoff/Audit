angular.module( 'services.avail', [
    'services.user'
] )

.factory( 'availService', function( $http, userService, $ionicLoading, $cordovaGeolocation ){

    var levels;
    var get_levels = function(){
        return levels;
    }
    var set_levels = function( lvs ){
        levels = lvs;
    }

    var can_be_load_more= true;
    var get_can_be_load_more = function(){
        return can_be_load_more;
    }
    var set_can_be_load_more = function( cb ){
        can_be_load_more = cb;
    }

    var load = function( success, error ){

        //alert( 'start load' );

        var hadler_after_gps = function( position ){

            //alert( 'after gps' );

            var param;

            if( position ){
                param = {
                    user_token : userService.get_user_token(),
                    c_id : userService.get_c_id(),
                    u_id : userService.get_u_id(),
                    token : '!@#H3W!@#H3W!@#H3W',
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };    

            }else{
                param = {
                    user_token : userService.get_user_token(),
                    c_id : userService.get_c_id(),
                    u_id : userService.get_u_id(),
                    token : '!@#H3W!@#H3W!@#H3W',
                };    
            };

            $http({
                method : 'POST',
                url : 'https://issapi.com/audits/v1/Search',
                data: param,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

            }).success(function(res){
                //alert( 'end load : success' );
                can_be_load_more = false;
                if( res.levels ){
                    //alert( 'end load : success :final' );
                    levels = res.levels;
                    success(res);
                    return;
                }
                //alert( 'end load : success : fail' );
                failed( "" );
            }).error(function(error){
                //alert( 'end load : failed' );
                failed( error );
            });

        };

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(
            function (position) {
                hadler_after_gps(position);
            }, 
            function(err) {
                hadler_after_gps(null);
                // error
        });

        /*navigator.geolocation.getCurrentPosition(
        function(position){
        alert('aa');
        hadler_after_gps(position);
        }, function(){
        alert('bb');
        hadler_after_gps(null); 
        });*/
        //hadler_after_gps(null); 
    };

    var can_be_load_more = function(){
        return true;
    }

    var add_audit = function( audit, status, callback ){

        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
            token : '!@#H3W!@#H3W!@#H3W',
            auditID: audit.id,
            assignedDate: (new Date()).toISOString().slice(0, 10)
        };

        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Start',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){
            if(res.error){
                status.msg = res.error;
                callback(false);
                return;
            }
            status.msg = res.message;
            status.audit_succeded.push(audit);
            callback(true);
        }).error(function(error){
            status.msg = "NETWORK Connection or Server Internal Error.";
            callback(false);
        });
        return true;
    }

    var add_audits = function( audits, status, success, error ){

        var index = 0;

        var callback = function( result ){

            if( result == false ){
                $ionicLoading.hide();
                error( status );
                return;
            }

            index++;
            if( index >= audits.length ){
                $ionicLoading.hide();
                success( status );
                return;
            }

            add_audit( audits[index], status, callback );
        };

        if( audits.length > 0 ){
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner><br><span class="nowrap">Processing</span>',
            });
            add_audit( audits[index], status, callback );
        }

        return true;
    }

    var add_audit_selected = function( audits, success, error ){

        var audits_selected = [];
        for( var index in audits ){
            if( audits[index].selected == false ){
                continue;
            }
            audits_selected.push( audits[index]);
        }

        var status = { msg: "", audit_succeded:[] };

        if( audits_selected.length < 1 ){
            status.msg = "Please Select one or more available audits.";
            error( status );
            return;
        }

        if( add_audits( audits_selected, status, success, error ) == false ){
            error( status );
            return;
        }

        return;
    };

    return {
        "load": load,
        "can_be_load_more": can_be_load_more,
        "get_levels": get_levels,
        "set_levels": set_levels,
        "get_can_be_load_more": get_can_be_load_more,
        "set_can_be_load_more": set_can_be_load_more,
        "add_audit_selected": add_audit_selected,
    }
} );