// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      1.7.3
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

const mistaScriptVersion = '1.7.3';
let tooltipsOrder = [];
let tooltipsMap = {};
let currentTopicId = 0;
let yourUrl;
let topicAuthor;

let options = new Map([
    ["open-in-new_window",    {default: "true",        type: "checkbox", label: "Открывать ветки в новом окне"}],
    ["show-tooltips",         {default: "true",        type: "checkbox", label: "Показывать тултипы, задержка"}],
    ["show-tooltips-on-main", {default: "true",        type: "checkbox", label: "Показывать тултипы на главной странице, при наведении на кол-во ответов "}],
    ["tooltip-delay",         {default: "500",         type: "input",    label: "", suffix: "мс", width: "50"}],
    ["remove-tooltip-on-leave", {default: "false",     type: "checkbox", label: "Скрывать тултип при уходе мыши, задержка"}],
    ["remove-tooltip-delay",    {default: "1000",         type: "input",    label: "", suffix: "мс", width: "50"}],
    ["replace-catalog-to-is", {default: "true",        type: "checkbox", label: "Обратно заменять catalog.mista.ru на infostart.ru"}],
    ["mark-author",           {default: "true",        type: "checkbox", label: "Подсвечивать автора цветом"}],
    ["author-color",          {default: "#ffd784",     type: "color",    label: "", width: "100"}],
    ["mark-yourself",         {default: "true",        type: "checkbox", label: "Подсвечивать себя цветом"}],
    ["yourself-color",        {default: "#9bc5ef",     type: "color",    label: "", width: "100"}],
    ["show-userpics",         {default: "onMouseOver", type: "radio",    label: "Показывать фото пользователей",
                              values:[{v: "showAlways", descr: "Показывать всегда"}, {v: "showThumbs", descr: "Показывать thumbs"}, {v: "onMouseOver", descr: "При наведении"}, {v: "no", descr: "Не показывать"}]}],
    ["max-userpic-width",     {default: "100",         type: "input",    label: "Макс. ширина фото", suffix: "px. Желательно не более 150", width: "50"}],
    ["show-imgs",             {default: "onMouseOver", type: "radio",    label: "Показывать картинки",
                              values:[{v: "showAlways", descr: "Показывать всегда"}, {v: "onMouseOver", descr: "При наведении"}, {v: "no", descr: "Не показывать"}]}],
    ["max-img-width",         {default: "500",         type: "input",    label: "Макс. ширина картинки", suffix: "px", width: "50"}],
    ["limit-embedded-img-width", {default: "true",        type: "checkbox", label: "Ограничивать ширину вставленных изображений"}],
    ["show-youtube-title",    {default: "true",        type: "checkbox", label: "Показывать наименования роликов youtube, макс. длина"}],
    ["max-youtube-title",     {default: "40",          type: "input",    label: "", suffix: "символов", width: "50"}],
    ["youtube-prefix",        {default: "youtube",     type: "input",    label: "Префикс youtube", suffix: "", width: "100"}],
    ["first-post-tooltip",    {default: "true",        type: "checkbox", label: "Отображать тултип нулевого поста ссыки на другую ветку"}],
    ["add-name-to-message",   {default: "true",        type: "checkbox", label: "Кнопка для ввода имени в сообщение"}],
    ["add-name-style",        {default: '{"font-size": "100%"}', type: "input",    label: "Стиль кнопки", width: "350", suffix: "любые свойства css"}],
    ["user-autocomplete",     {default: "true",        type: "checkbox", label: "Дополнение имен пользователей. При написании @"}],
    ["fix-broken-links",      {default: "true",        type: "checkbox", label: "Чинить поломанные ссылки (с русскими символами)"}],
    ["scroll-tooltip-on-main", {default: "true",       type: "checkbox", label: "При скролле этотого тултипа переходить к след/пред сообщениям"}],
    ["use-ignore",            {default: "false",       type: "checkbox", label: "Игнорировать следующих пользователей (имена через запятую)"}],
    ["ignore-list",           {default: "",            type: "input",    label: "", width: "550"}]
]);

