import "jquery/src/jquery"; //do not remove

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import InternalConfig from './config/config'
import ConfigService from './service/ConfigService'
import DebugService from "./service/DebugService.ts";
import { HashRouter as Router } from 'react-router-dom';
import * as QueryParam from './constant/QueryParam';
import { StorageService } from "./service";
import ServerService from "./service/ServerService";
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import { LocalizationService } from "./service/LocalizationService";

ConfigService.fetchExternalConfig().then(externalConfig => {
    const localService = LocalizationService.getInstance();

    ConfigService.initialize(InternalConfig, externalConfig);
    localService.setCurrentLanguage(ConfigService.get('language'));
    DebugService.initialize(!!ConfigService.get('debug'));
    StorageService.initialize(window.sessionStorage);
    ServerService.initialize();

    document.title = ConfigService.get('appTitle') || '';

    const intl = createIntl({
      locale: localService.getCurrentLanguage(),
      messages: localService.getMessages(),
    }, createIntlCache());
    localService.setIntlProvider(intl);

    const url = new URL(window.location);
    const callId = url.searchParams.get(QueryParam.CALL_ID);
    const reuseSession = url.searchParams.get(QueryParam.REUSE_SESSION) === 'true';

    ReactDOM.render(
      <Provider store={store}>
        <Router>
          <RawIntlProvider value={intl}>
            <App
              callId={callId}
              reuseSession={reuseSession} />
          </RawIntlProvider>
        </Router>
      </Provider>,
      document.getElementById('root')
    );
  });