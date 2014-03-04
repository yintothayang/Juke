window.onload = function(){
    $('#content').height(window.innerHeight - $('#main-header').outerHeight() -40);
    console.log("window.inner: " + window.innerHeight);
    console.log("window.outer: " + window.outerHeight);
    console.log("main-header.outer: " + $('#main-header').outerHeight());
    console.log("main-header.inner: " + $('#main-header').innerHeight());
    var showCodeDivs = document.getElementsByClassName('showcode');
    for (var i = showCodeDivs.length - 1; i >= 0; i--) {
	showCodeDivs[i].firstChild.onclick = function(e) {
	    var element = e.target.parentNode.nextSibling.nextSibling;
	    var style = window.getComputedStyle(element);
	    if(style.getPropertyValue('display') == 'none'){
		e.target.innerHTML = 'Hide code snippets';
		element.style.display = 'block';
	    } else {
		e.target.innerHTML = 'Show code snippets';
		element.style.display = 'none';
	    }
	    return false;
	};
    };
    var slideMenuButton = document.getElementById('slide-menu-button');
    slideMenuButton.onclick = function(e) {
	var site = document.getElementById('site');
	var cl = site.classList;
	if (cl.contains('open')) {
	    cl.remove('open');
	} else {
	    cl.add('open');
	}
    };
}

window.onresize = function(event) {
    $('#content').height(window.innerHeight - $('#main-header').outerHeight() -40);
}