function Init(parameterName){
    //document.documentElement.style.overflowY = 'hidden';
    
    var result = null;
    tmp = [];
    var items = location.search.substr(1).split("&");
    for(var index = 0;index<items.length;index++){
	tmp = items[index].split("=");
	if(tmp[0]===parameterName)
	    result = decodeURIComponent(tmp[1]);
    }
    document.getElementById("pid").innerHTML = "PID : " + result;
    var sc = new WebSocket("ws://127.0.0.1/websocket");
    sc.onopen = function(e){
    	sc.send('memory_map '+result);
    }
    sc.onmessage = function(event){
	var ParsedData = ParseMaps(event.data);
	
	drawTable(ParsedData);
	drawGraphic(ParsedData);
    }
}


function tab(){
    if(document.getElementById("tab").innerHTML==="▼"){
	document.getElementById("graph").height = length*42;
	document.getElementById("graph").width = 360;
	document.getElementById("graph").style.visibility = "visible";
	//document.documentElement.style.overflowY = "visible";
	document.getElementById("tab").innerHTML="▲";
    }
    else{
	document.getElementById("graph").height = 1;
	document.getElementById("graph").width = 1;
	document.getElementById("graph").style.visibility = "hidden";
	//document.documentElement.style.overflowY = "hidden";
	document.getElementById("tab").innerHTML="▼";
    }
}

function drawGraphic(ParsedData){
    var PFG = ParsingForGraphics(ParsedData);
    var canvas = document.getElementById("canvas");
    
    canvas.height = (PFG.length * 50) + 50;

    var ctx = canvas.getContext("2d");
    
    var rgb = [0,0,0];
    for(var i=0;i<PFG.length;i++){
	var index = i%3;
	rgb[index] = 200;

	ctx.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
   	ctx.fillRect(10,10+(i*50),230,50);

	ctx.font = "15px malgun gothic";
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillText(PFG[i][0],15,40+(i*50));
	
	ctx.font = "20px malgun gothic";
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillText(PFG[i][PFG[i].length-1],250,40+(i*50));
	
	rgb[index] = 0;
    }
}

function ParsingForGraphics(ParsedData){
    var tmp = ParsedData[0][ParsedData[0].length-1].split('/');
    var cmd = tmp[tmp.length-1];
    var target = [cmd,"[stack]","[heap]"];
    var result = new Array();
    var etc = new Array();
    for(var i=0;i<ParsedData.length;i++){
	var line = ParsedData[i];
        var exist = false;
	for(var j=0;j<3;j++){
	    var path = line[line.length-1].split('/');
	    if(path[path.length-1] === target[j]){
		if(etc.length){
		    result.push(etc);
		    etc = [];
		}
		result.push(line);
		exist = true;
	    }
	}
	if(!exist){
	    if(!etc.length){
		for(var j=0;j<line.length;j++){
		    etc[j] = line[j];
		}
		etc[etc.length-1] = "etc";
	    }
	    else{
		var bef_mem = etc[0].split('-');
		var cur_mem = line[0].split('-');
		var update = bef_mem[0] + "-" + cur_mem[1];
		etc[0] = update;
	    }
	}
    }
    if(etc.length){
	result.push(etc);
    }
    return result;
}

function drawTable(ParsedData){
    var length = ParsedData.length;
    console.log(length);
    document.getElementById("graph").height  = length*42;
    document.getElementById("graph").width = 360;
    var str = "";
    for(var i=0;i<length;i++){
	var line = ParsedData[i];	
	str = str + '<tr>'
	      + '<td width="180px" height="40px" style="border:1px solid black; text-align:center;">'
	      + line[0]
	      + '</td>'
	      + '<td width="180px" height="40px" style="border:1px solid black; text-align:center:">'
	      + line[line.length-2] + " " + line[line.length-1]
	      + '</td>'
	      + '</tr>';
    }
    document.getElementById("body").innerHTML = str;
}

function logging(data){
    for(i=0;i<data.length;i++){
	var line = data[i];
	var str = i + "-----";
	for(var j=0;j<line.length;j++){
	    str = str + j + " : " ;
	    str = str + line[j];
	    str = str + " ";
	}
	console.log(str);
    }
}

function ParseMaps(data){
    var parse = data.split('\"');
    var output = parse[7].split('\n');
    var Parsed = new Array();
    var i;
    for(i=0;i<output.length;i++){
	var line = output[i].split(' ');
	if(line.length>6){
	    Parsed.push(line);
	    break;
	}
    }
    for(;i<output.length;i++){
	var line = output[i].split(' ');
	var memory = line[0].split('-');

	var bef_line = Parsed[Parsed.length-1];
	var bef_memory = bef_line[0].split('-');	
	if(line[line.length-1] == bef_line[bef_line.length-1]){
	    bef_memory[1] = memory[1];
	    var update = bef_memory[0]+"-"+bef_memory[1];
	    Parsed[Parsed.length-1][0] = update;
	}
	else{
	    if(line.length>6){
		Parsed.push(line);
	    }
	}
    }
    return Parsed;
}
