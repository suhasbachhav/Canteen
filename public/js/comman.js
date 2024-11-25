var quality = 60;
var timeout = 10;
let select ='<option value="0">-Select-</option>';

function showlastEntries(){
    $("#lastEntries , #dataRecords").html("");
    $.ajax({
        url: "todaysRecords",
        method: "GET",
        ContentType: 'application/json',
        success: function(ObjRes) {
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
            url: "pizza",
            method: "GET",
            ContentType: 'application/json',
            success: function(ObjRes) {
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
function pieChartData() {
    var dayWise = $('#dayWisePichart');
    var weekWise = $('#weekWisePichart');
    var monthWise = $('#monthWisePichart');
    var backgroundColor = new Array('rgba(255, 99, 132, 0.5)','rgba(54, 162, 235, 0.5)','rgba(255, 206, 86, 0.5)','rgba(0, 230, 64, 0.5)','rgb(255,0,255,0.5)','rgb(139,0,0,0.5)');
    var backgroundColor = new Array('rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(0, 230, 64, 1)','rgb(255,0,255,1)','rgb(139,0,0,1)');
    var qryDayResLabel = new Array();
    var qryDayResCount = new Array();
    var qryWeekResLabel = new Array();
    var qryWeekResCount = new Array();
    var qryMonthResLabel = new Array();
    var qryMonthResCount = new Array();
    
    $.ajax({
        url: "reports",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            for(var k in resultData.qryDayRes) {
                qryDayResLabel.push(resultData.qryDayRes[k].food);
                qryDayResCount.push(resultData.qryDayRes[k].countFood);
            }
            for(var j in resultData.qryWeekRes) {
                qryWeekResLabel.push(resultData.qryWeekRes[j].food);
                qryWeekResCount.push(resultData.qryWeekRes[j].countFood);
            }
            for(var l in resultData.qryMonthRes) {
                qryMonthResLabel.push(resultData.qryMonthRes[l].food);
                qryMonthResCount.push(resultData.qryMonthRes[l].countFood);
            }
            var dayWisePichart = new Chart(dayWise, {
                type: 'doughnut',
                data: {
                    labels: qryDayResLabel,
                    datasets: [{
                        label: '# of Votes',
                        data: qryDayResCount,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        borderWidth: 1
                    }]
                },
            });


            var weekWisePichart = new Chart(weekWise, {
                type: 'doughnut',
                data: {
                    labels: qryWeekResLabel,
                    datasets: [{
                        label: '# of Votes',
                        data: qryWeekResCount,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        borderWidth: 1
                    }]
                },
            });

            var monthWisePichart = new Chart(monthWise, {
                type: 'doughnut',
                data: {
                    labels: qryMonthResLabel,
                    datasets: [{
                        label: '# of Votes',
                        data: qryMonthResCount,
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        borderWidth: 1
                    }]
                },
            });
        },
        error: function(err) {
            console.log(err);
        }
    });
}
setInterval(function(){ 
    pieChartData();
}, 300 * 1000); 
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
    $.ajax({
        url: `pizza/${$(this).data('srno')}/1`,
        method: "PUT",
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
    $.ajax({
        url: `pizza/${$(this).data('srno')}/2`,
        method: "PUT",
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
        url: "food",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            $("#entryFood").attr("disabled", false);
            showlastEntries();
            $("#lastenterUser").html();
            $("#empFoodId").val();
            if (resultData == "Invalid User") alert("Please enter Valid Employee Id!");
            else if (resultData =="Allready Food Serve") alert("You have allready taken food today");
            else {
                if(resultData){
                    var text = resultData.username+" is added for the "+resultData.foodType+" of the Day";
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
    $("#employeeDeactivateReport").removeClass("hidden")
    $.ajax({
        url: `employee/${$("#deactivateEmpId").val()}`,
        method: "PUT",
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "Updated"){  
                $("#employeeDeactivateReport").addClass("hidden")
                alert("Employee Updated Succesfully");
            }else alert("Something is wrong, Please refresh and try again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#empFoodReport").on('click',function(e) {
    var currDate = new Date();
    var fDate = new Date($("#empdt1").val());
    var tDate = new Date($("#empdt2").val());
    if(!$("#empdt1").val()){
        alert("Please enter Start date");
        return;
    }else if(!$("#empdt2").val()){
        alert("Please enter End date");
        return;
    }else if(currDate < fDate || currDate < tDate){
        alert("Date should be past Date!");
        return;
    }else if(fDate > tDate){
        alert("Please enter End date is greater than start Date!");
        return;       
    }
    $("#dataRecords").html('');
    $("#employeeReportLoader").removeClass("hidden")
    $.ajax({
        url: `reports/${$("#empdt1").val()}/${$("#empdt2").val()}/${$("#empWiseReport").val()}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(ObjRes) {
            if(ObjRes){
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
                        $("#employeeReportLoader").addClass("hidden");
                    }
                });
            }else{
                $("#dataEmpFoodRecords").html('');
                $("#employeeReportLoader").addClass("hidden");
                alert("Data not available for selection criteria");
            }
        }
    });
});
$("#employeeListReport").on('click',function(e) {
    $("#dataEmpRecords").html('');
    $("#employeeListLoader").addClass("hidden");
    $.ajax({
        url: `reports/${$("#empCompWise").val()}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(ObjRes) {
            if(ObjRes){
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
                        $("#employeeListLoader").addClass("hidden");
                    }
                });
            }else{
                $("#dataEmpRecords").html('');
                $("#employeeListLoader").addClass("hidden");
                alert("Data not available for selection criteria");
            }
        }
    });
});
$("#vendorWise").change(function() {
    $.ajax({
        url: `vendor/${$(this).val()}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            resultData = resultData[0];
            if(resultData){
                $("#updateVendorName").val(resultData.vendor);
                $("#updateVendorUserName").val(resultData.username);
                $("#updateVendorEmail").val(resultData.email);
                $("#foodVendorType").val(resultData.foodservice);
                $("#foodVendorStatus").val(resultData.status); 
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
        name: $("#updateVendorName").val(),
        userName: $("#updateVendorUserName").val(),
        pass: $("#updateVendorNewPass").val(),
        email: $("#updateVendorEmail").val(),
        type: $("#foodVendorType").val(),
        status: $("#foodVendorStatus").val()
    };
    $.ajax({
        url: `vendor/${$("#vendorWise").val()}`,
        method: "PUT",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData.affectedRows) alert("User Updated Succesfully");
            else alert("Please refresh and check again");
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
        name: $("#updateVendorName").val(),
        userName: $("#updateVendorUserName").val(),
        pass: $("#updateVendorNewPass").val(),
        email: $("#updateVendorEmail").val(),
        type: $("#foodVendorType").val(),
        status: $("#foodVendorStatus").val()
    };
    $.ajax({
        url: "vendor",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData) {
                alert("Vendor Added Succesfully");
                location.reload();
            } else 
                alert("Please refresh and check again");
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
    $.ajax({
        url: "company",
        method: "POST",
        data: {
            name: $("#updateCompanyName").val()
        },
        ContentType: 'application/json',
        success: function(res) {
            alert(res.affectedRows ? "Company created Succesfully" : "Please refresh and check again");
            getCompany();
            $("#updateCompanyName").val('');
        },
        error: function(err) {
            alert('Company not created');
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
        name: $("#updateCompanyName").val(),
        id: $("#companyDropdwn").val()
    };
    $.ajax({
        url: `company/${paramdata.name}/${paramdata.id}`,
        method: "PUT",
        ContentType: 'application/json',
        success: function(res) {
            alert(res.affectedRows ? "Company Updated Succesfully" : "Please refresh and check again");
            $("#updateCompanyName").val('');
            getCompany();
        },
        error: function(err) {
            alert('Company not Updated');
        }
    });
});
$("#addDepartmentBtn").click(function() {
    if ($("#updateDepartmentName").val() == '') {
        alert("Please enter Company Name");
        return;
    }
    var paramdata = {
        deptName: $("#updateDepartmentName").val()
    };
    $.ajax({
        url: "departments",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            alert(resultData.affectedRows ? "Department created Succesfully" : "Please refresh and check again");
            $("#updateDepartmentName").val('');
            getDepartment();
        },
        error: function(err) {
            alert('Department not created');
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
    var deptParam = {
        name: $("#updateDepartmentName").val(),
        id: $("#departmentDropdwn").val()
    };
    $.ajax({
        url: `departments/${deptParam.name}/${deptParam.id}`,
        method: "put",
        ContentType: 'application/json',
        success: function(res) {
            alert(res.affectedRows ? "Department Updated Succesfully" : "Please refresh and check again");
            $("#updateDepartmentName").val('');
            getDepartment();
        },
        error: function(err) {
            alert('Department not Updated');
        }
    });
});
$(document).ready(function() {
	pieChartData();
    var d = new Date(); // for now
    var hr = d.getHours(); // => 9
    var min = d.getMinutes(); // =>  30
    if(hr == 12 && min < 5){
        sessionStorage.clear();
    }

    setInterval(function(){ 
        if($("#foodService").val() == 0) showlastEntries();    
    }, 300 * 1000);
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
        url: "vendor",
        method: "GET",
        data: '',
        ContentType: 'application/json',
        success: function(resultData) {
            const result = resultData.map((val)=>{
                return `<option value="${val.id}">${val.vendor}</option>`
            })
            var html ='<option value="0">---SELECT Vendor---</option>';
            $("#vendorWise").html(html+result);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "food",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            var html ='<option value="">-SELECT-</option>';

            const result = resultData.map((val)=>{
                return '<option value="'+val.id+'">'+val.foodType+'</option>';
            });
            $("#foodVendorType").html(html + result);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "vendor",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            let html ='';
            if(Object.keys(resultData).length){
                html ='<option value="0">---ALL---</option>';
            }
            const result = resultData.map((val)=>{
                return `<option value="${val.id}">${val.vendor}</option>`
            })
            $("#foodVendorList").html(html+result);
        },
        error: function(err) {
            console.log(err);
        }
    });
    $.ajax({
        url: "session",
        method: "GET",
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
        url: "employee",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            let html = resultData.map((val)=>{
                return '<input type="hidden" class="ISOdata isoClass-'+val.department+'" id="emp-'+val.emp_id+'" value="'+val.ISOdata+'" data-department="'+val.department+'"/>';
            })
            $("#isoDataDiv").html(html);
        },
        error: function(err) {
            console.log(err);
        }
    });
});
function getDepartment(){
    $.ajax({
        url: "departments",
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            let departmentDropDown = resultData.map((val)=>{
                return '<option value="'+val.id+'">'+val.dept_name+'</option>'
            })
            $("#empDept, #empDeptFood, #departmentDropdwn").html(select+departmentDropDown);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
function getCompany(){
    $.ajax({
            url: "company",
            method: "GET",
            ContentType: 'application/json',
            success: function(resultData) {
                const htmlDropDown = resultData.map((val)=>{
                    return "<option value='"+val.compID+"'>"+val.comp_name+"</option>"
                })
                const html ="<option value=''>---SELECT---</option>";
                const htmlCompWise ="<option value='0'>---ALL---</option>";
                $("#empComp").html(html + htmlDropDown);
                $("#companyDropdwn").html(htmlDropDown);
                $("#empCompWise").html(htmlCompWise + htmlDropDown);
            },
            error: function(err) {
                console.log(err);
            }
        });

}
$("#empId").on('change',function(e) {
    if($(this).val().length > 2){
        $.ajax({
            url: `employee/${$(this).val()}`,
            method: "GET",
            ContentType: 'application/json',
            success: function(ObjData) {
                if(ObjData){
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
        url: "employee",
        method: "POST",
        data: paramdata,
        ContentType: 'application/json',
        success: function(resultData) {
            if (resultData == "User Allready exist") {
                alert("User Allready Exist!");
            } else if (resultData.existing) {
                alert("User Updated Succesfully");
                location.reload();
            }else if (resultData.affectedRows) {
                alert("User Added Succesfully");
                location.reload();
            } else  alert("Please refresh and check again");
        },
        error: function(err) {
            console.log(err);
        }
    });
});
$("#monthlyReport").on('click',function(e) {
    var currDate = new Date();
    var fDate = new Date($("#dt1").val());
    var tDate = new Date($("#dt2").val());
    if(!$("#dt1").val()){
        alert("Please enter Start date");
        return;
    }else if(!$("#dt2").val()){
        alert("Please enter End date");
        return;
    }else if(currDate < fDate || currDate < tDate){
        alert("Date should be past Date!");
        return;
    }else if(fDate > tDate){
        alert("Please enter End date is greater than start Date!");
        return;       
    }
    var paramdata = {
        date1: $("#dt1").val(),
        date2: $("#dt2").val(),
        foodvendorList: $("#foodVendorList").val(),
        mealType : $("#mealType").val()
    };
    $("#dataRecords").html('');
    $("#monthlyReportLoader").removeClass("hidden")
    $.ajax({
        url: `reports/${paramdata.date1}/${paramdata.date2}/${paramdata.mealType}/${paramdata.foodvendorList}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(resultData) {
            if(resultData){
                let htmlRes = resultData.map((val)=>{
                    return "<tr><th>"+val.empId+"</th><th>"+val.user_name+"</th><th>"+val.food+"</th><th>"+val.fooddate+"</th><th>"+val.companyName+"</th><th>"+val.foodVendor+"</th><th>"+val.timeInterval+"</th></tr>"
                })
                $("#dataRecords").html(htmlRes);
                var ttl = Object.keys(resultData).length - 1;
                $.each(resultData, function (ic , val){
                    if(ttl == ic){
                        var reportName = "foodreport-frm:"+$("#dt1").val()+"-to:"+$("#dt2").val()+"-for:"+$("#foodVendorList option:selected").html();
                        exportTableToExcel('tblData', reportName);
                        $("#monthlyReportLoader").addClass("hidden");
                    }
                });
            }else{
                $("#dataRecords").html('');  
                $("#monthlyReportLoader").addClass("hidden");
                alert("Data not available for selection criteria");
            } 
        }
    });
});
$("#dashboardReport").on('click',function(e) {
    var currDate = new Date();
    var fDate = new Date($("#dDt1").val());
    var tDate = new Date($("#dDt2").val());
    if(!$("#dDt1").val()){
        alert("Please enter Start date");
        return;
    }else if(!$("#dDt2").val()){
        alert("Please enter End date");
        return;
    }else if(currDate < fDate || currDate < tDate){
        alert("Date should be past Date!");
        return;
    }else if(fDate > tDate){
        alert("Please enter End date is greater than start Date!");
        return;       
    }
    $("#dataDashboardRecords1 , #dataDashboardRecords2 , #dataDashboardRecords3 ,  #dataDashboardRecords4").html('');
    $("#dashboardReportLoader").removeClass("hidden");
    $.ajax({
        url: `reports/${$("#dDt1").val()}/${$("#dDt2").val()}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(ObjRes) {
            if(ObjRes){
                var htmlRes = '';
                $.each(ObjRes.qry1Res, function (i , val){
                    htmlRes += "<tr><th>"+val.food+"</th><th>"+val.countFood+"</th></tr>";
                });
                $("#dataDashboardRecords1").html(htmlRes);
                var ttl = Object.keys(ObjRes.qry1Res).length - 1;
                $.each(ObjRes.qry1Res, function (ic , val){
                    if(ttl == ic) qry3report(ObjRes);
                });
                $("#dashboardReportLoader").addClass("hidden");
            }else{
                $("#dataDashboardRecords1").html('');
                $("#dashboardReportLoader").addClass("hidden");
                alert("Data not available for selection criteria");
            }
        }
    });
});

$("#vendorwiseLunchDinnerReport").on('click',function(e) {
    var currDate = new Date();
    var fDate = new Date($("#dlt1").val());
    var tDate = new Date($("#dlt2").val());
    if(!$("#dlt1").val()){
        alert("Please enter Start date");
        return;
    }else if(!$("#dlt2").val()){
        alert("Please enter End date");
        return;
    }else if(currDate < fDate || currDate < tDate){
        alert("Date should be past Date!");
        return;
    }else if(fDate > tDate){
        alert("Please enter End date is greater than start Date!");
        return;       
    }
    $("#datavendorwiseLunchDinnerRecords").html('');
    $("#vendorReportLoader").removeClass("hidden");
    $.ajax({
        url: `vendorReport/${$("#dlt1").val()}/${$("#dlt2").val()}`,
        method: "GET",
        ContentType: 'application/json',
        success: function(ObjRes) {
            if(ObjRes){
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
                        $("#vendorReportLoader").addClass("hidden");
                    }
                });
            }else{
                $("#datavendorwiseLunchDinnerRecords").html('');
                $("#vendorReportLoader").addClass("hidden");
                alert("Data not available for selection criteria");
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
            var reportName = "dashboardreport-frm:"+$("#dDt1").val()+"-to:"+$("#dDt2").val();
            exportTableToExcel('tblDashboardData', reportName);
        }
    });
}