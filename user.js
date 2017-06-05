// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  Make mista great again!
// @author       acsent
// @match        *.mista.ru/*
// @grant        none
// @require      http://forum.mista.ru/js/jquery-1.9.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js
// @downloadURL  https://cdn.jsdelivr.net/gh/a-sitnikov/mista.js@latest/user.js
// @updateURL    https://cdn.jsdelivr.net/gh/a-sitnikov/mista.js@latest/user.js
// ==/UserScript==

var mistaScriptVersion = '1.1.1';
var tooltipsOrder = [];
var tooltipsMap = {};
var currentTopicId = 0;
var yourUrl;
var topicAuthor;

var options = {
    "show-tooltips":         {default: "true",        type: "checkbox", label: "Показывать тултипы, задержка"},
    "tooltip-delay":         {default: "500",         type: "input",    label: "", suffix: "мс", width: "50"},
    "replace-catalog-to-is": {default: "true",        type: "checkbox", label: "Обратно заменять catalog.mista.ru на infostart.ru"},
    "mark-author":           {default: "true",        type: "checkbox", label: "Подсвечивать автора цветом"},
    "author-color":          {default: "#ffd784",     type: "color",    label: "", width: "100"},
    "mark-yourself":         {default: "true",        type: "checkbox", label: "Подсвечивать себя цветом"},
    "yourself-color":        {default: "#9bc5ef",     type: "color",    label: "", width: "100"},
    "show-userpics":         {default: "onMouseOver", type: "radio",    label: "Показывать фото пользователей",
                              values:[{v: "showAlways", descr: "Показывать всегда"}, {v: "showThumbs", descr: "Показывать thumbs"}, {v: "onMouseOver", descr: "При наведении"}, {v: "no", descr: "Не показывать"}]},
    "max-userpic-width":     {default: "100",         type: "input",    label: "Макс. ширина фото", suffix: "px. Желательно не более 150", width: "50"},
    "show-imgs":             {default: "onMouseOver", type: "radio",    label: "Показывать картинки",
                              values:[{v: "showAlways", descr: "Показывать всегда"}, {v: "onMouseOver", descr: "При наведении"}, {v: "no", descr: "Не показывать"}]},
    "max-img-width":         {default: "500",         type: "input",    label: "Макс. ширина картинки", suffix: "px", width: "50"},
    "show-youtube-title":    {default: "true",        type: "checkbox", label: "Показывать наименования роликов youtube, макс. длина"},
    "max-youtube-title":     {default: "40",          type: "input",    label: "", suffix: "символов", width: "50"},
    "youtube-prefix":        {default: "youtube",     type: "input",    label: "Префикс youtube", suffix: "", width: "100"},
    "first-post-tooltip":    {default: "true",        type: "checkbox", label: "Отображать тултип нулевого поста ссыки на другую ветку"},
    "add-name-to-message":   {default: "true",        type: "checkbox", label: "Кнопка для ввода имени в сообщение"},
    "user-autocomplete":     {default: "true",        type: "checkbox", label: "Дополнение имен пользователей. При написании @"}
};

var formOptions = [
    ['show-tooltips', 'tooltip-delay'],
    ['replace-catalog-to-is'],
    ['first-post-tooltip'],
    ['mark-author', 'author-color'],
    ['mark-yourself', 'yourself-color'],
    ['show-userpics'],
    ['max-userpic-width'],
    ['show-imgs'],
    ['max-img-width'],
    ['show-youtube-title', 'max-youtube-title'],
    ['youtube-prefix'],
    ['add-name-to-message'],
    ['user-autocomplete']
];

function utimeToDate(utime) {
    var a = new Date(utime*1000);

    var year  = a.getYear();
    var month = a.getMonth();
    var date  = a.getDate();
    var hours = a.getHours();
    var minutes = "0" + a.getMinutes();

    return date + '.' + month + '.' + year + ' - ' + hours + ':' + minutes.substr(-2);
}

function parseJSON(text) {
    try {
        return eval(text);
    } catch(e) {
        console.log(e.message);
        console.log(text);
        return null;
    }
}

function processLinkToMistaCatalog(element, url) {
    //http://www.forum.mista.ru/topic.php?id=783361
    if (url.search("catalog.mista.ru") === -1) return false;

    if (options["replace-catalog-to-is"].value === 'true') {
        var text = $(element).text();
        var newUrl   = url.replace(/catalog.mista/i, "infostart");
        var newTrext = text.replace(/catalog.mista/i, "infostart");

        $(element).attr("href", newUrl);
        $(element).text(newTrext);
    }

    return true;
}

