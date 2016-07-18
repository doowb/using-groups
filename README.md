## tl;dr;

This is an example on using [assemble-permalinks](https://github.com/assemble/assemble-permalinks) and grouped collections from [templates](https://github.com/jonschlinkert/templates) to dynamically create view collections based on front-matter.

## Install

```sh
$ git clone https://github.com/doowb/using-groups.git && cd using-groups && npm i
```

There's a post install script that should install the `jonschlinkert/templates#groups` branch.

## Run

```sh
$ assemble
```

This should build to the `_gh_pages` directory with page content files going to the root and post content files going to the blog folder in sub-directories based on the date in their filename.

There are also `tags` and `categories` directories built out based on the front-matter found in the posts.