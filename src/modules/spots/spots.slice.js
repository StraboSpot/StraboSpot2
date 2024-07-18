import {createSlice, current} from '@reduxjs/toolkit';
import {PURGE} from 'redux-persist';

import {isEmpty} from '../../shared/Helpers';

const initialSpotState = {
  intersectedSpotsForTagging: [],
  recentViews: [],
  selectedAttributes: [],
  selectedSpot: {},
  spots: {},
};

const spotSlice = createSlice({
  name: 'spot',
  initialState: initialSpotState,
  reducers: {
    addedSpotsFromDevice(state, action) {
      state.spots = action.payload;
    },
    addedSpotsFromServer(state, action) {
      state.spots = Object.assign({}, ...action.payload.map(spot => ({...state.spots, [spot.properties.id]: spot})));
      console.log('ADDED Spots:', state.spots, 'in Existing Spots:', current(state));
    },
    clearedSelectedSpots(state) {
      state.selectedSpot = {};
    },
    clearedSpots(state) {
      state.selectedSpot = {};
      state.spots = {};
      state.recentViews = [];
    },
    deletedSpot(state, action) {
      const {[action.payload]: deletedSpot, ...remainingSpots} = state.spots;
      console.log('DELETED Spot:', action.payload, deletedSpot);
      console.log('Remaining Spots:', remainingSpots);
      state.selectedSpot = {};
      state.spots = remainingSpots;
      state.recentViews = state.recentViews.filter(id => id !== action.payload);
    },
    editedOrCreatedSpot(state, action) {
      const modifiedSpot = {
        ...action.payload,
        properties: {...action.payload.properties, modified_timestamp: Date.now()},
      };
      state.spots = {...state.spots, [modifiedSpot.properties.id]: modifiedSpot};
      console.log('UPDATED Spot:', modifiedSpot, 'in Existing Spots:', state.spots);
      if (isEmpty(state.selectedSpot)) {
        state.selectedSpot = modifiedSpot;
        console.log('ADDED NEW Selected Spot:', state.selectedSpot);
      }
      else if (state.selectedSpot.properties.id === modifiedSpot.properties.id) {
        state.selectedSpot = modifiedSpot;
        console.log('UPDATED Selected Spot:', state.selectedSpot);
      }
    },
    editedSpotImage(state, action) {
      const foundSpot = Object.values(state.spots).find((spot) => {
        return spot.properties.images && spot.properties.images.find(image => image.id === action.payload.id);
      });
      if (foundSpot) {
        const imagesFiltered = foundSpot.properties.images.filter(image => image.id !== action.payload.id);
        imagesFiltered.push(action.payload);
        foundSpot.properties.images = imagesFiltered;
        const selectedSpotCopy = isEmpty(state.selectedSpot)
        || state.selectedSpot.properties.id === foundSpot.properties.id ? foundSpot : state.selectedSpot;
        console.log('Edit Image for selectedSpot', selectedSpotCopy);
        state.selectedSpot = selectedSpotCopy;
        state.spots = {...state.spots, [foundSpot.properties.id]: foundSpot};
      }
    },
    editedSpotImages(state, action) {
      let tempImages = [];
      if (state.selectedSpot.properties.images) tempImages = state.selectedSpot.properties.images;
      const updatedSpotObj = action.payload.map((image) => {
        return {id: image.id, height: image.height, width: image.width, image_type: image.image_type};
      });
      tempImages = [...tempImages, ...updatedSpotObj];
      state.selectedSpot.properties.images = tempImages;
      state.selectedSpot.properties.modified_timestamp = Date.now();
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
    editedSpotProperties(state, action) {
      const {field, value} = action.payload;
      state.selectedSpot.properties[field] = value;
      state.selectedSpot.properties.modified_timestamp = Date.now();
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
    editedSpots(state, action) {
      const spotsWithTimestamp = action.payload.map(s => (
        {...s, properties: {...s.properties, modified_timestamp: Date.now()}}
      ));
      const spots = Object.assign({}, ...spotsWithTimestamp.map(spot => ({[spot.properties.id]: spot})));
      state.spots = {...state.spots, ...spots};
      console.log('UPDATED Spots:', state.spots, 'in Existing Spots:', current(state));
      if (!isEmpty(state.selectedSpot) && Object.keys(spots).includes(state.selectedSpot.properties.id)) {
        state.selectedSpot = spots[state.selectedSpot.properties.id];
        console.log('UPDATED Selected Spot:', state.selectedSpot);
      }
    },
    setIntersectedSpotsForTagging(state, action) {
      state.intersectedSpotsForTagging = action.payload;
    },
    setSelectedAttributes(state, action) {
      state.selectedAttributes = action.payload;
    },
    setSelectedSpot(state, action) {
      let recentViewsArr = Object.assign([], state.recentViews);
      const index = recentViewsArr.indexOf(action.payload.properties.id);
      if (index !== -1) recentViewsArr.splice(index, 1);
      recentViewsArr.unshift(action.payload.properties.id);
      if (state.recentViews.length > 20) recentViewsArr.shift();
      state.selectedSpot = action.payload;
      state.recentViews = recentViewsArr;
      state.selectedAttributes = [];
    },
    setSelectedSpotNotesTimestamp(state) {
      state.selectedSpot.properties.notesTimestamp = Date();
      state.spots = {...state.spots, [state.selectedSpot.properties.id]: state.selectedSpot};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialSpotState;
    });
  },
});

export const {
  addedSpotsFromDevice,
  addedSpotsFromServer,
  clearedSelectedSpots,
  clearedSpots,
  deletedSpot,
  editedOrCreatedSpot,
  editedSpotImage,
  editedSpotImages,
  editedSpotProperties,
  editedSpots,
  setIntersectedSpotsForTagging,
  setSelectedAttributes,
  setSelectedSpot,
  setSelectedSpotNotesTimestamp,
} = spotSlice.actions;

export default spotSlice.reducer;
