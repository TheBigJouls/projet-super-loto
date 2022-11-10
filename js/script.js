var registered = false;
var chatid = 0;
var grids = decodeURIComponent(document.cookie).split(';');
for (var i = 0; i < grids.length; i++) {
    var c = grids[i];
    while (c.charAt(0) == ' ') {
        c = c.substring(1);
    }
    if (c.indexOf("grids") == 0) {
        grids = c.substring("grids".length + 1, c.length);
    }
}
if (!grids || grids.length == 1 || grids.length == 0) {
    grids = {};
} else {
    grids = JSON.parse(grids);
}
$(document).ready(function() {
    $('.bloc-grilles .grilles').click(function() {
        $(".cellules").off('click');
        $(this).find(".cellules").click(function() {
            var phtml = $(this).find("p").html();
            if (phtml) {
                if (!$(this).find("p").hasClass("border1")) {
                    grids[phtml] = true;
                } else if (typeof(grids[phtml]) != "undefined") {
                    delete grids[phtml];
                }
                var d = new Date();
                d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
                document.cookie = "grids=" + JSON.stringify(grids) + ";expires=" + d.toUTCString() + ";path=/";
                console.log(document.cookie);
                $(this).find("p").toggleClass("border1");
            }
        });
        $(".grilles.selected").removeClass("selected");
        $(".grilles.unselected").removeClass("unselected");
        fullGridScreen();
        $(this).addClass("padding");
        $(this).addClass("selected");
        $(".bloc-grilles .grilles:not(.selected)").addClass("unselected");
        $("#fermer-grille" + $(this).attr('data-pos')).show();
        $(this).addClass('focus' + $(this).attr('data-pos'));
    });
    $(".fermer-grilles").click(function() {
        fullGridScreen();
    });
    var beat = window.setInterval(getStatus, 6000);
    $.ajax({
        url: 'check',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            $(".form").hide();
            $("main").show()
            registered = true;
            for (i in data) {
                generateGrid((parseInt(i) + 1), data[i]);
            }
        },
        error: function(data) {
            $(".bloc-grilles").hide();
            $(".form").show()
        }
    });
    $("#submit").click(function() {
        var form = $('.registerform');
        $.ajax({
            url: 'register',
            type: 'POST',
            data: {
                "email": form.find('input[type="email"]').val(),
                "password": form.find('input[type="password"]').val(),
                "pseudo": form.find('input#pseudo').val(),
                "phone": form.find('input#phone').val(),
                "grecaptcha": grecaptcha ? grecaptcha.getResponse() : "",
            },
            dataType: 'json',
            success: function(data) {
                $(".form").hide();
                $("main").show()
                registered = true;
                for (i in data) {
                    generateGrid((parseInt(i) + 1), data[i]);
                }
            },
            error: function(data) {
                $(".form .notice").html('Le match va bientôt commencer, réessayez dans quelques instants');
            }
        });
    });
    $(".generate").click(function() {
        if (!registered || state.status != "started") return false;
        var par = $(this).parents(".grilles");
        var id = par.attr('data-id');
        $.ajax({
            url: 'grid/generate',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                par.attr('data-id', data.id);
                generateGrid(parseInt(id), data);
            },
            error: function(data) {
                $(".form").html('Une erreur est survenue');
            }
        });
    });
    $('.buzz').click(function() {
        if (!registered || state.status != "started") return false;
        var id = $('.selected').attr('data-id');
        $.ajax({
            url: 'grid/validate',
            type: 'POST',
            data: {
                "id": id
            },
            dataType: 'json',
            success: function(data) {
                if (data === 1) {
                    $('#buzz').attr('src', "images/BOUTON_BUZZ_SUCCESS.png")
                    $('#buzz_sound')[0].play();
                    $('.titre-manche').html("YOU WIN " + $('.titre-manche').html());
                } else {
                    $('#buzz').attr('src', "images/BOUTON_BUZZ_FAIL.png")
                    $('#buzz_lose_sound')[0].play();
                }
                window.setTimeout(function() {
                    $('#buzz').attr('src', "images/buzz.png")
                }, 2600);
            },
            error: function(data) {
                $('#buzz').attr('src', "images/BOUTON_BUZZ_FAIL.png")
                $('#buzz_lose_sound')[0].play();
                $(".form").html('Une erreur est survenue');
                window.setTimeout(function() {
                    $('#buzz').attr('src', "images/buzz.png")
                }, 2600);
            }
        });
    });
});
var state = null;

function generateGrid(index, data) {
    $('#grille' + index).attr("data-id", data.id);
    $('#grille' + index).html("");
    var count = 1;
    for (var i in data.grid) {
        for (var j in data.grid[i]) {
            if (data.grid[i][j] && data.grid[i][j] != "null") content = parseInt(data.grid[i][j]);
            else content = "";
            var bordered = "";
            if (typeof(grids[content]) != "undefined") {
                bordered = ' class="border1"';
            }
            $('#grille' + index).append('<div class="cellules item' + (count++) + '"><p' + bordered + '>' + content + '</p></div>');
        }
    }
}
$('.bloc-grilles').hide();
$('.bloc-wait').show();
$('.boutons').hide()

