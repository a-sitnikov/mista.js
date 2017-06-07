"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      1.1.8
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

var mistaScriptVersion = '1.1.8';
var tooltipsOrder = [];
var tooltipsMap = {};
var currentTopicId = 0;
var yourUrl = void 0;
var topicAuthor = void 0;

var options = new Map([["show-tooltips", { default: "true", type: "checkbox", label: "Показывать тултипы, задержка" }], ["tooltip-delay", { default: "500", type: "input", label: "", suffix: "мс", width: "50" }], ["replace-catalog-to-is", { default: "true", type: "checkbox", label: "Обратно заменять catalog.mista.ru на infostart.ru" }], ["mark-author", { default: "true", type: "checkbox", label: "Подсвечивать автора цветом" }], ["author-color", { default: "#ffd784", type: "color", label: "", width: "100" }], ["mark-yourself", { default: "true", type: "checkbox", label: "Подсвечивать себя цветом" }], ["yourself-color", { default: "#9bc5ef", type: "color", label: "", width: "100" }], ["show-userpics", { default: "onMouseOver", type: "radio", label: "Показывать фото пользователей",
    values: [{ v: "showAlways", descr: "Показывать всегда" }, { v: "showThumbs", descr: "Показывать thumbs" }, { v: "onMouseOver", descr: "При наведении" }, { v: "no", descr: "Не показывать" }] }], ["max-userpic-width", { default: "100", type: "input", label: "Макс. ширина фото", suffix: "px. Желательно не более 150", width: "50" }], ["show-imgs", { default: "onMouseOver", type: "radio", label: "Показывать картинки",
    values: [{ v: "showAlways", descr: "Показывать всегда" }, { v: "onMouseOver", descr: "При наведении" }, { v: "no", descr: "Не показывать" }] }], ["max-img-width", { default: "500", type: "input", label: "Макс. ширина картинки", suffix: "px", width: "50" }], ["show-youtube-title", { default: "true", type: "checkbox", label: "Показывать наименования роликов youtube, макс. длина" }], ["max-youtube-title", { default: "40", type: "input", label: "", suffix: "символов", width: "50" }], ["youtube-prefix", { default: "youtube", type: "input", label: "Префикс youtube", suffix: "", width: "100" }], ["first-post-tooltip", { default: "true", type: "checkbox", label: "Отображать тултип нулевого поста ссыки на другую ветку" }], ["add-name-to-message", { default: "true", type: "checkbox", label: "Кнопка для ввода имени в сообщение" }], ["add-name-style", { default: '{"font-size": "100%"}', type: "input", label: "Стиль кнопки", width: "350", suffix: "любые свойства css" }], ["user-autocomplete", { default: "true", type: "checkbox", label: "Дополнение имен пользователей. При написании @" }]]);

var formOptions = [['show-tooltips', 'tooltip-delay'], ['replace-catalog-to-is'], ['first-post-tooltip'], ['mark-author', 'author-color'], ['mark-yourself', 'yourself-color'], ['show-userpics'], ['max-userpic-width'], ['show-imgs'], ['max-img-width'], ['show-youtube-title', 'max-youtube-title'], ['youtube-prefix'], ['add-name-to-message'], ['add-name-style'], ['user-autocomplete']];

function utimeToDate(utime) {
    var a = new Date(utime * 1000);

    var year = a.getYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hours = a.getHours();
    var minutes = "0" + a.getMinutes();

    return date + '.' + month + '.' + year + ' - ' + hours + ':' + minutes.substr(-2);
}

function parseJSON(text) {
    try {
        return eval(text);
    } catch (e) {
        console.log(e.message);
        console.log(text);
        return null;
    }
}