// ----------------Options-------------------------------------
function readAllOptions(){
    var keys = Object.keys(options);
    for (var i in keys) {
        var name = keys[i];
        options[name].value = readOption(name, options[name].default);
    }
}

function saveOption(name, value) {
    window.localStorage.setItem(name, String(value));
}

function readOption(name) {
    var value = window.localStorage.getItem(name);
    if (!value) value = options[name].default;
    return value;
}

function loadOptions(){
    var keys = Object.keys(options);
    for (var i in keys){
        var name   = keys[i];
        var option = options[name];
        if (option.type === 'checkbox'){
            if (option.value === 'true') $('#' + name).prop("checked", "checked");

        } else if (option.type === 'radio'){
            $('input:radio[name="' + name + '"][value="' +  option.value + '"]').prop("checked", "checked");

        } else if (option.type === 'input'){
            $('#' + name).val(option.value);

        } else if (option.type === 'color'){
            $('#' + name).val(option.value.toUpperCase());
        }
    }
}

function openMistaScriptOptions(){
    var html =
        '<div id="mista-script-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index:1000; opacity: 0.85"; pointer-events: none;></div>' +
        '<div id="mista-script" style="position:fixed; left: 25%; top: 25%; background:#FFFFE1; border:1px solid #000000; width:630px; font-weight:normal; z-index: 1001">' +
             '<span id="closeOptions" style="POSITION: absolute; RIGHT: 6px; TOP: 3px; cursor:hand; cursor:pointer">'+
             '     <b> x </b>' +
             '</span>' +
             '<div style="cursor: move; background:white; padding:4px; border-bottom:1px solid silver">' +
                 '<b>Настройки Mista.Script</b> version ' + mistaScriptVersion +
             '</div>' +
            '<div style="padding:5px">';

    for (var i in formOptions){
        html += '<div style="margin-bottom:5px">';

        var row = formOptions[i];
        for (var j in row){

            var name = row[j];
            var option = options[name];

            if (option.type === 'checkbox') {
                html += '<input id="' + name +'" type="checkbox" name="' + name +'" value="' + name +'">' +
                    '<label for="' + name +'">' + option.label + '</label>';

            } else if (option.type === 'input' || option.type === 'color') {
                if (option.label){
                    html += '<label for=' + name + '">' + option.label + '</label>';
                }
                html += '<input id="' + name + '" name="' + name + '" style="margin-left:5px; width: ' + option.width + 'px"' + (option.type === 'color' ? ' type="color"': '') + '>';
                if (option.suffix){
                    html += ' ' + option.suffix;
                }
            } else if (option.type === 'radio') {
                html += '<label for="' + name +'">' + option.label + '</label><br>';
                for (var k in option.values){
                    var value = option.values[k];
                    html += '<input type="radio" name="' + name +'" value="' + value.v + '"> ' + value.descr;
                }
            }
        }

        html += '</div>';
    }
    html +=
        '<div>После применения настроек страницу нужно перезагрузить</div>' +
             '<div>' +
                  '<button id="applyOptions" class="sendbutton" style="margin: 5px">OK</button>' +
                  '<button id="cancelOptions" class="sendbutton" style="margin: 5px; float: left;">Отмена</button>' +
                  '<button id="defaultOptions" class="sendbutton" style="margin: 5px; float: right;">Сбросить настройки</button>' +
             '</div>' +
        '</div>';

    $(html).appendTo('#body');
    $('#mista-script').draggable();
    $('body').css({"overflow-y": "hidden"});

    loadOptions();

    $('#applyOptions').click(function(){

        var keys = Object.keys(options);
        for (var i in keys){
            var name   = keys[i];
            var option = options[name];
            if (option.type === 'checkbox'){
                option.value = String($('#' + name).is(':checked'));

            } else if (option.type === 'radio'){
                option.value = $('input:radio[name=' + name + ']:checked').val();

            } else if (option.type === 'input'){
                option.value = $('#' + name).val();

            } else if (option.type === 'color'){
                option.value = $('#' + name).val();
            }

            saveOption(name, option.value);
        }

        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({"overflow-y": "auto"});
    });

    $('#cancelOptions, #closeOptions').click(function(){
        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({"overflow-y": "auto"});
    });

    $('#defaultOptions').click(function(){
        var keys = Object.keys(options);
        for (var i in keys){
            var name = keys[i];
            options[name].value = options[name].default;
        }
        loadOptions();
    });
}

