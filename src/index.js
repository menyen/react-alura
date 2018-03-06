import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Autor from './Autor';
import Livro from './Livro';
import Home from './Home';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

ReactDOM.render(
    <BrowserRouter>
        <App>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/autor" component={Autor} />
                <Route path="/livro" component={Livro} />
            </Switch>
        </App>
    </BrowserRouter>,
    document.getElementById('root')
);
registerServiceWorker();
