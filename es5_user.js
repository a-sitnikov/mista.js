"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      1.6.0
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

var mistaScriptVersion = '1.6.0';
var tooltipsOrder = [];
var tooltipsMap = {};
var currentTopicId = 0;
var yourUrl = void 0;
var topicAuthor = void 0;

var options = new Map([["open-in-new_window", { default: "true", type: "checkbox", label: "Открывать ветки в новом окне" }], ["show-tooltips", { default: "true", type: "checkbox", label: "Показывать тултипы, задержка" }], ["show-tooltips-on-main", { default: "true", type: "checkbox", label: "Показывать тултипы на главной странице, при наведении на кол-во ответов " }], ["tooltip-delay", { default: "500", type: "input", label: "", suffix: "мс", width: "50" }], ["remove-tooltip-on-leave", { default: "false", type: "checkbox", label: "Скрывать тултип при уходе мыши, задержка" }], ["remove-tooltip-delay", { default: "1000", type: "input", label: "", suffix: "мс", width: "50" }], ["replace-catalog-to-is", { default: "true", type: "checkbox", label: "Обратно заменять catalog.mista.ru на infostart.ru" }], ["mark-author", { default: "true", type: "checkbox", label: "Подсвечивать автора цветом" }], ["author-color", { default: "#ffd784", type: "color", label: "", width: "100" }], ["mark-yourself", { default: "true", type: "checkbox", label: "Подсвечивать себя цветом" }], ["yourself-color", { default: "#9bc5ef", type: "color", label: "", width: "100" }], ["show-userpics", { default: "onMouseOver", type: "radio", label: "Показывать фото пользователей",
    values: [{ v: "showAlways", descr: "Показывать всегда" }, { v: "showThumbs", descr: "Показывать thumbs" }, { v: "onMouseOver", descr: "При наведении" }, { v: "no", descr: "Не показывать" }] }], ["max-userpic-width", { default: "100", type: "input", label: "Макс. ширина фото", suffix: "px. Желательно не более 150", width: "50" }], ["show-imgs", { default: "onMouseOver", type: "radio", label: "Показывать картинки",
    values: [{ v: "showAlways", descr: "Показывать всегда" }, { v: "onMouseOver", descr: "При наведении" }, { v: "no", descr: "Не показывать" }] }], ["max-img-width", { default: "500", type: "input", label: "Макс. ширина картинки", suffix: "px", width: "50" }], ["limit-embedded-img-width", { default: "true", type: "checkbox", label: "Ограничивать ширину вставленных изображений" }], ["show-youtube-title", { default: "true", type: "checkbox", label: "Показывать наименования роликов youtube, макс. длина" }], ["max-youtube-title", { default: "40", type: "input", label: "", suffix: "символов", width: "50" }], ["youtube-prefix", { default: "youtube", type: "input", label: "Префикс youtube", suffix: "", width: "100" }], ["first-post-tooltip", { default: "true", type: "checkbox", label: "Отображать тултип нулевого поста ссыки на другую ветку" }], ["add-name-to-message", { default: "true", type: "checkbox", label: "Кнопка для ввода имени в сообщение" }], ["add-name-style", { default: '{"font-size": "100%"}', type: "input", label: "Стиль кнопки", width: "350", suffix: "любые свойства css" }], ["user-autocomplete", { default: "true", type: "checkbox", label: "Дополнение имен пользователей. При написании @" }], ["fix-broken-links", { default: "true", type: "checkbox", label: "Чинить поломанные ссылки (с русскими символами)" }], ["scroll-tooltip-on-main", { default: "true", type: "checkbox", label: "При скролле этотого тултипа переходить к след/пред сообщениям" }]]);