// ----------------Tooltips-------------------------------------
function tooltipHtml(msgId) {
    //min-width: 500px; width:auto; max-width: 1200px
    return '<div id=tooltip' + msgId+ ' msg-id=' + msgId + ' class="gensmall" style="position:absolute; background:#FFFFE1; border:1px solid #000000; width:650px; font-weight:normal;">'+
        '<div id=tooltip-header' + msgId+ ' msg-id=' + msgId + '  style="cursor: move; background:white; padding:4px; border-bottom:1px solid silver"><span><b>Подождите...</b></span></div>' +
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
        if (tooltipsMap[tempMsgId]) tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder.splice(ind);
}

function removeAllTooltips() {
    // remove all subsequent tooltips
    for (var i = 0; i < tooltipsOrder.length; i++) {
        var tempMsgId = tooltipsOrder[i];
        if (tooltipsMap[tempMsgId]) tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder = [];
}

function setMsgText(topicId, msgId, elemHeader, elemText){
    var user;
    if (topicId === currentTopicId) user = $('#tduser' + msgId).html();
    if (user) {
        elemHeader.html(user);
        var text = $('#' + msgId).html();
        if (!text) {
            // hidden message
            try {
                text = hidden_messages[+msgId];
            } catch(e) {}
        }
        elemText.html(text);
        elemText.find('img').css({'max-width': '642px'});
        run(elemHeader, elemText, true);
    } else {
        setMsgTextAjax(topicId, msgId, elemHeader, elemText);
    }

}

function setMsgTextAjax(topicId, msgId, elemHeader, elemText){

    var apiUrl = "ajax_topic.php?id=" + topicId + "&from=" + msgId + "&to=" + (parseInt(msgId) + 1);

    $.ajax({
        url: apiUrl
    }).done(function(data) {
        dataObj = parseJSON(data);
        if (!dataObj || dataObj.length === 0) {
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
            if (elemHeader) elemHeader.html(user);
            run(elemHeader, elemText);
            elemText.find('img').css('max-width: 642px');
        } else {
            elemHeader.html('<b>Сообщение не найдено</b>');
            elemText.html('Возможно оно скрыто или удалено');
            return;
        }
    });
}

function loadDataMsg(topicId, msgId){
    return function() {
        setMsgText(topicId, msgId, $("#tooltip-header" + msgId), $("#tooltip-text" + msgId));
    };
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

    tooltipsMap[msgId] = elem;
    tooltipsOrder.push(msgId);

    return elem;
}

function attachTooltip(link, id, loadDataFunc) {

    var timer;
    $(link).hover(function(){
        timer = setTimeout(function() {
            createTooltip(link, id);
            loadDataFunc();
        }, +options['tooltip-delay'].value);
    },
    function() {
        // on mouse out, cancel the timer
        clearTimeout(timer);
    });
}

function processLinkToPost(element, url, onlyBindEvents) {
    var topicId, msgId;
    try {
        topicId = url.match(/topic.php\?id=([0-9]+)($|\&)/)[1];
    } catch(e) {}
    try {
        msgId = url.match(/#([0-9]+)/)[1];
    } catch(e) {}

    if (!topicId && !msgId) return false;

    if (!topicId) topicId = currentTopicId;
    if (!msgId) msgId = "0";

    if (topicId !== currentTopicId) {
        if (options['first-post-tooltip'].value !== 'true') {
            return true;
        } else {
            if (!onlyBindEvents) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        }
    }

    if (topicId === currentTopicId && options['show-tooltips'].value !== 'true') return true;

    attachTooltip(element, msgId, loadDataMsg(topicId, msgId));
}

// ----------------Images--------------------------------------
function loadDataImg(url, id, header){

    if (!header) header = 'Картинка';

    return function(){
        $('#tooltip-header' + id).html('<b>' + header + '</b>');
        $('#tooltip-text' + id).html('<img src="' + url + '" style="max-width: ' + options['max-img-width'].value + 'px; height:auto;">');
        $('#tooltip-text' + id + ' img').on('load', function(){
            if ($(this).height() === 1) {
                $('#tooltip-text' + id).text('Картинка отсутствует');
            } else {
                $('#tooltip' + id).width($(this).width() + 8);
            }
        });
    };
}

function getImgUrl(url) {
    if (url.search("ximage.ru/index.php") !== -1) {
        var imgId = url.match(/id=(.+)$/)[1];
        return "http://ximage.ru/data/imgs/" + imgId + ".jpg";

    } else if (url.search(/.+\.(jpg|jpeg|png)$/) !== -1) {
        return url;
    }
}

function processLinkToImage(element, url, onlyBindEvents) {

    var imgUrl = getImgUrl(url);
    if (!imgUrl) return false;
    if ($(element).text() === '') return true;

    if (options['show-imgs'].value === 'showAlways'){
        if (!onlyBindEvents) {
            $(element).text("");
            var html = '';
            var prev = $(element).prev();
            if (prev.length === 0) {
                html = '<br>';
            }
            html += '<img src="' + imgUrl + '" style="max-width: ' + options['max-img-width'].value + 'px; height:auto;"/>';
            $(html).appendTo($(element));
        }

    } else if (options['show-imgs'].value === 'onMouseOver') {
        if (!onlyBindEvents) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        attachTooltip(element, '_p', loadDataImg(imgUrl, "_p"));
    }

    return true;
}

// ----------------Youtube-------------------------------------
function setYoutubeTitle(link, videoId, onlyBindEvents) {

    if (onlyBindEvents) return;

    var apiUrl = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBPtVWaQ7iGkObgyavKoNVQdfPwczAdQUE&&fields=items(snippet(title))&part=snippet&id=' + videoId;

    $.ajax({
        url: apiUrl
    }).done(function(data){
        try {
            var fullTitle = data.items[0].snippet.title;
            var title = fullTitle;
            if (fullTitle.length > options['max-youtube-title'].value) title = title.substring(0, options['max-youtube-title'].value) + '...';
            $(link).text(options['youtube-prefix'].value + ': ' + title);
            $(link).attr('title', fullTitle);
        } catch(e) {
            console.log(e.message);
            console.log(data);
        }
    });
}

function processLinkToYoutube(element, url, onlyBindEvents) {

    var videoId;
    // youtube.com/watch?v=videoId
    if (url.search(/youtube/) !== -1) {
        if (options['show-youtube-title'].value === 'true'){
            try{
                videoId = url.match(/v=(.+)(\&|$)/)[1];
            } catch(e){}
            if (videoId) setYoutubeTitle(element, videoId, onlyBindEvents);
        }
        return true;
    }

    // youtu.be/videoId
    if (url.search(/youtu\.be/) !== -1) {
        if (options['show-youtube-title'].value === 'true'){
            try{
                videoId = url.match(/e\/(.+)(\&|$)/)[1];
            } catch(e){}
            if (videoId) setYoutubeTitle(element, videoId, onlyBindEvents);
        }
        return true;
    }

    return false;
}

// ----------------Users---------------------------------------
function processLinkToUser(element, url, userPostMap, onlyBindEvents) {

    if (options['show-userpics'].value === 'no') return;
    var userId = $(element).attr('data-user_id');
    if (!userId) return;

    var userName = $(element).text();
    var imgUrl;
    if (options['show-userpics'].value === 'showThumbs') {
        imgUrl = "/users_photo/thumb/" + userId + ".jpg";
    } else {
        imgUrl = "/users_photo/mid/" + userId + ".jpg";
    }

    if (options['show-userpics'].value === 'onMouseOver') {
        var user = $(element).text();
        attachTooltip(element, '_p', loadDataImg(imgUrl, '_p', user));

    } else {
        if (!onlyBindEvents) {

            var msgId = +$(element).parent().attr('id').replace('tduser', '');
            if (userPostMap[msgId - 1] !== userId) {

                var img = $('<img src="' + imgUrl + '" style="max-width: ' + options['max-userpic-width'].value + 'px; height: auto"><br>').insertBefore($(element));
                img.on('load', function(){
                    // Delete empty image to remove empty space
                    if ($(this).height() === 1) {
                        img.remove();
                    }
                });
            }
            userPostMap[msgId] = userId;
        }
    }

    if (options['add-name-to-message'].value === 'true') {
        var span;
        if (!onlyBindEvents) {
            span = $('<span id="addUserToMessage' + userId + '" class="agh" style="cursor: pointer"> &#9654;</span>').insertAfter($(element));
        } else {
            span = $('#addUserToMessage' + userId);
        }

        if (span) {
            span.click(function(){
                addUserToMessage(userId, userName);
            });
        }
    }

}

function addUserToMessage(userId, userName) {
    $('#message_text').val(function(i, text) {
        var space = '';
        var lastLetter = text.slice(-1);
        if (lastLetter !== ' ' && lastLetter !== '\n' && text.length > 0) space = ' ';
        return text + space + '@{' + userName + '}';
    });
}

function processLinkToAuthor(element, url, onlyBindEvents) {

    if ($(element).text() !== topicAuthor) return false;
    if (options['mark-author'].value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({'background': options['author-color'].value});
    return true;
}

function processLinkToYourself(element, url, onlyBindEvents) {

    if (url !== yourUrl) return false;
    if (options['mark-yourself'].value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({'background': options['yourself-color'].value});
    return true;
}

// ----------------Run-----------------------------------------
function run(parentElemHeader, parentElemText, onlyBindEvents){

    parentElemHeader = parentElemHeader || $('td[id^=tduser]');
    parentElemText   = parentElemText   || $('td[id^=tdmsg]');

    // Process all links in the user name area
    var userPostMap = {};
    parentElemHeader.find('a').each(function(a){

        var url = $(this).attr('href');
        processLinkToUser(this, url, userPostMap, onlyBindEvents);
        if (processLinkToAuthor(this, url, onlyBindEvents)) return;
        if (processLinkToYourself(this, url, onlyBindEvents)) return;

    });

    // Process all links in the message area
    parentElemText.find('a').each(function(a){

        var url = $(this).attr('href');
        if (processLinkToImage(this, url, onlyBindEvents)) return;
        if (processLinkToYoutube(this, url, onlyBindEvents)) return;
        if (processLinkToMistaCatalog(this, url, onlyBindEvents)) return;
        if (processLinkToPost(this, url, onlyBindEvents)) return;

    });

}

function addUserAutocomplete(){

    if (options['user-autocomplete'].value !== 'true') return;

    $("<style>")
    .prop("type", "text/css")
    .html(`.dropdown-menu {
        background: white;
        list-style-type:none;
        overflow-y: auto;
        max-height: 200px;
        border: 1px solid #CECECE;
    }
    .dropdown-menu .textcomplete-item a,
    .dropdown-menu .textcomplete-item a:hover {
        cursor: pointer;
        font-weight: normal;
        color: #000;
        position: relative;
        padding: 3px 10px;
        display: block;
        border-bottom: 1px solid #CECECE;
     }
    .dropdown-menu .textcomplete-item.active a {
        background: lightgrey;
    }
    /* Highlighting of the matching part
    of each search result */
    .dropdown-menu .textcomplete-item a em {
        font-style: normal;
        font-weight: bold;
    }`)
    .appendTo("head");

    $('textarea').textcomplete([{
        match: /(^|\s)@([a-zA-Zа-яА-Я0-9_]{2,})$/,
        search: function (term, callback) {
            if (!term) return;
            $.ajax({
                url: 'http://forum-mista.pro/api/users.php?name=' + encodeURI(term)
            }).done(function(data){
                var dataObj = JSON.parse(data).slice(0, 20).map((a) => a.name);
                callback(dataObj);
            }).fail(function () {
                callback([]); // Callback must be invoked even if something went wrong.
            });
        },
        replace: function (word) {
            return ' @{' + word + '} ';
        },
        template: function(value, term) {
            return value;
        }
    }], {
        appendTo: 'body',
        dropdownClassName: 'dropdown-menu',
        maxCount: 20
    });
}

(function() {

    var currentUrl = window.location.href;
    try {
        currentTopicId = currentUrl.match(/id=([0-9]+)/)[1];
    } catch(e){}

    yourUrl = $('a[href*="users.php?id="]',  "#user-td").attr("href");
    topicAuthor = $("a",  "#tduser0").text();

    readAllOptions();

    $('<li class="nav-item"><a href="#">Настройки Mista.Script</a></li>')
        .appendTo("ul.nav-bar")
        .click(openMistaScriptOptions);

    $('body').click(function(e){
        if ($(e.target).closest('div[id^=tooltip]').length === 0) removeAllTooltips();
    });

    $('#table_messages').on('mista.load', 'tr', function(event){
        //<tr id=message_id>
        var elemHeader = $(this).find('td[id^=tduser]');
        var elemText = $(this).find('td[id^=tdmsg]');
        run(elemHeader, elemText);
    });

    if (typeof $.ui == 'undefined') {

        $.when(
            $.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'),
            $.getScript('https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js'),
            $.Deferred(function( deferred ){
                $( deferred.resolve );
            })
        ).done(function(){
            addUserAutocomplete();
            run();
        });

    } else {
        addUserAutocomplete();
        run();
    }
})();
