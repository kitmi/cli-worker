"use strict";

const path = require('path');

const Feature = require('../enum/Feature');

const Literal = require('../enum/Literal');

const Util = require('rk-utils');

module.exports = {
  type: Feature.INIT,
  load_: async function (app, options) {
    let bootPath = options.path ? app.toAbsolutePath(options.path) : path.join(app.workingPath, Literal.DEFAULT_BOOTSTRAP_PATH);
    let bp = path.join(bootPath, '**', '*.js');
    let files = await Util.glob(bp, {
      nodir: true
    });
    return Util.eachAsync_(files, async file => {
      let bootstrap = require(file);

      return bootstrap(app);
    });
  }
};