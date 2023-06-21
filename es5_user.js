/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// ==UserScript==
// @name         mista.ru
// @namespace    http://tampermonkey.net/
// @version      1.9.8
// @description  Make mista great again!
// @author       acsent
// @match        *.mista.ru/*
// @match        *.mista.cc/*
// @grant        none
// @require      http://forum.mista.ru/js/jquery-1.9.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js
// @downloadURL  https://cdn.jsdelivr.net/gh/a-sitnikov/mista.js@latest/user.js
// @updateURL    https://cdn.jsdelivr.net/gh/a-sitnikov/mista.js@latest/user.js
// ==/UserScript==
/* global $ */

var mistaScriptVersion = '1.9.8';
var tooltipsOrder = [];
var tooltipsMap = {};
var currentTopicId = 0;
var yourUrl;
var topicAuthor;
var options = new Map([["open-in-new_window", {
  "default": "true",
  type: "checkbox",
  label: "Открывать ветки в новом окне"
}], ["show-tooltips", {
  "default": "true",
  type: "checkbox",
  label: "Показывать тултипы, задержка"
}], ["show-tooltips-on-main", {
  "default": "true",
  type: "checkbox",
  label: "Показывать тултипы на главной странице, при наведении на кол-во ответов "
}], ["tooltip-delay", {
  "default": "500",
  type: "input",
  label: "",
  suffix: "мс",
  width: "50"
}], ["remove-tooltip-on-leave", {
  "default": "false",
  type: "checkbox",
  label: "Скрывать тултип при уходе мыши, задержка"
}], ["remove-tooltip-delay", {
  "default": "1000",
  type: "input",
  label: "",
  suffix: "мс",
  width: "50"
}], ["replace-catalog-to-is", {
  "default": "true",
  type: "checkbox",
  label: "Обратно заменять catalog.mista.ru на infostart.ru"
}], ["mark-author", {
  "default": "true",
  type: "checkbox",
  label: "Подсвечивать автора цветом"
}], ["author-color", {
  "default": "#ffd784",
  type: "color",
  label: "",
  width: "100"
}], ["mark-yourself", {
  "default": "true",
  type: "checkbox",
  label: "Подсвечивать себя цветом"
}], ["yourself-color", {
  "default": "#9bc5ef",
  type: "color",
  label: "",
  width: "100"
}], ["show-userpics", {
  "default": "onMouseOver",
  type: "radio",
  label: "Показывать фото пользователей",
  values: [{
    v: "showAlways",
    descr: "Показывать всегда"
  }, {
    v: "showThumbs",
    descr: "Показывать thumbs"
  }, {
    v: "onMouseOver",
    descr: "При наведении"
  }, {
    v: "no",
    descr: "Не показывать"
  }]
}], ["max-userpic-width", {
  "default": "100",
  type: "input",
  label: "Макс. ширина фото",
  suffix: "px. Желательно не более 150",
  width: "50"
}], ["show-imgs", {
  "default": "onMouseOver",
  type: "radio",
  label: "Показывать картинки",
  values: [{
    v: "showAlways",
    descr: "Показывать всегда"
  }, {
    v: "onMouseOver",
    descr: "При наведении"
  }, {
    v: "no",
    descr: "Не показывать"
  }]
}], ["max-img-width", {
  "default": "500",
  type: "input",
  label: "Макс. ширина картинки",
  suffix: "px",
  width: "50"
}], ["limit-embedded-img-width", {
  "default": "true",
  type: "checkbox",
  label: "Ограничивать ширину вставленных изображений"
}], ["show-youtube-title", {
  "default": "true",
  type: "checkbox",
  label: "Показывать наименования роликов youtube, макс. длина"
}], ["max-youtube-title", {
  "default": "40",
  type: "input",
  label: "",
  suffix: "символов",
  width: "50"
}], ["youtube-prefix", {
  "default": "youtube",
  type: "input",
  label: "Префикс youtube",
  suffix: "",
  width: "100"
}], ["first-post-tooltip", {
  "default": "true",
  type: "checkbox",
  label: "Отображать тултип нулевого поста ссыки на другую ветку"
}], ["add-name-to-message", {
  "default": "true",
  type: "checkbox",
  label: "Кнопка для ввода имени в сообщение"
}], ["add-name-style", {
  "default": '{"font-size": "100%"}',
  type: "input",
  label: "Стиль кнопки",
  width: "350",
  suffix: "любые свойства css"
}], ["user-autocomplete", {
  "default": "true",
  type: "checkbox",
  label: "Дополнение имен пользователей. При написании @"
}], ["fix-broken-links", {
  "default": "true",
  type: "checkbox",
  label: "Чинить поломанные ссылки (с русскими символами)"
}], ["scroll-tooltip-on-main", {
  "default": "true",
  type: "checkbox",
  label: "При скролле этотого тултипа переходить к след/пред сообщениям"
}], ["use-ignore", {
  "default": "false",
  type: "checkbox",
  label: "Игнорировать следующих пользователей (имена через запятую)"
}], ["ignore-list", {
  "default": "",
  type: "input",
  label: "",
  width: "550"
}], ["wrap-nicknames", {
  "default": "true",
  type: "checkbox",
  label: "Переность длинные ники"
}], ["re-before-title", {
  "default": "true",
  type: "checkbox",
  label: "Колонка \"Re\" перед темой"
}]]);
var formOptions = [{
  id: 'tab1',
  name: 'Тултипы',
  rows: [['show-tooltips', 'tooltip-delay'], ['remove-tooltip-on-leave', 'remove-tooltip-delay'], ['show-tooltips-on-main'], ['scroll-tooltip-on-main'], ['first-post-tooltip']]
}, {
  id: 'tab2',
  name: 'Инфо',
  rows: [['mark-author', 'author-color'], ['mark-yourself', 'yourself-color'], ['show-userpics'], ['max-userpic-width'], ['add-name-to-message'], ['add-name-style'], ['wrap-nicknames']]
}, {
  id: 'tab3',
  name: 'Текст',
  rows: [['show-imgs'], ['max-img-width'], ['limit-embedded-img-width'], ['show-youtube-title', 'max-youtube-title'], ['youtube-prefix'], ['fix-broken-links'], ['replace-catalog-to-is']]
}, {
  id: 'tab4',
  name: 'Прочее',
  rows: [['open-in-new_window'], ['user-autocomplete'], ['use-ignore'], ['ignore-list'], ['re-before-title']]
}];
function utimeToDate(utime) {
  var a = new Date(utime * 1000);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hours = a.getHours();
  var minutes = "0" + a.getMinutes();
  return '' + date + '.' + month + '.' + year + ' - ' + hours + ':' + minutes.substr(-2);
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
  var _iterator = _createForOfIteratorHelper(options),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        name = _step$value[0],
        option = _step$value[1];
      option.value = readOption(name, option["default"]);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function saveOption(name, value) {
  window.localStorage.setItem(name, String(value));
}
function readOption(name) {
  var value = window.localStorage.getItem(name);
  return value || options.get(name)["default"];
}
function loadOptions(param) {
  param = param || 'value';
  var _iterator2 = _createForOfIteratorHelper(options),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _step2$value = _slicedToArray(_step2.value, 2),
        name = _step2$value[0],
        option = _step2$value[1];
      if (option.type === 'checkbox') {
        if (option[param] === 'true') $("#".concat(name)).prop("checked", "checked");
      } else if (option.type === 'radio') {
        $("input:radio[name=\"".concat(name, "\"][value=\"").concat(option[param], "\"]")).prop("checked", "checked");
      } else if (option.type === 'input') {
        $("#".concat(name)).val(option[param]);
      } else if (option.type === 'color') {
        $("#".concat(name)).val(option[param].toUpperCase());
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function openMistaScriptOptions() {
  var html = "<div id=\"mista-script-overlay\" class=\"options-form-overlay\" ></div>\n        <div id=\"mista-script\" class=\"options-form\">\n             <span id=\"closeOptions\" class=\"close-button\">\n                  <b> x </b>\n             </span>\n             <div class=\"options-header\" style=\"cursor: default\">\n                 <b>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Mista.Script</b> version ".concat(mistaScriptVersion, "\n             </div>\n             <div class=\"tabs\">");
  var _iterator3 = _createForOfIteratorHelper(formOptions),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var tab = _step3.value;
      html += "<div id=".concat(tab.id, " class=\"tab\">").concat(tab.name, "</div>");
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  html += "</div>\n             <div id=\"tab_content\" style=\"padding:5px\">";
  var _iterator4 = _createForOfIteratorHelper(formOptions),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var _tab = _step4.value;
      html += "<div id=\"".concat(_tab.id, "_cont\" class=\"tab-cont\">");
      var _iterator6 = _createForOfIteratorHelper(_tab.rows),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var row = _step6.value;
          //html += '<div style="margin-bottom:5px">';
          html += '<div>';
          var _iterator7 = _createForOfIteratorHelper(row),
            _step7;
          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var name = _step7.value;
              var option = options.get(name);
              if (option.type === 'checkbox') {
                html += "<input id=\"".concat(name, "\" type=\"checkbox\" name=\"").concat(name, "\">\n                         <label for=\"").concat(name, "\">").concat(option.label, "</label>");
              } else if (option.type === 'input' || option.type === 'color') {
                if (option.label) {
                  html += "<label for=\"".concat(name, "\">").concat(option.label, "</label>");
                }
                var typeColor = option.type === 'color' ? ' type="color"' : '';
                html += "<input id=\"".concat(name, "\" name=\"").concat(name, "\" style=\"margin-left:5px; width: ").concat(option.width, "px\" ").concat(typeColor, ">");
                if (option.suffix) {
                  html += ' ' + option.suffix;
                }
              } else if (option.type === 'radio') {
                html += "<label for=\"".concat(name, "\">").concat(option.label, "</label><br>");
                var _iterator8 = _createForOfIteratorHelper(option.values),
                  _step8;
                try {
                  for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                    var value = _step8.value;
                    html += "<input type=\"radio\" name=\"".concat(name, "\" value=\"").concat(value.v, "\"> ").concat(value.descr);
                  }
                } catch (err) {
                  _iterator8.e(err);
                } finally {
                  _iterator8.f();
                }
              }
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
          html += '</div>';
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      html += '</div>';
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  html += "</div>\n        <div id=\"options-footer\" class=\"options-footer\">\n           <div style=\"margin: 0px 0px 5px 10px;\">\u041F\u043E\u0441\u043B\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u043D\u0443\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</div>\n           <div style=\"margin: 0px 0px 5px 10px;\">\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u043E\u0433\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0430 <a href=\"https://a-sitnikov.github.io/react.mista/#/\" target=\"blank\">React.Mista</a></div>\n           <div style=\"padding: 5px 10px 5px 10px; border-top: 1px solid silver; background-color:#eee\">\n              <button id=\"applyOptions\" class=\"sendbutton\" style=\"margin: 5px; height: 30px\">OK</button>\n              <button id=\"cancelOptions\" class=\"sendbutton\" style=\"margin: 5px; float: left;height: 30px\">\u041E\u0442\u043C\u0435\u043D\u0430</button>\n              <button id=\"defaultOptions\" class=\"sendbutton\" style=\"margin: 5px; float: right; height: 30px\">\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</button>\n           </div>\n           </div>\n        </div>";
  $(html).appendTo('#body');
  //$('#mista-script').draggable();
  $('body').css({
    "overflow-y": "hidden"
  });
  var tabId = formOptions[0].id;
  $("#".concat(tabId)).addClass('active');
  $("#".concat(tabId, "_cont")).addClass('active');
  $('.tab').on("click", function () {
    $(".tab").removeClass('active');
    $(".tab-cont").removeClass('active');
    $(this).addClass("active");
    var id = $(this).attr('id');
    $("#".concat(id, "_cont")).addClass("active");
  });
  loadOptions();
  $('#applyOptions').click(function () {
    var _iterator5 = _createForOfIteratorHelper(options),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _step5$value = _slicedToArray(_step5.value, 2),
          name = _step5$value[0],
          option = _step5$value[1];
        if (option.type === 'checkbox') {
          option.value = String($("#".concat(name)).is(':checked'));
        } else if (option.type === 'radio') {
          option.value = $("input:radio[name=".concat(name, "]:checked")).val();
        } else if (option.type === 'input') {
          option.value = $("#".concat(name)).val();
        } else if (option.type === 'color') {
          option.value = $("#".concat(name)).val();
        }
        saveOption(name, option.value);
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    $('#mista-script').remove();
    $('#mista-script-overlay').remove();
    $('body').css({
      "overflow-y": "auto"
    });
  });
  $('#cancelOptions, #closeOptions').click(function () {
    $('#mista-script').remove();
    $('#mista-script-overlay').remove();
    $('body').css({
      "overflow-y": "auto"
    });
  });
  $('#defaultOptions').click(function () {
    loadOptions('default');
  });
}

// ----------------Tooltips-------------------------------------
function tooltipHtml(msgId) {
  //min-width: 500px; width:auto; max-width: 1200px
  var html = "<div id=\"tooltip_id".concat(msgId, "\" msg-id=\"").concat(msgId, "\" class=\"gensmall\" style=\"position:absolute; background:#FFFFE1; border:1px solid #000000; width:650px; font-weight:normal;\">\n        <div id=\"tooltip-header").concat(msgId, "\" msg-id=\"").concat(msgId, "\" class=\"tooltip-header\">\n            <span><b>\u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435...</b></span>\n        </div>\n        <div id=\"tooltip-text").concat(msgId, "\" msg-id=\"").concat(msgId, "\" class=\"tooltip-text\">\n            <span>\u0418\u0434\u0435\u0442 ajax \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430.<br/>\u042D\u0442\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.</span>\n        </div>\n        <span id=\"tooltip-close").concat(msgId, "\" msg-id=\"").concat(msgId, "\" class=\"close-button\">\n            <b> x </b>\n        </span>\n    </div>");
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
  var user;
  if (topicId === currentTopicId) user = $("#tduser".concat(msgId)).html();
  if (user) {
    elemHeader.html(user);
    var text = $("#".concat(msgId)).html();
    if (!text) {
      // hidden message
      try {
        text = hidden_messages[+msgId];
      } catch (e) {}
    }
    elemText.html(text);
    elemText.find('img').css({
      'max-width': '642px'
    });
    run(elemHeader, elemText, true);
  } else {
    setMsgTextAjax(topicId, msgId, elemHeader, elemText);
  }
}
function setMsgTextAjax(topicId, msgId, elemHeader, elemText) {
  if (msgId === 'F') {
    $.ajax({
      url: "ajax_gettopic.php?id=".concat(topicId)
    }).done(function (data) {
      //console.log('data', data);
      var dataObj = data; //parseJSON(data);
      setMsgTextAjax(topicId, dataObj.answers_count, elemHeader, elemText);
    });
    return;
  }
  var apiUrl = "ajax_topic.php?id=".concat(topicId, "&from=").concat(msgId, "&to=").concat(+msgId + 1);
  $.ajax({
    url: apiUrl
  }).done(function (data) {
    var dataObj = data; //parseJSON(data);
    if (!dataObj || dataObj.length === 0 || $.isEmptyObject(dataObj)) {
      elemText.html("\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E<BR>Topic id: ".concat(topicId, "<BR>Msg id: ").concat(msgId));
      return;
    }
    var msgArr = dataObj.filter(function (a) {
      return a.n == msgId;
    });
    if (msgArr.length === 1) {
      var msg = msgArr[0];
      var text = msg.text.replace(/\(([0-9]+)\)/g, '<a href="topic.php?id=' + topicId + '#$1">($1)</a>');
      var user = "<b>".concat(msg.user, "</b><br>\n                 <span class='message-info'>").concat(msg.n, "  - ").concat(utimeToDate(msg.utime), "</span>");
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
  }).fail(function (jqXHR, exception) {
    console.log(jqXHR);
  });
}
function loadDataMsg(topicId, msgId) {
  return function () {
    setMsgText(topicId, msgId, $("#tooltip-header".concat(msgId)), $("#tooltip-text".concat(msgId)));
  };
}
function createTooltip(link, msgId, topicId, scroll) {
  var loc = $(link).offset();
  var left = loc.left;
  if ($(window).width() - loc.left < 100) {
    left = left - 630;
  }
  var tooltip = $("#tooltip_id".concat(msgId));
  if (tooltip.length > 0) {
    tooltip.css({
      "top": loc.top + "px",
      "left": left + "px"
      //"z-index": "999"
    });

    return;
  }
  $(tooltipHtml(msgId)).appendTo('body');
  var elem = $("#tooltip_id".concat(msgId)).draggable().css({
    "top": loc.top + "px",
    "left": left + "px"
    //"z-index": "999"
  }).click(removeTooltip);
  if (scroll) {
    elem.bind('mousewheel DOMMouseScroll', function (e) {
      e.preventDefault();
      var delta = e.wheelDelta || -e.detail || e.originalEvent.wheelDelta || -e.originalEvent.detail;
      var newMsgId = +$("#tooltip-text".concat(msgId)).data('msgId') + (delta > 0 ? -1 : 1);
      setTimeout(function () {
        setMsgText(topicId, newMsgId, $("#tooltip-header".concat(msgId)), $("#tooltip-text".concat(msgId)));
      }, 100);
    });
  }
  tooltipsMap[msgId] = elem;
  tooltipsOrder.push(msgId);
  if (options.get('remove-tooltip-on-leave').value === 'true') {
    elem.hover(function () {
      if (elem.is(':animated')) elem.stop().animate({
        opacity: '100'
      });
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
  var timer;
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
  var topicId, msgId;
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
    $("#tooltip-header".concat(id)).html("<b>".concat(header, "</b>"));
    $("#tooltip-text".concat(id)).html("<img src=\"".concat(url.img, "\" style=\"max-width: ").concat(maxWidth, "px; height:auto;\">"));
    $("#tooltip-text".concat(id, " img")).on('load', function () {
      if ($(this).height() === 1) {
        $("#tooltip-text".concat(id)).text('Картинка отсутствует');
      } else {
        $("#tooltip_id".concat(id)).width($(this).width() + 8);
      }
    }).on('error', function () {
      this.src = url.altImg;
      $(this).off('error');
    });
  };
}
function getImgUrl(url) {
  var img, altImg;
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
  return {
    img: img,
    altImg: altImg
  };
}
function processLinkToImage(element, url, onlyBindEvents) {
  var imgUrl;
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
      html += "<img src=\"".concat(imgUrl.img, "\" style=\"max-width: ").concat(options.get('max-img-width').value, "px; height:auto;\"/>");
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
        var _regExp = new RegExp(escapedUrl + '<\/a>(\\)|[а-яёА-ЯЁ0-9#\\-\\+\\_\\%\\?=]*)');
        var arr = parentHtml.match(_regExp);
        if (arr && arr.length > 1) {
          if (arr[1] === ')' && url.search('\\(') === -1) {
            return url;
          }
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
  var apiUrl = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBPtVWaQ7iGkObgyavKoNVQdfPwczAdQUE&&fields=items(snippet(title))&part=snippet&id=".concat(videoId);
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
  var videoId;
  // youtube.com/watch?v=videoId&t=
  if (url.search(/youtube/) !== -1) {
    if (options.get('show-youtube-title').value === 'true') {
      try {
        videoId = url.match(/v=(.+?)(\&|\?|$)/)[1];
      } catch (e) {}
      if (videoId) {
        setYoutubeTitle(element, videoId, onlyBindEvents);
      }
    }
    return true;
  }

  // youtu.be/videoId?t=
  if (url.search(/youtu\.be/) !== -1) {
    if (options.get('show-youtube-title').value === 'true') {
      try {
        videoId = url.match(/e\/(.+?)(\&|\?|$)/)[1];
      } catch (e) {}
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
  var userId = $(element).attr('data-user_id');
  if (!userId) {
    var arr = url.match(/users\.php\?id=(\d+)/);
    if (arr.length >= 2) userId = arr[1];
  }
  if (!userId) return;
  if (options.get('wrap-nicknames').value === 'true') $(element).parent().css({
    'word-wrap': 'break-word'
  });
  var userName = $(element).attr('data-user_name');
  userName = userName || $(element).text();
  var parentId = $(element).parent().attr('id');
  var imgUrl;
  if (options.get('show-userpics').value === 'showThumbs') {
    imgUrl = "/users_photo/thumb/".concat(userId, ".jpg");
  } else {
    imgUrl = "/users_photo/mid/".concat(userId, ".jpg");
  }
  if (options.get('show-userpics').value === 'onMouseOver' || !parentId) {
    var user = $(element).text();
    attachTooltip(element, "_p".concat(userId), '', loadDataImg({
      img: imgUrl
    }, "_p".concat(userId), user));
  } else {
    if (!onlyBindEvents) {
      var msgId = +parentId.replace('tduser', '');
      if (userPostMap[msgId - 1] !== userId) {
        var img = $("<img src=\"".concat(imgUrl, "\" style=\"max-width: ").concat(options.get('max-userpic-width').value, "px; height: auto\"><br>")).insertBefore($(element));
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
    var span;
    if (!onlyBindEvents) {
      span = $("<span id=\"addUserToMessage".concat(userId, "\" class=\"agh\" style=\"cursor: pointer\"> &#9654;</span>")).insertAfter($(element));
      try {
        span.css(JSON.parse(options.get('add-name-style').value));
      } catch (e) {
        console.error("incorrect css for button");
        console.error(e.message);
      }
    } else {
      span = $("#addUserToMessage".concat(userId));
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
  $(element).css({
    'background': options.get('author-color').value
  });
  return true;
}
function processLinkToYourself(element, url, onlyBindEvents) {
  if (url !== yourUrl) return false;
  if (options.get('mark-yourself').value !== 'true') return false;
  if (onlyBindEvents) return true;
  $(element).css({
    'background': options.get('yourself-color').value
  });
  return true;
}

// ----------------Run-----------------------------------------
function run(parentElemHeader, parentElemText, onlyBindEvents) {
  // main page
  if (!parentElemText) {
    if (options.get('show-tooltips-on-main').value === 'true') {
      $('.col_answers').each(function () {
        var text = $(this).text();
        $(this).text("");
        var url = $(this).parent().find('.col_main a').attr("href") + "&p=last20#F";
        var link = $("<a href=\"".concat(url, "\" style=\"color: black\">").concat(text, "</a>")).appendTo($(this));
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
      $(this).css('max-width', options.get('max-img-width').value + 'px').wrap("<a href=\"".concat(url, "\"></a>"));
    });
  }
  if (options.get('re-before-title').value === 'true') {
    $("#tm tr").each(function () {
      $(".col_main", this).before($(".col_answers", this));
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
      $.ajax({
        url: "/api/users.php?name=".concat(encodeURI(term), "&count=").concat(count)
      }).done(function (data) {
        var dataObj = typeof data === 'string' ? JSON.parse(data) : data;
        dataObj = dataObj.map(function (a) {
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
      if (value) return "<b>".concat(term, "</b>") + value.substring(term.length);else return term;
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
  var userIds = options.get('ignore-list').value.split(',').map(function (val) {
    return val.trim();
  });
  var selector = "[data-user_name='" + userIds.join("'],[data-user_name='") + "']";
  $(selector, 'tr[id^=message]').parent().parent().hide();
}
function code1ConClick(e) {
  e.preventDefault();
  var openTag = '[1C]\n';
  var closeTag = '\n[/1C]';
  var textArea = $('#message_text');
  var start = textArea[0].selectionStart;
  var end = textArea[0].selectionEnd;
  var oldText = textArea.val();
  var len = oldText.length;
  var selectedText = oldText.substring(start, end);
  var replacement = openTag + selectedText + closeTag;
  var newText = oldText.substring(0, start) + replacement + oldText.substring(end, len);
  textArea.val(newText);
}
(function () {
  var currentUrl = window.location.href;
  try {
    currentTopicId = currentUrl.match(/id=([0-9]+)/)[1];
  } catch (e) {}
  yourUrl = $('a[href*="users.php?id="]', ".nav-bar").attr("href");
  if (yourUrl.substr(0, 1) === '/') yourUrl = yourUrl.substr(1);
  topicAuthor = $("a", "#tduser0").text();
  readAllOptions();
  $('<li class="nav-item"><a href="#">Настройки Mista.Script</a></li>').appendTo("nav>ul.nav-bar").click(openMistaScriptOptions);
  $('body').click(function (e) {
    if ($(e.target).closest('div[id^=tooltip_id]').length === 0) removeAllTooltips();
  });
  $('#table_messages').on('mista.load', 'tr', function (event) {
    //<tr id=message_id>
    var elemHeader = $(this).find('td[id^=tduser]');
    var elemText = $(this).find('td[id^=tdmsg]');
    run(elemHeader, elemText);
  });

  // button code 1C
  $('<button class="sendbutton" name="code1C" style="margin: 5px">Код 1С</button>').insertBefore('button[name=Submit]').click(code1ConClick);

  // style  for options form & tooltips
  $("<style>").prop("type", "text/css").html(".tabs:after{\n\t\t     content: \"\";\n\t\t     display: block;\n\t\t     clear: both;\n\t\t     height: 0;\n       \t}\n\t\t.tabs{\n\t\t\t border-right: none;\n             background-color: #eee;\n             border-bottom: solid 1px silver;\n\t\t}\n        .tab {\n\t\t\t float: left;\n\t\t\t cursor: pointer;\n             background-color: #eee;\n             margin-top: 3px;\n             border-radius: 10px 10px 0px 0px;\n             border-left: solid 1px grey;\n             border-top: solid 1px grey;\n\t\t \t padding: 10px 20px;\n        }\n        .tab:first-child{\n             margin-left: 10px;\n\t\t}\n\t\t.tab:last-child{\n             border-right: solid 1px grey;\n\t\t}\n        .tab.active{\n             background-color: #FFFFE1;\n             border-bottom:  solid 1px transparent;\n             margin-bottom: -1px;\n\t\t}\n        .tab-cont > div{\n            margin-bottom:5px;\n        }\n\t\t.tab-cont{\n\t\t\tdisplay: none;\n\t\t    padding: 5px 5px;\n\t\t}\n\t\t.tab-cont.active{\n\t\t    display: block;\n\t\t}\n\n        .options-form {\n            position:fixed;\n            left: 50%;\n            top: 50%;\n            transform: translate(-50%, -50%);\n            background:#FFFFE1;\n            border:1px solid #000000;\n            width:630px;\n            min-height: 450px;\n            font-weight:normal;\n            z-index: 1001;\n        }\n        .options-form-overlay {\n            position: absolute;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background-color: #000;\n            opacity: 0.85;\n            z-index:1000;\n            pointer-events: none;\n        }\n        .options-header {\n            cursor: move;\n            background:white;\n            padding:4px;\n            border-bottom:1px solid silver;\n        }\n        .options-footer {\n            position: absolute;\n            bottom: 0px;\n            width: 100%;\n        }\n        .tooltip-header{\n            cursor: move;\n            background:white;\n            padding:4px;\n            border-bottom:1px solid silver;\n        }\n        .tooltip-text{\n            padding:4px;\n            word-break:break-word;\n            max-height: 700px;\n            overflow-y: auto;\n        }\n        .close-button{\n            display: block;\n            position: absolute;\n            right: 6px;\n            top: 3px;\n            cursor:pointer;\n        }").appendTo("head");
  if (typeof $.ui == 'undefined') {
    $.when($.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'), $.getScript('https://cdn.jsdelivr.net/gh/yuku-t/jquery-textcomplete@latest/dist/jquery.textcomplete.min.js'), $.Deferred(function (deferred) {
      $(deferred.resolve);
    })).done(function () {
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
/******/ })()
;