function processLinkToMistaCatalog(element, url) {
    //http://www.forum.mista.ru/topic.php?id=783361
    if (url.search("catalog.mista.ru") === -1) return false;

    if (options.get("replace-catalog-to-is").value === 'true') {
        var text = $(element).text();
        var newUrl = url.replace(/catalog.mista/i, "infostart");
        var newTrext = text.replace(/catalog.mista/i, "infostart");

        $(element).attr("href", newUrl);
        $(element).text(newTrext);
    }

    return true;
}

// ----------------Options-------------------------------------
function readAllOptions() {
    //let keys = Object.keys(options);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                name = _step$value[0],
                option = _step$value[1];

            //let name = keys[i];
            option.value = readOption(name, option.default);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

function saveOption(name, value) {
    window.localStorage.setItem(name, String(value));
}

function readOption(name) {
    var value = window.localStorage.getItem(name);
    return value || options.get(name).default;
}

function loadOptions(param) {

    param = param || 'value';

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                name = _step2$value[0],
                option = _step2$value[1];

            if (option.type === 'checkbox') {
                if (option[param] === 'true') $("#" + name).prop("checked", "checked");
            } else if (option.type === 'radio') {
                $("input:radio[name=\"" + name + "\"][value=\"" + option[param] + "\"]").prop("checked", "checked");
            } else if (option.type === 'input') {
                $("#" + name).val(option[param]);
            } else if (option.type === 'color') {
                $("#" + name).val(option[param].toUpperCase());
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }
}

function openMistaScriptOptions() {
    var html = "<div id=\"mista-script-overlay\" style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index:1000; opacity: 0.85\"; pointer-events: none;></div>\n        <div id=\"mista-script\" style=\"position:fixed; left: 25%; top: 25%; background:#FFFFE1; border:1px solid #000000; width:630px; font-weight:normal; z-index: 1001\">\n             <span id=\"closeOptions\" style=\"POSITION: absolute; RIGHT: 6px; TOP: 3px; cursor:hand; cursor:pointer\">\n                  <b> x </b>\n             </span>\n             <div style=\"cursor: move; background:white; padding:4px; border-bottom:1px solid silver\">\n                 <b>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Mista.Script</b> version " + mistaScriptVersion + "\n             </div>\n             <div style=\"padding:5px\">";

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = formOptions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var row = _step3.value;

            html += '<div style="margin-bottom:5px">';

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = row[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var name = _step5.value;


                    var option = options.get(name);

                    if (option.type === 'checkbox') {
                        html += "<input id=\"" + name + "\" type=\"checkbox\" name=\"" + name + "\">\n                    '<label for=\"" + name + "\">" + option.label + "</label>";
                    } else if (option.type === 'input' || option.type === 'color') {
                        if (option.label) {
                            html += "<label for=\"" + name + "\">" + option.label + "</label>";
                        }
                        var typeColor = option.type === 'color' ? ' type="color"' : '';
                        html += "<input id=\"" + name + "\" name=\"" + name + "\" style=\"margin-left:5px; width: " + option.width + "px\" " + typeColor + ">";
                        if (option.suffix) {
                            html += ' ' + option.suffix;
                        }
                    } else if (option.type === 'radio') {
                        html += "<label for=\"" + name + "\">" + option.label + "</label><br>";
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = option.values[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var value = _step6.value;

                                html += "<input type=\"radio\" name=\"" + name + "\" value=\"" + value.v + "\"> " + value.descr;
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            html += '</div>';
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    html += "<div>\u041F\u043E\u0441\u043B\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u043D\u0443\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</div>\n             <div>\n                  <button id=\"applyOptions\" class=\"sendbutton\" style=\"margin: 5px\">OK</button>\n                  <button id=\"cancelOptions\" class=\"sendbutton\" style=\"margin: 5px; float: left;\">\u041E\u0442\u043C\u0435\u043D\u0430</button>\n                  <button id=\"defaultOptions\" class=\"sendbutton\" style=\"margin: 5px; float: right;\">\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</button>\n             </div>\n        </div>";

    $(html).appendTo('#body');
    $('#mista-script').draggable();
    $('body').css({ "overflow-y": "hidden" });

    loadOptions();

    $('#applyOptions').click(function () {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {

            for (var _iterator4 = options[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _step4$value = _slicedToArray(_step4.value, 2),
                    name = _step4$value[0],
                    option = _step4$value[1];

                if (option.type === 'checkbox') {
                    option.value = String($("#" + name).is(':checked'));
                } else if (option.type === 'radio') {
                    option.value = $("input:radio[name=" + name + "]:checked").val();
                } else if (option.type === 'input') {
                    option.value = $("#" + name).val();
                } else if (option.type === 'color') {
                    option.value = $("#" + name).val();
                }

                saveOption(name, option.value);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({ "overflow-y": "auto" });
    });

    $('#cancelOptions, #closeOptions').click(function () {
        $('#mista-script').remove();
        $('#mista-script-overlay').remove();
        $('body').css({ "overflow-y": "auto" });
    });

    $('#defaultOptions').click(function () {
        loadOptions('default');
    });
}

// ----------------Tooltips-------------------------------------
function tooltipHtml(msgId) {
    //min-width: 500px; width:auto; max-width: 1200px
    var html = "<div id=\"tooltip" + msgId + "\" msg-id=\"" + msgId + "\" class=\"gensmall\" style=\"position:absolute; background:#FFFFE1; border:1px solid #000000; width:650px; font-weight:normal;\">\n        <div id=\"tooltip-header" + msgId + "\" msg-id=\"" + msgId + "\" style=\"cursor: move; background:white; padding:4px; border-bottom:1px solid silver\"><span><b>\u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435...</b></span></div>\n        <div id=\"tooltip-text" + msgId + "\" msg-id=\"" + msgId + "\" style=\"padding:4px\"><span>\u0418\u0434\u0435\u0442 ajax \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430.<br/>\u042D\u0442\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.</span></div>\n        <span id=\"tooltip-close" + msgId + "\" msg-id=\"" + msgId + "\" style=\"POSITION: absolute; RIGHT: 6px; TOP: 3px; cursor:hand; cursor:pointer\">\n            <b> x </b>\n        </span>\n    </div>";
    return html;
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

function setMsgText(topicId, msgId, elemHeader, elemText) {
    var user = void 0;
    if (topicId === currentTopicId) user = $("#tduser" + msgId).html();
    if (user) {
        elemHeader.html(user);
        var text = $("#" + msgId).html();
        if (!text) {
            // hidden message
            try {
                text = hidden_messages[+msgId];
            } catch (e) {}
        }
        elemText.html(text);
        elemText.find('img').css({ 'max-width': '642px' });
        run(elemHeader, elemText, true);
    } else {
        setMsgTextAjax(topicId, msgId, elemHeader, elemText);
    }
}

function setMsgTextAjax(topicId, msgId, elemHeader, elemText) {

    var apiUrl = "ajax_topic.php?id=" + topicId + "&from=" + msgId + "&to=" + (+msgId + 1);

    $.ajax({
        url: apiUrl
    }).done(function (data) {
        dataObj = parseJSON(data);
        if (!dataObj || dataObj.length === 0) {
            elemText.text('Сообщение не найдено');
            return;
        }
        var msgArr = dataObj.filter(function (a) {
            return a.n === msgId;
        });
        if (msgArr.length === 1) {
            var msg = msgArr[0];
            var text = msg.text.replace(/\(([0-9]+)\)/g, "<a href='#$1'>($1)</a>");
            var user = "<b>" + msg.user + "</b><br>\n                 <span class='message-info'>" + msg.n + "  - " + utimeToDate(msg.utime) + "</span>";
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

function loadDataMsg(topicId, msgId) {
    return function () {
        setMsgText(topicId, msgId, $("#tooltip-header" + msgId), $("#tooltip-text" + msgId));
    };
}

function createTooltip(link, msgId) {
    if ($("#tooltip" + msgId).length > 0) return;
    $(tooltipHtml(msgId)).appendTo('#body');
    var loc = $(link).offset();
    var left = loc.left;
    if ($(window).width() - loc.left < 100) {
        left = left - 630;
    }

    var elem = $("#tooltip" + msgId).draggable().css({
        "top": loc.top + "px",
        "left": left + "px"
        //"z-index": "999"
    }).click(removeTooltip);

    tooltipsMap[msgId] = elem;
    tooltipsOrder.push(msgId);

    return elem;
}

function attachTooltip(link, id, loadDataFunc) {

    var timer = void 0;
    $(link).hover(function () {
        timer = setTimeout(function () {
            createTooltip(link, id);
            loadDataFunc();
        }, +options.get('tooltip-delay').value);
    }, function () {
        // on mouse out, cancel the timer
        clearTimeout(timer);
    });
}

function processLinkToPost(element, url, onlyBindEvents) {
    var topicId = void 0,
        msgId = void 0;
    try {
        topicId = url.match(/topic.php\?id=([0-9]+)($|\&)/)[1];
    } catch (e) {}
    try {
        msgId = url.match(/#([0-9]+)/)[1];
    } catch (e) {}

    if (!topicId && !msgId) return false;

    if (!topicId) topicId = currentTopicId;
    if (!msgId) msgId = "0";

    if (topicId !== currentTopicId) {
        if (options.get('first-post-tooltip').value !== 'true') {
            return true;
        } else {
            if (!onlyBindEvents) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        }
    }

    if (topicId === currentTopicId && options.get('show-tooltips').value !== 'true') return true;

    attachTooltip(element, msgId, loadDataMsg(topicId, msgId));
}

// ----------------Images--------------------------------------
function loadDataImg(url, id, header) {

    header = header || 'Картинка';

    return function () {
        $("#tooltip-header" + id).html("<b>" + header + "</b>");
        $("#tooltip-text" + id).html("<img src=\"" + url + "\" style=\"max-width: " + options.get('max-img-width').value + "px; height:auto;\">");
        $("#tooltip-text" + id + " img").on('load', function () {
            if ($(this).height() === 1) {
                $("#tooltip-text" + id).text('Картинка отсутствует');
            } else {
                $("#tooltip" + id).width($(this).width() + 8);
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
    } else if (url.search(/skrinshoter\.ru/) !== -1) {
        return url.replace(/\?a$/, ".png");
    }
}

function processLinkToImage(element, url, onlyBindEvents) {

    var imgUrl = getImgUrl(url);
    if (!imgUrl) return false;
    if ($(element).text() === '') return true;

    if (options.get('show-imgs').value === 'showAlways') {
        if (!onlyBindEvents) {
            $(element).text("");
            var html = '';
            var prev = $(element).prev();
            if (prev.length === 0) {
                html = '<br>';
            }
            html += "<img src=\"" + imgUrl + "\" style=\"max-width: " + options.get('max-img-width').value + "px; height:auto;\"/>";
            $(html).appendTo($(element));
        }
    } else if (options.get('show-imgs').value === 'onMouseOver') {
        if (!onlyBindEvents) $('<span class="agh" style="cursor: pointer">[?]</span>').insertAfter($(element));
        attachTooltip(element, '_p', loadDataImg(imgUrl, "_p"));
    }

    return true;
}

// ----------------Youtube-------------------------------------
function setYoutubeTitle(link, videoId, onlyBindEvents) {

    if (onlyBindEvents) return;

    var apiUrl = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBPtVWaQ7iGkObgyavKoNVQdfPwczAdQUE&&fields=items(snippet(title))&part=snippet&id=" + videoId;

    $.ajax({
        url: apiUrl
    }).done(function (data) {
        try {
            var fullTitle = data.items[0].snippet.title;
            var title = fullTitle;
            if (fullTitle.length > options.get('max-youtube-title').value) title = title.substring(0, options.get('max-youtube-title').value) + '...';
            $(link).text(options.get('youtube-prefix').value + ': ' + title);
            $(link).attr('title', fullTitle);
        } catch (e) {
            console.log(e.message);
            console.log(data);
        }
    });
}

function processLinkToYoutube(element, url, onlyBindEvents) {

    var videoId = void 0;
    // youtube.com/watch?v=videoId
    if (url.search(/youtube/) !== -1) {
        if (options.get('show-youtube-title').value === 'true') {
            try {
                videoId = url.match(/v=(.+)(\&|$)/)[1];
            } catch (e) {}
            if (videoId) setYoutubeTitle(element, videoId, onlyBindEvents);
        }
        return true;
    }

    // youtu.be/videoId
    if (url.search(/youtu\.be/) !== -1) {
        if (options.get('show-youtube-title').value === 'true') {
            try {
                videoId = url.match(/e\/(.+)(\&|$)/)[1];
            } catch (e) {}
            if (videoId) setYoutubeTitle(element, videoId, onlyBindEvents);
        }
        return true;
    }

    return false;
}

// ----------------Users---------------------------------------
function processLinkToUser(element, url, userPostMap, onlyBindEvents) {

    if (options.get('show-userpics').value === 'no') return;
    var userId = $(element).attr('data-user_id');
    if (!userId) return;

    var userName = $(element).text();
    var imgUrl = void 0;
    if (options.get('show-userpics').value === 'showThumbs') {
        imgUrl = "/users_photo/thumb/" + userId + ".jpg";
    } else {
        imgUrl = "/users_photo/mid/" + userId + ".jpg";
    }

    if (options.get('show-userpics').value === 'onMouseOver') {
        var user = $(element).text();
        attachTooltip(element, '_p', loadDataImg(imgUrl, '_p', user));
    } else {
        if (!onlyBindEvents) {

            var msgId = +$(element).parent().attr('id').replace('tduser', '');
            if (userPostMap[msgId - 1] !== userId) {

                var img = $("<img src=\"" + imgUrl + "\" style=\"max-width: " + options.get('max-userpic-width').value + "px; height: auto\"><br>").insertBefore($(element));
                img.on('load', function () {
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
        var span = void 0;
        if (!onlyBindEvents) {
            span = $("<span id=\"addUserToMessage" + userId + "\" class=\"agh\" style=\"cursor: pointer\"> &#9654;</span>").insertAfter($(element));
            try {
                span.css(JSON.parse(options.get('add-name-style').value));
            } catch (e) {
                console.error("incorrect css for button");
                console.error(e.message);
            }
        } else {
            span = $("#addUserToMessage" + userId);
        }

        if (span) {
            span.click(function () {
                addUserToMessage(userId, userName);
            });
        }
    }
}

function addUserToMessage(userId, userName) {
    $('#message_text').val(function (i, text) {
        var space = '';
        var lastLetter = text.slice(-1);
        if (lastLetter !== ' ' && lastLetter !== '\n' && text.length > 0) space = ' ';
        return text + space + '@{' + userName + '}';
    });
}

function processLinkToAuthor(element, url, onlyBindEvents) {

    if ($(element).text() !== topicAuthor) return false;
    if (options.get('mark-author').value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({ 'background': options.get('author-color').value });
    return true;
}

function processLinkToYourself(element, url, onlyBindEvents) {

    if (url !== yourUrl) return false;
    if (options.get('mark-yourself').value !== 'true') return false;
    if (onlyBindEvents) return true;

    $(element).css({ 'background': options.get('yourself-color').value });
    return true;
}

// ----------------Run-----------------------------------------
function run(parentElemHeader, parentElemText, onlyBindEvents) {

    parentElemHeader = parentElemHeader || $('td[id^=tduser]');
    parentElemText = parentElemText || $('td[id^=tdmsg]');

    // Process all links in the user name area
    var userPostMap = {};
    parentElemHeader.find('a').each(function (a) {

        var url = $(this).attr('href');
        processLinkToUser(this, url, userPostMap, onlyBindEvents);
        if (processLinkToAuthor(this, url, onlyBindEvents)) return;
        if (processLinkToYourself(this, url, onlyBindEvents)) return;
    });

    // Process all links in the message area
    parentElemText.find('a').each(function (a) {

        var url = $(this).attr('href');
        if (processLinkToImage(this, url, onlyBindEvents)) return;
        if (processLinkToYoutube(this, url, onlyBindEvents)) return;
        if (processLinkToMistaCatalog(this, url, onlyBindEvents)) return;
        if (processLinkToPost(this, url, onlyBindEvents)) return;
    });
}

function addUserAutocomplete() {

    if (options.get('user-autocomplete').value !== 'true') return;

    $("<style>").prop("type", "text/css").html(".dropdown-menu {\n        background: white;\n        list-style-type:none;\n        overflow-y: auto;\n        max-height: 200px;\n        border: 1px solid #CECECE;\n    }\n    .dropdown-menu .textcomplete-item a,\n    .dropdown-menu .textcomplete-item a:hover {\n        cursor: pointer;\n        font-weight: normal;\n        color: #000;\n        position: relative;\n        padding: 3px 10px;\n        display: block;\n        border-bottom: 1px solid #CECECE;\n     }\n    .dropdown-menu .textcomplete-item.active a {\n        background: lightgrey;\n    }\n    /* Highlighting of the matching part\n    of each search result */\n    .dropdown-menu .textcomplete-item a em {\n        font-style: normal;\n        font-weight: bold;\n    }").appendTo("head");

    var count = 20;
    $('textarea').textcomplete([{
        match: /(^|\s)@([a-zA-Zа-яА-Я0-9_]{2,})$/,
        search: function search(term, callback) {
            if (!term) return;
            $.ajax({
                url: "http://forum-mista.pro/api/users.php?name=" + encodeURI(term) + "&count=" + count
            }).done(function (data) {
                var dataObj = JSON.parse(data).map(function (a) {
                    return a.name;
                });
                callback(dataObj);
            }).fail(function () {
                callback([]); // Callback must be invoked even if something went wrong.
            });
        },
        replace: function replace(word) {
            if (word.search(' ') === -1) return ' @' + word;else return ' @{' + word + '} ';
        },
        template: function template(value, term) {
            return "<b>" + term + "</b>" + value.substring(term.length);
        },
        // index in match result
        index: 2
    }], {
        appendTo: 'body',
        dropdownClassName: 'dropdown-menu',
        maxCount: count
    });
}

(function () {

    var currentUrl = window.location.href;
    try {
        currentTopicId = currentUrl.match(/id=([0-9]+)/)[1];
    } catch (e) {}

    yourUrl = $('a[href*="users.php?id="]', "#user-td").attr("href");
    topicAuthor = $("a", "#tduser0").text();

    readAllOptions();

    $('<li class="nav-item"><a href="#">Настройки Mista.Script</a></li>').appendTo("ul.nav-bar").click(openMistaScriptOptions);

    $('body').click(function (e) {
        if ($(e.target).closest('div[id^=tooltip]').length === 0) removeAllTooltips();
    });

    $('#table_messages').on('mista.load', 'tr', function (event) {
        //<tr id=message_id>
        var elemHeader = $(this).find('td[id^=tduser]');
        var elemText = $(this).find('td[id^=tdmsg]');
        run(elemHeader, elemText);
    });

    if (typeof $.ui == 'undefined') {

        $.when($.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'), $.getScript('https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js'), $.Deferred(function (deferred) {
            $(deferred.resolve);
        })).done(function () {
            addUserAutocomplete();
            run();
        });
    } else {
        addUserAutocomplete();
        run();
    }
})();