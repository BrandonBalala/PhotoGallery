import React, { Component } from 'react';
import './assets/css/App.css';

import Gallery from './components/Gallery';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Gallery />
      </div>
    );
  }
}

export default App;
