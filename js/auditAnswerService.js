angular.module( 'services.audit_answer', [
    'services.user' ,
    'ngCordova',
] )

.factory( 'auditAnswerService', function( $http, userService, $ionicLoading, $cordovaFileTransfer, $cordovaPreferences ){

    var get_can_be_load_more = function( section, question ){

        var answer = get_answer( section, question );

        return !answer.app_data.inited;
    }

    var init = function(){
        can_be_load_more = true;
        answer = {};
    }

    var selected_section;
    var get_selected_section = function(){
        return selected_section;
    }
    var set_selected_section = function(section){
        selected_section = section;
    }

    var answer = {};
    var get_answer = function( section, question ){
        var section_id = section.id || 0;
        var question_id = question.questionID;
        if( !answer[section_id] || !answer[section_id][question_id] ){
            create_answer(section, question);
        }
        return answer[section_id][question_id];
    }
    var create_answer = function( section, question ){
        var section_id = section.id || 0;
        var question_id = question.questionID;

        if( !answer[section_id] ){
            answer[section_id] = {};
        }

        answer[section_id][question.questionID]= { 'app_data': { 'inited': false, 'is_answered': false, 'section': section, 'question': question } };
        answer[section_id][question.questionID].photo_url = '';
        answer[section_id][question.questionID].comment = '';

        return answer[section_id][question.questionID];
    }
    var set_answer = function( section, question, new_answer ){
        var _old_answer = get_answer(section, question);
        answer[section.id||0][question.questionID] = new_answer;
    }
    
    var set_answers = function( ans ){
        answer = ans;
    }
    
    var load = function( audit, section, question, success, error ){

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><br><span class="nowrap">Loading</span>',
        });

        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
            token : '!@#H3W!@#H3W!@#H3W',
            action: "query",
            query_type: 'answer',
            id: audit.id,
            shop_question_id: question.questionID
        };
        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Audit/',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){

            $ionicLoading.hide();

            if( typeof res !== "object" ){
                error( err );
                return;
            }

            set_answer( section, question, res );
            var _answer = get_answer( section, question );
            _answer.photo_url = "";
            _answer.app_data = { 'inited': true, 'is_answered': _answer.status, 'section': section, 'question': question  };

            success( _answer );

        }).error(function(err){
            $ionicLoading.hide();
            error( err );
        });
    };

    var update_answer_status = function(auditSectionService){

        var answer_item;
        var section_item;
        var num_answered;
        var num_questions;
        var num_unanswered;

        for( var section_id in answer ){
            section_item = auditSectionService.get_section( section_id );
            if( section_item == null ){
                continue;
            }

            num_answered =0;
            num_questions =0;
            for( var question_id in answer[section_id] ){
                answer_item = answer[section_id][question_id];
                if( answer_item.app_data.is_answered ){
                    num_answered++;
                }
                num_questions++;
            }

            num_unanswered = num_questions- num_answered;
            section_item.unanswered = num_unanswered;
        }
    };

    var local_save = function( audit, auditSectionService, success, error ){

        var audit_data = {
            'sections': auditSectionService.get_sections(),
            'questions': auditSectionService.get_questions(),
            'answeres': answer,
        }

        var prefs = plugins.appPreferences;

        prefs.store (
            function(value){
                success( value );
            }, 
            function(err){
                error( err );
            }, audit.id, window.btoa(JSON.stringify(audit_data)) );

        /*$cordovaPreferences.set(audit.id, JSON.stringify(audit_data)).then( function () {
            success( audit_data );
        })*/
    };

    var remote_save = function( audit, success, error ){
        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
            token : '!@#H3W!@#H3W!@#H3W',
            auditID: audit.id,
            id: audit.id,
            submitted: "No",
        };

        var answer_item;
        var question_item;
        var request= {};
        var request_item;
        var key;
        for(var i in answer){
            for( var j in answer[i] ){
                answer_item = answer[i][j];
                question_item = answer_item.app_data.question;

                request_item= {};

                if( answer_item.questionanswer == null ){
                    key = 'answers['+question_item.questionID+']';
                    request_item[key] = 'null';
                }else{
                    if( question_item.answer_type == 'segmented' ){
                        key = 'answers['+question_item.questionID+']';
                        request_item[key] = parseInt(answer_item.questionanswer)+1;
                    }else{
                        key = 'answers['+question_item.questionID+']';
                        request_item[key] = answer_item.questionanswer;
                    }

                    if( question_item.answer_type == 'price' && answer_item.price != '' ){
                        key = 'price['+question_item.questionID+']';
                        request_item[key] = answer_item.price;
                    }

                    if( answer_item.comment != null && answer_item.comment != '' ){
                        key = 'additional_text['+question_item.questionID+']';
                        request_item[key] = answer_item.comment;
                    }
                }


                request = angular.extend( {}, request, request_item );
            }
        }

        request = angular.extend( {}, request, param );

        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Save',
            data: request,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){
            if( res.message ){
                success(res);
                return;
            }
            error(res);
        }).error(function(err){
            error(err);
        });
    }

    var submit = function( audit, auditSectionService, success, error ){

        var num_all_unansweres = auditSectionService.num_all_unanswers();
        var loading_label = num_all_unansweres>0? "Saving": "Submiting";

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><br><span class="nowrap">'+loading_label+'</span>',
        });

        local_save( 
            audit,
            auditSectionService, 
            function(res){
                if( num_all_unansweres >0  ){
                    $ionicLoading.hide();
                    success( res );
                    return;
                }
                remote_save( 
                    audit,
                    function(res){
                        $ionicLoading.hide();
                        success(res)
                    },
                    function(err){
                        $ionicLoading.hide();
                        error( err );
                } );
            }, 
            function(err){
                $ionicLoading.hide();
                error(err);
        });

    };

    /*var submit_one_by_one = function( audit, index, success, error ){

    if( index > tasks.length-1 ){
    return result? success() : error();
    }

    var answer = tasks[index];

    if( answer.new_posts.photo !=  "" ){
    var server = "https://issapi.com/audits/v1/Audit";
    var options = {
    fileKey: "photo",
    params: {
    user_token : userService.get_user_token(),
    c_id : userService.get_c_id(),
    u_id : userService.get_u_id(),
    token : '!@#H3W!@#H3W!@#H3W',
    action: "query",
    query_type: 'save_answer',
    id: audit.id,
    shop_question_id: answer.shop_question_id,
    }
    };
    options.params = angular.extend( {}, options.params, answer.new_posts );
    delete options.params.photo;
    $cordovaFileTransfer.upload(server, answer.new_posts.photo, options )
    .then(function(result) {
    alert( result );
    // Success!
    }, function(err) {
    alert( "failed" );
    // Error
    }, function (progress) {
    // constant progress updates
    });
    }else{

    params = {
    user_token : userService.get_user_token(),
    c_id : userService.get_c_id(),
    u_id : userService.get_u_id(),
    token : '!@#H3W!@#H3W!@#H3W',
    action: "query",
    query_type: 'save_answer',
    id: audit.id,
    shop_question_id: answer.shop_question_id,
    };
    params = angular.extend( {}, params, answer.new_posts );
    delete params.photo;
    $http({
    method : 'POST',
    url : 'https://issapi.com/audits/v1/Audit/',
    data: params,
    headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

    }).success(function(res){
    }).error(function(err){
    });

    }
    }*/

    return {
        "load": load,
        "get_can_be_load_more": get_can_be_load_more,
        "get_answer": get_answer,
        "create_answer": create_answer,
        "init": init,
        "get_selected_section": get_selected_section,
        "set_selected_section":  set_selected_section,
        "submit": submit,
        "update_answer_status": update_answer_status,
        "set_answers": set_answers,
    }

} );