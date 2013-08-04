var live = require('level-live-stream');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this.received = null;
  this._limit = Infinity;
  this.elements = {};

  process.nextTick(this.seed.bind(this, fn));
}

List.prototype.seed = function (fn) {
  var self = this;
  self.stream = live(self.db);
  self.stream.on('data', function (change) {
    if (change.type == 'del') {
      self.el.removeChild(self.elements[change.key]);
      return;
    }

    var el = fn(change.value, change.key);
    self.el.appendChild(el);
    self.elements[change.key] = el;

    if (++self.received == self._limit) {
      self.stream.destroy();
    }
  });
};

List.prototype.limit = function (count) {
  this._limit = count;
};
