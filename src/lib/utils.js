'use strict';

var get = require('get-value');
var set = require('set-value');
var has = require('has-value');
var del = require('del-value');

var utils = module.exports = {};

utils.cache = function(cache) {
  var props = ['data', 'locals', 'options'];
  var escape = function(str) {
    return str.split('.').join('\\.');
  };

  return {
    set: function(view, key) {
      props.forEach(function(prop) {
        if (has(view, [prop, key])) {
          set(cache, [escape(view.key), prop, key], get(view, [prop, key]));
          del(view, [prop, key].join('.'));
        }
      });
    },
    restore: function(view, key) {
      props.forEach(function(prop) {
        var escaped = escape(view.key);
        if (has(cache, [escaped, prop, key])) {
          set(view, [prop, key], get(cache, [escaped, prop, key]));
          del(cache, [escaped, prop, key].join('.'));
        }
      });
    }
  };
}
