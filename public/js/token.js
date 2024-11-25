setInterval(function(){ 
    $.ajax({
        url: "tokenData",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            resultData = JSON.parse(resultData)
            var htmlprep ='';
            var htmlready ='';
            $.each(resultData, function (i , val){
                console.log(val);
                if(val.status == 1){
                    htmlready += '<div class="col-sm-4 textready">'+val.empId+'</div>';
                }else{
                    htmlprep += '<div class="col-sm-4 textprep">'+val.empId+'</div>';
                }
            });
            $("#readyList").html(htmlready);
            $("#preparelist").html(htmlprep);
        },
        error: function(err) {
            console.log(err);
        }
    });

}, 1000);
$(document).ready(function() {
$.ajax({
        url: "tokenData",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            resultData = JSON.parse(resultData)
            var htmlprep ='';
            var htmlready ='';
            $.each(resultData, function (i , val){
                console.log(val);
                if(val.status == 1){
                    htmlready += '<div class="col-sm-4 textready">'+val.empId+'</div>';
                }else{
                    htmlprep += '<div class="col-sm-4 textprep">'+val.empId+'</div>';
                }
            });
            $("#readyList").html(htmlready);
            $("#preparelist").html(htmlprep);
        },
        error: function(err) {
            console.log(err);
        }
    });

});