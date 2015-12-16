angular.module( 'starter.controllers', 
    [   'ionic',
        'ngCordova', 
        'services.user',
        'services.avail',
        'services.active',
        'services.audit_section',
        'services.audit_answer' ] )

.controller('appCtrl', function($scope, $ionicModal, $timeout, $rootScope ) {
})

.controller('loginCtrl', function($rootScope,$scope, $state, $ionicHistory, $ionicLoading, $http, $ionicPlatform, userService, $cordovaDialogs ) {

    $scope.loginForm={};

    /*$ionicPlatform.ready(function() {
    var prefs = plugins.appPreferences;
    alert( prefs );
    });*/

    $scope.login = function(){
        userService.login( 
            $scope.loginForm.username,
            $scope.loginForm.password,
            /*device.uuid*/"1123124124214",
            "!@#H3W!@# H3W!@# H3W",
            function(res){
                if( res.error ){
                    /*$ionicPopup.alert({
                    title: 'Login Failed.',
                    template: res.error
                    });*/
                    $cordovaDialogs.alert('Login Failed.', 'Login', 'OK')
                    .then(function() {
                        // callback success
                    });
                    return;
                }
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });
                $state.go( 'app.home' );
            },
            function(error){
                /*$ionicPopup.alert({
                title: 'Login Failed.',
                template: error
                });*/
                $cordovaDialogs.alert('Login Failed.', 'Login', 'OK')
                .then(function() {
                    // callback success
                });
        });
    }

})

.controller('homeCtrl', function($scope, $state, $ionicHistory, $cordovaPreferences, userService, $cordovaDialogs ) {
    
    $scope.title = "Welcome "+userService.get_first_name()+"!";
    
    $scope.on_btn_click_avail = function(){
        $state.go( 'app.avail' );
    }

    $scope.on_btn_click_active = function(){
        $state.go( 'app.active' );
    }

    $scope.on_btn_click_contact = function(){
        $state.go( 'app.contact' );
    }

    $scope.logout= function(){
        userService.logout();
    }
})

