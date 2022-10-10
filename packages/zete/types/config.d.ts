import { BrowserWindowConstructorOptions } from 'electron';

export interface ZeteConfig {
  cwd?: string;
  pages?: string;
  plugins?: any[];
  port?: number;

  win?: ZeteWindow;
}

export interface ZeteWindow {
  showWindowAfterLoad?: boolean; // default: true
  electron?: BrowserWindowConstructorOptions;
}
