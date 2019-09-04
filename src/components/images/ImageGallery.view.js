import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, FlatList, ScrollView, Text, View} from 'react-native';
import {pictureSelectDialog, saveFile} from './Images.container';
import {connect} from "react-redux";
import imageStyles from './images.styles'
import {Button, Image} from "react-native-elements";
import {imageReducers, SortedViews} from "./Image.constants";
import SettingsPanelHeader from "../settings-panel/SettingsPanelHeader";
import * as SharedUI from '../../shared/ui/index';
import {isEmpty} from '../../shared/Helpers';
import {spotReducers} from "../../spots/Spot.constants";
import {homeReducers} from "../../views/home/Home.constants";
import {notebookReducers} from "../notebook-panel/Notebook.constants";

const imageGallery = (props) => {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [sortedList, setSortedList] = useState(props.spots);
  const [sortedListView, setSortedListView] = useState(SortedViews.CHRONOLOGICAL);
  let savedArray = [];

  useEffect(() => {
    updateIndex(selectedButtonIndex);
    console.log('render!')
  }, []);

  useEffect(() => {
    setSortedList(props.spots);
    setRefresh(!refresh);
    console.log('render Recent Views!')
  }, [props]);

  const imageSave = async () => {
    const savedPhoto = await pictureSelectDialog();
    console.log('imageObj', savedPhoto);

    if (savedPhoto === 'cancelled') {
      console.log('User cancelled image picker', savedArray);
      if (savedArray.length > 0) {
        console.log('ALL PHOTOS SAVED', savedArray);
        props.addPhoto(savedArray);
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...')
      }
    }
    else if (savedPhoto.error) {
      console.log('ImagePicker Error: ', savedPhoto.error);
    }
    else {
      savedArray.push(savedPhoto);
      console.log('AllPhotosSaved', savedArray);
      imageSave();
    }
  };

  const renderName = (item) => {
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={imageStyles.headingText}>
            {item.properties.name}
          </Text>
          <Button
            title={'View In Spot'}
            type={'clear'}
            onPress={() => props.getSpotData(item.properties.id)}
          />
        </View>
        {item.properties.images !== undefined ?
          <FlatList
            keyExtractor={(image) => image.id}
            data={item.properties.images}
            numColumns={3}
            renderItem={({item}) => renderImage(item)}
          />
          :
          <Text style={{textAlign: 'center'}}>No images available for this spot</Text>}
      </View>
    )
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <SharedUI.ImageButton
          source={{uri: getImageSrc(image.id)}}
          style={imageStyles.galleryImage}
          PlaceholderContent={<ActivityIndicator/>}
          onPress={() => renderImageModal(image)}
        />
      </View>
    );
  };

  const renderRecentView = (spotID) => {
    const spot = props.spots.find(spot => {
      return spot.properties.id === spotID
    });
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <View style={{justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={imageStyles.headingText}>
            {spot.properties.name}
          </Text>
          {spot.properties.images !== undefined ?
            <FlatList
              data={spot.properties.images}
              keyExtractor={(image) => image.id}
              numColumns={3}
              renderItem={({item}) => renderImage(item)}
            />
            :
            <Text style={{textAlign: 'center'}}>No images available for this spot</Text>}
        </View>
      </View>
    )
  };

  const renderImageModal = (image) => {
    console.log(image.id, '\n was pressed!');
    props.setSelectedAttributes([image]);
    props.setIsImageModalVisible(true)
  };

  const getImageSrc = (id) => {
    return props.imagePaths[id]
  };

  // used with the button group to select active button
  const updateIndex = (selectedButtonIndex) => {
    setSelectedButtonIndex(selectedButtonIndex);
    switch (selectedButtonIndex) {
      case 0:
        console.log('Chronological Selected');
        setSortedListView(SortedViews.CHRONOLOGICAL);
        setSortedList(props.spots.sort(((a, b) => a.properties.date > b.properties.date)));
        setRefresh(!refresh);
        break;
      case 1:
        console.log('Map Extent Selected');
        break;
      case 2:
        setSortedListView(SortedViews.RECENT_VIEWS);
        break;
    }
  };

  if (!isEmpty(props.spots)) {
    let sortedView = null;
    const buttons = ['Chronological', 'Map Extent', 'Recent \n Views'];

    if (sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>
    }
    else if (sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>
    }
    else if (sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView = <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={props.recentViews}
        inverted={true}
        renderItem={({item}) => renderRecentView(item)}/>
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={props.spots}
        renderItem={({item}) => renderName(item)}/>
    }

    return (
      <React.Fragment>
          <SharedUI.ButtonGroup
              selectedIndex={selectedButtonIndex}
              buttons={buttons}
              containerStyle={{height: 50}}
              buttonStyle={{padding: 5}}
              textStyle={{fontSize: 12}}
              onPress={(selected) => updateIndex(selected)}
          />
          <ScrollView>
            <View style={imageStyles.galleryImageContainer}>
              {sortedView}

            </View>
          </ScrollView>
      </React.Fragment>
    );
  }
  else {
    return (
      <React.Fragment>
        <SettingsPanelHeader onPress={() => props.backToSettings()}>
          {props.children}
        </SettingsPanelHeader>
        <View style={imageStyles.noImageContainer}>
          <Image
            source={require('../../assets/images/noimage.jpg')}
            style={{height: '70%', width: 400}}
          />
        </View>
      </React.Fragment>
    );
  }

};

const mapStateToProps = (state) => {
  return {
    imagePaths: state.images.imagePaths,
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedView: state.images.sortedView,
    selectedImage: state.spot.selectedAttributes[0],
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
