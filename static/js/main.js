$(".l3").hide();
$("#nav1").hide();
$("#ptimer").hide();

var pomr = 0;
var autopom = true;
var audio;

setTimeout(function(){
    SC.initialize({
      client_id: 'cee27d0ebe60b52c3781ad18c64ccb31'
    });
}, 1000);

function addTimer(){
    var name = prompt("What would you like to name this timer?")
    var html = '<div class="s timer" stopped="true">\
                        <span class="name">'+name+'</span> <br>\
                        <input class="form-control ti tm" placeholder="mm"> : <input class="form-control ti ts" placeholder="ss"> <br><br>\
                        <a href="#" class="btn btn-primary btn-sm" onclick="sT($(this))">Start</a>\
                    </div>'
    
    $(html).insertAfter("#conf")
}

function startPom(){
   
    $("#ptimer").attr("stopped", "false");
    addPomTimer(2, "")
    $("#ptimer").slideDown();
}

function stopPom(){
    pomr = 0;
    $("#ptimer").attr("stopped", "true");
    $("#ptimer").slideUp();
    $("#yoga").slideDown()
}

function addPomTimer(min, n){
        if(min == 2){
            pomr += 1;
            $("#ptimer").attr("break","false")
            $("#yoga").slideUp()
        }
        var html = '<span class="name">Pomodora '+n+'Timer</span> <br>\
                        <span class="t"><span class="tm">'+min+'</span>:<span class="ts">00</span></span>'
        $("#ptimer").html(html)
}

function startPomBreak(){
    $("#ptimer").attr("break","true")
    $("#yoga").slideDown()
    if(pomr == 4){
        pomr = 0
        addPomTimer(3, "Extended Break ")
    } else {
        addPomTimer(1, " Break ")
    }
}



function updateTime(){
    var d = new Date();
    
    if(d.getHours() > 12){
        hours = d.getHours() - 12;   
    } else {
        hours = d.getHours();   
    }
    
    var sec =  d.getSeconds() + ""
    if(sec.length == 1){
        sec = "0" + sec;
    }
    
    var min =  d.getMinutes() + ""
    if(min.length == 1){
        min = "0" + min;
    }
    
    var s = hours+ ":" + min + ":" + sec;
    $("#dtime").text(s);
    
    $(".timer").each(function(){
        if($(this).attr("stopped") == "false"){
            var s = parseInt($(".ts",this).text()) - 1;
            if(s == -1){
                var m = parseInt($(".tm",this).text()) - 1;
                if(m == -1){
                    //end the timer
                    $(this).attr("stopped", "true")
                    var a = new Audio("audio/alarm.mp3")
                    a.volume = 1;
                    a.play();
                    $(this).addClass("done") //ToDo: Style
                    
                    if($(this).is("[id]")){ //Pom is done
                        
                        if(autopom == true){
                             $(this).attr("stopped", "false")
                            if($(this).attr("break") == "false"){
                                startPomBreak()
                            } else {
                                addPomTimer(2, "")
                            }
                        } else {
                            $(this).append('<br><br><a href="#" class="btn btn-success btn-xs lolol">Continue Timer</a>')
                            $(".lolol").click(function(){
                                $("#ptimer").attr("stopped", "false")
                                if($("#ptimer").attr("break") == "false"){
                                    startPomBreak()
                                } else {
                                    addPomTimer(2, "")
                                }
                            });
                            
                        }
                        
                    }
                    
                    
                } else {
                    //count down minutes
                    $(".ts",this).text("59")
                    if((m+"").length == 1){
                        $(".tm",this).text("0"+m)
                    } else {
                        $(".tm",this).text(m)   
                    }
                    
                }
                
                
                
            } else if((s+"").length == 1){
                $(".ts",this).text("0"+s)
            }else{
                $(".ts",this).text(s)
            }
                
            
        }
    })
    
}


function sT(e){
    var timer = $(e).parent();
    var name = $(".name", timer).val();
    var m = $(".tm",  timer).val();
    var s = $(".ts",  timer).val();
    
    if(m == ""){
        m = "00"   
    }
    
    if(s == ""){
        s = "59"   
    }
    
    if(m.length == 1){
        m = "0" + m   
    }
    
    if(s.length == 1){
        s = "0" + s   
    }
    
    $(timer).attr("stopped", "false")
    
    $(timer).attr("im", m)
    $(timer).attr("is", s)
    
    $(timer).html('<span class="name">'+name+'</span> <br>\
                        <span class="t"><span class="tm">'+m+'</span>:<span class="ts">'+s+'</span></span> <br><br>\
                        <a href="#" class="btn btn-warning btn-xs" onclick="stopT($(this)); retursn false">Stop Timer</a>')
}

function gCommon(e){
    var goal = $(e).parent().parent();
    var done = parseInt($(".done", goal).text());
    var total = parseInt($(".total", goal).text());
    
    return [goal, done, total]
}

function gP(e){
    var a = gCommon(e)
    var g = a[0];
    var done = a[1]+1
    
    var p = done / a[2] * 100;
    
    $(".progress-bar", g).css("width", p+"%")
    $(".done", g).text(done)
}

function gM(e){
    var a = gCommon(e)
    var g = a[0];
    var done = a[1]-1
     
    var p = done / a[2] * 100;

    $(".progress-bar", g).css("width",p+"%")
    $(".done", g).text(done)
}

function addGoal(){
    var goal = prompt("What is your goal?")
    var total = prompt("How many times do you want to do this goal?")
    
    html = '<div class="s goal"><div class="progress"><div class="progress-bar progress-bar-warning" style="width: 0%"></div></div>\
                        <span class="name">'+goal+'</span> <br><span class="prog"><span class="done">0</span> / <span class="total">'+total+'</span>\
                        </span><br><br><div class="btn-group"><a href="#" class="btn btn-danger" onclick="gM($(this))">-</a><a href="#" class="btn btn-success" onclick="gP($(this))">+</a></div></div>';
    
    $(html).insertAfter("#conf")
}

function saveC(){
    autopom = $("#autopom").is(':checked');
    $("#closeC").click();
}


function startMusic(){
    try{audio.pause();} catch(e){}
    var file = $("#songchoice").val();
    audio = new Audio("audio/"+file);
    audio.volume = .5;
    audio.play();
    
}


function doit(){
    console.log("Here")
    if($("#myonoffswitch").is(':checked')){
        startPom()   
    } else {
        stopPom()
    }
    
    return true;
}

function selPage(path){
    $("#content").html('<iframe id="mainframe" src="'+path+'" frameBorder="0"></iframe>')
}

function loadPom(){
    var html = '<div id="chold"><img src = "img/pomodoro1.png" id="pic"><p>Studies show that the human brain\'s concentration ability decreases by 50% after 30 minutes of studying. </p> <p>Use our built -in timer to keep your study sessions down to manageable sections of 25 minutes so that you\'ll always be working at your best! </p><p>The best part? Every hour, you get an extra long 15 minute break! Feel free to check out our relaxation page to distress during your breaks.</p>\
<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" onchange="doit()"><label class="onoffswitch-label" for="myonoffswitch"><span class="onoffswitch-inner"></span></label></div>'
    $("#content").html(html);
}

function logout(){
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
    	var cookie = cookies[i];
    	var eqPos = cookie.indexOf("=");
    	var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    	document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    
    document.location.reload();
}


setInterval(updateTime, 1000)