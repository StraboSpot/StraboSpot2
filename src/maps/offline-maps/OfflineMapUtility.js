import React, {Component} from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {MAPBOX_KEY} from '../../MapboxConfig';
import {getMapTiles} from '../../services/maps/MapDownload';
import {Alert} from "react-native";


MapboxGL.setAccessToken(MAPBOX_KEY);

export const getVisibleBounds = async (map) => {
  // console.log("Download map selected");
  // console.log('this._map', map);
  // const visibleBounds = await map.getVisibleBounds();      // Mapbox
  // //const visibleBounds = await this._map.getMapBoundaries();    // RN Maps
  // console.log('first bounds', visibleBounds);
  // Alert.alert('first Bounds', JSON.stringify(visibleBounds));
  return await map.getVisibleBounds();
};
