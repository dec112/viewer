import "jquery/src/jquery"; //do not remove

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap/dist/js/bootstrap.js';

import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import InternalConfig from './config/config'
import ConfigService from './service/ConfigService'
import ApiService from './service/ApiService'
import LanguageService from './service/LanguageService'
import DebugService from "./service/DebugService";

fetch('./dec112.config.json')
  .then(x => x.json())
  .then(externalConfig => {

  const api = ApiService.initialize(window.location);
  const configService = ConfigService.initialize(InternalConfig, externalConfig, api.getKey());
  const config = configService.getConfig();
  LanguageService.getInstance().setCurrentLanguage(config.language);
  DebugService.initialize(!!config.debug);

  document.title = config.appTitle || '';
  
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
   );
});