(function () {
  var DOMAINS = ['foo.com', 'bar.com', 'baz.com'];

  var CUTOF = 20;

  var DEL = 46;
  var BACK = 8;

  var INVALID = ['', 'test', 'test@', 'test@@', 'test@foo.comz'];
  var VALID = ['test@f', 'test@foo.co', /* test@foo.com, */ 'test@ba'];
  var EXPECTED = [
    ['test@foo.com'],
    ['test@foo.com'],
    ['test@bar.com', 'test@baz.com']
  ];
  var input;

  function setup() {
    $('#main').append($('<form id="form"><input id="input" /></form>'));
    input = $('#input').emailcomplete(DOMAINS, CUTOF);
  }

  function teardown() {
    $('#main').empty();
    input = null;
  }

  function placeholder() {
    return $('.ec-suggest').val();
  }

  function suggestions() {
    var result = [];
    $('.ec-item').each(function() {
      result.push($(this).text());
    });
    return result;
  }

  function backspace(text) {
    var event = {altKey: false, metaKey: false, shiftKey: false, ctrlKey: false};
    var keydownevent = $.extend($.Event(), event, {type:'keydown', keyCode: BACK, charCode: 0});
    var keyupevent = $.extend($.Event(), event, {type:'keyup', keyCode: BACK, charCode: 0});

    input.trigger(keydownevent);
    input.val(text);
    input.trigger(keyupevent);
  }


  function carret(pos) {
    var i = input.get(0);
    if (i.setSelectionRange) {
      i.setSelectionRange(pos, pos);
    } else {
      var range = i.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  $(document).ready(function() {
    module('emailcomplete', {setup: setup, teardown: teardown});

    test("when I type a string that does not match the suggestion list is not shown", function() {
      for (var i in INVALID) {
        input.val('').autotype(INVALID[i]);
        ok($('.ec-list').is(':hidden'), 'suggestion list is hidden after typing: "' + INVALID[i] + '"');
      }
    });

    test("when I type a string that does not match the suggestion list is empty", function() {
      for (var i in INVALID) {
        input.val('').autotype(INVALID[i]);
        same(suggestions(), [], 'suggestion list is empty after typing: "' + INVALID[i] + '"');
      }
    });

    test("when I type a string that matches, a suggestion list should be shown", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        ok($('.ec-list').is(':visible'), 'suggestion list is visible after typing: "' + VALID[i] + '"');
      }
    });

    test("when I type a string that matches, the suggestion list should contain the matches", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        same(suggestions(), EXPECTED[i], 'when ' + VALID[i] + ' is typed, the matching suggestions should be shown');
      }
    });

    test("when I type a string that matches the first match should be shown as placeholder", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        equals(placeholder(), EXPECTED[i][0], 'typed ' + VALID[i]);
      }
    });

    test("when I click a suggestion its value is set", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        var suggestion = $('.ec-item:first-child');
        suggestion.mousedown();
        equals(suggestion.text(), input.val(), 'clicking sets text');
      }
    });

    test("when I click a suggestion the suggestion list is hidden", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        var suggestion = $('.ec-item:first-child');
        suggestion.mousedown();
        ok($('.ec-list').is(':hidden'), 'suggestion list is visable');
      }
    });

    test("when I click a suggestion the placeholder is cleared", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        var suggestion = $('.ec-item:first-child');
        suggestion.mousedown();
        equal(placeholder(), '', 'placeholder should be empty');
      }
    });

    test("when a suggestion list is present the first suggestion is selected", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        var suggestion = $('.ec-item:first-child');
        ok(suggestion.is('.ec-selected'), 'first suggestion should be selected when ' + VALID[i] + ' is typed') 
      }
    });

    test("when a suggestion list is present only one item should be selected", function() {
      for (var i in VALID) {
        input.val('').autotype(VALID[i]);
        equal($('.ec-selected').length, 1, 'only one item should be selected');
      }
    });

    test("when a suggestion list is present and I press down the next suggestion is highlighted", function() {
      input.autotype('test@b');
      var selected = $('.ec-selected');
      input.autotype('{{down}}');
      equal($('.ec-selected').text(), selected.next().text());
    });

    test("when a suggestion list is present and I press down the next suggestion is used as a placeholder", function() {
      input.autotype('test@b');
      input.autotype('{{down}}');
      equal(placeholder(), $('.ec-selected').text());
    });

    test("when a suggestion list is present and I press down while at the last suggestion nothing happens", function() {
      input.autotype('test@b');
      $('.ec-item').removeClass('ec-selected');
      var selected = $('.ec-item:last-child').addClass('ec-selected');
      input.autotype('{{down}}');
      equal($('.ec-selected').text(), selected.text());
    });

    test("when a suggestion list is present and I press up the previous suggestion is highlighted", function() {
      input.autotype('test@b');
      $('.ec-item').removeClass('ec-selected');
      var selected = $('.ec-item:last-child').addClass('ec-selected');
      input.autotype('{{up}}');
      equal($('.ec-selected').text(), selected.prev().text());
    });

    test("when a suggestion list is present and I press up the previous suggestion is is used as a placeholder", function() {
      input.autotype('test@b');
      $('.ec-item').removeClass('ec-selected');
      var selected = $('.ec-item:last-child').addClass('ec-selected');
      input.autotype('{{up}}');
      equal($('.ec-selected').text(), selected.prev().text());
    });

    test("when a suggestion list is present and I press up while at the first suggestion nothing happens", function() {
      input.autotype('test@b');
      var selected = $('.ec-selected');
      input.autotype('{{up}}');
      equal($('.ec-selected').text(), selected.text());
    });

    test("when a placeholder is present and I blur the placeholder is cleared", function() {
      input.autotype('test@b');
      input.blur();
      equal(placeholder(), '');
    });

    test("when a placeholder is present and I blur the input the suggestion list is hidden", function() {
      input.autotype('test@b');
      input.blur();
      ok($('.ec-list').is(':hidden'));
    });

    test("when a selected value is present and I press enter its value is transfered to the input", function() {
      input.autotype('test@b');
      input.autotype('{{enter}}');
      equal(input.val(), 'test@bar.com');
    });

    test("when a placeholder is present and I press enter placeholder is cleared", function() {
      input.autotype('test@b');
      input.autotype('{{enter}}');
      equal(placeholder(), '');
    });

    test("when a selected value is present and I press tab its value is transfered to the input", function() {
      input.autotype('test@b');
      input.autotype('{{tab}}');
      equal(input.val(), 'test@bar.com');
    });

    test("when a placeholder is present and I press tab placeholder is cleared", function() {
      input.autotype('test@b');
      input.autotype('{{tab}}');
      equal(placeholder(), '');
    });

    test("when I change the string the suggestion is updated", function() {
      input.autotype('test@ba');
      same(suggestions(), ['test@bar.com', 'test@baz.com'], input.val());
      input.autotype('z');
      same(suggestions(), ['test@baz.com'], input.val());
      input.autotype('{{back}}');
      same(suggestions(), ['test@bar.com', 'test@baz.com'], input.val());
    });

    test("when I change the string the placeholder is updated", function() {
      input.autotype('test@ba');
      equal(placeholder(), 'test@bar.com');
      input.autotype('z');
      equal(placeholder(), 'test@baz.com');
      input.autotype('{{back}}');
      equal(placeholder(), 'test@bar.com');
    });

    test("when I change the string so that it no longer matches the suggestions are hidden", function() {
      input.autotype('test@b');
      input.autotype('{{back}}');
      ok($('.ec-list').is(':hidden'));
    });

    test("when I change the string so that it no longer matches the placeholder is cleared", function() {
      input.autotype('test@b');
      input.autotype('{{back}}');
      equal(placeholder(), '');
    });

    test("when the suggestion list is present it should be the at least the same width as the input", function() {
      input.autotype('test@b');
      var list = $('.ec-list').width();
      ok(list >= input.width(), list + ' >= ' + input.width());
    });

    test("when we are focused the suggestion list should become visible again", function() {
      input.autotype('test@b');
      input.blur();
      input.focus();
      ok($('.ec-list').is(':visible'));
    });

    test("when we are focused the placeholder be set again", function() {
      input.autotype('test@b');
      input.blur();
      input.focus();
      equal(placeholder(), 'test@bar.com');
    });

    test("when the localpart is updated the placeholder is updated to match", function() {
      input.autotype('test@ba');
      backspace('tes@ba');
      equal(placeholder(), 'tes@bar.com');
    });

    test("when the localpart is updated the suggestion list is updated to match", function() {
      input.autotype('test@ba');
      backspace('tes@ba');
      same(suggestions(), ['tes@bar.com', 'tes@baz.com']);
    });

    test("when the keydown event for delete is fired the suggestion is cleared", function() {
        input.autotype('test@b');

        var event = {altKey: false, metaKey: false, shiftKey: false, ctrlKey: false};
        var keydownevent = $.extend($.Event(), event, {type:'keydown', keyCode: DEL, charCode: 0});

        input.trigger(keydownevent);
        equal(placeholder(), '');
    });

    test("when the keydown event for backspace is fired the suggestion is cleared", function() {
        input.autotype('test@b');
        carret(0);

        var event = {altKey: false, metaKey: false, shiftKey: false, ctrlKey: false};
        var keydownevent = $.extend($.Event(), event, {type:'keydown', keyCode: BACK, charCode: 0});

        input.trigger(keydownevent);
        equal(placeholder(), '');
    });

    test("when the keydownevent for backspace is fired and the carret is at the end the text is not cleared", function() {
        var text = 'test@ba';
        input.autotype(text);
        carret(text.length);

        var event = {altKey: false, metaKey: false, shiftKey: false, ctrlKey: false};
        var keydownevent = $.extend($.Event(), event, {type:'keydown', keyCode: BACK, charCode: 0});

        input.trigger(keydownevent);
        equal(placeholder(), 'test@bar.com');
    });

    test("when cutof is passed placeholder is not set", function() {
      input.autotype('12345678901234567890@f')
      same(placeholder(), '');
    });

    test("when the suggestion list is present it should be below the input", function() {
      // FIXME
    });

    test("when the suggestion list is present it should have a solid background", function() {
      // FIXME
    });

    test("when the placeholder is present it should be aligned with the input", function() {
      // FIXME
    });

    test("when the tab key is pressed the the suggestion input is not focused", function() {
      // FIXME
    });

    test("when the shift+tab key is pressed the the suggestion input is not focused", function() {
      // FIXME
    });

    test("when the text is earsed the placeholder is updated", function() {
    });

    test("when the text is changed the selected item is presserved", function() {
    });

    test("when a placeholder is present and I press enter the form is not submited", function() {
    });

    test("when no placeholder is present and I press enter the form is submited", function() {
    });

    // FIXME enter triggers submit on opera
    // ... keydown vs. keypress issue it would seem
    // FIXME enter never trigger submit on ie
    // FIXME text scrolling breaks placeholder hack
    // ... solved with cutof perhaps?
    // FIXME clearing placeholder for keydown back and del not tested
    // FIXME clearing placeholder when at end of string looks ugly...
    // FIXME test-foo@ba -> testi@ba should be tested with keypress i
    // FIXME updating localpart should not trigger animation

    // FIXME test suggest is not modified between events... 

    // Backspace at end does nothing
    // Backspace internal clears suggest
    // del allways clears suggestion
  });
})();
