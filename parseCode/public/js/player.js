(function localFileAudioPlayerInit(win) {
    var URL = win.URL || win.webkitURL,
    displayMessage = (function displayMessageInit() {
        var node = document.querySelector('#message');
	
        return function displayMessage(message, isError) {
            node.innerHTML = message;
            node.className = isError ? 'error' : 'info';
        };
    }()),
    playSelectedFile = function playSelectedFileInit(event) {
	for(var i = 0; i < this.files.length; i++){
	    var file = this.files[i];
	    console.log(file);
	}
	var file = this.files[0];
		
        var type = file.type;

        var audioNode = document.querySelector('audio');

        var canPlay = audioNode.canPlayType(type);
	
        canPlay = (canPlay === '' ? 'no' : canPlay);
	
        var message = 'Can play type "' + type + '": ' + canPlay;

        var isError = canPlay === 'no';
	
        displayMessage(message, isError);
	
        if (isError) {
            return;
        }
	
        var fileURL = URL.createObjectURL(file);
	
        audioNode.src = fileURL;
    },
    inputNode = document.querySelector('input');
    if (!URL) {
        displayMessage('Your browser is not ' + 
		       '<a href="http://caniuse.com/bloburls">supported</a>!', true);
        return;
    }                
    inputNode.addEventListener('change', playSelectedFile, false);
}(window));
