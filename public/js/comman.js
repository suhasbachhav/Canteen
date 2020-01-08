    var quality = 60;
var timeout = 10;
function showlastEntries(){
    $("#lastEntries , #dataRecords").html("");
    $.ajax({
        url: "getlastrecords",
        method: "POST",
        ContentType: 'application/json',
        success: function(resultData) {
            var ObjRes = JSON.parse(resultData);
            var htmlCount = '';
            $.each(ObjRes.count, function (i , val){
                htmlCount +="<span style='color: green;'><b>"+val.food+": "+val.countFood+"<b><span><br>";
            });
            $("#foodCountNav").html(htmlCount);
            var html = '';
            $.each(ObjRes.records, function (i , val){
                html += "<tr><th>"+val.empId+"</th><th>"+val.user_name+"</th><th>"+val.food+"</th><th>"+val.date_time+"</th></tr>";
            });
            $("#lastEntries").html(html);
            var countHtml = '';
            $.each(ObjRes.count, function (i , val){
                countHtml += '<br>Count of '+val.food+': '+val.countFood; 
            });
            $("#countFood").html(countHtml);
        },
        error: function(err) {
            console.log(err);
        }
    });
    queuePizza();
}

$("#tokenGeneration").delegate(".vegNonVegCls", 'click', function(){
    if($(this).is(':checked')){
        var empIdArr = $(this).attr('id');
        var res = empIdArr.split("vegNonBegId-")[1];
        sessionStorage.setItem(res, "1");
    }else{
        var empIdArr = $(this).attr('id');
        var res = empIdArr.split("vegNonBegId-")[1];
        sessionStorage.removeItem(res);
    }
});