var formOptions = [{
    id: 'tab1',
    name: 'Тултипы',
    rows: [['show-tooltips', 'tooltip-delay'], ['remove-tooltip-on-leave', 'remove-tooltip-delay'], ['show-tooltips-on-main'], ['scroll-tooltip-on-main'], ['first-post-tooltip']]
}, {
    id: 'tab2',
    name: 'Инфо',
    rows: [['mark-author', 'author-color'], ['mark-yourself', 'yourself-color'], ['show-userpics'], ['max-userpic-width'], ['add-name-to-message'], ['add-name-style']]
}, {
    id: 'tab3',
    name: 'Текст',
    rows: [['show-imgs'], ['max-img-width'], ['limit-embedded-img-width'], ['show-youtube-title', 'max-youtube-title'], ['youtube-prefix'], ['fix-broken-links'], ['replace-catalog-to-is']]
}, {
    id: 'tab4',
    name: 'Прочее',
    rows: [['open-in-new_window'], ['user-autocomplete']]
}];

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
        text = text.replace(/\\</g, '<').replace(/\\>/g, '>').replace(/\\&/g, '&').replace(/\\'/g, "'");

        return JSON.parse(text);
        //return eval(text);
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
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                name = _step$value[0],
                option = _step$value[1];

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
    var html = "<div id=\"mista-script-overlay\" class=\"options-form-overlay\" ></div>\n        <div id=\"mista-script\" class=\"options-form\">\n             <span id=\"closeOptions\" class=\"close-button\">\n                  <b> x </b>\n             </span>\n             <div class=\"options-header\" style=\"cursor: default\">\n                 <b>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Mista.Script</b> version " + mistaScriptVersion + "\n             </div>\n             <div class=\"tabs\">";

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = formOptions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var tab = _step3.value;

            html += "<div id=" + tab.id + " class=\"tab\">" + tab.name + "</div>";
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

    html += "</div>\n             <div id=\"tab_content\" style=\"padding:5px\">";

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = formOptions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _tab = _step4.value;


            html += "<div id=\"" + _tab.id + "_cont\" class=\"tab-cont\">";

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = _tab.rows[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var row = _step6.value;


                    //html += '<div style="margin-bottom:5px">';
                    html += '<div>';

                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = row[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var name = _step7.value;


                            var option = options.get(name);

                            if (option.type === 'checkbox') {
                                html += "<input id=\"" + name + "\" type=\"checkbox\" name=\"" + name + "\">\n                         <label for=\"" + name + "\">" + option.label + "</label>";
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
                                var _iteratorNormalCompletion8 = true;
                                var _didIteratorError8 = false;
                                var _iteratorError8 = undefined;

                                try {
                                    for (var _iterator8 = option.values[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                        var value = _step8.value;

                                        html += "<input type=\"radio\" name=\"" + name + "\" value=\"" + value.v + "\"> " + value.descr;
                                    }
                                } catch (err) {
                                    _didIteratorError8 = true;
                                    _iteratorError8 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                            _iterator8.return();
                                        }
                                    } finally {
                                        if (_didIteratorError8) {
                                            throw _iteratorError8;
                                        }
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    html += '</div>';
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

            html += '</div>';
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

    html += "</div>\n        <div id=\"options-footer\" class=\"options-footer\">\n           <div style=\"margin-left:15px;\">\u041F\u043E\u0441\u043B\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u043D\u0443\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</div>\n           <div style=\"margin:10px\">\n              <button id=\"applyOptions\" class=\"sendbutton\" style=\"margin: 5px\">OK</button>\n              <button id=\"cancelOptions\" class=\"sendbutton\" style=\"margin: 5px; float: left;\">\u041E\u0442\u043C\u0435\u043D\u0430</button>\n              <button id=\"defaultOptions\" class=\"sendbutton\" style=\"margin: 5px; float: right;\">\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</button>\n           </div>\n           </div>\n        </div>";

    $(html).appendTo('#body');
    //$('#mista-script').draggable();
    $('body').css({ "overflow-y": "hidden" });

    var tabId = formOptions[0].id;
    $("#" + tabId).addClass('active');
    $("#" + tabId + "_cont").addClass('active');

    $('.tab').on("click", function () {
        $(".tab").removeClass('active');
        $(".tab-cont").removeClass('active');
        $(this).addClass("active");

        var id = $(this).attr('id');
        $("#" + id + "_cont").addClass("active");
    });
    loadOptions();

    $('#applyOptions').click(function () {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {

            for (var _iterator5 = options[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _step5$value = _slicedToArray(_step5.value, 2),
                    name = _step5$value[0],
                    option = _step5$value[1];

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
    var html = "<div id=\"tooltip_id" + msgId + "\" msg-id=\"" + msgId + "\" class=\"gensmall\" style=\"position:absolute; background:#FFFFE1; border:1px solid #000000; width:650px; font-weight:normal;\">\n        <div id=\"tooltip-header" + msgId + "\" msg-id=\"" + msgId + "\" class=\"tooltip-header\">\n            <span><b>\u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435...</b></span>\n        </div>\n        <div id=\"tooltip-text" + msgId + "\" msg-id=\"" + msgId + "\" class=\"tooltip-text\">\n            <span>\u0418\u0434\u0435\u0442 ajax \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430.<br/>\u042D\u0442\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.</span>\n        </div>\n        <span id=\"tooltip-close" + msgId + "\" msg-id=\"" + msgId + "\" class=\"close-button\">\n            <b> x </b>\n        </span>\n    </div>";
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

    if (msgId === 'F') {
        $.ajax({
            url: "ajax_gettopic.php?id=" + topicId
        }).done(function (data) {
            var dataObj = parseJSON(data);
            setMsgTextAjax(topicId, dataObj.answers_count, elemHeader, elemText);
        });
        return;
    }

    var apiUrl = "ajax_topic.php?id=" + topicId + "&from=" + msgId + "&to=" + (+msgId + 1);

    $.ajax({
        url: apiUrl
    }).done(function (data) {
        dataObj = parseJSON(data);
        if (!dataObj || dataObj.length === 0 || $.isEmptyObject(dataObj)) {
            elemText.html("\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E<BR>Topic id: " + topicId + "<BR>Msg id: " + msgId);
            return;
        }
        var msgArr = dataObj.filter(function (a) {
            return a.n == msgId;
        });
        if (msgArr.length === 1) {
            var msg = msgArr[0];
            var text = msg.text.replace(/\(([0-9]+)\)/g, '<a href="topic.php?id=' + topicId + '#$1">($1)</a>');
            var user = "<b>" + msg.user + "</b><br>\n                 <span class='message-info'>" + msg.n + "  - " + utimeToDate(msg.utime) + "</span>";
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

function loadDataMsg(topicId, msgId) {
    return function () {
        setMsgText(topicId, msgId, $("#tooltip-header" + msgId), $("#tooltip-text" + msgId));
    };
}

function createTooltip(link, msgId, topicId, scroll) {
    if ($("#tooltip_id" + msgId).length > 0) return;
    $(tooltipHtml(msgId)).appendTo('#body');
    var loc = $(link).offset();
    var left = loc.left;
    if ($(window).width() - loc.left < 100) {
        left = left - 630;
    }

    var elem = $("#tooltip_id" + msgId).draggable().css({
        "top": loc.top + "px",
        "left": left + "px"
        //"z-index": "999"
    }).click(removeTooltip);

    if (scroll) {
        elem.bind('mousewheel DOMMouseScroll', function (e) {
            e.preventDefault();
            var delta = e.wheelDelta || -e.detail || e.originalEvent.wheelDelta || -e.originalEvent.detail;
            var newMsgId = +$("#tooltip-text" + msgId).data('msgId') + (delta > 0 ? -1 : 1);
            setTimeout(function () {
                setMsgText(topicId, newMsgId, $("#tooltip-header" + msgId), $("#tooltip-text" + msgId));
            }, 100);
        });
    }

    tooltipsMap[msgId] = elem;
    tooltipsOrder.push(msgId);

    if (options.get('remove-tooltip-on-leave').value === 'true') {

        elem.hover(function () {
            if (elem.is(':animated')) elem.stop().animate({ opacity: '100' });
        }, function () {
            elem.fadeOut(+options.get('remove-tooltip-delay').value, function () {
                tooltipsMap[msgId] = null;
                var ind = tooltipsOrder.indexOf(msgId);
                tooltipsOrder.splice(ind, 1);
                $(this).remove();
            });
        });
    }
    return elem;
}

function attachTooltip(link, msgId, topicId, loadDataFunc, scroll) {

    var timer = void 0;
    $(link).hover(function () {
        timer = setTimeout(function () {
            createTooltip(link, msgId, topicId, scroll);
            loadDataFunc();
        }, +options.get('tooltip-delay').value);
    }, function () {
        // on mouse out, cancel the timer
        clearTimeout(timer);
    });

    $(link).mousedown(function (event) {
        clearTimeout(timer);
    });
}

function processLinkToPost(element, url, onlyBindEvents, scroll) {
    var topicId = void 0,
        msgId = void 0;
    try {
        topicId = url.match(/topic.php\?id=([0-9]+)($|\&|#)/)[1];
    } catch (e) {}
    try {
        msgId = url.match(/#(F|[0-9]+)/)[1];
    } catch (e) {}

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
function loadDataImg(url, id, header) {

    header = header || 'Картинка';

    return function () {
        var maxWidth = options.get('max-img-width').value;
        $("#tooltip-header" + id).html("<b>" + header + "</b>");
        $("#tooltip-text" + id).html("<img src=\"" + url.img + "\" style=\"max-width: " + maxWidth + "px; height:auto;\">");
        $("#tooltip-text" + id + " img").on('load', function () {
            if ($(this).height() === 1) {
                $("#tooltip-text" + id).text('Картинка отсутствует');
            } else {
                $("#tooltip_id" + id).width($(this).width() + 8);
            }
        }).on('error', function () {
            this.src = url.altImg;
            $(this).off('error');
        });
    };
}

function getImgUrl(url) {

    var img = void 0,
        altImg = void 0;

    if (url.search("ximage.ru/index.php") !== -1) {
        var imgId = url.match(/id=(.+)$/i)[1];
        img = "http://ximage.ru/data/imgs/" + imgId + ".png";
        altImg = "http://ximage.ru/data/imgs/" + imgId + ".jpg";
    } else if (url.search(/.+\.(jpg|jpeg|png|gif)$/i) !== -1) {
        img = url;
    } else if (url.search(/skrinshoter\.ru/i) !== -1) {
        img = url.replace(/\?a$/i, ".png");
        if (img === url) img = url + ".png";

        altImg = url.replace(/\?a$/i, ".jpg");
        if (altImg === url) altImg = url + ".jpg";
    } else if (url.search(/joxi\.ru/i) !== -1) {
        img = url + ".png";
        altImg = url + ".jpg";
    } else if (url.search(/savepic\.ru/i) !== -1) {
        //http://savepic.ru/14650331.htm
        img = url.replace(/\.htm/i, ".png");
        altImg = url.replace(/\.htm/i, ".jpg");
    }

    return { img: img, altImg: altImg };
}

function processLinkToImage(element, url, onlyBindEvents) {

    var imgUrl = void 0;
    try {
        imgUrl = getImgUrl(url);
    } catch (e) {
        console.error(e);
    }
    if (!imgUrl.img) return false;
    if ($(element).text() === '') return true;

    if (options.get('show-imgs').value === 'showAlways') {
        if (!onlyBindEvents) {
            $(element).text("");
            var html = '';
            var prev = $(element).prev();
            if (prev.length === 0) {
                html = '<br>';
            }
            html += "<img src=\"" + imgUrl.img + "\" style=\"max-width: " + options.get('max-img-width').value + "px; height:auto;\"/>";
            $(html).on('error', function () {
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

            var regExp = /\[img\](.+)\[\/img\]/i;
            if (url.search(regExp) !== -1) {
                url = url.match(regExp)[1];
                $(element).prop('href', url);
                return url;
            }
            var parentHtml = $(element).parent().html();
            var escapedUrl = url.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\./g, '\.').replace(/\./g, '\\.').replace(/\*/g, '\\*').replace(/\+/g, '\\+').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\?/g, '\\?').replace(/\//g, '\\/');
            try {
                var _regExp = new RegExp(escapedUrl + '<\/a>(\\)|[а-яёА-ЯЁ0-9#\\-\\+\\_\\%\\?]*)');
                var arr = parentHtml.match(_regExp);
                if (arr && arr.length > 1) {
                    url = url + arr[1];
                    $(element).prop("href", url);
                    return url;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    return url;
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
            var maxLength = +options.get('max-youtube-title').value;
            if (fullTitle.length > maxLength + 5) title = title.substring(0, maxLength) + '...';
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
    if (!userId) {
        var arr = url.match(/users\.php\?id=(\d+)/);
        if (arr.length >= 2) userId = arr[1];
    }
    if (!userId) return;

    var userName = $(element).attr('data-user_name');
    userName = userName || $(element).text();

    var parentId = $(element).parent().attr('id');

    var imgUrl = void 0;
    if (options.get('show-userpics').value === 'showThumbs') {
        imgUrl = "/users_photo/thumb/" + userId + ".jpg";
    } else {
        imgUrl = "/users_photo/mid/" + userId + ".jpg";
    }

    if (options.get('show-userpics').value === 'onMouseOver' || !parentId) {
        var user = $(element).text();
        attachTooltip(element, "_p" + userId, '', loadDataImg({ img: imgUrl }, "_p" + userId, user));
    } else {
        if (!onlyBindEvents) {

            var msgId = +parentId.replace('tduser', '');
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

        if (userName.search(' ') === -1) return text + space + '@' + userName;else {
            return text + space + '@{' + userName + '}';
        }
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

    // main page
    if (!parentElemText) {
        if (options.get('show-tooltips-on-main').value === 'true') {
            $('td:nth-child(2).cc').each(function () {
                var text = $(this).text();
                $(this).text("");
                var url = $(this).next().find('a:first()').attr("href") + "&p=last20#F";
                var link = $("<a href=\"" + url + "\" style=\"color: black\">" + text + "</a>").appendTo($(this));
                if (options.get('open-in-new_window').value === 'true') link.prop("target", "_blank");
                var scroll = options.get('scroll-tooltip-on-main').value === 'true';
                processLinkToPost(link, url, true, scroll);
            });
        }
        if (options.get('open-in-new_window').value === 'true') {
            $('a', 'td[id^="tt"]').each(function (a) {
                $(this).prop("target", "_blank");
            });
        }
    }

    parentElemHeader = parentElemHeader || $('td[id^=tduser], li.whois-user');
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
        url = processBrokenLink(this, url, onlyBindEvents);
        if (processLinkToImage(this, url, onlyBindEvents)) return;
        if (processLinkToYoutube(this, url, onlyBindEvents)) return;
        if (processLinkToMistaCatalog(this, url, onlyBindEvents)) return;
        if (processLinkToPost(this, url, onlyBindEvents)) return;
    });

    if (options.get('limit-embedded-img-width').value === 'true') {
        parentElemText.find('img').each(function (img) {
            var url = $(this).attr('src');
            $(this).css('max-width', options.get('max-img-width').value + 'px').wrap("<a href=\"" + url + "\"></a>");
        });
    }
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
        if ($(e.target).closest('div[id^=tooltip_id]').length === 0) removeAllTooltips();
    });

    $('#table_messages').on('mista.load', 'tr', function (event) {
        //<tr id=message_id>
        var elemHeader = $(this).find('td[id^=tduser]');
        var elemText = $(this).find('td[id^=tdmsg]');
        run(elemHeader, elemText);
    });

    // style  for options form & tooltips
    $("<style>").prop("type", "text/css").html(".tabs:after{\n\t\t     content: \"\";\n\t\t     display: block;\n\t\t     clear: both;\n\t\t     height: 0;\n       \t}\n\t\t.tabs{\n\t\t\t border-right: none;\n             background-color: #eee;\n             border-bottom: solid 1px silver;\n\t\t}\n        .tab {\n\t\t\t float: left;\n\t\t\t cursor: pointer;\n             background-color: #eee;\n             margin-top: 3px;\n             border-radius: 10px 10px 0px 0px;\n             border-left: solid 1px grey;\n             border-top: solid 1px grey;\n\t\t \t padding: 10px 20px;\n        }\n\t\t.tab:first-child{\n             margin-left: 10px;\n\t\t}\n\t\t.tab:last-child{\n             border-right: solid 1px grey;\n\t\t}\n        .tab.active{\n             background-color: #FFFFE1;\n             border-bottom:  solid 1px #FFFFE1;\n             margin-bottom: -1px;\n\t\t}\n        .tab-cont > div{\n            margin-bottom:5px;\n        }\n\t\t.tab-cont{\n\t\t\tdisplay: none;\n\t\t    padding: 5px 5px;\n\t\t}\n\t\t.tab-cont.active{\n\t\t    display: block;\n\t\t}\n\n        .options-form {\n            position:fixed;\n            left: 50%;\n            top: 50%;\n            transform: translate(-50%, -50%);\n            background:#FFFFE1;\n            border:1px solid #000000;\n            width:630px;\n            min-height: 400px;\n            font-weight:normal;\n            z-index: 1001;\n        }\n        .options-form-overlay {\n            position: absolute;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background-color: #000;\n            opacity: 0.85;\n            z-index:1000;\n            pointer-events: none;\n        }\n        .options-header {\n            cursor: move;\n            background:white;\n            padding:4px;\n            border-bottom:1px solid silver;\n        }\n        .options-footer {\n            position: absolute;\n            bottom: 0px;\n            width: 100%;\n        }\n        .tooltip-header{\n            cursor: move;\n            background:white;\n            padding:4px;\n            border-bottom:1px solid silver;\n        }\n        .tooltip-text{\n            padding:4px;\n            word-break:break-word;\n        }\n        .close-button{\n            display: block;\n            position: absolute;\n            right: 6px;\n            top: 3px;\n            cursor:pointer;\n        }").appendTo("head");

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
