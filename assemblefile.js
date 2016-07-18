'use strict';

var path = require('path');
var assemble = require('assemble');
var permalinks = require('assemble-permalinks');
var utils = require('./src/lib/utils');
var app = assemble();
app.option('engine', 'hbs');
app.option('layout', 'default');

/**
 * Set up variables for paths used throughout the build.
 */

var cwd = require('memoize-path')(__dirname);
var src = cwd('src');
var base = cwd('_gh_pages');
var structure = src('structure');
var content = src('content');

/**
 * Add some plugins for custom helpers used in the templates in this example
 */

app.use(require('./src/lib/plugins/renderString')());
app.use(require('./src/lib/plugins/helpers')());

/**
 * onLoad middleware for posts to slice the date part of the filename off
 * and add it to the file's data object.
 * This is used in the permalinks below.
 */

app.onLoad(/.*posts\/.*\.md/, function(file, next) {
  if (file.data.date) {
    return next(null, file);
  }
  var name = file.stem;
  file.data.date = name.slice(0, 10);
  file.stem = name.slice(11);
  next(null, file);
});

/**
 * Create a custom view collection used for templates that will be used when rendering lists of templates.
 * These lists are used for index and list pages (e.g. for tags and categories)
 */

app.create('lists');

/**
 * Create a custom view collection for posts. This is used to group posts into their own collection and provide
 * a custom permalink structure based on their filenames.
 *
 * The `permalinks` plugin used to create the destination file path for each post. The `onLoad` middleware above
 * is used to create the `date` property on the post's data object.
 */

app.create('posts')
  .use(permalinks(':toPaths(date)/:stem.html', {
    toPaths: function(date) {
      return date.split('-').join('/');
    }
  }));

/**
 * Add a `load` task that loads all the templates (structure), posts and pages (content), and
 * custom groups (creates collections based on front-matter from content views).
 */

app.task('load', function(cb) {
  // lists are used when creating collections from tags and categories
  app.lists(structure('lists/*.hbs').path);

  // layouts wrap renderable views with common html structure
  app.layouts(structure('layouts/*.hbs').path);

  // are used inside layouts and renderable views to provide common html elements
  app.partials(structure('partials/*.hbs').path);

  // content pages and posts
  app.pages(content('pages/*.hbs').path);
  app.posts(content('posts/*.md').path);

  // Use the content views to create custom collections use for grouping pages and posts together based
  // on the tags and categories used in their front-matter.
  // `posts` is just a name to identify the group we're working with
  // `app.posts` is the view collection that we'll be grouping using the post's front-matter
  // `app.list` is the view collection containing index and list views used for templates
  var group = app.group('posts', app.posts, app.lists);

  // Since we just loaded the posts above with the `app.posts(...)` method, we can group
  // posts together and create new view collections.
  // We're going to create 2 new collections, one for `tags` and one for `categories`.
  // Each view collection can use a custom permalinks structure by setting the permalinks plugin function on the
  // `options.permalinks` function when creating the collection
  group.create('tags', {permalinks: permalinks(':stem.html')});
  group.create('categories', {permalinks: permalinks(':stem.html')});
  cb();
});

/**
 * Render all the pages and write them to the `base` destination directory
 */

app.task('pages', function() {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(app.dest(base()));
});

/**
 * Render all the posts and write them to the `blog` directory in the `base` destination directory
 */

app.task('posts', function() {
  return app.toStream('posts')
    .pipe(app.renderFile())
    .pipe(app.dest(function(file) {
      file.base = base('blog').path;
      file.path = path.resolve(file.base, file.data.permalink);
      return base('blog').path;
    }));
});

/**
 * Render the groups (tags and categories) view collections to the `base` destination directory based
 * on the permalinks for those collections.
 */

app.task('groups', function() {
  return app.toStream('tags')
    .pipe(app.toStream('categories'))
    .pipe(app.renderFile())
    .pipe(app.dest(function(file) {
      file.base = base.path;
      file.path = path.resolve(file.base, file.data.permalink);
      return base(file.options.collection).path;
    }));
});

/**
 * Default task that runs the other tasks in the following order:
 *  - load
 *  - pages
 *  - posts
 *  - groups
 */

app.task('default', ['load', 'pages', 'posts', 'groups'], function(cb) {
  cb();
});

module.exports = app;
