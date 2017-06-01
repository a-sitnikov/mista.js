// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  try to take over the world!
// @author       You
// @match        *.mista.ru/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @downloadURL  https://gist.githubusercontent.com/a-sitnikov/bc1886671da01b43f43a10748e1e92dc/raw/
// @updateURL    https://gist.githubusercontent.com/a-sitnikov/bc1886671da01b43f43a10748e1e92dc/raw/
// ==/UserScript==

var tooltipsOrder = [];
var tooltipsMap = {};
var tooltipDelay = 0;
var maxImgWidth = 0;
var maxYoutubeTitle = 0;

var defaultOptions = {
    "show-tooltips":         "true",
    "tooltip-delay":         "500",
    "replace-catalog-to-is": "true",
    "mark-author":           "true",
    "author-color":          "#ffd784",
    "show-userpics":         "onMouseOver",
    "show-imgs":             "onMouseOver",
    "max-img-width":         "500",
    "show-youtube-title":    "true",
    "max-youtube-title":     "40"
};

function tooltipHtml(msgId) {
    return '<div id=tooltip' + msgId+ ' msg-id=' + msgId + ' class="gensmall" style="position:absolute; background:#FFFFE1; border:1px solid #000000; width:630px; font-weight:normal;">'+
        '<div id=tooltip-author' + msgId+ ' msg-id=' + msgId + '  style="cursor: move; background:white; padding:4px; border-bottom:1px solid silver"><span><b>Подождите...</b></span></div>' +
        '<div id=tooltip-text' + msgId+ ' msg-id=' + msgId + '  style="padding:4px"><span>Идет ajax загрузка.<br/>Это может занять некоторое время.</span></div>' +
        '<span id=tooltip-close' + msgId + ' msg-id=' + msgId + '  style="POSITION: absolute; RIGHT: 6px; TOP: 3px; cursor:hand; cursor:pointer">'+
            '<b> x </b>' +
        '</span>' +
    '</div>';
}

