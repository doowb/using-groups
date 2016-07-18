'use strict';
var path = require('path');
var Remarkable = require('remarkable');

module.exports = function(options) {
  return function(app) {
    var Handlebars = app.engine('hbs').Handlebars;

    // helpers
    app.helpers(require('handlebars-helpers')());
    app.helper('link-to', require('helper-link-to'));

    app.helper('relative', function(to) {
      var from = path.dirname(this.view.data.permalink);
      var fp = path.relative(from, to);
      return fp;
    });

    app.helper('highlight', function(lang, options) {
      var delim = '```';
      return `
${delim + lang}
${options.fn(this)}${delim}
`;
    });

    app.asyncHelper('markdown', function(options, cb) {
      var md = new Remarkable({ html: true, breaks: true });
      var str = options.fn(this);
      this.app.renderString(str, this.context, function(err, str) {
        if (err) return cb(err);
        cb(null, md.render(str));
      });
    });

    app.asyncHelper('inline-view', function(view, options, cb) {
      var str = view.content;
      if (typeof view.options.layoutStack !== 'undefined' && typeof view.options.layoutStack[0] !== 'undefined') {
        str = view.options.layoutStack[0].before;
      }
      this.app.renderString(str, cb);
    });
  };
};
