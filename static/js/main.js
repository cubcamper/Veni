$(".l3").hide();
$("#nav1").hide();

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
    
    var s = hours+ ":" + d.getMinutes() + ":" + sec;
    $("#dtime").text(s);
}

setInterval(updateTime, 1000)