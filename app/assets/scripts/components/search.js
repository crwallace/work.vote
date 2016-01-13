'use strict';

import geo from 'mapbox-geocoding';
import React from 'react';
import { connect } from 'react-redux';
import { pushPath } from 'redux-simple-router';
import Autosuggest from 'react-autosuggest';
import nets from 'nets';
import config from '../config';

let juris = {};

let Search = React.createClass({
  displayName: 'Search',
  propTypes: {
    dispatch: React.PropTypes.func
  },
  getSuggestions: function (input, callback) {
    let options = new Set();
    geo.setAccessToken(config.accessToken);
    nets({
      method: 'get',
      encoding: undefined,
      headers: {
        'Content-Type': 'application/json'
      },
      url: `${config.apiUrl}/jurisdictions/?search=${input}`
    }, function (err, resp, body) {
      if (err) {
        console.log(err);
      }
      let results = JSON.parse(body).results;
      for (let j = 0; j < results.length; j++) {
        let option = results[j].name + ', ' + results[j].state.alpha;
        juris[option] = results[j].id;
        options.add(option);
      }
      callback(null, Array.from(options));
    });
  },

  onSuggestionSelected: function (value, event) {
    this.props.dispatch(pushPath(`j/${juris[value]}`));
  },

  render: function () {
    return (
      <div>
        <div id='Search-container'>
          <div id='Address-Finder'>
            <div className='center-text'>Enter your county, zip code, or address</div>
            <Autosuggest suggestions={this.getSuggestions} onSuggestionSelected={this.onSuggestionSelected}/>
            <p>Work Elections currently covers:</p>
            <p>AZ, CA, FL, NV, NM, OH, VA</p>
          </div>
        </div>
        <div id='Search-enabler'><img src='/assets/graphics/layout/search.png'></img></div>
      </div>
    );
  }
});

export default connect()(Search);
