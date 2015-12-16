angular.module( 'services.audit_section', [
    'services.user',
    'services.audit_answer'
] )

.factory( 'auditSectionService', function( $http, userService, $ionicLoading, auditAnswerService ){

    var can_be_load_more= true;
    var get_can_be_load_more = function(){
        return can_be_load_more;
    }
    var set_can_be_load_more = function( cb ){
        can_be_load_more = cb;
    }

    var sections = [];
    var get_sections = function(){
        return sections;
    }

    var questions = [];
    var get_questions = function(){
        return questions;
    }

    var init = function(){
        can_be_load_more = true;
        sections = [];
        questions = [];
    }

    var get_section = function( section_id ){
        var _section_id;
        for( var i in sections ){
            _section_id = sections[i].id || 0;
            if( section_id == _section_id ){
                return sections[i];
            }
        }
        return null;
    }

    var num_all_unanswers = function(){
        var num_unansweres = 0;
        for( var i in sections ){
            num_unansweres += parseInt(sections[i].unanswered)||0;
        }
        return num_unansweres;
    }

    var load_local = function( audit, auditSectionService, success, error ){
        //error();
        //return;
        var prefs = plugins.appPreferences;
        prefs.fetch (
            function(value){
                
                var audit_data = null;
                
                try{
                    audit_data = JSON.parse( window.atob(value) );
                    if( audit_data == null ){
                        error();
                        return;
                    }
                }catch( err ){
                    error();
                    return;
                }
                
                sections = audit_data.sections;
                questions = audit_data.questions;
                var answers = audit_data.answeres;
                var section_questions = null;
                var section = null;
                
                for( var section_id in questions ){
                    section_questions = questions[section_id].questions;
                    section = get_section(section_id);
                    if( section == null ){
                        continue;
                    }
                    for( var j in section_questions ){
                        var question = section_questions[j];
                        answers[section_id][question.questionID].app_data.section= section;
                        answers[section_id][question.questionID].app_data.question= question;
                    }
                }
                auditAnswerService.set_answers( answers );
                can_be_load_more = false;
                success(audit_data);
            }, function(err){
                error( err );
            }, audit.id );
    }

    var load_remote = function( audit, auditSectionService, success, error ){

        param = {
            user_token : userService.get_user_token(),
            c_id : userService.get_c_id(),
            u_id : userService.get_u_id(),
            token : '!@#H3W!@#H3W!@#H3W',
            action: "query",
            query_type: 'sections',
            id: audit.id,
        };
        $http({
            method : 'POST',
            url : 'https://issapi.com/audits/v1/Audit/',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

        }).success(function(res){

            $http({
                method : 'POST',
                url : 'https://issapi.com/audits/v1/Questions/',
                data: param,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}  

            }).success( function( res_q ){
                can_be_load_more = false;
                for( var i in res ){
                    sections.push( res[i] );
                }
                questions = res_q;
                auditAnswerService.init();

                var section_questions = null;
                var section = null;
                for( var section_id in questions ){
                    section_questions = questions[section_id].questions;
                    section = get_section(section_id);
                    if( section == null ){
                        continue;
                    }
                    for( var j in section_questions ){
                        var question = section_questions[j];
                        auditAnswerService.create_answer( section, question );
                    }
                }

                auditAnswerService.update_answer_status(auditSectionService);

                success();

            }).error( function(err){
                error( err );
            } );
        }).error(function(err){
            error( err );
        });
    }

    var load = function( audit, auditSectionService, success, error ){
        
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><br><span class="nowrap">Loading</span>',
        });

        load_local( 
            audit,
            auditSectionService,
            function(res){
                $ionicLoading.hide();
                success(res);
                //alert( res );
            }, function(err){
                load_remote( 
                    audit,
                    auditSectionService,
                    function(res){
                        $ionicLoading.hide();
                        success(res);
                    }, 
                    function(err){
                        $ionicLoading.hide();
                        error( err );
                })
        });
    };

    return {
        "load": load,
        "get_can_be_load_more": get_can_be_load_more,
        "set_can_be_load_more": set_can_be_load_more,
        "get_sections": get_sections,
        "get_section": get_section,
        "get_questions": get_questions,
        "init": init,
        "num_all_unanswers": num_all_unanswers,
    }

} );