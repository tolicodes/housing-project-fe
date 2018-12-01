
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import { Map, GeoJSON } from 'react-leaflet';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import TitleLayer from './maps/TitleLayer';
import { updateBorrower } from './App/actions';

import { getCenter, MAPS, CENTERS, LA_CENTER } from './maps/utils';
import la from './maps/la';

// import CityDetailsBox from './CityDetailsBox';

/* Neighborhood */
const defaultStyle = {
  color: '#2262CC',
  weight: 2,
  opacity: 0.6,
  fillOpacity: 0.1,
  fillColor: '#2262CC',
};

const highlightStyle = {
  ...defaultStyle,
  weight: 3,
  fillOpacity: 0.65,
};

const styles = () => ({
  mapContainer: {
    marginRight: '300px',
    paddingTop: '20px',
    border: '1px solid red',
  },
  backButton: {
    marginLeft: '50px',
  }
})

class CityMap extends Component {
  state = {
    currentCity: null,
    currentNeighborhoods: []
  }

  onEachFeature = (feature, layer) => {
    const { city } = this.props.borrower;

    // Load the default style.
    layer.setStyle(defaultStyle);

    const properties = feature.properties;

    layer.on('mouseover', () => {
      layer.setStyle(highlightStyle);
    });

    layer.on('mouseout', () => {
      if (!this.props.borrower.neighborhoods.includes(properties.name)) {
        layer.setStyle(defaultStyle);
      }
    });

    layer.on('click', () => {
      if (!city) {
        this.props.updateBorrower({
          ...this.props.borrower,
          city: properties.name,
          neighborhoods: [],
        })
      } else {
        this.props.updateBorrower({
          ...this.props.borrower,
          neighborhoods: [
            ...this.props.borrower.neighborhoods,
            properties.name,
          ]
        })

        layer.setStyle(highlightStyle);
      }
    });
  };

  handleBackButton = () => {
    this.props.updateBorrower({
      ...this.props.borrower,
      city: '',
      neighborhoods: [],
    })
  };

  render() {

    const { classes } = this.props;

    const { city, neighborhoods } = this.props.borrower;

    let zoomLevel = !city ? 10 : 11;

    let centerPoint = !city ?
      LA_CENTER
      : CENTERS[city];

    if (neighborhoods.length) {
      const lastNeighborhood = neighborhoods[neighborhoods.length - 1];

      centerPoint = getCenter(city, lastNeighborhood);

      zoomLevel = 12;
    }

    const mapData = !city ? la : MAPS[city];
    const mapKey = city || 'la';

    const button = !city ?
      null
      : <Button
        size="small"
        className={classes.backButton}
        onClick={this.handleBackButton}
      >
        Back
        </Button>;


    return (
      <div className={classes.mapContainer}>
        <Map
          style={{
            height: 'calc(100vh - 275px)',
            marginRight: '50px',
            marginLeft: '50px',
          }}

          zoomControl={false}
          scrollWheelZoom={false}
          touchZoom={false}
          doubleClickZoom={false}

          zoom={zoomLevel}
          center={centerPoint}
        >

          <TitleLayer />

          <GeoJSON
            key="la"
            data={la}
            onEachFeature={this.onEachFeature}
          />
          {city && <GeoJSON
            key={mapKey}
            data={mapData}
            onEachFeature={this.onEachFeature}
          />}
        </Map>
        {button}
      </div>
    );
  }
}

export default withStyles(styles)(connect(
  ({ app: { borrowers } }) => ({
    borrower: borrowers[borrowers.length - 1],
  }),
  dispatch => bindActionCreators({
    updateBorrower,
  }, dispatch),
)(CityMap));