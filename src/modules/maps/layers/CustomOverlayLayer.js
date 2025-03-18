import React from 'react';

import MapboxGL from '@rnmapbox/maps';

import useMapURL from '../useMapURL';

const CustomOverlayLayer = ({basemap, customMap}) => {

  const {buildTileURL} = useMapURL();

  return (
    <MapboxGL.RasterSource
      key={customMap.id}
      id={customMap.id}
      tileUrlTemplates={[buildTileURL(customMap)]}
    >
      <MapboxGL.RasterLayer
        aboveLayerID={basemap.id}
        id={customMap.id + 'Layer'}
        sourceID={customMap.id}
        style={{
          rasterOpacity: customMap.opacity && parseFloat(customMap.opacity.toString())
          && parseFloat(customMap.opacity.toString()) >= 0 && parseFloat(customMap.opacity.toString()) <= 1
            ? parseFloat(customMap.opacity.toString()) : 1,
          visibility: 'visible',
        }}
      />
    </MapboxGL.RasterSource>
  );
};

export default CustomOverlayLayer;
