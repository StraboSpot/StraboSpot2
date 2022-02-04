import React, {useRef} from 'react';
import {Alert, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {NumberInputField} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const ImageOverlayDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const imageDetailRef = useRef(null);

  const getImageLabel = (id) => {
    const image = spot.properties.images.find(i => id === i.id);
    return image && image.title ? image.title : 'Untitled';
  };

  const saveImageOverlayDetail = () => {
    let editedImageOverlayData = imageDetailRef?.current?.values;
    let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
    let editedStratSectionData = editedSedData.strat_section ? JSON.parse(
      JSON.stringify(editedSedData.strat_section)) : {};
    let editedImageOverlaysData = editedStratSectionData.images ? JSON.parse(
      JSON.stringify(editedStratSectionData.images)) : [];
    editedImageOverlaysData = editedImageOverlaysData.filter(i => i.id !== editedImageOverlayData.id);
    editedImageOverlaysData.push(editedImageOverlayData);
    editedStratSectionData = {...editedStratSectionData, images: editedImageOverlaysData};
    editedSedData = {...editedSedData, strat_section: editedStratSectionData};
    dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
    props.cancel();
  };

  const showFieldInfo = (label, info) => {
    Alert.alert(label, info);
  };

  return (
    <React.Fragment>
      <SaveAndCloseButton
        cancel={props.cancel}
        save={() => saveImageOverlayDetail()}
      />
      <ListItem
        containerStyle={commonStyles.listItem}
        key={props.image.id}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{getImageLabel(props.image.id)}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <Formik
        initialValues={props.image}
        onSubmit={() => console.log('Submitting form...')}
        innerRef={imageDetailRef}
      >
        {() => (
          <View>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'image_origin_x'}
                  label={'Image Origin X Value'}
                  key={'image_origin_x'}
                  placeholder={'x value for the bottom left corner of image relative to axes origin (0,0)'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'image_origin_y'}
                  label={'Image Origin Y Value'}
                  key={'image_origin_y'}
                  placeholder={'y value for the bottom left corner of image relative to axes origin (0,0)'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'image_width'}
                  label={'Adjusted Image Width'}
                  key={'image_width'}
                  placeholder={'height adjusted automatically to maintain aspect ratio'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'image_height'}
                  label={'Adjusted Image Height'}
                  key={'image_height'}
                  placeholder={'width adjusted automatically to maintain aspect ratio'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'image_opacity'}
                  label={'Image Opacity'}
                  key={'image_opacity'}
                  placeholder={'0-1 with 0 being transparent and 1 opaque'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={NumberInputField}
                  name={'z_index'}
                  label={'Z-Index'}
                  key={'z_index'}
                  placeholder={'layer ordering'}
                  onShowFieldInfo={showFieldInfo}
                />
              </ListItem.Content>
            </ListItem>
          </View>
        )}
      </Formik>
    </React.Fragment>
  );
};

export default ImageOverlayDetail;