.controller('availCtrl', function($scope, $state, $stateParams,$ionicHistory, $cordovaDialogs, availService, $timeout, $ionicNavBarDelegate, userService ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.avail_path = $stateParams['avail_path'];    
    $scope.root_levels = availService.get_levels();

    var paths = $scope.avail_path.split(".");
    paths.shift();


    var iter_levels = $scope.root_levels;
    for( var index in paths ){
        iter_levels = iter_levels[paths[index]].levels || iter_levels[paths[index]].locations;
    }

    $scope.levels = iter_levels;

    $scope.loadMore = function(){

        availService.load( 
            function(){
                $scope.root_levels = availService.get_levels();

                var paths = $scope.avail_path.split(".");
                paths.shift();


                var iter_levels = $scope.root_levels;
                for( var index in paths ){
                    iter_levels = iter_levels[paths[index]].levels || iter_levels[paths[index]].locations;
                }

                $scope.levels = iter_levels;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 
            function(){
                /*$ionicPopup.alert({
                title: 'Error.',
                template: 'Server Internal Error',
                });*/
                $cordovaDialogs.alert('Server Internal Error.', 'Load Available Service', 'OK')
                .then(function() {
                    // callback success
                });
        } );
    }

    $scope.moreDataCanBeLoaded = function(){
        return availService.get_can_be_load_more();
    }

    $scope.go_deep = function( index ){
        if( $scope.levels[index]['audits'] ){
            $state.go( 'app.avail_audits', {avail_path:$scope.avail_path+"."+index} );
        }else{
            $state.go( 'app.avail', {avail_path:$scope.avail_path+"."+index} );
        }
    }
})

.controller('availAuditCtrl', function($scope, $state, $stateParams,$ionicHistory, $cordovaDialogs, availService, $timeout, $ionicNavBarDelegate, userService ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.avail_path = $stateParams['avail_path'];    
    $scope.root_levels = availService.get_levels();

    var paths = $scope.avail_path.split(".");
    paths.shift();


    var iter_levels = $scope.root_levels;
    for( var index in paths ){
        iter_levels = iter_levels[paths[index]].levels || iter_levels[paths[index]].locations || iter_levels[paths[index]].audits;
    }

    $scope.audits = iter_levels;
    for( var index in iter_levels ){
        iter_levels[index].selected = false;
    }

    $scope.loadMore = function(){

        availService.load( function(){
            $scope.root_levels = availService.get_levels();
            var paths = $scope.avail_path.split(".");
            paths.shift();


            var iter_levels = $scope.root_levels;
            for( var index in paths ){
                iter_levels = iter_levels[paths[index]].levels || iter_levels[paths[index]].locations || iter_levels[paths[index]].audits;
            }

            $scope.audits = iter_levels;

            $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(){
                /*$ionicPopup.alert({
                title: 'Error.',
                template: 'Server Internal Error',
                });*/
                $cordovaDialogs.alert('Server Internal Error.', 'Loading Audit Info', 'OK')
                .then(function() {
                    // callback success
                });
        } );
    }

    $scope.moreDataCanBeLoaded = function(){
        return availService.get_can_be_load_more();
    }

    $scope.click_audit = function( index ){
        var audit = $scope.audits[index];
        if( audit ){
            audit.selected = !audit.selected;
        }
    }

    var remove_audits = function( audits ){
        for( var index in audits ){
            var f_index = $scope.audits.indexOf( audits[index] );
            if( f_index > -1 ){
                $scope.audits.splice( f_index, 1 );
            }
        }
    };

    $scope.add_audit = function(){
        availService.add_audit_selected( 
            $scope.audits, 
            function( status ){
                remove_audits( status.audit_succeded );
                /*$ionicPopup.alert({
                title: 'Success.',
                template: status.msg,
                });*/
                $cordovaDialogs.alert('Audit is activated successfully.', 'Active Audit', 'OK')
                .then(function() {
                    // callback success
                });
            }, function(status){
                remove_audits( status.audit_succeded );
                /*$ionicPopup.alert({
                title: 'Failed.',
                template: status.msg,
                });*/
                $cordovaDialogs.alert('Failed.', 'Active Audit', 'OK')
                .then(function() {
                    // callback success
                });
        } )
    }
})

.controller('activeCtrl', function($scope, $state, $stateParams,$ionicHistory, $cordovaDialogs, activeService, userService ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.audits = activeService.get_audits();

    $scope.loadMore = function(){

        activeService.load( function(){
            $scope.audits = activeService.get_audits();
            $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(){
                /*$ionicPopup.alert({
                title: 'Error.',
                template: 'Server Internal Error',
                });*/
                $cordovaDialogs.alert('Server Internal Error.', 'Audit', 'OK')
                .then(function() {
                    // callback success
                });
        } );
    }

    $scope.moreDataCanBeLoaded = function(){
        return true;
        return activeService.get_can_be_load_more();
    }

    $scope.click_audit = function(audit){
        activeService.set_selected( audit );
        $state.go( 'app.active_audit' );
    }
})

.controller('active_auditCtrl', function($scope, $state, $stateParams,$ionicHistory, $cordovaDialogs, activeService, userService, auditSectionService, auditAnswerService ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.audit = activeService.get_selected();

    $scope.start_audit = function(){
        auditSectionService.init();
        auditAnswerService.init();
        $state.go( 'app.audit_section' );
    }

    $scope.cancel_audit = function(){
        activeService.cancel(
            function(res){
                //alert(res.message);
                $cordovaDialogs.alert(res.message, 'Audit Cancel', 'OK')
                .then(function() {
                    auditSectionService.init();
                    auditAnswerService.init();
                    //activeService.init();
                    activeService.remove_selected();
                    $state.go( 'app.active' );
                });
            },
            function(err){
                //alert( "failed" );
                $cordovaDialogs.alert('Failed', 'Audit Cancel', 'OK')
                .then(function() {
                });
            }
        );
    }

    $scope.show_map = function(){
        $state.go( 'app.audit_map' );
    }

    $scope.call_phone = function(){
        if( $scope.audit.phone == null || $scope.audit.phone == '' ){
            //alert( 'No Phone Number.' );
            $cordovaDialogs.alert('No Phone Number', 'Calling', 'OK')
            .then(function() {
            });
            return;
        }
        window.plugins.CallNumber.callNumber(
            function(){

            }, 
            function( err ){
                //alert( err );
                $cordovaDialogs.alert(err, 'Calling', 'OK')
                .then(function() {
                });
            }, $scope.audit.phone );
    }
})

.controller('audit_sectionCtrl', function($scope, $state, $stateParams,$ionicHistory, $cordovaDialogs, activeService, userService, auditSectionService, auditAnswerService ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.audit = activeService.get_selected();
    $scope.sections = auditSectionService.get_sections();
    $scope.questions = auditSectionService.get_questions();

    $scope.btn_save_label = function(){

        if( auditSectionService.num_all_unanswers() < 1 ){
            return "Submit";
        }else{
            return "Save Work";
        }
    }

    $scope.icons = [
        "images/site/viewdetails-icon.png",
        "images/site/cashier.png",
        "images/site/checkout-icon.png",
        "images/site/general-icon.png"
    ];

    if( auditSectionService.get_can_be_load_more() ){
        auditSectionService.load( 
            $scope.audit,
            auditSectionService,
            function(){
                $scope.sections = auditSectionService.get_sections();
                $scope.questions = auditSectionService.get_questions();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function(){
                /*$ionicPopup.alert({
                title: 'Error.',
                template: 'Server Internal Error',
                });*/
                $cordovaDialogs.alert('Server Internal Error.', 'Audit', 'OK')
                .then(function() {
                    // callback success
                });
        } );
    }


    $scope.save = function( ){
        auditAnswerService.submit( $scope.audit, auditSectionService,
            function(res){
                //alert('success');
                $cordovaDialogs.alert('Success', 'Audit Save', 'OK')
                .then(function() {
                });
            }, function(err){
                //alert( 'error: '+err );
                $cordovaDialogs.alert(err, 'Audit Save', 'OK')
                .then(function() {
                });
        } );
    }

    /*$scope.moreDataCanBeLoaded = function(){
    return auditSectionService.get_can_be_load_more();
    }*/

    $scope.start_section = function( section ){
        auditAnswerService.set_selected_section(section);
        $state.go( 'app.audit_question', {nth:$scope.audit.id+"."+(section.id||0)+"."+0} );
    }
})

.controller('audit_questionCtrl', function($scope, $state, $stateParams, $ionicHistory, $cordovaDatePicker, $cordovaImagePicker, $cordovaDialogs, $http, userService, activeService, auditSectionService, auditAnswerService ) {

    $scope.logout= function(){
        userService.logout();
    }


    $scope.data = {
        'elapsed': '',
    }

    $scope.next = function(){
        if( $scope.nth >= $scope.questions.length-1 ){
            return;
        }
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
        });
        $ionicHistory.currentView($ionicHistory.backView());
        $state.go( 'app.audit_question', {nth:$scope.audit.id+"."+($scope.section.id||0)+"."+($scope.nth+1)} );
    };

    $scope.prev = function(){
        if( $scope.nth < 1 ){
            return;
        }
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
        });
        $ionicHistory.currentView($ionicHistory.backView());
        $state.go( 'app.audit_question', {nth:$scope.audit.id+"."+($scope.section.id||0)+"."+($scope.nth-1)} );
    };

    var make_freeanswer = function( datetime ){
        var date = datetime.date;
        var time = datetime.time;

        if( $scope.question.answer_type == 'date' ){
            return date;
        }else if( $scope.question.answer_type == 'time' ){
            return time;
        }

        return (new Date( date + " " + time )).format("yyyy-mm-dd hh:MM:ss");
    }

    $scope.pick_date = function(){
        var options = {
            date: new Date(),
            mode: 'date', // 'date' or 'time'
            minDate: new Date() - 10000,
            allowOldDates: true,
            allowFutureDates: false,
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
        };

        $cordovaDatePicker.show(options).then(function(date){
            //alert( (new Date(date)).format("mm/dd/yyyy") );
            $scope.datetime.date = (new Date(date)).format("mm/dd/yyyy");
            change_datetime();
        });
        /*var date = (new Date()).format("mm/dd/yyyy");
        $scope.datetime.date = date;
        change_datetime();*/
    }

    $scope.pick_time = function(){
        var options = {
            date: new Date(),
            mode: 'time', // 'date' or 'time'
            minDate: new Date() - 10000,
            allowOldDates: true,
            allowFutureDates: false,
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
        };

        $cordovaDatePicker.show(options).then(function(date){
            //alert( (new Date(date)).format("h:MM TT") );
            var time = (new Date(date)).format("h:MM TT");
            $scope.datetime.time = time;
            change_datetime();
        });
        /*var time = (new Date()).format("h:MM TT");
        $scope.datetime.time = time;
        change_datetime();*/
    }

    var change_datetime = function(){
        var free_answer = make_freeanswer($scope.datetime);
        if( free_answer == null ){
            return;
        }
        $scope.answer.free_answer = free_answer;
        //$scope.answer.new_posts = { new_date: $scope.datetime.date, new_time: $scope.datetime.time };
    }

    $scope.pick_picker = function( q_ans_id ){
        if( $scope.answer.answer_id == q_ans_id ){
            return;
        }
        $scope.answer.answer_id = q_ans_id;
    }

    $scope.pick_seqment = function( q_ans_id ){
        if( $scope.answer.answer_id == q_ans_id ){
            return;
        }
        $scope.answer.answer_id = q_ans_id;
    }

    $scope.pick_check_all = function( q_ans_id ){
        var index = $scope.chk_free_answers.indexOf(q_ans_id+"");
        var checked = index != -1;
        if( checked ){
            $scope.chk_free_answers.splice( index, 1 );
        }else{
            $scope.chk_free_answers.push( q_ans_id+"" );
        }
        $scope.answer.free_answer = $scope.chk_free_answers.join('\n');
    }

    $scope.bind_check_status = function( q_ans_id ){
        if( $scope.answer == null ){
            return false;
        }

        if( !$scope.chk_free_answers && $scope.answer && $scope.answer.free_answer ){
            $scope.chk_free_answers = $scope.answer.free_answer.split('\n');
        }else if(!$scope.chk_free_answers){
            $scope.chk_free_answers = [];
        }

        return $scope.chk_free_answers.indexOf(q_ans_id+"")!=-1;
    }

    $scope.bind_elapsed = function(){
        var elapsed = $scope.data.elapsed.split(':');
        if( elapsed.length != 3 ){
            $scope.answer.free_answer = '';
            return;
        }
        var hour = parseInt(elapsed[0]);
        var min = parseInt(elapsed[1]);
        var sec = parseInt(elapsed[2]);
        if( !(hour >= 0 && min>=0 &&  sec>=0) ){
            $scope.answer.free_answer = '';
            return;
        }
        $scope.answer.free_answer = hour*3600 + min*60 + sec;
    }

    $scope.bind_price_answer_label = function(){
        for( var i in $scope.question.answers ){
            if( $scope.question.answers[i].answerid == $scope.answer.answer_id ){
                return $scope.question.answers[i].answerlabel;
            }
        }
        return "Choose..";
    }

    $scope.select_image = function(){
        var options = {
            maximumImagesCount: 1,
            width: 800,
            height: 800,
            quality: 80
        };

        $cordovaImagePicker.getPictures(options)
        .then(
            function (results) {
                if( results.length> 0 ){
                    if( $scope.answer == null ){
                        $scope.answer = auditAnswerService.create_answer( $scope.section, $scope.question);
                    }
                    $scope.answer.photo_url = results[0];
                }
            }, 
            function(error) {
                // error getting photos
        });
    }

    var exist_answer_id = function( answer_id ){
        for( var i in $scope.question.answers ){
            if( $scope.question.answers[i].answerid == answer_id ){
                return true;
            }
        }
        return false;
    }

    var fix_check_all_answer= function(){
        var check_all = $scope.answer.free_answer.split('\n');
        var check_all_new = [];
        for( var i in check_all ){
            if( !exist_answer_id(check_all[i]) ){
                continue;
            }
            check_all_new.push( check_all[i]);
        }
        $scope.answer.free_answer = check_all_new.join('\n');
    }

    var path = $stateParams['nth'].split(".");
    $scope.nth = parseInt( path[path.length-1] );
    $scope.audit = activeService.get_selected();
    $scope.section = auditAnswerService.get_selected_section();
    $scope.questions = auditSectionService.get_questions()[$scope.section.id||0].questions;
    $scope.question = auditSectionService.get_questions()[$scope.section.id||0].questions[$scope.nth];

    $scope.answer = auditAnswerService.get_answer( $scope.section, $scope.question );

    $scope.datetime = { date: '', time: '' };
    $scope.reload_answer = function(){
        if( $scope.question.answer_type == "datetime" || 
            $scope.question.answer_type == "date" ||
            $scope.question.answer_type == "time" ){

            if( $scope.question.answer_type="time" ){
                $scope.datetime.time = $scope.answer.free_answer;
            }else if( $scope.question.answer_type="date" ){
                $scope.datetime.date = $scope.answer.free_answer;
            }else{
                $scope.datetime.date = (new Date($scope.answer.free_answer)).format("mm/dd/yyyy");
                $scope.datetime.time = (new Date($scope.answer.free_answer)).format("h:MM TT");
            }
        }
        else if( $scope.question.answer_type=="check_all" && $scope.answer && $scope.answer.free_answer ){
            fix_check_all_answer();
            $scope.chk_free_answers = $scope.answer.free_answer.split('\n');
        }
        else if( $scope.question.answer_type=="elapsed" ){
            var all_seconds = parseInt($scope.answer.free_answer) || 0;
            var hour = Math.floor(all_seconds/3600);
            var min = Math.floor( (all_seconds-hour*3600)/60 );
            var second = all_seconds - hour*3600 - min*60;
            $scope.data.elapsed = hour+":"+min+":"+second;
        }else if( $scope.question.answer_type=="info"){
            $scope.answer.app_data.is_answered = true;
            $scope.answer.status = "Question has been Answered.";
        }
    };

    $scope.reload_answer();

    if( auditAnswerService.get_can_be_load_more( $scope.section, $scope.question ) ){
        auditAnswerService.load( 
            $scope.audit,
            $scope.section,
            $scope.question,
            function( answer ){
                $scope.answer = auditAnswerService.get_answer( $scope.section, $scope.question );
                $scope.reload_answer();
                console.log( answer );
            },
            function( err ){
                console.log( err );
            }
        );
    }

    $scope.check_is_answered = function(){

        var is_answered = true;
        var answer_status = 'Question has been Answered.';
        if( $scope.question.answer_type == 'info'){
        }else if( $scope.answer.questionanswer == null || ($scope.answer.questionanswer == '' && $scope.question.ans_required == 'Yes' ) ){
            is_answered = false;
            switch( $scope.question.answer_type ){
                case 'segmented':
                case 'picker':
                    answer_status = 'Answer has not been Picked';
                    break;
                default:
                    answer_status = 'Answer was not given';
                    break;
            }
        }else if( $scope.question.photo_required != 'No' && ($scope.answer.photo_url==null || $scope.answer.photo_url=='' ) ){
            answer_status = "Photo should be selected.";
            is_answered = false;
        }else if( $scope.question.answer_type == 'price' && $scope.answer.questionanswer == 1 && parseFloat($scope.answer.price) == 0 ){
            is_answered = false;
            answer_status = "Price must be entered if product found.";
        }else if( $scope.question.min_char && $scope.question.min_char>0 ){
            if( $scope.question.answer_type == 'text' ){
                if( $scope.answer.free_answer.length< $scope.question.min_char ){
                    is_answered = false;
                    if( $scope.answer.free_answer.length < 1 ){
                        answer_status = "Text Answer is required.";
                    }else{
                        answer_status = "Text Answer requires a text of "+$scope.question.min_char.length+" characters. Your response is short by "+$scope.answer.free_answer.length+" characters";
                    }

                }
            }else if( $scope.question.allow_comment != 'N' ){
                if( $scope.answer.comment.length< $scope.question.min_char ){
                    is_answered = false;
                    if( $scope.answer.comment.length < 1 ){
                        answer_status = "Comment is required.";
                    }else{
                        answer_status = "Your Answer requires a comment of "+$scope.question.min_char+" characters. Your response is short by "+$scope.answer.comment.length+" characters";
                    }

                }
            }
        }

        $scope.answer.app_data.is_answered = is_answered;
        $scope.answer.status = answer_status;
        auditAnswerService.update_answer_status(auditSectionService);
    }

    $scope.check_is_answered();
    $scope.alert_status = function(){
        //alert( $scope.answer.status );
        $cordovaDialogs.alert( $scope.answer.status, 'Answer Status', 'OK')
        .then(function() {
        });
    }

    $scope.$watchCollection( '[ answer.answer_id, answer.comment, answer.photo_url, answer.price ]', function( newValues, oldValues ){

        if( $scope.question.answer_type != 'picker' &&
            $scope.question.answer_type != 'segmented' &&
            $scope.question.answer_type != 'price' ){
            return;
        }

        /*if( oldValues.indexOf(undefined) != -1 ){
        return;
        }*/
        if( arry_equals(newValues,oldValues) === true ){
            return;
        }

        if( exist_answer_id(newValues[0]) ){
            $scope.answer.answer_id = newValues[0];
        }else{
            $scope.answer.answer_id = null;
        }

        $scope.answer.comment = newValues[1];
        $scope.answer.questionanswer = $scope.answer.answer_id;
        $scope.answer.price = parseFloat($scope.answer.price) || 0;

        $scope.answer.new_posts = {
            answer_id: $scope.answer.answer_id, 
            comment: $scope.answer.comment, 
            photo: $scope.answer.photo_url };

        $scope.check_is_answered();
    });

    $scope.$watchCollection( '[ answer.free_answer, answer.comment, answer.photo_url ]', function( newValues, oldValues ){

        if( $scope.question.answer_type != 'text' &&
            $scope.question.answer_type != 'check_all' &&
            $scope.question.answer_type != 'receipt' &&
            $scope.question.answer_type != 'elapsed' &&
            $scope.question.answer_type != 'date' &&
            $scope.question.answer_type != 'time' &&
            $scope.question.answer_type != 'datetime' ){
            return;
        }

        if( arry_equals(newValues,oldValues) === true){
            return;
        }

        $scope.answer.free_answer = newValues[0];

        if( $scope.question.answer_type == 'receipt' ){
            $scope.answer.free_answer = parseFloat($scope.answer.free_answer)|| '';
        }

        $scope.answer.comment = newValues[1];
        $scope.answer.questionanswer = $scope.answer.free_answer;

        $scope.answer.new_posts = {
            free_answer: $scope.answer.free_answer, 
            comment: $scope.answer.comment, 
            photo: $scope.answer.photo_url };

        $scope.check_is_answered();

    });
})

.controller('audit_mapCtrl', function($scope, $state, $ionicHistory, activeService, userService, $cordovaDialogs ) {

    $scope.logout= function(){
        userService.logout();
    }

    $scope.audit = activeService.get_selected();

    var pos = new google.maps.LatLng( $scope.audit.latitude, $scope.audit.longitude );

    var mapOptions = {
        center: pos,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    var map = new google.maps.Map( document.getElementById("map"), mapOptions );
    $scope.map = map;
})

.controller('contactCtrl', function($scope, $state, $ionicHistory, activeService, userService, $cordovaDialogs ) {

    $scope.logout= function(){
        userService.logout();
    }
})