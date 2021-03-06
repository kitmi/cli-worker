"use strict";

/**
 * Parse command line arguments using minimist and store the parsed object into app.argv, and add app.showUsage() helper function
 * @module Feature_CmdLineOptions
 */

const path = require('path');
const Feature = require('../enum/Feature');
const Util = require('rk-utils');

const minimist = require('minimist');

function translateMinimistOptions(opts) {
    let m = {};

    Util._.forOwn(opts, (detail, name) => {
        if (detail.isBool) {
            Util.putIntoBucket(m, 'boolean', name);
        } else {
            Util.putIntoBucket(m, 'string', name);
        }

        if ('default' in detail) {
            Util.setValueByPath(m, `default.${name}`, detail.default);
        }

        if (detail.alias) {
            Util.setValueByPath(m, `alias.${name}`, detail.alias);
        }
    });

    return m;
}

function optionDecorator(name) {
    return name.length == 1 ? ('-' + name) : ('--' + name);
}

function getUsage(app, usageOptions) {
    let usage = '';

    if (usageOptions.banner) {
        if (typeof usageOptions.banner === 'function') {
            usage += usageOptions.banner(app);
        } else if (typeof usageOptions.banner === 'string') {
            usage += usageOptions.banner;
        } else {
            throw new Error('Invalid banner value of cmdLineOptions feature.');
        }

        usage += '\n';
    }            

    let fmtArgs = '';
    if (!Util._.isEmpty(usageOptions.arguments)) {
        fmtArgs = ' ' + usageOptions.arguments.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ');
    }

    usage += `Usage: ${usageOptions.program || path.basename(process.argv[1])}${fmtArgs} [options]\n`;
    
    if (!Util._.isEmpty(usageOptions.options)) {
        usage += `\nOptions:\n`;
        Util._.forOwn(usageOptions.options, (opts, name) => {
            let line = '  ' + optionDecorator(name);
            if (opts.alias) {
                line += Util._.reduce(opts.alias, (sum, a) => (sum + ', ' + optionDecorator(a)), '');
            }

            line += '\n';
            line += '    ' + opts.desc + '\n';

            if ('default' in opts) {
                line += '    default: ' + opts.default.toString() + '\n';
            }

            if (opts.required) {
                line += '    required\n';
            }

            line += '\n';

            usage += line;
        });
    }        

    return usage;
}

module.exports = {
    /**
     * This feature is loaded at configuration stage
     * @member {string}
     */
    type: Feature.INIT,

    /**
     * Load the feature
     * @param {CliApp} app - The cli app module object
     * @param {object} usageOptions - Options for the feature     
     * @property {string} [usageOptions.banner] - Banner message or banner generator function
     * @property {string} [usageOptions.program] - Executable name
     * @property {array} [usageOptions.arguments] - Command line arguments, identified by the position of appearance
     * @property {object} [usageOptions.options] - Command line options
     * @returns {Promise.<*>}
     */
    load_: async (app, usageOptions) => {
        let argv = process.argv.slice(2);
        app.argv = minimist(argv, translateMinimistOptions(usageOptions.options));

        app.showUsage = () => {
            console.log(getUsage(app, usageOptions));
        }
    }
};