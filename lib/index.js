'use strict'

const url = require('url')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs-extra')
const BaseStorage = require('ghost-storage-base')
const octokit = require('@octokit/rest')({})

class GhostGithubStorage extends BaseStorage {
  constructor (config) {
    super()
    if (!config || !config.repo || !config.owner || !config.repo || !config.token) {
      throw new Error('Missing required parameters.')
    }
    this.owner = config.owner
    this.repo = config.repo
    this.token = config.token

    // Repository branch default is gh-pages
    this.branch = config.branch || 'gh-pages'
    // authenticate for octokit
    octokit.authenticate({
      type: 'token',
      token: this.token
    })
    // check repo existence
    octokit.repos.get({
      owner: this.owner,
      repo: this.repo
    }).catch(error => {
      if (error.code === 404) {
        // no repo found. create a new repo
        octokit.repos.create({
          name: this.owner,
          description: this.repo,
          license_template: 'unlicense',
          auto_init: true
        }).then(result => {
          // create success
          console.log(result)
        })
      }
    })
    // check repo existence
    octokit.repos.getBranch({
      owner: this.owner,
      repo: this.repo,
      branch: this.branch
    }).catch(error => {
      if (error.code === 404) {
        // get master branch sha to create new branch
        octokit.repos.getBranch({
          owner: this.owner,
          repo: this.repo,
          branch: 'master'
        }).then(result => {
          // create branch
          octokit.gitdata.createReference({
            owner: this.owner,
            repo: this.repo,
            ref: 'refs/heads/' + this.branch,
            sha: result.data.commit.sha
          })
        })
      }
    })

    // Custom gh-pages root url (custom domain)
    // check given prefix if not given generate default url
    if (!config.prefix) {
      // prefix can be vary depends on the branch name
      if (this.branch === 'gh-pages') {
        // for gh-pages will generate into github pages so prefix can set to github.io
        this.prefix = 'https://' + this.owner + 'github.io/' + this.repo
      } else {
        // for other name, use https://raw.githubusercontent.com for prefix
        this.prefix = 'https://raw.githubusercontent.com' + this.owner + '/' + this.repo + '/' + this.branch
      }
    } else {
      // use given prefix
      this.prefix = config.prefix
    }

    this.format = config.format || '{yyyy}/{mm}/{name}{ext}'

    // Local storage path
    this.localPath = config.path
      ? path.resolve(config.path)
      : path.join(__dirname, '../../../../images/')
  }

  exists (filename, targetDir) {
    const filePath = path.join(targetDir || this.localPath, filename)

    return fs.stat(filePath)
      .then(() => true)
      .catch(() => false)
  }

  save (image, targetDir) {
    return this.getFilename(image)
      .then(filename => {
        // Save to the local
        return fs.copy(image.path, filename).then(() => filename)
      })
      .then(filename => {
        // read file into a bitmap
        const bitmap = fs.readFileSync(filename)
        // Push to the remote repo
        return octokit.repos.createFile({
          owner: this.owner,
          repo: this.reponame,
          path: path,
          message: 'updates',
          content: Buffer.from(bitmap).toString('base64'),
          branch: this.branch
        }).then(() => filename)
      })
      .then(filename => {
        // get image url
        const pathname = path.relative(this.localPath, filename)
        const urlObj = url.parse(this.prefix)
        urlObj.path = urlObj.pathname = path.posix.join(urlObj.pathname, pathname)
        return url.format(urlObj)
      })
      .catch(e => Promise.reject(e))
  }

  serve () {
    return (req, res, next) => next()
  }

  delete () {
    return Promise.reject(new Error('Not implemented'))
  }

  read (options) {
    options = options || {}
    options.path = (options.path || '').replace(this.prefix, '')

    const targetPath = path.join(this.localPath, options.path)

    return new Promise((resolve, reject) => {
      fs.readFile(targetPath, (err, bytes) => {
        if (!err) resolve(bytes)
        return reject(new Error(` Could not read image: ${options.path}`))
      })
    })
  }

  /**
   * get uploaded image filename
   */
  getFilename (image) {
    const date = new Date()
    const timestamp = date.getTime()
    const year = this.padLeft(date.getYear() + 1900, 4)
    const month = this.padLeft(date.getMonth() + 1, 2)
    const day = this.padLeft(date.getDate(), 2)

    const random = Math.random().toString().substr(-8)

    const ext = path.extname(image.name)
    const name = path.basename(image.name, ext)

    const pathname = this.format.toLowerCase()
      .replace(/{timestamp}/g, timestamp)
      .replace(/{yyyy}/g, year)
      .replace(/{mm}/g, month)
      .replace(/{dd}/g, day)
      .replace(/{name}/g, name)
      .replace(/{ext}/g, ext)
      .replace(/{random}/g, random)
      .replace(/{uuid}/g, uuid())

    const filename = path.join(this.localPath, pathname)
    const pathObj = path.parse(filename)

    return fs.mkdirs(pathObj.dir).then(() => this.unique(pathObj))
  }

  padLeft (num, length) {
    const prefix = new Array(length).join('0')
    return (prefix + num).substr(-length)
  }

  /**
   * ensure filename is unique
   */
  unique (pathObj, i) {
    const originalName = pathObj.name

    if (i !== undefined) {
      pathObj.name += '-' + i
      pathObj.base = pathObj.name + pathObj.ext
    }

    return this.exists(pathObj.base, pathObj.dir).then(exists => {
      if (!exists) return path.format(pathObj)
      pathObj.name = originalName
      return this.unique(pathObj, i + 1 || 1)
    })
  }
}

module.exports = GhostGithubStorage