let formOptions = [
    {
        id: 'tab1',
        name: 'Тултипы',
        rows: [
            ['show-tooltips', 'tooltip-delay'],
            ['remove-tooltip-on-leave', 'remove-tooltip-delay'],
            ['show-tooltips-on-main'],
            ['scroll-tooltip-on-main'],
            ['first-post-tooltip'],
        ]
    },
    {
        id: 'tab2',
        name: 'Инфо',
        rows: [
            ['mark-author', 'author-color'],
            ['mark-yourself', 'yourself-color'],
            ['show-userpics'],
            ['max-userpic-width'],
            ['add-name-to-message'],
            ['add-name-style']
        ]
    },
    {
        id: 'tab3',
        name: 'Текст',
        rows: [
            ['show-imgs'],
            ['max-img-width'],
            ['limit-embedded-img-width'],
            ['show-youtube-title', 'max-youtube-title'],
            ['youtube-prefix'],
            ['fix-broken-links'],
            ['replace-catalog-to-is']
        ]
    },
    {
        id: 'tab4',
        name: 'Прочее',
        rows: [
            ['open-in-new_window'],
            ['user-autocomplete'],
            ['use-ignore'],
            ['ignore-list']
        ]
    }
];

function utimeToDate(utime) {
    let a = new Date(utime*1000);
    let year  = a.getFullYear();
    let month = a.getMonth() + 1;
    let date  = a.getDate();
    let hours = a.getHours();
    let minutes = "0" + a.getMinutes();

    return '' + date + '.' + month + '.' + year + ' - ' + hours + ':' + minutes.substr(-2);
}

