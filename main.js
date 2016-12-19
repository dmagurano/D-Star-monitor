var socketId;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('app.html', {
  	id: "mainwin",
    innerBounds: {
      width: 380,
      height: 600
    }
  },function(win) {
	  win.onClosed.addListener(function() {
			//console.log('onclosed');
			chrome.sockets.udp.send(socketId, str2ab("bye"),
			'xreflector.ddns.net', 10001, function(sendInfo) {
			  console.log("bye sent");
		  });
	  });
});
  
  
});

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