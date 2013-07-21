(function (models, modules, ui) {

  // models

  var midiController = new models.MIDIController();

  var song = new models.Song();

  var generator1 = new modules.Generator({
    id: 1,
    x: 50,
    y: 100,
    title: "Gen1"
  });
  var generator2 = new modules.Generator({
    id: 2,
    x: 300,
    y: 50,
    title: "Gen2"
  });
  var output = new modules.Output({
    id: 3,
    x: 300,
    y: 150,
    title: "Output"
  });

  var pattern = new zound.models.Pattern();
  song.patterns.add(pattern);

  _.each(_.range(0, 40), function (i) {
    var track = pattern.tracks.at(Math.floor(Math.random()*pattern.tracks.size()));
    track.addNote(
      Math.floor(Math.random()*track.slots.size()),
      Math.floor(20+40*Math.random()),
      Math.random()<0.5 ? generator1 : generator2
    );
  });

  generator1.connect(output);

  song.modules.add(generator1);
  song.modules.add(generator2);
  song.modules.add(output);

  // FIXME: mock: init from the server?
  var users = new zound.models.Users([
      { name: "gre", color: 0 },
      { name: "pvo", color: 40 },
      { name: "ast", color: 80 },
      { name: "eca", color: 120 },
      { name: "aau", color: 160 },
      { name: "aau", color: 200 },
      { name: "vbr", color: 240 },
      { name: "jto", color: 255 }]);

  window.CURRENT_USER = users.at(0);

  // views

  var midiControllerNotification = new ui.MIDIControllerNotification({
    model: midiController
  });
  $("#midiNotification").append(midiControllerNotification.el);

  var nodeEditor = new ui.NodeEditor({
    model: song,
    el: '#node-editor'
  });

  var tracker = new zound.ui.Tracker({
    model: pattern
  });
  $("#tracker").append(tracker.el);

  var currentPropertiesEditor;
  nodeEditor.on("selectModule", function (module) {
    CURRENT_USER.selectModule(module);
    if (currentPropertiesEditor) {
      currentPropertiesEditor.remove();
    }
    currentPropertiesEditor = new zound.ui.ModulePropertiesEditor({
      model: module
    });
    $('#module-properties').append(currentPropertiesEditor.el);
  });
  var m = song.modules.first();
  if (m) {
    nodeEditor.selectModule(m);
  }

  // bind user style
  var users_style_template = _.template(document.getElementById('users_style_template').innerHTML);
  function updateUsersStyle (users) {
    $('#users_style').html(users.map(function (user) {
      return users_style_template(user.attributes);
    }).join('\n'));
  }
  users.on("add remove", function () {
    updateUsersStyle(users);
  });
  updateUsersStyle(users);

  var trackerIncrement = new zound.ui.TrackerIncrement({
    model: CURRENT_USER,
    id: "tracker-increment"
  });
  $('#tracker').append(trackerIncrement.el);

  var keyboardController = new zound.models.KeyboardController({
    user: CURRENT_USER
  });

  keyboardController.on({
    note: function (note) {
      var module = CURRENT_USER.getCurrentModule();
      var slot = CURRENT_USER.getSelectedSlot();
      if (module && slot) {
        slot.model.set({
          note: note,
          module: module
        });
        CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"));
      }
    }
  });

  // Handle selection
  $(window).click(function (e) {
    if (CURRENT_USER.getSelectedSlot()) {
      if (!$(e.target).parents('#tracker:first').size()) {
        CURRENT_USER.unselectCurrentTrackerSlot();
      }
    }
  });

  // Handle tracker navigation
  $(window).on("keydown", function (e) {
    var slot = CURRENT_USER.getSelectedSlot();
    var incrX = 0, incrY = 0;
    switch (e.which) {
      case 37: // left
        incrX = -1;
        break;
      case 39: // right
        incrX = 1;
        break;
      case 38: // up
        incrY = -1;
        break;
      case 40: // down
        incrY = 1;
        break;
    }
    if (slot) {
      e.preventDefault();
      CURRENT_USER.moveTrackerSelection(incrX, incrY);
    }
  });

  // for DEBUG only
  window._song = song;

}(zound.models, zound.modules, zound.ui));
