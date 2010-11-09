/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, indent: 2 */
/*global jQuery */
(function ($) {
  var KEYS = {UP: 38, DOWN: 40, TAB: 9, ENTER: 13, ESC: 27, BACK: 8, DEL: 46};

  $.fn.emailcomplete = function (domains, cutof) {
    /* Autocomplete / suggest emails based on common domains */
    var input = $(this);
    var wrapper = $('<span class="ec"></span>');
    var list = create_list(input);

    var data = {
      domains: domains,
      input: input,
      suggest: $('<input class="ec-suggest" disabled="disabled" />'),
      list: list
    };

    input.replaceWith(wrapper);

    input.addClass('ec-input');
    input.attr('autocomplete', 'off');
    input.attr('spellcheck', 'off');
    input.bind('keydown', data, handle_input_keydown);
    input.bind('keypress', data, handle_input_keypress);
    input.bind('keyup', data, handle_input_keyup);
    input.bind('blur', data, handle_blur);
    input.bind('focus', data, handle_focus);

    wrapper.append(input);
    wrapper.append(data.suggest);
    wrapper.append(list);

    list.data('hover', null);
    list.data('cutof', cutof || 0);

    // FIXME might fail with multiple email completes in same form
    $('.ec-item').live('hover', data, select_hovered_item);
    $('.ec-item').live('mousedown', data, click_item);

    place_list(input, list);

    return this;
  };

  function create_list(input) {
    var list = $('<ul></ul>').addClass('ec-list');
    var left_border = parseInt(input.css('borderLeftWidth'), 10);
    var right_border = parseInt(input.css('borderRightWidth'), 10);
    list.css('min-width', input.outerWidth() - left_border - right_border);
    return list;
  }

  function place_list(input, list) {
    var bottom_border = parseInt(input.css('borderBottomWidth'), 10);
    var left_border = parseInt(input.css('borderLeftWidth'), 10);
    list.css({
      'top': input.outerHeight() + bottom_border,
      'left': left_border
    });
  }

  function update_selection(current, replacement, suggest) {
    if (!replacement.length) {
      return;
    }
    current.removeClass('ec-selected');
    replacement.addClass('ec-selected');
    suggest.hide();
    suggest.val(replacement.text());
    suggest.fadeIn();
  }

  function commit_selection(input, suggest, list) {
    if (list.is(':hidden')) {
      return false;
    }

    var selected = list.find('.ec-selected');
    if (selected.length > 0) {
      input.val(selected.text());
    }
    list.hide();
    suggest.val('');
    return true;
  }

  function select_hovered_item(e) {
    var item = $(this);
    if (item.parent().data('hover') !== item.index()) {
      item.siblings().removeClass('ec-selected');
      item.addClass('ec-selected');
      item.parent().data('hover', item.index());
    }
  }

  function click_item(e) {
    e.data.input.val($(this).text());
    e.data.suggest.val('');
    $(this).parent().hide();
  }

  function handle_blur(e) {
    e.data.list.hide();
    e.data.suggest.val('');
  }

  function handle_input_keydown(e) {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return true;
    }

    var selected = e.data.list.find('.ec-selected');

    switch (e.keyCode) {
      case KEYS.UP:
        update_selection(selected, selected.prev(), e.data.suggest);
      break;

      case KEYS.DOWN:
        update_selection(selected, selected.next(), e.data.suggest);
      break;

      case KEYS.TAB:
        commit_selection(e.data.input, e.data.suggest, e.data.list)
      return true;

      case KEYS.ENTER:
        if (!commit_selection(e.data.input, e.data.suggest, e.data.list)) {
          return true;
        }
      break;

      case KEYS.DEL:
        e.data.suggest.val('');
      return true;

      case KEYS.BACK:
        if (!carret_at_end(e.data.input)) {
          e.data.suggest.val('');
        }
      return true;

      default:
      return true;
    }
    e.preventDefault();
    return false;
  }

  function handle_input_keypress(e) {
    var suggest = e.data.suggest.val();
    var input = e.data.input.val();
    var key = String.fromCharCode(e.charCode || e.keyCode);
    var next = suggest[input.length];

    if (e.charCode == 0 || e.keyCode == 0) {
      return;
    }

    if (key != next || input != suggest.substr(0, input.length)) {
      e.data.suggest.val('');
    }
  }

  function handle_input_keyup(e) {
    if (e.keyCode > 46 || e.keyCode == KEYS.BACK || e.keyCode == KEYS.DEL) {
      update_complete(e.data.input, e.data.list, e.data.domains);
    }
  }

  function handle_focus(e) {
    update_complete(e.data.input, e.data.list, e.data.domains);
  }

  function update_complete(input, list, domains) {
    var match = input.val().match('^([^@ ]+)@([^@ ]+)$');

    if (!match) {
      list.hide();
      input.parent().find('.ec-suggest').val('');
      return;
    }

    var localpart = match[1], domain = match[2];

    list.empty();
    for (var i in domains) {
      if (domain == domains[i].substr(0, domain.length)) {
        list.append($('<li class="ec-item">' + localpart + '@' + domains[i] + '</li>'));
      }
    }
    list.children(':first').addClass('ec-selected');
    list.children().length > 0 ? list.show() : list.hide();

    var text = list.find(':first-child').text();
    var suggest = input.parent().find('.ec-suggest');
    var cutof = list.data('cutof');

    if (text.length < cutof || cutof == 0) {
      suggest.val(text);
    } else {
      suggest.val('');
    }
  }

  function carret_at_end(input) {
    if (document.selection) {
      var range = document.selection.createRange();
      range.moveStart ('character', -input.val().length);
      return range.text.length == input.val().length;
    } else if (input.get(0).selectionStart) {
      var text = input.val();
      input = input.get(0);
      return input.selectionStart == input.selectionEnd &&
        input.selectionEnd == text.length;
    }
    return false;
  }
}(jQuery));
