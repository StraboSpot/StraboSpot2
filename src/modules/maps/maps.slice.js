import {createSlice} from '@reduxjs/toolkit';

const initialMapsState = {
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
  mapSymbols: [],
  tagTypeForColor: undefined,
  isShowSpotLabelsOn: true,
};

const mapsSlice = createSlice({
  name: 'map',
  initialState: initialMapsState,
  reducers: {
    addedCustomMap(state, action) {
      let mapId = action.payload.id;
     if (action.payload.source === 'mapbox_styles') mapId = action.payload.id.split('/')[1];
      const newMapObject = Object.assign({}, {[mapId]: action.payload});
      console.log('Setting custom maps: ', newMapObject);
      state.customMaps = {...state.customMaps, ...newMapObject};
    },
    addedCustomMapsFromBackup(state, action) {
      state.customMaps = action.payload;
    },
    clearedMaps(state) {
      state.customMaps = {};
    },
    clearedVertexes(state) {
      state.vertexStartCoords = undefined;
      state.vertexEndCoords = undefined;
    },
    deletedCustomMap(state, action) {
      state.customMaps = action.payload;
    },
    selectedCustomMapToEdit(state, action) {
      state.selectedCustomMapToEdit = action.payload;
    },
    setAllSymbolsToggled(state, action) {
      console.log('Map All Symbols Toggled', action.payload);
      state.isAllSymbolsOn = action.payload;
      state.symbolsOn = action.payload ? state.mapSymbols : state.symbolsOn;
    },
    setCurrentBasemap(state, action) {
      // const newBasemap = BASEMAPS.find(basemap => basemap.id === action.payload);
      // console.log('Setting current basemap to a default basemap...');
      state.currentBasemap = action.payload;
    },
    setCurrentImageBasemap(state, action) {
      state.currentImageBasemap = action.payload;
    },
    setFreehandFeatureCoords(state, action) {
      state.freehandFeatureCoords = action.payload;
    },
    setIsShowSpotLabelsOn(state, action) {
      state.isShowSpotLabelsOn = action.payload;
    },
    setMapSymbols(state, action) {
      console.log('Set Map Symbols', action.payload);
      state.mapSymbols = action.payload;
    },
    setSpotsInMapExtent(state, action) {
      state.spotsInMapExtent = action.payload;
    },
    setSymbolsDisplayed(state, action) {
      console.log('Map Symbols Displayed', action.payload);
      state.symbolsOn = action.payload;
      state.isAllSymbolsOn = action.payload.length < state.mapSymbols.length ? false : state.isAllSymbolsOn;
    },
    setTagTypeForColor(state, action) {
      state.tagTypeForColor = action.payload;
    },
    setVertexEndCoords(state, action) {
      console.log('Set vertex selected end coords: ', action.payload);
      state.vertexEndCoords = action.payload;
    },
    setVertexStartCoords(state, action) {
      console.log('Set vertex selected start coords: ', action.payload);
      state.vertexStartCoords = action.payload;
    },
  },
});

export const {
  addedCustomMap,
  addedCustomMapsFromBackup,
  clearedMaps,
  clearedVertexes,
  deletedCustomMap,
  selectedCustomMapToEdit,
  setAllSymbolsToggled,
  setCurrentBasemap,
  setCurrentImageBasemap,
  setFreehandFeatureCoords,
  setMapSymbols,
  setIsShowSpotLabelsOn,
  setSpotsInMapExtent,
  setSymbolsDisplayed,
  setTagTypeForColor,
  setVertexEndCoords,
  setVertexStartCoords,
} = mapsSlice.actions;

export default mapsSlice.reducer;


