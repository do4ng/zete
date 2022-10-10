/* eslint-disable default-param-last */
import electron from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as devServer from '@zete/dev';
import { ZeteConfig } from '../types/config';
import { logger } from './utils/logging';
import { existsPackage } from './utils/package';

// eslint-disable-next-line no-unused-vars
export async function zete(config: ZeteConfig = {}, fn?: (webview: electron.BrowserWindow) => void) {
  const port = config.port || 11050;

  // check electron package
  if (!existsPackage('electron')) logger.error(new Error("Cannot find module 'electron'."));

  // set config
  config = {
    cwd: process.cwd(),
    pages: '/pages',
    plugins: [],
    win: {
      showWindowAfterLoad: true,
      electron: {
        width: 1600,
        height: 850,
        show: false,
        webPreferences: {
          preload: join(config.cwd || process.cwd(), '.zete', 'entry.js'),
          nodeIntegration: true,
        },
      },
    },
    ...config,
  };

  devServer.builder({});

  const waitForBuild = () =>
    // eslint-disable-next-line implicit-arrow-linebreak
    new Promise<void>((resolve) => {
      const wait = setInterval(() => {
        if (existsSync(join(config.cwd, '.zete', 'routes.js'))) {
          console.log(readFileSync(join(config.cwd, '.zete', 'routes.js')).toString());
          console.log(join(config.cwd, '.zete', 'routes.js'));
          clearInterval(wait);
          resolve();
        }
        console.log('was');
      }, 100);
    });

  waitForBuild().then(async () => {
    console.log('helloworld');
    await devServer.dev({
      port,
    });

    // wait for electron apis
    await electron.app.whenReady();

    writeFileSync(join(config.cwd, '.zete', 'index.html'), readFileSync(join(__dirname, '../assets/index.html')));

    writeFileSync(join(config.cwd, '.zete', 'entry.js'), readFileSync(join(__dirname, '../assets/entry.js')));

    // create window
    const create = () => {
      const mainWindow = new electron.BrowserWindow({
        ...config.win.electron,
      });

      if (fn) fn(mainWindow);

      mainWindow.once('ready-to-show', () => {
        mainWindow.show();
      });

      mainWindow.loadURL(`http://localhost:${port}`);
    };

    // wait for build frontend

    create();

    /**/

    electron.app.on('activate', () => {
      if (electron.BrowserWindow.getAllWindows().length === 0) {
        create();
      }
    });

    electron.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') electron.app.quit();
    });
  });
}
