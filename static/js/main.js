$(".l3").hide();
$("#nav1").hide();

function addTimer(){
    var name = prompt("What would you like to name this timer?")
    var html = '<div class="s timer" stopped="true">\
                        <span class="name">'+name+'</span> <br>\
                        <input class="form-control ti tm" placeholder="mm"> : <input class="form-control ti ts" placeholder="ss"> <br><br>\
                        <a href="#" class="btn btn-primary btn-sm" onclick="sT($(this))">Start</a>\
                    </div>'
    $(html).insertAfter("#conf")
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
                    //ToDo: Play sound
                    
                    
                } else {
                    //count down minutes
                    $(".ts",this).text("60")
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
    var done = $(".done", goal);
    var total = $(".total", goal);
    
}

function gP(e){
    gCommon(e)
}

function gM(e){
    
}



setInterval(updateTime, 1000)