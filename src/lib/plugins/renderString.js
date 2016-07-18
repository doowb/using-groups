'use strict';

module.exports = function renderString() {
  return function() {
    var count = 0;
    this.define('renderString', function(str, locals, cb) {
      if (typeof locals === 'function') {
        cb = locals;
        locals = {};
      }
      var view = this.view(`tmpl-${count++}`, {content: str});
      view.layout = false;
      view.extname = locals.ext;
      this.render(view, locals, function(err, res) {
        if (err) {
          err.view = view;
          err.locals = locals;
          cb(err);
          return;
        }
        cb(null, res.content);
      });
    });
  };
};
