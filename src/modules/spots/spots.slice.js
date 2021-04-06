import {createSlice, current} from '@reduxjs/toolkit';

import {isEmpty, isEqual} from '../../shared/Helpers';

const initialSpotState = {
  intersectedSpotsForTagging: [],
  recentViews: [],
  selectedAttributes: [],
  selectedMeasurement: {},
  selectedSpot: {},
  selectedSpots: [],
  spots: {},
};

const spotSlice = createSlice({
  name: 'spot',
  initialState: initialSpotState,
  reducers: {
    addedSpot(state, action) {
      console.log('ADDED Spot:', action.payload, 'to Existing Spots:', state.spots);
      if (!isEmpty(state.selectedSpot) && state.selectedSpot.properties
        && state.selectedSpot.properties.id === action.payload.properties.id) state.selectedSpot = action.payload;
      action.payload.properties.modified_timestamp = Date.now();
      state.selectedSpot = action.payload;
      state.selectedSpots = !isEmpty(state.selectedSpot) ? [state.selectedSpot] : [];
      state.spots = {...state.spots, [action.payload.properties.id]: action.payload};
    },
    addedSpots(state, action) {
      const spots = Object.assign({}, ...action.payload.map(spot => ({[spot.properties.id]: spot})));
      console.log('ADDED Spots:', action.payload, 'to Existing Spots:', current(state));
      state.spots = {...state.spots, ...spots};
    },
    addedSpotsFromDevice(state, action) {
      state.spots = action.payload;
    },
    clearedSelectedSpots(state) {
      state.selectedSpots = [];
      state.selectedSpot = {};
    },
    clearedSpots(state) {
      state.selectedSpot = {};
      state.selectedSpots = [];
      state.spots = {};
      state.recentViews = [];
    },
    deletedSpot(state, action) {
      const {[action.payload]: deletedSpot, ...remainingSpots} = state.spots;
      console.log('DELETED Spot:', action.payload, deletedSpot);
      console.log('Remaining Spots:', remainingSpots);
      state.selectedSpot = {};
      state.selectedSpots = [];
      state.spots = remainingSpots;
      state.recentViews = state.recentViews.filter(id => id !== action.payload);
    },
    editedSpotImage(state, action) {
      const foundSpot = Object.values(state.spots).find(spot => {
        return spot.properties.images && spot.properties.images.find(image => image.id === action.payload.id);
      });
      if (foundSpot) {
        const imagesFiltered = foundSpot.properties.images.filter(image => image.id !== action.payload.id);
        imagesFiltered.push(action.payload);
        foundSpot.properties.images = imagesFiltered;
        const selectedSpotCopy = state.selectedSpot && state.selectedSpot.properties.id === foundSpot.properties.id
          ? foundSpot : state.selectedSpot;
        console.log('Edit Image for selectedSpot', selectedSpotCopy);
        state.selectedSpot = selectedSpotCopy;
        state.spots = {...state.spots, [foundSpot.properties.id]: foundSpot};
      }
    },
    editedSpotImages(state, action) {
      let tempImages = [];
      if (state.selectedSpot.properties.images) tempImages = state.selectedSpot.properties.images;
      const updatedSpotObj = action.payload.map(image => {
        return {id: image.id, height: image.height, width: image.width, image_type: image.image_type};
      });
      tempImages = [...tempImages, ...updatedSpotObj];
      state.selectedSpot.properties.images = tempImages;
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
    editedSpotProperties(state, action) {
      const {field, value} = action.payload;
      if (!isEmpty(value) && !isEqual(value, state.selectedSpot.properties[field])) {
        state.selectedSpot.properties[field] = value;
        state.modified_timestamp = Date.now();
      }
      else if (isEmpty(value)) delete state.selectedSpot.properties[field];
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
    setIntersectedSpotsForTagging(state, action) {
      state.intersectedSpotsForTagging = action.payload;
    },
    setSelectedAttributes(state, action) {
      state.selectedAttributes = action.payload;
    },
    setSelectedMeasurement(state, action) {
      state.selectedMeasurement = action.payload;
    },
    setSelectedSpot(state, action) {
      let recentViewsArr = Object.assign([], state.recentViews);
      const index = recentViewsArr.indexOf(action.payload.properties.id);
      if (index !== -1) recentViewsArr.splice(index, 1);
      recentViewsArr.unshift(action.payload.properties.id);
      if (state.recentViews.length > 20) recentViewsArr.shift();
      state.selectedSpots = action.payload;
      state.selectedSpot = action.payload;
      state.recentViews = recentViewsArr;
      state.selectedAttributes = [];
    },
    setSelectedSpotNotesTimestamp(state) {
      state.selectedSpot.properties.notesTimestamp = Date();
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
  },
});

export const {
  addedSpot,
  addedSpots,
  addedSpotsFromDevice,
  clearedSelectedSpots,
  clearedSpots,
  deletedSpot,
  editedSpotImage,
  editedSpotImages,
  editedSpotProperties,
  setIntersectedSpotsForTagging,
  setSelectedAttributes,
  setSelectedMeasurement,
  setSelectedSpot,
  setSelectedSpotNotesTimestamp,
} = spotSlice.actions;

export default spotSlice.reducer;
