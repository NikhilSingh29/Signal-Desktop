// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import ReactDOM from 'react-dom';
import { contextBridge, ipcRenderer } from 'electron';

import { SignalContext } from '../context';
import { DebugLogWindow } from '../../components/DebugLogWindow';
import * as debugLog from '../../logging/debuglogs';
import { upload } from '../../logging/uploadDebugLog';
import * as logger from '../../logging/log';

contextBridge.exposeInMainWorld('SignalContext', {
  ...SignalContext,
  renderWindow: () => {
    const environmentText: Array<string> = [SignalContext.getEnvironment()];

    const appInstance = SignalContext.getAppInstance();
    if (appInstance) {
      environmentText.push(appInstance);
    }

    ReactDOM.render(
      React.createElement(DebugLogWindow, {
        platform: process.platform,
        isWindows11: SignalContext.OS.isWindows11(),
        executeMenuRole: SignalContext.executeMenuRole,
        closeWindow: () => SignalContext.executeMenuRole('close'),
        downloadLog: (logText: string) =>
          ipcRenderer.send('show-debug-log-save-dialog', logText),
        i18n: SignalContext.i18n,
        fetchLogs() {
          return debugLog.fetch(
            SignalContext.getNodeVersion(),
            SignalContext.getVersion()
          );
        },
        uploadLogs(logs: string) {
          return upload({
            content: logs,
            appVersion: SignalContext.getVersion(),
            logger,
          });
        },
      }),
      document.getElementById('app')
    );
  },
});