function queuePizza(){
    if($("#foodService").val() ==2){
        $.ajax({
            url: "getqueuePizza",
            method: "POST",
            ContentType: 'application/json',
            success: function(resultData) {
                var ObjRes = JSON.parse(resultData);
                var html = '';
                $.each(ObjRes, function (i , val){
                    if(val.status == 0)
                        html +='<div class="cls-'+val.empId+'"><b><span style="margin: 2px;" >'+val.empId+'</span></b><button type="button" style="margin: 2px;" class="btn btn-xs btn-warning pizzaready" id="tokenReadyId-'+val.empId+'" data-srno="'+val.id+'">Ready</button><button type="button" style="margin: 2px;" class="btn btn-xs btn-success pizzaserved"  data-srno="'+val.id+'" id="tokenServed-'+val.empId+'" disabled>Served</button><input type="checkbox" class="vegNonVegCls" name="vegnonveg" id="vegNonBegId-'+val.empId+'"><br></div>';
                    else if(val.status == 1)
                        html +='<div class="cls-'+val.empId+'"><b><span style="margin: 2px;" >'+val.empId+'</span></b><button type="button" style="margin: 2px;" class="btn btn-xs btn-warning pizzaready" id="tokenReadyId-'+val.empId+'" data-srno="'+val.id+'" disabled>Ready</button><button type="button" style="margin: 2px;" class="btn btn-xs btn-success pizzaserved" data-srno="'+val.id+'" id="tokenServed-'+val.empId+'" >Served</button><input type="checkbox" class="vegNonVegCls" name="vegnonveg" id="vegNonBegId-'+val.empId+'"><br></div>';
                });
                $("#tokenGeneration").html(html);
                $.each(Object.keys(sessionStorage), function (i , val){
                    if(sessionStorage.getItem(val)){
                        var idV = "#vegNonBegId-"+val;
                        $(idV).prop('checked', true);
                    }
                });
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
}
function Capture() {
    try {
        $('#txtStatus').value = "";
        $('#imgFinger').src = "data:image/bmp;base64,";
        $('#imgFinger').attr("src" ,"data:image/bmp;base64,");
        $('#ISOdataID').val('');
        var res = CaptureFinger(quality, timeout);
        if (res.httpStaus) {
            $('#txtStatus').value = "ErrorCode: " + res.data.ErrorCode + " ErrorDescription: " + res.data.ErrorDescription;
            if (res.data.ErrorCode == "0") {
                var imgData = "data:image/bmp;base64," + res.data.BitmapData;
                $('#imgFinger').attr("src" ,imgData);
                $('#ISOdataID').val(res.data.IsoTemplate);
            } else
                alert("Please try Again");
        } else alert(res.err);
    } catch (e) {
        alert(e);
    }
    return false;
}
function exportTableToExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    filename = filename?filename+'.xls':'excel_data.xls';
    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
}
function matchBioBySuhas() {
    $("#imgFingerFake").attr("src","");
    var newId ='' ;
    var newImg = '';
    var res = CaptureFinger(quality, timeout);
    if (res.httpStaus) {
        if (res.data.ErrorCode == "0") {
            newImg = "data:image/bmp;base64," + res.data.BitmapData;
            $('#txtIsoTemplateNew').val(res.data.IsoTemplate);
            newId = res.data.IsoTemplate;
        }
    }
    var className = ".isoClass-"+$("#empDeptFood").val();
    var iCount = $(className).length;
    var areFieldEmpty;
    console.log(className);
    $(className).each(function(eriii) {
        console.log(className);
        if($(this).val() != '') var areFieldEmpty = 0;
        else var areFieldEmpty = 1;
        isotemplate = $(this).val();
        var isotemplateCurrent = $('#txtIsoTemplateNew').val();
        var res = VerifyFinger(newId, isotemplate);
        if (res.httpStaus && res.data.Status) {
            var empIdArr = $(this).attr('id');
            var res = empIdArr.split("emp-")[1];
            $("#empFoodId").val(res);
            $("#entryFood").click();
            $("#imgFingerFake").attr("src",newImg);
            return;
        }
    });
    $(className).each(function(eriii) {
        if (eriii+1 === iCount && areFieldEmpty == 1 ) {
            alert("Please update or Check Biomatrics");
        }
    });  
}
function Match() {
    try {
        var isotemplate = $('#ISOdataID').val();
        var res = MatchFinger(quality, timeout, isotemplate);
        if (res.httpStaus) {
            if (res.data.Status) 
                alert("Finger matched");
            else {
                if (res.data.ErrorCode != "0") alert(res.data.ErrorDescription);
                else alert("Finger not matched");
            }
        } else alert(res.err);
    } catch (e) {
        alert(e);
    }
    return false;
}
$("#empFoodId").on('keypress',function(e) {
    if(e.which == 13) { $("#entryFood").click(); }
});
$("#dailyFoodLink").on('click',function(e) {
    showlastEntries();
});
$("#registerLink").click(function() {
    $("#register-user").show();
    $("#FoodEntry , #report-page").hide();
});
$("#dailyFoodLink").click(function() {
    $("#register-user , #report-page").hide();
    $("#FoodEntry").show();
});
$("#reports").click(function() {
    $("#register-user , #FoodEntry").hide();
    $("#report-page").show();
});
$("#updateExistingVendor").click(function() {
    $("#vendorWise , #empCompWiseLbl ,  #UpdateVendorBtn").removeClass('hidden');
    $("#addVendorBtn").addClass('hidden');
});
$("#addNewVendor").click(function() {
    $("#vendorWise , #empCompWiseLbl, #UpdateVendorBtn").addClass('hidden');
    $("#addVendorBtn").removeClass('hidden');
});
$("#updateExistingCompany").click(function() {
    $("#empCompLbl , #companyDropdwn ,  #UpdateCompanyBtn").removeClass('hidden');
    $("#addCompanyBtn").addClass('hidden');
});
$("#addNewCompany").click(function() {
    $("#empCompLbl , #companyDropdwn ,  #UpdateCompanyBtn").addClass('hidden');
    $("#addCompanyBtn").removeClass('hidden');
});
$("#updateExistingDepartment").click(function() {
    $("#empDepartmentLbl , #departmentDropdwn ,  #UpdateDepartmentBtn").removeClass('hidden');
    $("#addDepartmentBtn").addClass('hidden');
});
$("#addNewDepartment").click(function() {
    $("#empDepartmentLbl , #departmentDropdwn ,  #UpdateDepartmentBtn").addClass('hidden');
    $("#addDepartmentBtn").removeClass('hidden');
});

$("#queuefinger").click(function() { interval = setInterval(function(){ $("#btnCaptureAndMatch").click(); }, 5000); });
$("#queueStopfinger").click(function() { clearInterval(interval); });
$(function() {
    setTimeout(function() {
        $("#lastenterUser").hide('blind', {}, 500)
    }, 4000);
});
$(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $(".side-nav .collapse").on("hide.bs.collapse", function() {
        $(this).prev().find(".fa").eq(1).removeClass("fa-angle-right").addClass("fa-angle-down");
    });
    $('.side-nav .collapse').on("show.bs.collapse", function() {
        $(this).prev().find(".fa").eq(1).removeClass("fa-angle-down").addClass("fa-angle-right");
    });
});
$("#empDeptFood").change(function() {
    var className = ".isoClass-"+$(this).val();
    if (typeof($(className).attr('class')) == 'undefined') $("#btnCaptureAndMatch").hide();
    else $("#btnCaptureAndMatch").show();
});
$("#tokenGeneration").delegate(".pizzaready", 'click', function(){
    $(this).attr('disabled','disabled');
    var empIdArr = $(this).attr('id');
    var srno = $(this).data('srno');
    var res = empIdArr.split("ReadyId-")[1];
    var paramdata = {
        empId: res,
        srno:srno
    };
    $.ajax({
        url: "updatePizzaStatus",
        method: "POST",
         data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            queuePizza();
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#tokenGeneration").delegate(".pizzaserved", 'click', function(){
    $(this).attr('disabled','disabled');
    var empIdArr = $(this).attr('id');
    var srno = $(this).data('srno');
    var res = empIdArr.split("Served-")[1];
    var paramdata = {
        empId: res,
        srno:srno
    };
    $.ajax({
        url: "updatePizzaStatusFinal",
        method: "POST",
         data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            sessionStorage.removeItem(res);
            queuePizza();
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#entryFood").click(function() {
    $("#entryFood").attr("disabled", true);
    if ($("#empFoodId").val() == '') {
        alert("Please enter Employee Id");
        $("#entryFood").attr("disabled", false);
        return;
    } 
    var paramdata = {
        empFoodId: $("#empFoodId").val(),
        foodType: $("#foodService").val(),
        vendorId: $("#vendorid").val()
    };
    $.ajax({
        url: "foodEntry",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            $("#entryFood").attr("disabled", false);
            showlastEntries();
            $("#lastenterUser").html();
            $("#empFoodId").val();
            if (resultData == "Invalid Employee") alert("Please enter Valid Employee Id!");
            else if (resultData =="Allready Food Serve") alert("You have allready taken food today");
            else {
                var ObjData = JSON.parse(resultData);
                if(ObjData){
                    var text = ObjData.username+" is added for the "+ObjData.foodType+" of the Day";
                    $("#lastenterUser").html(text).show();
                }else alert("Error Occured! Please check Again"); 
            }
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#employeeDeactivateReport").click(function() {
    if ($("#deactivateEmpId").val() == '') {
        alert("Please enter Employee Id");
        return;
    } 
    var paramdata = {
        deactivateEmpId: $("#deactivateEmpId").val()
    };
    $.ajax({
        url: "deactivateemployeelist",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "Updated")  alert("Employee Updated Succesfully");
            else alert("Something is wrong, Please refrsh and try again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#empFoodReport").on('click',function(e) {
    var paramdata = {
        date1: $("#empdt1").val(),
        date2: $("#empdt2").val(),
        empId: $("#empWiseReport").val()
    };
    $("#dataRecords").html('');
    $.ajax({
        url: "downloadEmpFoodReport",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                var ObjRes = JSON.parse(resultData);
                var htmlRes = '';
                var iii =0;
                $.each(ObjRes, function (i , val){
                    iii +=1;
                    htmlRes += "<tr><th>"+iii+"</th><th>"+val.empId+"</th><th>"+val.user_name+"</th><th>"+val.food+"</th><th>"+val.fooddate+"</th><th>"+val.companyName+"</th></tr>";
                });
                $("#dataEmpFoodRecords").html(htmlRes);
                var ttl = Object.keys(ObjRes).length - 1;
                $.each(ObjRes, function (ic , val){
                    if(ttl == ic){
                        var reportName = "empfoodreport-frm:"+$("#empdt1").val()+"-to:"+$("#empdt2").val()+"-for:"+$("#empWiseReport").val();
                        exportTableToExcel('tblEmpFoodData', reportName);
                    }
                });
            }else{
                $("#dataEmpFoodRecords").html('');
            }
        }
    });
});
$("#employeeListReport").on('click',function(e) {
    var paramdata = {
        empCompWise: $("#empCompWise").val()
    };
    $("#dataEmpRecords").html('');
    $.ajax({
        url: "downloadEmpReport",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                var ObjRes = JSON.parse(resultData);
                var htmlEmpRes = '';
                var doubleFood = "No";
                var ISOdata ='';
                $.each(ObjRes, function (i , val){
                    doubleFood = "No";
                    var ISOdata = 'Updated';
                    if(val.doubleFood == 1) doubleFood = "Yes";
                    
                    if(val.ISOdata == '')ISOdata = "-";
                    
                    htmlEmpRes += "<tr><th>"+val.emp_id+"</th><th>"+val.user_name+"</th><th>"+val.comp_name+"</th><th>"+val.department+"</th><th>"+val.status+"</th><th>"+doubleFood+"</th><th>"+ISOdata+"</th></tr>";
                });
                $("#dataEmpRecords").html(htmlEmpRes);
                var ttle = Object.keys(ObjRes).length - 1;
                $.each(ObjRes, function (ie , val){
                    if(ttle == ie){
                        exportTableToExcel('tblEmpData', "emplyeeReportList");
                    }
                });
            }else{
                $("#dataEmpRecords").html('');
            }
        }
    });
});
$("#vendorWise").change(function() {
    var paramdata = {
        vendorId: $(this).val()
    };
    $.ajax({
        url: "checkVendor",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                var ObjData = JSON.parse(resultData);
                $("#updateVendorName").val(ObjData.vendor);
                $("#updateVendorUserName").val(ObjData.username);
                $("#updateVendorEmail").val(ObjData.email);
                $("#foodVendorType").val(ObjData.foodservice);
                $("#foodVendorStatus").val(ObjData.status); 
            }else{
                $("#updateVendorName , #updateVendorUserName , #updateVendorEmail , #foodVendorType").val('');
            }
        }
    });
});
$("#UpdateVendorBtn").click(function() {
    if ($("#updateVendorName").val() == '') {
        alert("Please enter Vendor Name");
        return;
    } else if ($("#updateVendorUserName").val() == '') {
        alert("Please enter Vendor User Name");
        return;
    } else if ($("#updateVendorNewPass").val() != $("#updateVendorConfirmPass").val()) {
        alert("Password must be same");
        return;
    } else if ($("#updateVendorEmail").val() == '') {
        alert("Please enter vendor Email");
        return;
    }else if ($("#foodVendorType").val() == '') {
        alert("Please select vendor food type");
        return;
    } else if ($("#vendorWise").val() == '') {
        alert("Please select vendor from Dropdown");
        return;
    }else if ($("#foodVendorStatus").val() == '') {
        alert("Please select vendor food type");
        return;
    }
    var paramdata = {
        updateVendorName: $("#updateVendorName").val(),
        vendorWise: $("#vendorWise").val(),
        updateVendorUserName: $("#updateVendorUserName").val(),
        updateVendorNewPass: $("#updateVendorNewPass").val(),
        updateVendorEmail: $("#updateVendorEmail").val(),
        foodVendorType: $("#foodVendorType").val(),
        foodVendorStatus: $("#foodVendorStatus").val()
    };
    $.ajax({
        url: "updateVendor",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "Updated") alert("User Updated Succesfully");
            else alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#addVendorBtn").click(function() {
    if ($("#updateVendorName").val() == '') {
        alert("Please enter Vendor Name");
        return;
    } else if ($("#updateVendorUserName").val() == '') {
        alert("Please enter Vendor User Name");
        return;
    } else if ($("#updateVendorNewPass").val() != $("#updateVendorConfirmPass").val()) {
        alert("Password must be same");
        return;
    } else if ($("#updateVendorEmail").val() == '') {
        alert("Please enter vendor Email");
        return;
    }else if ($("#foodVendorType").val() == '') {
        alert("Please select vendor food type");
        return;
    }else if ($("#foodVendorStatus").val() == '') {
        alert("Please select vendor food type");
        return;
    }
    $(this).attr("disabled", true);
    var paramdata = {
        updateVendorName: $("#updateVendorName").val(),
        updateVendorUserName: $("#updateVendorUserName").val(),
        updateVendorNewPass: $("#updateVendorNewPass").val(),
        updateVendorEmail: $("#updateVendorEmail").val(),
        foodVendorType: $("#foodVendorType").val(),
        foodVendorStatus: $("#foodVendorStatus").val()
    };
    $.ajax({
        url: "addVendor",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData) {
                alert("Vendor Added Succesfully");
                location.reload();
            } else 
                alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#addCompanyBtn").click(function() {
    if ($("#updateCompanyName").val() == '') {
        alert("Please enter Company Name");
        return;
    }
    var paramdata = {
        updateCompanyName: $("#updateCompanyName").val()
    };
    $.ajax({
        url: "addCompany",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData) {
                alert("Company Added Succesfully");
                getCompany();
                $("#updateCompanyName").val('');
            } else 
                alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#UpdateCompanyBtn").click(function() {
     if ($("#updateCompanyName").val() == '') {
        alert("Please enter Company Name");
        return;
    }else if ($("#companyDropdwn").val() == '') {
        alert("Please Select Company");
        return;
    }
    var paramdata = {
        updateCompanyName: $("#updateCompanyName").val(),
        updateCompanyId: $("#companyDropdwn").val()
    };
    $.ajax({
        url: "updateCompany",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "Updated"){
                alert("Company Updated Succesfully");
                getCompany();
                $("#updateCompanyName").val('');
            }else
                alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#addDepartmentBtn").click(function() {
    if ($("#updateDepartmentName").val() == '') {
        alert("Please enter Company Name");
        return;
    }
    var paramdata = {
        updateDepartmentName: $("#updateDepartmentName").val()
    };
    $.ajax({
        url: "addDepartment",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData) {
                alert("Department Added Succesfully");
                getDepartment();
                $("#updateDepartmentName").val('');
            } else 
                alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#companyDropdwn").change(function() {
    $("#updateCompanyName").val($("#companyDropdwn option:selected").text());    
});
$("#departmentDropdwn").change(function() {
    $("#updateDepartmentName").val($("#departmentDropdwn option:selected").text());    
});
$("#UpdateDepartmentBtn").click(function() {
    if ($("#updateDepartmentName").val() == '') {
        alert("Please enter Company Name");
        return;
    }else if ($("#departmentDropdwn").val() == '') {
        alert("Please Select Department");
        return;
    }
    var paramdata = {
        updateDepartmentName: $("#updateDepartmentName").val(),
        updateDepartmentId: $("#departmentDropdwn").val()
    };
    $.ajax({
        url: "updateDepartment",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "Updated"){
                alert("Department Updated Succesfully");
                getDepartment();
                $("#updateDepartmentName").val('');
            }
            else
                alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$(document).ready(function() {
    var d = new Date(); // for now
    var hr = d.getHours(); // => 9
    var min = d.getMinutes(); // =>  30
    if(hr == 12 && min < 5){
        sessionStorage.clear();
    }

    setInterval(function(){ 
        if($("#foodService").val() == 0) showlastEntries();    
    }, 8000);
    $("#dt1").datepicker({
        format: "yyyy-mm-dd",
        minDate: 0,
        onSelect: function (date) {
            var dt2 = $('#dt2');
            var startDate = $(this).datepicker('getDate');
            var minDate = $(this).datepicker('getDate');
            dt2.datepicker('setDate', minDate);
            startDate.setDate(startDate.getDate() + 30);
            dt2.datepicker('option', 'maxDate', startDate);
            dt2.datepicker('option', 'minDate', minDate);
            $(this).datepicker('option', 'minDate', minDate);
        }
    });
    $('#dt2').datepicker({
        format: "yyyy-mm-dd"
    });
    $("#dDt1").datepicker({
        format: "yyyy-mm-dd",
        minDate: 0,
        onSelect: function (date) {
            var dt2 = $('#dt2');
            var startDate = $(this).datepicker('getDate');
            var minDate = $(this).datepicker('getDate');
            dt2.datepicker('setDate', minDate);
            startDate.setDate(startDate.getDate() + 30);
            dt2.datepicker('option', 'maxDate', startDate);
            dt2.datepicker('option', 'minDate', minDate);
            $(this).datepicker('option', 'minDate', minDate);
        }
    });
    $('#dDt2').datepicker({
        format: "yyyy-mm-dd"
    });
    $("#dlt1").datepicker({
        format: "yyyy-mm-dd",
        minDate: 0,
        onSelect: function (date) {
            var dt2 = $('#dt2');
            var startDate = $(this).datepicker('getDate');
            var minDate = $(this).datepicker('getDate');
            dt2.datepicker('setDate', minDate);
            startDate.setDate(startDate.getDate() + 30);
            dt2.datepicker('option', 'maxDate', startDate);
            dt2.datepicker('option', 'minDate', minDate);
            $(this).datepicker('option', 'minDate', minDate);
        }
    });
    $('#dlt2').datepicker({
        format: "yyyy-mm-dd"
    });
    $("#empdt1").datepicker({
        format: "yyyy-mm-dd",
        minDate: 0,
        onSelect: function (date) {
            var dt2 = $('#dt2');
            var startDate = $(this).datepicker('getDate');
            var minDate = $(this).datepicker('getDate');
            dt2.datepicker('setDate', minDate);
            startDate.setDate(startDate.getDate() + 30);
            dt2.datepicker('option', 'maxDate', startDate);
            dt2.datepicker('option', 'minDate', minDate);
            $(this).datepicker('option', 'minDate', minDate);
        }
    });
    $('#empdt2').datepicker({
        format: "yyyy-mm-dd"
    });
    getCompany();
    $.ajax({
        url: "getusers",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            resultData = JSON.parse(resultData)
            var html ='<option value="0">---SELECT Vendor---</option>';
            $.each(resultData, function (i , val){
                html += '<option value="'+val.id+'">'+val.vendor+'</option>';
            });
            $("#vendorWise").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "getfoodtype",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            resultData = JSON.parse(resultData)
            var html ='<option value="">-SELECT-</option>';
            $.each(resultData, function (i , val){
                html += '<option value="'+val.id+'">'+val.foodType+'</option>';
            });
            $("#foodVendorType").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "getuserwise",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            resultDataArr = JSON.parse(resultData);
            var html ='';
            var size = Object.keys(resultDataArr).length;
            if(size > 1){
                html ='<option value="0">---ALL---</option>';
            }
            $.each(resultDataArr, function (i , val){
               html += '<option value="'+val.id+'">'+val.vendor+'</option>';
            });
            $("#foodVendorList").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "getsessionData",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            $("#UserName").html(resultData.vendor);
            $("#vendorid").val(resultData.id);
            $("#foodService").val(resultData.foodservice);
            if(resultData.foodservice == 0){
                $("#authorizeId , #foodEntryIdClass").addClass("hidden");
                $("#authorizeRegistrationId , #fingerPrintDiv , #registerDiv, .admindiv").removeClass("hidden");
            }else{
                $("#authorizeId , #foodEntryIdClass").removeClass("hidden");
                $("#authorizeRegistrationId  , #fingerPrintDiv , #registerDiv, .admindiv").addClass("hidden");
            }
            $("#tokenClass").addClass("hidden");
            if(resultData.foodservice == 2){
                $("#tokenClass").removeClass("hidden");
            }
        },
        error: function(err) {
            console.log(err);
        }
    });
    getDepartment();
    $.ajax({
        url: "getIsoData",
        method: "POST",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            var html ='';
            var resultDataArr = JSON.parse(resultData);
            $.each(resultDataArr, function (i , val){
                html += '<input type="hidden" class="ISOdata isoClass-'+val.department+'" id="emp-'+val.emp_id+'" value="'+val.ISOdata+'" data-department="'+val.department+'"/>';
            });
            $("#isoDataDiv").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
});
function getDepartment(){
    $.ajax({
        url: "getDepartment",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            var resultDataArr = JSON.parse(resultData);
            var html ='<option value="0">-Select Department-</option>';
            var htmlUDept ='';
            $.each(resultDataArr, function (i , val){
                html += '<option value="'+val.id+'">'+val.dept_name+'</option>';
                htmlUDept += '<option value="'+val.id+'">'+val.dept_name+'</option>';
            });
            $("#empDept , #empDeptFood").html(html);
            $("#departmentDropdwn").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
function getCompany(){
    $.ajax({
            url: "getcompany",
            method: "GET",
            data: '',
            ContentType: 'application/json',
            success: function(resultData) {
                resultData = JSON.parse(resultData)
                var html ="<option value=''>---SELECT---</option>";
                var htmlCompWise ="<option value='0'>---ALL---</option>";
                var htmlUComp ="";
                $.each(resultData, function (i , val){
                    htmlCompWise += "<option value='"+val.compID+"'>"+val.comp_name+"</option> ";
                    html += "<option value='"+val.compID+"'>"+val.comp_name+"</option> ";
                    htmlUComp += "<option value='"+val.compID+"'>"+val.comp_name+"</option> ";
                });
                $("#empComp").html(html);
                $("#companyDropdwn").html(htmlUComp);
                $("#empCompWise").html(htmlCompWise);
            },
            error: function(err) {
                console.log(err);
            }
        });

}
$("#empId").on('change',function(e) {
    if($(this).val().length > 2){
        var paramdata = {
            empId: $(this).val()
        };
        $.ajax({
            url: "checkEmp",
            method: "POST",
            data: paramdata,
            ContentType: 'application/json',
            success: function(resultData) {
                if(resultData){
                    var ObjData = JSON.parse(resultData);
                    $("#empName").val(ObjData.user_name);
                    $("#empDept").val(ObjData.department);
                    $("#empComp").val(ObjData.emp_Comp);
                    $("#ISOdataID").val(ObjData.ISOdata);
                    $("#imgFinger").attr("src", window.atob(ObjData.base64Img));
                    $('input:radio[name="empStatus"]').val(ObjData.status);
                    if(ObjData.status == '0') $('#empStatus0').prop("checked", true);
                    else $('#empStatus1').prop("checked", true);
                    
                    $('input:radio[name="empFoodAllow"]').val(ObjData.doubleFood);
                    if(ObjData.doubleFood == '0') $('#empFoodAllow0').prop("checked", true);
                    else $('#empFoodAllow1').prop("checked", true);
                    
                    $("#registerBtn").removeClass("btn-primary").addClass("btn-success").html("Update Employee");
                }else{
                    $("#empName , #empDept , #empComp , #ISOdataID").val('');
                    $("#imgFinger").attr("src", '');
                    $("#registerBtn").addClass("btn-primary").removeClass("btn-success").html("Register Employee");
                }
            }
        });
    }
});
$("#registerBtn").click(function() {
    if ($("#empId").val() == '') {
        alert("Please enter Employee Id");
        return;
    } else if ($("#empName").val() == '') {
        alert("Please enter Employee Name");
        return;
    } else if ($("#empDept").val() == '') {
        alert("Please enter Employee Department");
        return;
    } else if ($("#empComp").val() == '') {
        alert("Please enter Employee Company Name");
        return;
    }
    var eStatus =0;
    var empFoodAllow =0;
    if($('#empStatus1').prop('checked')) eStatus =1;
    if($('#empFoodAllow1').prop('checked')) empFoodAllow =1;

    var paramdata = {
        empId: $("#empId").val(),
        empName: $("#empName").val(),
        empDept: $("#empDept").val(),
        empComp: $("#empComp").val(),
        empISOdataID: $("#ISOdataID").val(),
        empBase64Img: $("#imgFinger").attr('src'),
        empStatus: eStatus ,
        empFoodAllow: empFoodAllow
    };
    $.ajax({
        url: "register",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "User Allready exist") {
                alert("User Allready Exist!");
            } else if (resultData == "Updated") {
                alert("User Updated Succesfully");
                location.reload();
            }else if (resultData) {
                alert("User Added Succesfully");
                location.reload();
            } else  alert("Please refrsh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#monthlyReport").on('click',function(e) {
    var paramdata = {
        date1: $("#dt1").val(),
        date2: $("#dt2").val(),
        foodvendorList: $("#foodVendorList").val(),
        mealType : $("#mealType").val()
    };
    $("#dataRecords").html('');
    $.ajax({
        url: "downloadFoodServeReport",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            console.log(resultData);
            if(resultData){
                var ObjRes = JSON.parse(resultData);
                var htmlRes = '';
                $.each(ObjRes, function (i , val){
                    htmlRes += "<tr><th>"+val.empId+"</th><th>"+val.user_name+"</th><th>"+val.food+"</th><th>"+val.fooddate+"</th><th>"+val.companyName+"</th><th>"+val.foodVendor+"</th><th>"+val.timeInterval+"</th></tr>";
                });
                $("#dataRecords").html(htmlRes);
                var ttl = Object.keys(ObjRes).length - 1;
                $.each(ObjRes, function (ic , val){
                    if(ttl == ic){
                        var reportName = "foodreport-frm:"+$("#dt1").val()+"-to:"+$("#dt2").val()+"-for:"+$("#foodVendorList option:selected").html();
                        exportTableToExcel('tblData', reportName);
                    }
                });
            }else $("#dataRecords").html('');
        }
    });
});
$("#dashboardReport").on('click',function(e) {
    var paramdata = {
        date1: $("#dDt1").val(),
        date2: $("#dDt2").val()
    };
    $("#dataDashboardRecords1 , #dataDashboardRecords2 , #dataDashboardRecords3 ,  #dataDashboardRecords4").html('');
    $.ajax({
        url: "downloadDashboardReport",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                var ObjRes = JSON.parse(resultData);
                var htmlRes = '';
                $.each(ObjRes.qry1Res, function (i , val){
                    htmlRes += "<tr><th>"+val.food+"</th><th>"+val.countFood+"</th></tr>";
                });
                $("#dataDashboardRecords1").html(htmlRes);
                var ttl = Object.keys(ObjRes.qry1Res).length - 1;
                $.each(ObjRes.qry1Res, function (ic , val){
                    if(ttl == ic) qry3report(ObjRes);
                });
            }else{
                $("#dataDashboardRecords1").html('');
            }
        }
    });
});

$("#vendorwiseLunchDinnerReport").on('click',function(e) {
    var paramdata = {
        date1: $("#dlt1").val(),
        date2: $("#dlt2").val()
    };
    $("#datavendorwiseLunchDinnerRecords").html('');
    $.ajax({
        url: "downloadvendorwiseLunchDinnerReport",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                var ObjRes = JSON.parse(resultData);
                var htmlRes = '';
                $.each(ObjRes, function (i , val){
                    var slot = val.foodSlot;
                    htmlRes += "<tr><th>"+val.fdate+"</th><th>"+slot.split(':')[1]+"</th><th>"+val.vendor+"</th><th>"+val.fCount+"</th></tr>";
                });
               
                $("#datavendorwiseLunchDinnerRecords").html(htmlRes);
                var ttl = Object.keys(ObjRes).length - 1;
                $.each(ObjRes, function (ic , val){
                    if(ttl == ic) {
                        var reportName = "foodVendorReport-frm:"+$("#dlt1").val()+"-to:"+$("#dlt2").val();
                        exportTableToExcel('tblvendorWiseLunchDinnerData', reportName);
                    }
                });
            }else{
                $("#datavendorwiseLunchDinnerRecords").html('');
            }
        }
    });
});

function qry3report(ObjRes) {
    var htmlRes = '';
    $.each(ObjRes.qry3Res, function (i , val){
        htmlRes += "<tr><th>"+val.comp+"</th><th>"+val.countFood+"</th></tr>";
    });
    $("#dataDashboardRecords2").html(htmlRes);
    var ttl = Object.keys(ObjRes.qry3Res).length - 1;
    $.each(ObjRes.qry3Res, function (ic , val){
        if(ttl == ic) qry4report(ObjRes);
    });
}
function qry4report(ObjRes) {
    var htmlRes = '';
    $.each(ObjRes.qry4Res, function (i , val){
        htmlRes += "<tr><th>"+val.timeInterval+"</th><th>"+val.countFood+"</th></tr>";
    });
    $("#dataDashboardRecords3").html(htmlRes);
    var ttl = Object.keys(ObjRes.qry4Res).length - 1;
    $.each(ObjRes.qry4Res, function (ic , val){
        if(ttl == ic) qry2report(ObjRes);
    });
}
function qry2report(ObjRes) {
    var htmlRes = '';
    $.each(ObjRes.qry2Res, function (i , val){
        htmlRes += "<tr><th>Total Count"+val.totalCount+"</th></tr>";
    });
    $("#dataDashboardRecords4").html(htmlRes);
    var ttl = Object.keys(ObjRes.qry4Res).length - 1;
    $.each(ObjRes.qry4Res, function (ic , val){
        if(ttl == ic){
            var reportName = "dashboardreport-frm:"+$("#dt1").val()+"-to:"+$("#dt2").val();
            exportTableToExcel('tblDashboardData', reportName);
        }
    });
}