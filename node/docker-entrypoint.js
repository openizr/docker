/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// The hardened base image ships no shell, so this mirrors the `node-dev` `docker-entrypoint.sh` in
// the only interpreter the image has left.

'use strict';

const { join, resolve, delimiter } = require('node:path');
const { accessSync, statSync, constants } = require('node:fs');

// `execve` does not search `PATH`, so we have to resolve commands like `command -v` would.
const isExecutable = (path) => {
  try {
    accessSync(path, constants.X_OK);
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

const which = (command) => {
  if (command.includes('/')) {
    const path = resolve(command);
    return isExecutable(path) ? path : null;
  }
  const directories = (process.env.PATH ?? '').split(delimiter);
  return directories.map((directory) => join(directory || '.', command)).find(isExecutable) ?? null;
};

const exists = (path) => {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
};

const fail = (code, message) => {
  console.error(`docker-entrypoint: ${message}`);
  process.exit(code);
};

const command = process.argv.slice(2);

// Default node entrypoint: anything that is not a runnable command is a `node` argument.
// Scripts are always `node` arguments, even with an executable bit: there is no shell to run them.
const isScript = command.length === 0 || command[0].startsWith('-') || /\.[cm]?js$/.test(command[0]);
let executable = isScript ? null : which(command[0]);

if (executable === null) {
  // A `node` argument only if it exists on disk: a typo would otherwise surface as a confusing
  // MODULE_NOT_FOUND from `node`.
  if (!isScript && !['', '.js', '.cjs', '.mjs'].some((ext) => exists(command[0] + ext))) {
    fail(127, `${command[0]}: command not found`);
  }
  command.unshift('node');
  executable = which('node') ?? process.execPath;
}

// Replaces the current process, so `dumb-init` keeps signalling the application itself.
try {
  process.execve(executable, command, process.env);
} catch (error) {
  // Shell conventions: 127 not found, 126 found but not runnable.
  fail(error.code === 'ENOENT' ? 127 : 126, `cannot run "${command[0]}": ${error.code ?? error.message}`);
}
