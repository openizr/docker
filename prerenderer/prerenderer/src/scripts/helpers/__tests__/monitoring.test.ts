/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable global-require */

describe('helpers/monitoring', () => {
  jest.spyOn(process, 'exit').mockImplementation((code: number | undefined) => code as unknown as never);
  Object.assign(console, { error: jest.fn() });
  process.on = jest.fn((_event, callback) => callback({ message: 'fatal error', stack: 'stack' })) as Any;
  const { error } = console;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENV = 'test';
  });

  test('does not capture fatal errors in development mode', () => {
    jest.isolateModules(() => {
      process.env.ENV = 'development';
      require('scripts/helpers/monitoring');
      expect(process.exit).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(error).toHaveBeenCalledTimes(2);
      expect(error).toHaveBeenCalledWith({ message: 'fatal error', stack: 'stack' });
    });
  });

  test('captures fatal errors in (pre)/production modes', () => {
    jest.isolateModules(() => {
      process.env.ENV = 'production';
      require('scripts/helpers/monitoring');
      expect(process.exit).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(error).toHaveBeenCalledTimes(4);
      expect(error).toHaveBeenCalledWith({ message: 'fatal error', stack: 'stack' });
    });
  });
});
