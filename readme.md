# pages-store

[![NPM Downloads][downloads-image]][downloads-url]
[![NPM Version][version-image]][version-url]
[![License][license-image]][license-url]
[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devdependency-image]][devdependency-url]
[![Code Style][style-image]][style-url]

> GitHub Pages Storage Adapter for Ghost

## Installation

### Via Yarn or NPM

- Install pages-store module

  ```shell
  yarn add ghost-github-storage
  # or npm
  npm install ghost-github-storage
  ```
- Make the storage folder if it doesn't exist yet

  ```shell
  mkdir -p content/adapters/storage
  ```
- Copy the module into the right location

  ```shell
  cp -vR node_modules/ghost-github-storage content/adapters/storage/ghost-github-storage
  ```

### Via Git

In order to replace the storage module, the basic requirements are:

- Create a new folder inside `content/adapters` called `storage`

- Clone this repo to `storage`

  ```shell
  cd [path/to/ghost]/content/adapters/storage
  git clone https://github.com/wangkezun/ghost-github-storage.git
  ```

- Install dependencies

  ```shell
  cd ghost-github-storage
  yarn
  # or
  npm install
  ```

## Usage

In your `config.[env].json` file, you'll need to add a new `storage` block to whichever environment you want to change:

```json
{
  "storage": {
    "active": "ghost-github-storage",
    "ghost-github-storage": {
      "token": "YOUR_GITHUB_TOKEN",
      "repo": "REPO_NAME",
      "owner": "YOUR_GITHUB_USER_NAME"
    }
  }
}
```
Adapter will check the repo existence and create a new repo if not exist and check branch existence and checkout a new branch if not exist

Use gh-pages as branch name and leave prefix blank is recommended for github will automatic publish image to github.io

change configs will not affect images that already uploaded.

### Options

```json
{
  "storage": {
    "active": "ghost-github-storage",
    "ghost-github-storage": {
      "branch": "gh-pages", // using default is recommended
      "prefix": "https://wangkezun.github.io/ghost-assets", // by default adapter will generate this prefix
      "format": "{yyyy}/{mm}/{dd}/{name}-{uuid}-{timestamp}-{random}{ext}"
    }
  }
}
```

## Contributing

1. **Fork** it on GitHub!
2. **Clone** the fork to your own machine.
3. **Checkout** your feature branch: `git checkout -b my-awesome-feature`
4. **Commit** your changes to your own branch: `git commit -am 'Add some feature'`
5. **Push** your work back up to your fork: `git push -u origin my-awesome-feature`
6. Submit a **Pull Request** so that we can review your changes.

> **NOTE**: Be sure to merge the latest from "upstream" before making a pull request!

## License

[MIT](LICENSE) &copy; [wangkezun](https://wkz.io)

## Forked from [pages-store](https://github.com/zce/pages-store)

### origin repo depends on [gh-pages](https://www.npmjs.com/package/gh-pages) which commit every thing in images folder to github. It's very slow and unsafe.
### this repo depends on [@octokit/rest](https://github.com/octokit/rest.js) which can commit one file a time, makes the upload much faster than origin adapter.



[downloads-image]: https://img.shields.io/npm/dm/pages-store.svg
[downloads-url]: https://npmjs.org/package/pages-store
[version-image]: https://img.shields.io/npm/v/pages-store.svg
[version-url]: https://npmjs.org/package/pages-store
[license-image]: https://img.shields.io/github/license/wangkezun/ghost-github-storage.svg
[license-url]: https://github.com/wangkezun/ghost-github-storage/blob/master/LICENSE
[dependency-image]: https://img.shields.io/david/zce/pages-store.svg
[dependency-url]: https://david-dm.org/zce/pages-store
[devdependency-image]: https://img.shields.io/david/dev/zce/pages-store.svg
[devdependency-url]: https://david-dm.org/zce/pages-store?type=dev
[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: http://standardjs.com
