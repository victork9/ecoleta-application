import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Link
} from "react-router-dom";

import Home from './pages/Home'
import CreatePoint from './pages/CreatePoint'

 const Routes = () => {
    return (
        <Router>
            <Route path="/" component={Home} exact/>
            <Route path="/create-point" component={CreatePoint} />
        </Router>
    )
}

export default Routes;