function parseJSON(text) {
    try {
        text = text
            .replace(/\\</g, '<')
            .replace(/\\>/g, '>')
            .replace(/\\&/g, '&')
            .replace(/\\'/g, "'");

        return JSON.parse(text);
        //return eval(text);
    } catch(e) {
        console.log(e.message);
        console.log(text);
        return null;
    }
}

function processLinkToMistaCatalog(element, url) {
    //http://www.forum.mista.ru/topic.php?id=783361
    if (url.search("catalog.mista.ru") === -1) return false;

    if (options.get("replace-catalog-to-is").value === 'true') {
        let text = $(element).text();
        let newUrl   = url.replace(/catalog.mista/i, "infostart");
        let newTrext = text.replace(/catalog.mista/i, "infostart");

        $(element).attr("href", newUrl);
        $(element).text(newTrext);
    }

    return true;
}

// ----------------Options-------------------------------------
function readAllOptions(){
    for (let [name, option] of options) {
        option.value = readOption(name, option.default);
    }
}

function saveOption(name, value) {
    window.localStorage.setItem(name, String(value));
}

function readOption(name) {
    let value = window.localStorage.getItem(name);
    return value || options.get(name).default;
}

function loadOptions(param){

    param = param || 'value';

    for (let [name, option] of options){
        if (option.type === 'checkbox'){
            if (option[param] === 'true') $(`#${name}`).prop("checked", "checked");

        } else if (option.type === 'radio'){
            $(`input:radio[name="${name}"][value="${option[param]}"]`).prop("checked", "checked");

        } else if (option.type === 'input'){
            $(`#${name}`).val(option[param]);

        } else if (option.type === 'color'){
            $(`#${name}`).val(option[param].toUpperCase());
        }
    }
}

function openMistaScriptOptions(){
    let html =
       `<div id="mista-script-overlay" class="options-form-overlay" ></div>
        <div id="mista-script" class="options-form">
             <span id="closeOptions" class="close-button">
                  <b> x </b>
             </span>
             <div class="options-header" style="cursor: default">
                 <b>Настройки Mista.Script</b> version ${mistaScriptVersion}
             </div>
             <div class="tabs">`;

    for (let tab of formOptions){
        html += `<div id=${tab.id} class="tab">${tab.name}</div>`;
    }

    html += `</div>
             <div id="tab_content" style="padding:5px">`;

    for (let tab of formOptions){

        html += `<div id="${tab.id}_cont" class="tab-cont">`;

        for (let row of tab.rows){

            //html += '<div style="margin-bottom:5px">';
            html += '<div>';

            for (let name of row){

                let option = options.get(name);

                if (option.type === 'checkbox') {
                    html +=
                        `<input id="${name}" type="checkbox" name="${name}">
                         <label for="${name}">${option.label}</label>`;

                } else if (option.type === 'input' || option.type === 'color') {
                    if (option.label){
                        html += `<label for="${name}">${option.label}</label>`;
                    }
                    let typeColor = (option.type === 'color' ? ' type="color"': '');
                    html += `<input id="${name}" name="${name}" style="margin-left:5px; width: ${option.width}px" ${typeColor}>`;
                    if (option.suffix){
                        html += ' ' + option.suffix;
                    }
                } else if (option.type === 'radio') {
                    html += `<label for="${name}">${option.label}</label><br>`;
                    for (let value of option.values){
                        html += `<input type="radio" name="${name}" value="${value.v}"> ${value.descr}`;
                    }
                }
            }

            html += '</div>';
        }

        html += '</div>';
    }
    html +=
       `</div>
        <div id="options-footer" class="options-footer">
           <div style="margin: 0px 0px 5px 10px;">После применения настроек страницу нужно перезагрузить</div>
           <div style="padding: 5px 10px 5px 10px; border-top: 1px solid silver; background-color:#eee">
              <button id="applyOptions" class="sendbutton" style="margin: 5px; height: 30px">OK</button>
              <button id="cancelOptions" class="sendbutton" style="margin: 5px; float: left;height: 30px">Отмена</button>
              <button id="defaultOptions" class="sendbutton" style="margin: 5px; float: right; height: 30px">Сбросить настройки</button>
           </div>
           </div>
        </div>`;

    $(html).appendTo('#body');
    //$('#mista-script').draggable();
    $('body').css({"overflow-y": "hidden"});

    let tabId = formOptions[0].id;
    $(`#${tabId}`).addClass('active');
    $(`#${tabId}_cont`).addClass('active');

    $('.tab').on("click", function() {
        $(".tab").removeClass('active');
        $(".tab-cont").removeClass('active');
        $(this).addClass("active");

        let id = $(this).attr('id');
        $(`#${id}_cont`).addClass("active");
    });
    loadOptions();

    $('#applyOptions').click(function(){

        for (let [name, option] of options){

            if (option.type === 'checkbox'){
                option.value = String($(`#${name}`).is(':checked'));

            } else if (option.type === 'radio'){
                option.value = $(`input:radio[name=${name}]:checked`).val();

            } else if (option.type === 'input'){
                option.value = $(`#${name}`).val();

            } else if (option.type === 'color'){
                option.value = $(`#${name}`).val();
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
        loadOptions('default');
    });
}

// ----------------Tooltips-------------------------------------
function tooltipHtml(msgId) {
    //min-width: 500px; width:auto; max-width: 1200px
    let html =
    `<div id="tooltip_id${msgId}" msg-id="${msgId}" class="gensmall" style="position:absolute; background:#FFFFE1; border:1px solid #000000; width:650px; font-weight:normal;">
        <div id="tooltip-header${msgId}" msg-id="${msgId}" class="tooltip-header">
            <span><b>Подождите...</b></span>
        </div>
        <div id="tooltip-text${msgId}" msg-id="${msgId}" class="tooltip-text">
            <span>Идет ajax загрузка.<br/>Это может занять некоторое время.</span>
        </div>
        <span id="tooltip-close${msgId}" msg-id="${msgId}" class="close-button">
            <b> x </b>
        </span>
    </div>`;
    return html;
}

function removeTooltip() {
    // remove all subsequent tooltips
    let msgId = $(this).attr("msg-id");
    let ind = tooltipsOrder.indexOf(msgId);
    for (let i = ind; i < tooltipsOrder.length; i++) {
        let tempMsgId = tooltipsOrder[i];
        if (tooltipsMap[tempMsgId]) tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder.splice(ind);
}

function removeAllTooltips() {
    // remove all subsequent tooltips
    for (let i = 0; i < tooltipsOrder.length; i++) {
        let tempMsgId = tooltipsOrder[i];
        if (tooltipsMap[tempMsgId]) tooltipsMap[tempMsgId].remove();
        tooltipsMap[tempMsgId] = null;
    }
    tooltipsOrder = [];
}

function setMsgText(topicId, msgId, elemHeader, elemText){
    let user;
    if (topicId === currentTopicId) user = $(`#tduser${msgId}`).html();
    if (user) {
        elemHeader.html(user);
        let text = $(`#${msgId}`).html();
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

    if (msgId === 'F') {
        $.ajax({
            url: `ajax_gettopic.php?id=${topicId}`
        }).done(function(data) {
            let dataObj = parseJSON(data);
            setMsgTextAjax(topicId, dataObj.answers_count, elemHeader, elemText);
        });
        return;
    }

    let apiUrl = `ajax_topic.php?id=${topicId}&from=${msgId}&to=${(+msgId + 1)}`;

    $.ajax({
        url: apiUrl
    }).done(function(data) {
        dataObj = parseJSON(data);
        if (!dataObj || dataObj.length === 0 || $.isEmptyObject(dataObj)) {
            elemText.html(`Сообщение не найдено<BR>Topic id: ${topicId}<BR>Msg id: ${msgId}`);
            return;
        }
        let msgArr = dataObj.filter(function(a){ return a.n == msgId; });
        if (msgArr.length === 1) {
            let msg = msgArr[0];
            let text = msg.text.replace(/\(([0-9]+)\)/g, '<a href="topic.php?id=' + topicId + '#$1">($1)</a>');
            let user =
                `<b>${msg.user}</b><br>
                 <span class='message-info'>${msg.n}  - ${utimeToDate(msg.utime)}</span>`;
            elemText.html(text);
            if (elemHeader) elemHeader.html(user);
            run(elemHeader, elemText);
            elemText.find('img').css('max-width: 642px');
            elemText.data('msgId', msgId);
        } else {
            elemHeader.html('<b>Сообщение не найдено</b>');
            elemText.html('Возможно оно скрыто или удалено');
            return;
        }
    });
}

function loadDataMsg(topicId, msgId){
    return function() {
        setMsgText(topicId, msgId, $(`#tooltip-header${msgId}`), $(`#tooltip-text${msgId}`));
    };
}

function createTooltip(link, msgId, topicId, scroll) {

    let loc = $(link).offset();
    let left = loc.left;
    if ($(window).width() - loc.left < 100) {
        left = left - 630;
    }

    let tooltip = $(`#tooltip_id${msgId}`);
    if (tooltip.length > 0) {
        tooltip.css({
            "top": loc.top + "px",
            "left": left + "px"
            //"z-index": "999"
         });
        return;
    }
    $(tooltipHtml(msgId)).appendTo('#body');

    let elem = $(`#tooltip_id${msgId}`)
        .draggable()
        .css({
            "top": loc.top + "px",
            "left": left + "px"
            //"z-index": "999"
         })

        .click(removeTooltip);

    if (scroll) {
        elem.bind('mousewheel DOMMouseScroll', function(e){
            e.preventDefault();
            let delta = e.wheelDelta || -e.detail || e.originalEvent.wheelDelta || -e.originalEvent.detail;
            let newMsgId = +$(`#tooltip-text${msgId}`).data('msgId') + (delta > 0 ? -1 : 1);
            setTimeout(function(){
                setMsgText(topicId, newMsgId, $(`#tooltip-header${msgId}`), $(`#tooltip-text${msgId}`));
            }, 100);
        });
    }

    tooltipsMap[msgId] = elem;
    tooltipsOrder.push(msgId);

    if (options.get('remove-tooltip-on-leave').value === 'true') {

        elem.hover(function(){
            if (elem.is(':animated')) elem.stop().animate({opacity:'100'});
        }, function(){
            elem.fadeOut(+options.get('remove-tooltip-delay').value, function(){
                tooltipsMap[msgId] = null;
                let ind = tooltipsOrder.indexOf(msgId);
                tooltipsOrder.splice(ind, 1);
                $(this).remove();
            });
        });
    }
    return elem;
}

function attachTooltip(link, msgId, topicId, loadDataFunc, scroll) {

    let timer;
    $(link).hover(function(){
        timer = setTimeout(function() {
            createTooltip(link, msgId, topicId, scroll);
            loadDataFunc();
        }, +options.get('tooltip-delay').value);
    },
    function() {
        // on mouse out, cancel the timer
        clearTimeout(timer);
    });

    $(link).mousedown(function(event){
        clearTimeout(timer);
    });
}

function processLinkToPost(element, url, onlyBindEvents, scroll) {
    let topicId, msgId;
    try {
        topicId = url.match(/topic.php\?id=([0-9]+)($|\&|#)/)[1];
    } catch(e) {}
    try {
        msgId = url.match(/#(F|[0-9]+)/)[1];
    } catch(e) {}

    if (!topicId && !msgId) return false;

    if (!topicId) topicId = currentTopicId;
    if (!msgId) msgId = "0";

    if (topicId !== currentTopicId) {
        if (options.get('first-post-tooltip').value !== 'true') {
            return true;
        } else {
            if (!onlyBindEvents && $(element).text().search(/\([0-9]+\)/) === -1) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        }
    }

    if (topicId === currentTopicId && options.get('show-tooltips').value !== 'true') return true;

    attachTooltip(element, msgId, topicId, loadDataMsg(topicId, msgId), scroll);
}

// ----------------Images--------------------------------------
function loadDataImg(url, id, header){

    header = header || 'Картинка';

    return function(){
        let maxWidth = options.get('max-img-width').value;
        $(`#tooltip-header${id}`).html(`<b>${header}</b>`);
        $(`#tooltip-text${id}`).html(`<img src="${url.img}" style="max-width: ${maxWidth}px; height:auto;">`);
        $(`#tooltip-text${id} img`).on('load', function(){
            if ($(this).height() === 1) {
                $(`#tooltip-text${id}`).text('Картинка отсутствует');
            } else {
                $(`#tooltip_id${id}`).width($(this).width() + 8);
            }
        }).on('error', function(){
            this.src = url.altImg;
            $(this).off('error');
        });
    };
}

function getImgUrl(url) {

    let img, altImg;

    if (url.search("ximage.ru/index.php") !== -1) {
        let imgId = url.match(/id=(.+)$/i)[1];
        img    = "http://ximage.ru/data/imgs/" + imgId + ".png";
        altImg = "http://ximage.ru/data/imgs/" + imgId + ".jpg";

    } else if (url.search(/.+\.(jpg|jpeg|png|gif)$/i) !== -1) {
        img = url;

    } else if (url.search(/skrinshoter\.ru/i) !== -1) {
        img    = url.replace(/\?a$/i, ".png");
        if (img === url) img = url + ".png";

        altImg = url.replace(/\?a$/i, ".jpg");
        if (altImg === url) altImg = url + ".jpg";

    } else if (url.search(/joxi\.ru/i) !== -1) {
        img    =  url + ".png";
        altImg =  url + ".jpg";

    } else if (url.search(/savepic\.ru/i) !== -1) {
        //http://savepic.ru/14650331.htm
        img    = url.replace(/\.htm/i, ".png");
        altImg = url.replace(/\.htm/i, ".jpg");
    }

    return {img, altImg};
}

function processLinkToImage(element, url, onlyBindEvents) {

    let imgUrl;
    try {
        imgUrl = getImgUrl(url);
    } catch(e) {
        console.error(e);
    }
    if (!imgUrl.img) return false;
    if ($(element).text() === '') return true;

    if (options.get('show-imgs').value === 'showAlways'){
        if (!onlyBindEvents) {
            $(element).text("");
            let html = '';
            let prev = $(element).prev();
            if (prev.length === 0) {
                html = '<br>';
            }
            html += `<img src="${imgUrl.img}" style="max-width: ${options.get('max-img-width').value}px; height:auto;"/>`;
            $(html).on('error', function(){
                this.src = imgUrl.altImg;
                $(this).off('error');
            }).appendTo($(element));
        }

    } else if (options.get('show-imgs').value === 'onMouseOver') {
        if (!onlyBindEvents) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        attachTooltip(element, '_p', '', loadDataImg(imgUrl, "_p"));
    }

    return true;
}

function processBrokenLink(element, url, onlyBindEvents) {
    if (options.get('fix-broken-links').value === 'true') {

        if ($(element).attr("class") === 'extralink' && !onlyBindEvents) {

            let regExp = /\[img\](.+)\[\/img\]/i;
            if (url.search(regExp) !== -1) {
                url = url.match(regExp)[1];
                $(element).prop('href', url);
                return url;
            }
            let parentHtml = $(element).parent().html();
            let escapedUrl = url
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]')
                .replace(/\./g, '\.')
                .replace(/\./g, '\\.')
                .replace(/\*/g, '\\*')
                .replace(/\+/g, '\\+')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)')
                .replace(/\?/g, '\\?')
                .replace(/\//g, '\\/');
            try {
                let regExp = new RegExp(escapedUrl + '<\/a>(\\)|[а-яёА-ЯЁ0-9#\\-\\+\\_\\%\\?]*)');
                let arr = parentHtml.match(regExp);
                if (arr && arr.length > 1) {
                    if (arr[1] === ')' &&  url.search('\\(') === -1) {
                        return url;
                    }
                    url = url + arr[1];
                    $(element).prop("href", url);
                    return url;
                }
            } catch(e) {
                console.error(e);
            }
        }
    }

    return url;
}

// ----------------Youtube-------------------------------------
function setYoutubeTitle(link, videoId, onlyBindEvents) {

    if (onlyBindEvents) return;

    let apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBPtVWaQ7iGkObgyavKoNVQdfPwczAdQUE&&fields=items(snippet(title))&part=snippet&id=${videoId}`;

    $.ajax({
        url: apiUrl
    }).done(function(data){
        try {
            let fullTitle = data.items[0].snippet.title;
            let title = fullTitle;
            let maxLength = +options.get('max-youtube-title').value;
            if (fullTitle.length > maxLength + 5) title = title.substring(0, maxLength) + '...';
            $(link).text(options.get('youtube-prefix').value + ': ' + title);
            $(link).attr('title', fullTitle);
        } catch(e) {
            console.log(e.message);
            console.log(data);
        }
    });
}

function processLinkToYoutube(element, url, onlyBindEvents) {

    let videoId;
    // youtube.com/watch?v=videoId&t=
    if (url.search(/youtube/) !== -1) {
        if (options.get('show-youtube-title').value === 'true'){
            try{
                videoId = url.match(/v=(.+?)(\&|\?|$)/)[1];
            } catch(e){}
            if (videoId) {
                setYoutubeTitle(element, videoId, onlyBindEvents);
            }
        }
        return true;
    }

    // youtu.be/videoId?t=
    if (url.search(/youtu\.be/) !== -1) {
        if (options.get('show-youtube-title').value === 'true'){
            try{
                videoId = url.match(/e\/(.+?)(\&|\?|$)/)[1];
            } catch(e){}
            if (videoId) {
                setYoutubeTitle(element, videoId, onlyBindEvents);
            }
        }
        return true;
    }

    return false;
}

// ----------------Users---------------------------------------
function processLinkToUser(element, url, userPostMap, onlyBindEvents) {

    if (options.get('show-userpics').value === 'no') return;
    let userId = $(element).attr('data-user_id');
    if (!userId) {
        let arr = url.match(/users\.php\?id=(\d+)/);
        if (arr.length >= 2)
            userId = arr[1];
    }
    if (!userId) return;

    let userName = $(element).attr('data-user_name');
    userName = userName || $(element).text();

    let parentId = $(element).parent().attr('id');

    let imgUrl;
    if (options.get('show-userpics').value === 'showThumbs') {
        imgUrl = `/users_photo/thumb/${userId}.jpg`;
    } else {
        imgUrl = `/users_photo/mid/${userId}.jpg`;
    }

    if (options.get('show-userpics').value === 'onMouseOver' || !parentId) {
        let user = $(element).text();
        attachTooltip(element, `_p${userId}`, '', loadDataImg({img: imgUrl}, `_p${userId}`, user));

    } else {
        if (!onlyBindEvents) {

            let msgId = +parentId.replace('tduser', '');
            if (userPostMap[msgId - 1] !== userId) {

                let img = $(`<img src="${imgUrl}" style="max-width: ${options.get('max-userpic-width').value}px; height: auto"><br>`).insertBefore($(element));
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

    if (options.get('add-name-to-message').value === 'true') {
        let span;
        if (!onlyBindEvents) {
            span = $(`<span id="addUserToMessage${userId}" class="agh" style="cursor: pointer"> &#9654;</span>`).insertAfter($(element));
            try {
                span.css(JSON.parse(options.get('add-name-style').value));
            } catch(e) {
                console.error("incorrect css for button");
                console.error(e.message);
            }
        } else {
            span = $(`#addUserToMessage${userId}`);
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
        let space = '';
        let lastLetter = text.slice(-1);
        if (lastLetter !== ' ' && lastLetter !== '\n' && text.length > 0) space = ' ';

        if (userName.search(' ') === -1)
            return text + space + '@' + userName;
        else {
            return text + space + '@{' + userName + '}';
        }
    });
}

function processLinkToAuthor(element, url, onlyBindEvents) {

    if ($(element).text() !== topicAuthor) return false;
    if (options.get('mark-author').value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({'background': options.get('author-color').value});
    return true;
}

function processLinkToYourself(element, url, onlyBindEvents) {

    if (url !== yourUrl) return false;
    if (options.get('mark-yourself').value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({'background': options.get('yourself-color').value});
    return true;
}

// ----------------Run-----------------------------------------
function run(parentElemHeader, parentElemText, onlyBindEvents){

    // main page
    if (!parentElemText) {
         if (options.get('show-tooltips-on-main').value === 'true') {
            $('td:nth-child(2).cc').each(function(){
                let text = $(this).text();
                $(this).text("");
                let url = $(this).next().find('a:first()').attr("href") + "&p=last20#F";
                let link = $(`<a href="${url}" style="color: black">${text}</a>`).appendTo($(this));
                if (options.get('open-in-new_window').value === 'true') link.prop("target", "_blank");
                let scroll = options.get('scroll-tooltip-on-main').value === 'true';
                processLinkToPost(link, url, true, scroll);
            });
        }
        if (options.get('open-in-new_window').value === 'true') {
            $('a', 'td[id^="tt"]').each(function(a){
                $(this).prop("target", "_blank");
            });
        }
    }

    parentElemHeader = parentElemHeader || $('td[id^=tduser], li.whois-user');
    parentElemText   = parentElemText   || $('td[id^=tdmsg]');

    // Process all links in the user name area
    let userPostMap = {};
    parentElemHeader.find('a').each(function(a){

        let url = $(this).attr('href');
        processLinkToUser(this, url, userPostMap, onlyBindEvents);
        if (processLinkToAuthor(this, url, onlyBindEvents)) return;
        if (processLinkToYourself(this, url, onlyBindEvents)) return;

    });

    // Process all links in the message area
    parentElemText.find('a').each(function(a){

        let url = $(this).attr('href');
        url = processBrokenLink(this, url, onlyBindEvents);
        if (processLinkToImage(this, url, onlyBindEvents)) return;
        if (processLinkToYoutube(this, url, onlyBindEvents)) return;
        if (processLinkToMistaCatalog(this, url, onlyBindEvents)) return;
        if (processLinkToPost(this, url, onlyBindEvents)) return;

    });

    if (options.get('limit-embedded-img-width').value === 'true') {
        parentElemText.find('img').each(function(img){
            let url = $(this).attr('src');
            $(this).css('max-width', options.get('max-img-width').value + 'px')
            .wrap(`<a href="${url}"></a>`);
        });
    }
}

function addUserAutocomplete(){

    if (options.get('user-autocomplete').value !== 'true') return;

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

    let count = 20;
    $('textarea').textcomplete([{
        match: /(^|\s)@([a-zA-Zа-яА-Я0-9_]{2,})$/,
        search: function (term, callback) {
            if (!term) return;
            $.ajax({
                url: `http://forum-mista.pro/api/users.php?name=${encodeURI(term)}&count=${count}`
            }).done(function(data){
                let dataObj = JSON.parse(data).map(function(a){return a.name;});
                callback(dataObj);
            }).fail(function () {
                callback([]); // Callback must be invoked even if something went wrong.
            });
        },
        replace: function (word) {
            if (word.search(' ') === -1)
                return ' @' + word;
            else
                return ' @{' + word + '} ';
        },
        template: function(value, term) {
            return `<b>${term}</b>` + value.substring(term.length);
        },
        // index in match result
        index: 2
    }], {
        appendTo: 'body',
        dropdownClassName: 'dropdown-menu',
        maxCount: count
    });
}

function hideIgnored() {

    if (options.get('use-ignore').value !== 'true') return;

    let userIds = options.get('ignore-list').value.split(',').map((val) => val.trim());
    let selector = "[data-user_name='" + userIds.join("'],[data-user_name='") + "']";
    $(selector, 'tr[id^=message]').parent().parent().hide();

}

(function() {

    let currentUrl = window.location.href;
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
        if ($(e.target).closest('div[id^=tooltip_id]').length === 0) removeAllTooltips();
    });

    $('#table_messages').on('mista.load', 'tr', function(event){
        //<tr id=message_id>
        let elemHeader = $(this).find('td[id^=tduser]');
        let elemText = $(this).find('td[id^=tdmsg]');
        run(elemHeader, elemText);
    });

    // style  for options form & tooltips
    $("<style>")
    .prop("type", "text/css")
    .html(
        `.tabs:after{
		     content: "";
		     display: block;
		     clear: both;
		     height: 0;
       	}
		.tabs{
			 border-right: none;
             background-color: #eee;
             border-bottom: solid 1px silver;
		}
        .tab {
			 float: left;
			 cursor: pointer;
             background-color: #eee;
             margin-top: 3px;
             border-radius: 10px 10px 0px 0px;
             border-left: solid 1px grey;
             border-top: solid 1px grey;
		 	 padding: 10px 20px;
        }
        .tab:first-child{
             margin-left: 10px;
		}
		.tab:last-child{
             border-right: solid 1px grey;
		}
        .tab.active{
             background-color: #FFFFE1;
             border-bottom:  solid 1px transparent;
             margin-bottom: -1px;
		}
        .tab-cont > div{
            margin-bottom:5px;
        }
		.tab-cont{
			display: none;
		    padding: 5px 5px;
		}
		.tab-cont.active{
		    display: block;
		}

        .options-form {
            position:fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background:#FFFFE1;
            border:1px solid #000000;
            width:630px;
            min-height: 400px;
            font-weight:normal;
            z-index: 1001;
        }
        .options-form-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            opacity: 0.85;
            z-index:1000;
            pointer-events: none;
        }
        .options-header {
            cursor: move;
            background:white;
            padding:4px;
            border-bottom:1px solid silver;
        }
        .options-footer {
            position: absolute;
            bottom: 0px;
            width: 100%;
        }
        .tooltip-header{
            cursor: move;
            background:white;
            padding:4px;
            border-bottom:1px solid silver;
        }
        .tooltip-text{
            padding:4px;
            word-break:break-word;
        }
        .close-button{
            display: block;
            position: absolute;
            right: 6px;
            top: 3px;
            cursor:pointer;
        }`)
    .appendTo("head");

    if (typeof $.ui == 'undefined') {

        $.when(
            $.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'),
            $.getScript('https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js'),
            $.Deferred(function( deferred ){
                $( deferred.resolve );
            })
        ).done(function(){
            hideIgnored();
            addUserAutocomplete();
            run();
        });

    } else {
        hideIgnored();
        addUserAutocomplete();
        run();
    }
})();