function fullGridScreen() {
    $(".grilles.unselected").removeClass("unselected");
    $(".focus1").removeClass('focus1');
    $(".focus2").removeClass('focus2');
    $(".focus3").removeClass('focus3');
    $(".grilles.selected").removeClass("selected");
    $(".grilles").removeClass("padding");
    $(".fermer-grilles").hide();
}

function getStatus() {
    $.ajax({
        url: 'state.json',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            window.clearInterval(countdownInterval);
            var now = new Date();
            var date = null;
            if (video_link != data.link) {
                if (data.link.indexOf('twitch') > -1) {
                    $("#embed").html("");
                    new Twitch.Embed("embed", {
                        width: "100%",
                        height: "100%",
                        layout: "video",
                        channel: data.link.split('.tv/').pop().split("/").shift(),
                    });
                } else {
                    $("#embed").html('<iframe class="live" src="' + data.link + '" width="100%" poster="images/live.jpg" frameborder="0" autoplay allowfullscreen="false" mozallowfullscreen="false" msallowfullscreen="false" oallowfullscreen="false" webkitallowfullscreen="false"></iframe>');
                }
                video_link = data.link;
            }
            $('#thespam').off('click');
            $('#thespam').remove();
            if (data.spam) {
                $('body').prepend("<img id='thespam' src='" + data.spam + "' style='max-height:200px; cursor:pointer; z-index:100000000; background:red; border-radius:100%; position:absolute; top:" + Math.floor(Math.random() * 90) + "%; left:" + Math.floor(Math.random() * 90) + "%' />");
                $('#thespam').click(function(e) {
                    $('#thespam').off('click');
                    $('#thespam').remove();
                    $.ajax({
                        url: 'sendspam',
                        type: 'GET',
                        success: function(data) {
                            $('#thespam').off('click');
                            $('#thespam').remove();
                        },
                        error: function(data) {
                            $('#thespam').off('click');
                            $('#thespam').remove();
                        }
                    });
                })
            }
            if (data.status == "started") {
                if (data.gridtime) date = new Date(data.gridtime);
                if (registered && (!date || date < now)) {
                    $('.bloc-grilles').show();
                    $('.lien-regles-game').show()
                }
                $('.bloc-wait').hide();
                if (registered) {
                    $('.boutons').show();
                    $('.manche').show();
                }
                $('.bloc-wait').hide();
                $('.boutons').show();
                $('.manche').show();
                $('.bloc-grilles').show();
            } else if (data.status == "paused") {
                if (data.gridtime) date = new Date(data.gridtime);
                if (registered && (!date || date < now)) {
                    $('.bloc-grilles').show();
                } else {
                    $('.bloc-grilles').hide();
                }
                var date = null;
                if (data.time) date = new Date(data.time);
                $('.bloc-wait').hide();
                $('.boutons').show()
                $('.manche').show()
                $('.bloc-grilles').show();
                if (!date || date > now) {
                    var diff = dateDiff(now, date);
                    var jours = "";
                    var hours = "";
                    var mins = "";
                    var secs = "";
                    if (diff.day == 0) {
                        jours = "";
                    } else if (diff.day == 1) {
                        jours = diff.day + " jour,";
                    } else {
                        jours = diff.day + " jours,";
                    }
                    if (diff.hour < 10) {
                        hours = "0" + diff.hour;
                    } else {
                        hours = diff.hour;
                    }
                    if (diff.min < 10) {
                        mins = "0" + diff.min;
                    } else {
                        mins = diff.min;
                    }
                    if (diff.sec < 10) {
                        secs = "0" + diff.sec;
                    } else {
                        secs = diff.sec;
                    }
                    $('.bloc-wait').html("Le jeu commence dans " + jours + " " + hours + ":" + mins + ":" + secs);
                    countdownInterval = window.setInterval(countdown, 1000);
                } else {
                    $('.bloc-wait').html("Le jeu est en pause");
                }
            } else {
                $('.bloc-grilles').show();
                $('.bloc-wait').hide();
                $('.boutons').show()
                if (data.time) {
                    var date = new Date(data.time);
                    var diff = dateDiff(now, date);
                    var jours = "";
                    var hours = "";
                    var mins = "";
                    var secs = "";
                    if (diff.day == 0) {
                        jours = "";
                    } else if (diff.day == 1) {
                        jours = diff.day + " jour,";
                    } else {
                        jours = diff.day + " jours,";
                    }
                    if (diff.hour < 10) {
                        hours = "0" + diff.hour;
                    } else {
                        hours = diff.hour;
                    }
                    if (diff.min < 10) {
                        mins = "0" + diff.min;
                    } else {
                        mins = diff.min;
                    }
                    if (diff.sec < 10) {
                        secs = "0" + diff.sec;
                    } else {
                        secs = diff.sec;
                    }
                    $('.bloc-wait').html("Le jeu commence dans " + jours + " " + hours + ":" + mins + ":" + secs);
                }
            }
            $(".titre-manche").html("Round " + data.round);
            $(".lot").html(data.prize);
            if ($(".live").attr('src') != data.link) $(".live").attr('src', data.link);
            state = data;
        },
        error: function(data) {
            $(".form").html('Une erreur est survenue');
        }
    });
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

function startChifoumi() {
    
}