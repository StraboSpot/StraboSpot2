import {createSlice} from '@reduxjs/toolkit';

import {LATITUDE, LONGITUDE, ZOOM} from './maps.constants';

const initialMapsState = {
  center: [LONGITUDE, LATITUDE],
  currentBasemap: null,
  currentImageBasemap: undefined,
  customMaps: {},
  selectedCustomMapToEdit: {},
  vertexStartCoords: undefined,
  vertexEndCoords: undefined,
  freehandFeatureCoords: undefined,
  spotsInMapExtent: [],
  symbolsOn: [],
  isAllSymbolsOn: true,
  isMapMoved: true,
  mapSymbols: [],
  tagTypeForColor: undefined,
  isShowSpotLabelsOn: true,
  stratSection: undefined,
  zoom: ZOOM,
};

const mapsSlice = createSlice({
  name: 'map',
  initialState: initialMapsState,
  reducers: {
    addedCustomMap(state, action) {
      const newMapObject = Object.assign({}, {[action.payload.id]: action.payload});
      // console.log('Setting custom maps: ', newMapObject);
      state.customMaps = {...state.customMaps, ...newMapObject};
    },
    addedCustomMapsFromBackup(state, action) {
      state.customMaps = action.payload;
    },
    clearedMaps(state) {
      state.customMaps = {};
    },
    clearedStratSection(state) {
      state.stratSection = undefined;
    },
    clearedVertexes(state) {
      state.vertexStartCoords = undefined;
      state.vertexEndCoords = undefined;
    },
    deletedCustomMap(state, action) {
      state.customMaps = action.payload;
    },
    resetMapState() {
      return initialMapsState;
    },
    selectedCustomMapToEdit(state, action) {
      state.selectedCustomMapToEdit = action.payload;
    },
    setAllSymbolsToggled(state, action) {
      // console.log('Map All Symbols Toggled', action.payload);
      state.isAllSymbolsOn = action.payload;
      state.symbolsOn = action.payload ? state.mapSymbols : state.symbolsOn;
    },
    setCenter(state, action) {
      state.center = action.payload;
    },
    setCurrentBasemap(state, action) {
      // const newBasemap = BASEMAPS.find(basemap => basemap.id === action.payload);
      // console.log('Setting current basemap to a default basemap...');
      state.currentBasemap = action.payload;
    },
    setCurrentImageBasemap(state, action) {
      state.stratSection = undefined;
      state.currentImageBasemap = action.payload;
    },
    setFreehandFeatureCoords(state, action) {
      state.freehandFeatureCoords = action.payload;
    },
    setIsMapMoved(state, action) {
      state.isMapMoved = action.payload;
    },
    setIsShowSpotLabelsOn(state, action) {
      state.isShowSpotLabelsOn = action.payload;
    },
    setMapSymbols(state, action) {
      // console.log('Set Map Symbols', action.payload);
      state.mapSymbols = action.payload;
    },
    setSpotsInMapExtent(state, action) {
      state.spotsInMapExtent = action.payload;
    },
    setStratSection(state, action) {
      state.currentImageBasemap = undefined;
      state.stratSection = action.payload;
    },
    setSymbolsDisplayed(state, action) {
      // console.log('Map Symbols Displayed', action.payload);
      state.symbolsOn = action.payload;
      state.isAllSymbolsOn = action.payload.length < state.mapSymbols.length ? false : state.isAllSymbolsOn;
    },
    setTagTypeForColor(state, action) {
      state.tagTypeForColor = action.payload;
    },
    setVertexEndCoords(state, action) {
      // console.log('Set vertex selected end coords: ', action.payload);
      state.vertexEndCoords = action.payload;
    },
    setVertexStartCoords(state, action) {
      // console.log('Set vertex selected start coords: ', action.payload);
      state.vertexStartCoords = action.payload;
    },
    setZoom(state, action) {
      state.zoom = action.payload;
    },
    updateCustomMap(state, action) {
      state.customMaps[action.payload.id] = action.payload;
    },
  },
});

export const {
  addedCustomMap,
  addedCustomMapsFromBackup,
  clearedMaps,
  clearedStratSection,
  clearedVertexes,
  deletedCustomMap,
  resetMapState,
  selectedCustomMapToEdit,
  setAllSymbolsToggled,
  setCenter,
  setCurrentBasemap,
  setCurrentImageBasemap,
  setFreehandFeatureCoords,
  setIsMapMoved: setIsMapMoved,
  setIsShowSpotLabelsOn,
  setMapSymbols,
  setSpotsInMapExtent,
  setStratSection,
  setSymbolsDisplayed,
  setTagTypeForColor,
  setVertexEndCoords,
  setVertexStartCoords,
  setZoom,
  updateCustomMap,
} = mapsSlice.actions;

export default mapsSlice.reducer;


