
zound.models.Track = Backbone.Model.extend({
  defaults: {
    length: 32
  },
  initialize: function () {
    this.slots = new zound.models.Slots(_.chain(_.range(0, this.get("length"))).map(function () {
      return new zound.models.Slot({});
    }, this).value());

  },
  addNote: function (position, note, module) {
    var slot = this.slots.at(position);
    slot.set({ note: note, module: module });
  },
  removeNote: function (position) {
    var slot = this.slots.at(position);
    slot.set({ note: null, module: null });
  }
});

zound.models.Tracks = Backbone.Collection.extend({
  model: zound.models.Track
});
