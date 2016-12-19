var socketId;

callsign = document.getElementById('callsign');
onair = document.getElementById('onair');
lastheard = document.getElementById('lastheard');
module = document.getElementById('module');
profileimg = document.getElementById('profile');
module2 = document.getElementById('module2');


var idleText = 'Idle <img src="yellow.png" style="width:28px;height:28px;margin-bottom: 5px;">';
var onairText = 'On Air <img src="green.png" style="width:28px;height:28px;margin-bottom: 5px;">';
var noCallsign = "------";
var noLastheard = "Last Heard on: --:--:--";
var modulesLoaded = false;

function reset(){
	onair.innerHTML = idleText;
	callsign.innerHTML = noCallsign;
	lastheard.innerHTML = noLastheard;
	profileimg.src = "nobody.png";
	module2.innerHTML = "-";
	if(module.value != "ALL"){
		$("#modtable").hide();
	}
}

reset(); //first time reset

// Handle the "onReceive" event.
var onReceive = function(info) {
 // if (info.socketId !== socketId)
    //return;
	
   var received = ab2str(info.data);
   packet = JSON.parse(received);
   
   // console.log(packet);
   
   
   if(packet.modules != undefined && modulesLoaded == false){
	    var option = document.createElement("option");
		option.text = "ALL";
		module.add(option);
		
	    for(var i=0; i < packet.modules.length; i++){
		   option = document.createElement("option");
		   option.text = packet.modules[i];
		   module.add(option);
	    }
	   
	    module.value = "B";
	    modulesLoaded = true;
	    module.addEventListener('change', onChange, false);
   }
   
   
   if(packet.stations != undefined)
   {
	   if(callsign.innerHTML != '')
	   {
		   for(var i=0; i<packet.stations.length; i++)
		   {
			   if(packet.stations[i].callsign == callsign.innerHTML)
			   {
				   lh = new Date(packet.stations[i].time);
				   lastheard.innerHTML = "Last Heard on: " + lh.toTimeString().slice(0,8);
				   break;
			   }
		   }
	   }
	}
   
   if(packet.onair != undefined){
	   if(packet.module == module.value || module.value == "ALL"){ 
		   onair.innerHTML = onairText;
		   callsign.innerHTML = packet.onair;
		   var nd = new Date();
		   lastheard.innerHTML = "Last Heard on: " + nd.toTimeString().slice(0,8);
		   module2.innerHTML = packet.module;
		   module2.innerHTML = packet.module;
		   
		   $.get('https://www.qrz.com/db/' + callsign.innerHTML , function(data, status) { // get the page with the images
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(data, "text/html");  //turn it into a dom

				var img = xmldoc.getElementById('mypic'); //get the img tags
				if(img != undefined){
					var xhr = new XMLHttpRequest();
					xhr.open('GET', img.src, true);
					xhr.responseType = 'blob';
					xhr.onload = function(e) {
						  var img2 = document.createElement('img');
						  img2.src = window.URL.createObjectURL(this.response);
						  if(onair.innerHTML == onairText){
							  profileimg.src = img2.src;
						  }
					};
					xhr.send();
				} else {
					profileimg.src = "nobody.png";
				}

			}, 'html');
		   
	   }
   }
   
   if(packet.offair != undefined){
	   if(packet.offair == callsign.innerHTML){
		   onair.innerHTML = idleText;
		   profileimg.src = "nobody.png";
	   }
   }
  
   
};

// Create the Socket
chrome.sockets.udp.create({bufferSize:20000}, function(socketInfo) {
  socketId = socketInfo.socketId;
  // Setup event handler and bind socket.
 chrome.sockets.udp.onReceive.addListener(onReceive);
   
  chrome.sockets.udp.bind(socketId,
    "0.0.0.0", 0, function(result) {
      if (result < 0) {
        console.log("Error binding socket.");
        return;
      }
      chrome.sockets.udp.send(socketId, str2ab("startm"),
        'xreflector.ddns.net', 10001, function(sendInfo) {
          console.log("hello sent");
      });
  });
});

chrome.runtime.getBackgroundPage(function(bgpage) {
   bgpage.socketId = socketId;

});

document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
	//AdMob.createBanner({ 
	//  adId:'ca-app-pub-2396903825194434/5741417907', 
	// position:AdMob.AD_POSITION.BOTTOM_CENTER, 
	//  autoShow:true 
	//});
}

function onPause() {
    chrome.sockets.udp.send(socketId, str2ab("bye"),
			'xreflector.ddns.net', 10001, function(sendInfo) {
			  console.log("bye sent");
		  });
}


function onResume() {
    chrome.sockets.udp.send(socketId, str2ab("startm"),
        'xreflector.ddns.net', 10001, function(sendInfo) {
          console.log("hello sent");
      });
	  
	reset();
	  
	
}


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(string) {
    var arrayBuffer = new ArrayBuffer(string.length);
    var buffer = new Uint8Array(arrayBuffer);
    for (var i = 0, stringLength = string.length; i < stringLength; i++) {
        buffer[i] = string.charCodeAt(i);
    }
    return arrayBuffer;
}

function onChange(){
	reset();
	if(module.value == "ALL"){
		$("#modtable").show();
	}
	
}




