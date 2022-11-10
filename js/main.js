try {
	var grids = parseGridData(decodeURIComponent(document.cookie).split(';'));
} catch (e) {
	var grids = {};
}
var state = null;
var countdownInterval;
var video_link = false;
var spam = false;

function selectCell(e) {
    if (e.srcElement.innerHTML) {
        // display
        e.srcElement.classList.toggle("selected");
    	// cookie
        if (e.srcElement.classList.contains("selected")) {
            grids[e.srcElement.innerHTML] = true;
        } else if (typeof(grids[e.srcElement.innerHTML]) != "undefined") {
            delete grids[e.srcElement.innerHTML];
        }
        let d = new Date();
        d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = "grids=" + JSON.stringify(grids) + ";expires=" + d.toUTCString() + ";path=/";
    }
}


function mainCourse() {
    const ecartons = document.querySelectorAll('.rightConteneur .cartons');
    const ebuzz = document.querySelector('.buzzButton');

    const eroamer = document.querySelector("#roamer");
    const eroamerimg = document.querySelector("#roamer img");

    eroamer.style.display = "none";

    // check
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
        if (xhr.status == 403) {
    		console.log("System Error Fatal Dead Kick");
        } else {
            let data = JSON.parse(xhr.response);
            for (i in data) {
	    		generateGrid((parseInt(i) + 1), data[i]);
	        }
		    const ecellules = document.querySelectorAll('.rightConteneur .cartons tr th a');
			ecellules.forEach((element) => {
				element.addEventListener('click', selectCell);
		    });
        }
    });
    xhr.addEventListener('error', () => {
    	console.log("System Error Fatal Dead Kick");
    });
    xhr.open("GET", "/check", true);
    xhr.send();

	getStatus();
    const beat = window.setInterval(getStatus, 3000);
    ebuzz.addEventListener('click', buzz);
}

function buzz(e) {
    if (state.status != "started") return false;
    let el = e.srcElement.querySelector('a');
    if (!el) el = e.srcElement;

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
		let data = xhr.response;
    	if (xhr.status == 200 && (data === 1 || data === "1")) {
    		el.classList.add("shake-opacity");
    	} else {
    		el.innerHTML = "c'est <br> perdu";
    	}
        setTimeout(() => {
    		el.classList.remove("shake-opacity");
			el.innerHTML = "c'est <br> gagné";
        }, 8000);
    });
    xhr.addEventListener("error", () => {
		el.innerHTML = "c'est <br> perdu";
        setTimeout(() => {
			el.innerHTML = "c'est <br> gagné";
        }, 8000);
    });
    xhr.open("GET", "/grid/validate", true);
    xhr.send();
    e.preventDefault();
    e.stopPropagation();
}

function generateGrid(index, data) {
    const carton = document.querySelector('.rightConteneur .cartons.carton'+index);

    carton.setAttribute("data-id", data.id);
    carton.innerHTML = "";
    let inHtml = "";
    for (let i in data.grid) {
        inHtml += "<tr>";
        for (let j in data.grid[i]) {
            let filled = "";
            if (data.grid[i][j] && data.grid[i][j] != "null") {
            	content = parseInt(data.grid[i][j]);
            	filled = ' class="fill"';
            } else {
            	content = "";	
            }
            let bordered = "";
            if (typeof(grids[content]) != "undefined") {
                bordered = ' class="selected"';
            }
            inHtml += '<th' + filled + '><a' + bordered + '>' + content + '</a></th>'
        }
        inHtml += "</tr>";
	}
	carton.innerHTML = inHtml;
}

function parseGridData(gridData) {
	for (var i = 0; i < gridData.length; i++) {
	    var c = gridData[i];
	    while (c.charAt(0) == ' ') {
	        c = c.substring(1);
	    }
	    if (c.indexOf("grids") == 0) {
	        gridData = c.substring("grids".length + 1, c.length);
	    }
	}
	if (!gridData || gridData.length == 1 || gridData.length == 0) {
	    return {};
	} else {
	    return JSON.parse(gridData);
	}
}

function getStatus() {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
    	if (xhr.status == 200) {
            let now = new Date();
            let date = null;
            const embed = document.querySelector("#embed");
            let data = JSON.parse(xhr.response);
            if (video_link != data.link) {
                if (data.link.indexOf('twitch') > -1) {
                    embed.innerHTML = "";
                    let channelName = data.link.split('.tv/').pop().split("/").shift();
                    new Twitch.Embed("embed", {
                        width: "100%",
                        height: "100%",
                        layout: "video",
                        channel: channelName,
                    });
                } else {
                    embed.innerHTML = '<iframe class="live" src="' + data.link + '" width="100%" poster="images/live.jpg" frameborder="0" autoplay allowfullscreen="false" mozallowfullscreen="false" msallowfullscreen="false" oallowfullscreen="false" webkitallowfullscreen="false"></iframe>';
                }
                video_link = data.link;
            }

            const esection = document.querySelector("#section");
            const elogo = document.querySelector("#roamer");
            if (data.spam && typeof(data.spam.id) != "undefined") {
            	if (!spam || (spam.id != data.spam.id)) {
                    spam = data.spam;
                    elogo.removeEventListener('click', unroam);
                    elogo.style.background = "red";
                    roam();
            	}
            } else {
            	if (spam && typeof(spam.id) != "undefined") {
                  elogo.removeEventListener('click', unroam);
                  elogo.style.background = "red";
                  esection.style.display = "none";
                  elogo.style.display = "none";
            	}
            }
        	spam = data.spam;

            if (data.current) {
            	const elastNum = document.querySelector("#lastNum");
            	elastNum.innerHTML = data.current;
            }

            state = data;
    	} else {
    		console.log("System Error Fatal Dead Kick");
    	}
    });
    xhr.addEventListener("error", () => {
    	console.log("System Error Fatal Dead Kick");
    });
    xhr.open("GET", "/state.json", true);
    xhr.send();
}

function dateDiff(date1, date2) {
    var diff = {} // Initialisation du retour
    var tmp = date2 - date1;
    tmp = Math.floor(tmp / 1000); // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60; // Extraction du nombre de secondes
    tmp = Math.floor((tmp - diff.sec) / 60); // Nombre de minutes (partie entière)
    diff.min = tmp % 60; // Extraction du nombre de minutes
    tmp = Math.floor((tmp - diff.min) / 60); // Nombre d'heures (entières)
    diff.hour = tmp % 24; // Extraction du nombre d'heures
    tmp = Math.floor((tmp - diff.hour) / 24); // Nombre de jours restants
    diff.day = tmp;
    return diff;
}

window.addEventListener('load', mainCourse);
