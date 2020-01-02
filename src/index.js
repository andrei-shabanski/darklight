import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';

import store, { history } from './store';
import App from './components/App';
import Profile from './components/Profile';

import './config';
import './services/auth';
import 'normalize.css';
import './root.scss';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path={['/', '/*.png']} component={App} />
        <Route path="/profile" component={Profile} />
        <Route component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