function removeTooltip() {
    // remove all subsequent tooltips
    var msgId = $(this).attr("msg-id");
    var ind = tooltipsOrder.indexOf(msgId);
    for (var i = ind; i < tooltipsOrder.length; i++) {
        var tempMsgId = tooltipsOrder[i];
        tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder.splice(ind);
}

function removeAllTooltips() {
    // remove all subsequent tooltips
    for (var i = 0; i < tooltipsOrder.length; i++) {
        var tempMsgId = tooltipsOrder[i];
        tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder = [];
}

function getMsgId(elem){
    var url = $(elem).attr("href");
    try {
        return url.match(/#[0-9]+/)[0].substring(1);
    } catch(error) {
    }
    return null;
}

function setMsgText(msgId, elemAuthor, elemText){
    var author = $('#tduser' + msgId).html();
    var text = $('#' + msgId).html();
    if (text) {
        elemAuthor.html(author);
        elemText.html(text);
        addTooltips(elemText);
    } else {
        setMsgTextAjax(msgId, elemAuthor, elemText);
    }

}

function utimeToDate(utime) {
    var a = new Date(utime*1000);

    var year  = a.getYear();
    var month = a.getMonth();
    var date  = a.getDate();
    var hours = a.getHours();
    var minutes = "0" + a.getMinutes();

    return date + '.' + month + '.' + year + ' - ' + hours + ':' + minutes.substr(-2);
}

function normalizeJSON(text) {
    text = text.replace(/\\r\\/g, "");
    text = text.replace(/\\>/g, ">");
    text = text.replace(/\\</g, "<");
    text = text.replace(/\\\//g, "/");
    text = text.replace(/\\"/g, "'");
    text = text.replace(/\\&/g, '&');
    return text;
}

function setMsgTextAjax(msgId, elemAuthor, elemText){
    var currentUrl = window.location.href;
    var topicId = currentUrl.match(/id=([0-9]+)/)[1];
    var url = "ajax_topic.php?id=" + topicId + "&from=" + msgId + "&to=" + (parseInt(msgId) + 1);

    $.ajax({
        url: url
    }).done(function(data) {

        data = normalizeJSON(data);
        var dataObj = null;
        try {
            dataObj = JSON.parse(data);
        } catch(e) {
            console.log(data);
            return;
        }

        if (!dataObj) {
            elemText.text('Сообщение не найдено');
            return;
        }
        var msgArr = dataObj.filter(function(a){ return a.n === msgId; });
        if (msgArr.length === 1) {
            var msg = msgArr[0];
            var text = msg.text.replace(/\(([0-9]+)\)/g, "<a href='#$1'>($1)</a>");
            var user = "<b>" + msg.user + "</b><br>"+
                "<span class='message-info'>" + msg.n + " - " + utimeToDate(msg.utime) + "</span>";
            elemText.html(text);
            elemAuthor.html(user);
            addTooltips(elemText);
        }
    });
}

function createTooltip(link, msgId) {
    if ($('#tooltip' + msgId).length > 0) return;
    $(tooltipHtml(msgId)).appendTo('#body');
    var loc = $(link).offset();
    var left = loc.left;
    if ($(window).width() - loc.left < 100) {
        left = left - 630;
    }

    var elem = $("#tooltip" + msgId)
        .draggable()
        .css({
            "top": loc.top + "px",
            "left": left + "px"
            //"z-index": "999"
         })
        .click(removeTooltip);

    $("#tooltip-close" + msgId).click(removeTooltip);
    tooltipsMap[msgId] = elem;
    tooltipsOrder.push(msgId);

    return elem;
}

function showTooltip(link){
    var msgId = getMsgId(link);
    createTooltip(link, msgId);

    setMsgText(msgId, $("#tooltip-author" + msgId), $("#tooltip-text" + msgId));
}

function addTooltips(parentElem) {

    if (!parentElem) parentElem = $(document);

    parentElem.find('a[href^="#"], a[href^="topic.php?id="]')
       .filter(function(index){
           var href = $(this).attr("href");
           return href.search(/#[0-9]+/) !== -1;
        })
       .each(function(){
            var timer;
            var link = this;
            $(this).hover(function(){
                timer = setTimeout(function(){
                    showTooltip(link);
                }, +tooltipDelay);
            },
            function() {
                // on mouse out, cancel the timer
                clearTimeout(timer);
            });
       });
}

function saveOption(name, value) {
    window.localStorage.setItem(name, String(value));
}

function readOption(name) {
    var value = window.localStorage.getItem(name);
    if (!value) value = defaultOptions[name];
    return value;
}

function openMistaScriptOptions(){
    var html =
        '<div id="mista-script-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index:1000; opacity: 0.85"; pointer-events: none;></div>' +
        '<div id="mista-script" style="position:fixed; left: 25%; top: 25%; background:#FFFFE1; border:1px solid #000000; width:630px; font-weight:normal; z-index: 1001">' +
            '<div style="cursor: move; background:white; padding:4px; border-bottom:1px solid silver">' +
                 '<b>Настройки Mista.Script</b>' +
             '</div>' +
            '<div style="padding:5px">' +
                '<div style="margin-bottom:5px">' +
                    '<input id="showTooltips" type="checkbox" name="showTooltips" value="showTooltips">' +
                    '<label for="showTooltips">Показывать тултипы, задержка</label>' +
                    '<input id="tooltipDelay" name="tooltipDelay" style="margin-left:5px; width: 50px" value="tooltipDelay"> мс' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<input id="replaceCatalogToIS" type="checkbox" name="replaceCatalogToIS" value="replaceCatalogToIS">' +
                    '<label for="replaceCatalogToIS">Обратно заменять catalog.mista.ru на infostart.ru</label>' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<input id="markAuthor" type="checkbox" name="markAuthor" value="markAuthor">' +
                    '<label for="markAuthor">Подсвечивать автора цветом</label>' +
                    '<input id="authorColor" type="color" name="authorColor" style="margin-left:5px; width: 100px" value="authorColor">' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<label for="showUserpics">Показывать фото пользователей</label><br>' +
                    '<input type="radio" name="showUserpics" value="showAlways" checked> Показывать всегда' +
                    '<input type="radio" name="showUserpics" value="onMouseOver"> При наведении' +
                    '<input type="radio" name="showUserpics" value="no"> Не показывать' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<label for="showImgs">Показывать картинки</label><br>' +
                    '<input type="radio" name="showImgs" value="showAlways" checked> Показывать всегда' +
                    '<input type="radio" name="showImgs" value="onMouseOver"> При наведении' +
                    '<input type="radio" name="showImgs" value="no"> Не показывать' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<label for="maxImgWidth">Макс. ширина картинки</label>' +
                    '<input id="maxImgWidth" name="maxImgWidth" style="margin-left:5px; width: 50px;" value="maxImgWidth"> px' +
                '</div>' +
                '<div style="margin-bottom:5px">' +
                    '<input id="youtubeTitle" type="checkbox" name="youtubeTitle" value="youtubeTitle">' +
                    '<label for="youtubeTitle">Показывать наименования роликов youtube, макс. длина</label>' +
                    '<input id="maxYoutubeTitle" name="maxYoutubeTitle" style="margin-left:5px; width: 50px" value="maxYoutubeTitle"> символов' +
                '</div>' +
                '<div>После применения настроек страницу нужно перезагрузить</div>' +
                '<div>' +
                    '<button id="applyOptions" class="sendbutton" style="margin: 5px">OK</button>' +
                    '<button id="cancelOptions" class="sendbutton" style="margin: 5px; float: left;">Отмена</button>' +
                '</div>' +
            '</div>' +
         '</div>';

    $(html).appendTo('#body');
    $('#mista-script').draggable();

    $('body').css({"overflow-y": "hidden"});

    if (readOption("show-tooltips") === 'true')         $('#showTooltips').attr("checked", "checked");
    $("#tooltipDelay").val(readOption("tooltip-delay"));

    if (readOption("replace-catalog-to-is") === 'true') $('#replaceCatalogToIS').attr("checked", "checked");
    if (readOption("mark-author") === 'true')           $('#markAuthor').attr("checked", "checked");
    $("#authorColor").val(readOption("author-color"));
    $('input:radio[name=showUserpics]').val([readOption("show-userpics")]);
    $('input:radio[name=showImgs]').val([readOption("show-imgs")]);
    $("#maxImgWidth").val(readOption("max-img-width"));

    if (readOption("show-youtube-title") === 'true')    $('#youtubeTitle').attr("checked", "checked");
    $("#maxYoutubeTitle").val(readOption("max-youtube-title"));

    $('#applyOptions').click(function(){

        saveOption("show-tooltips",         $('#showTooltips').is(':checked'));
        saveOption("tooltip-delay",         $('#tooltipDelay').val());
        saveOption("replace-catalog-to-is", $('#replaceCatalogToIS').is(':checked'));
        saveOption("mark-author",           $('#markAuthor').is(':checked'));
        saveOption("author-color",          $('#authorColor').val());
        saveOption("show-userpics",         $('input:radio[name=showUserpics]:checked').val());
        saveOption("show-imgs",             $('input:radio[name=showImgs]:checked').val());
        saveOption("max-img-width",         $('#maxImgWidth').val());
        saveOption("show-youtube-title",    $('#youtubeTitle').is(':checked'));
        saveOption("max-youtube-title",     $('#maxYoutubeTitle').val());

        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({"overflow-y": "auto"});
    });

    $('#cancelOptions').click(function(){
        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({"overflow-y": "auto"});
    });
}

function showImgTooltip(link, url, headerText) {
    var timer;
    $(link).hover(function(){
        timer = setTimeout(function() {
            createTooltip(link, '_p');
            $('#tooltip-author_p').html('<b>' + headerText + '</b>');
            $('#tooltip-text_p').html('<img src="' + url + '">');
            $('#tooltip-text_p img').on('load', function(){
                if ($(this).height() === 1) {
                    $('#tooltip-text_p').text('Картинка отсутствует');
                } else {
                    $('#tooltip_p').width($(this).width() + 8);
                }
            });
        }, +tooltipDelay);
    },
    function() {
        // on mouse out, cancel the timer
        clearTimeout(timer);
    });
}

function setYootubeTitle(link, videoId) {

    var apiUrl = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBPtVWaQ7iGkObgyavKoNVQdfPwczAdQUE&&fields=items(snippet(title))&part=snippet&id=" + videoId;

    $.ajax({
        url: apiUrl
    }).done(function(data){
        try {
            var fullTitle = data.items[0].snippet.title;
            var title = fullTitle;
            if (fullTitle.length > maxYoutubeTitle) title = title.substring(0, maxYoutubeTitle) + "...";
            $(link).text("y: " + title);
            $(link).attr("title", fullTitle);
        } catch(e) {
        }
    });
}

function run(){

    tooltipDelay = readOption('tooltip-delay');
    maxImgWidth = readOption('max-img-width');
    maxYoutubeTitle = readOption('max-youtube-title');

    if (readOption('show-tooltips') === 'true') {
        addTooltips();
        $('body').click(removeAllTooltips);
    }

    if (readOption("replace-catalog-to-is") === 'true') {
        // change catalog.mista.ru to infostart
        $('a:contains("catalog.mista.ru")').each(function(){
            var url  = $(this).attr("href");
            var text = $(this).text();
            var newUrl   = url.replace(/catalog.mista/i, "infostart");
            var newTrext = text.replace(/catalog.mista/i, "infostart");
            $(this).attr("href", newUrl);
            $(this).text(newTrext);
        });
    }

    if (readOption("mark-author") === 'true') {
        // a - if logged in, span - otherwise
        var user = $("span, a",  "#tduser0").text();
        if (user) {
            var authorColor = readOption("author-color");
            $('a:contains("' + user + '")', "td[id^=tduser]").css({"background": authorColor});
            $('span:contains("' + user + '")', "td[id^=tduser]").css({"background": authorColor});
        }
    }

    var showUserpics = readOption('show-userpics');
    if (showUserpics === 'showAlways') {

        var userPostMap = {};
        $('a[href*="users.php?id"]', "td[id^=tduser]").each(function(){
            var userId = $(this).attr('data-user_id');
            var url = "/users_photo/mid/" + userId + ".jpg";
            var msgId = +$(this).parent().attr('id').replace('tduser', '');

            if (userPostMap[msgId - 1] !== userId) {
                var img = $('<img src="' + url + '" style="max-width: 100px;"><br>').insertBefore($(this));
                img.on('load', function(){
                    // Delete empty image to remove empty space
                    if ($(this).height() === 1) {
                        img.remove();
                    }
                });
            }
            userPostMap[msgId] = userId;
        });

    } else if (showUserpics === 'onMouseOver') {

        $('a[href*="users.php?id"]', "td[id^=tduser]").each(function(){

            var userId = $(this).attr('data-user_id');
            var user = $(this).text();
            var url = "/users_photo/mid/" + userId + ".jpg";

            showImgTooltip(this, url, user);

        });
    }

    var showImgs = readOption('show-imgs');
    var regFilter = /.+\.(jpg|jpeg|png)$/;
    if (showImgs === 'showAlways'){

        $('a').filter(function(i){
            return $(this).attr('href').search(regFilter) !== -1;
        }).each(function(a){

            var url = $(this).attr("href");
            $(this).text("");
            $('<img src="' + url + '" style="max-width: ' + maxImgWidth + 'px"/>').appendTo($(this));

        });

    } else if (showImgs === 'onMouseOver') {

        $('a').filter(function(i){
            return $(this).attr('href').search(regFilter) !== -1;
        }).each(function(a){
            //console.log(a);
            var link = $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(this));
            showImgTooltip(link, $(this).attr("href"), "Картинка");

        });
    }

    $('<li class="nav-item"><a href="#">Настройки Mista.Script</a></li>')
        .appendTo("ul.nav-bar")
        .click(openMistaScriptOptions);

    if (readOption('show-youtube-title') === 'true'){

        $('a[href*="youtube"]').each(function(){
            var link = this;
            var url = $(this).attr("href");
            var videoId = url.match(/v=(.+)(\&|$)/)[1];
            setYootubeTitle(link, videoId);
        });

        $('a[href*="youtu.be"]').each(function(){
            var link = this;
            var url = $(this).attr("href");
            var videoId = url.match(/e\/(.+)(\&|$)/)[1];

            setYootubeTitle(link, videoId);
        });
    }
}

(function() {
    if (typeof $.ui == 'undefined') {
        $.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', run);
    } else {
        run();
    }
})();
