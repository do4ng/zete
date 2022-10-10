import { ZeteConfig } from './config';
import electron from 'electron';
export function zete(config?: ZeteConfig, fn?: (webview: electron.BrowserWindow) => void);
