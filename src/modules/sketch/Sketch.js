import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import RNSketchCanvas from '@StraboSpot/react-native-sketch-canvas';
import {useDispatch, useSelector} from 'react-redux';

import {setModalVisible} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import useLocationHook from '../maps/useLocation';
import {MODAL_KEYS} from '../page/page.constants';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotImages} from '../spots/spots.slice';
import styles from './sketch.styles';

const Sketch = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [useImages] = useImagesHook();
  const navigation = useNavigation();
  const useLocation = useLocationHook();

  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    console.log('UE Sketch [imageId]', imageId);
    if (props.route.params?.imageId) setImageId(props.route.params.imageId);
  }, [imageId]);

  useEffect(() => {
    console.log('UE Sketch []');
    createSpot().catch(e => console.error(e));
  }, []);

  const createSpot = async () => {
    if (modalVisible === MODAL_KEYS.SHORTCUTS.SKETCH) {
      const pointSetAtCurrentLocation = await useLocation.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
  };

  const saveSketch = async (success, path) => {
    try {
      console.log(success, 'Path:', path);
      if (success) {
        const savedSketch = await useImages.saveFile({'path': path});
        dispatch(editedSpotImages([{...savedSketch, image_type: 'sketch'}]));
        dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
        Alert.alert(
          'Sketch Saved!',
          `Sketch saved to ${selectedSpot.properties.name}.`,
          [{
            text: 'OK', onPress: () => {
              dispatch(setModalVisible({modal: null}));
              navigation.pop();
            },
          }],
        );
      }
      else throw Error;
    }
    catch (err) {
      console.error('Error Saving Sketch', err);
      Alert.alert('Error Saving Sketch!',
        null,
        [{
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }, {
          text: 'OK', onPress: () => navigation.pop(),
        }],
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <RNSketchCanvas
          containerStyle={{backgroundColor: 'transparent', flex: 1}}
          canvasStyle={{
            backgroundColor: 'transparent',
            flex: 1,
            borderWidth: 2,
            borderColor: 'grey',
          }}
          localSourceImage={{
            filename: useImages.getLocalImageURI(imageId).replace('file://', ''),
            mode: 'AspectFit',
          }}
          defaultStrokeIndex={0}
          defaultStrokeWidth={1}
          onClosePressed={() => {
            dispatch(setModalVisible({modal: null}));
            props.navigation.goBack();
          }}
          onSketchSaved={(success, path) => saveSketch(success, path)}
          closeComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Close</Text></View>}
          undoComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Undo</Text></View>}
          clearComponent={<View style={{...styles.functionButton, backgroundColor: 'red'}}><Text
            style={{color: 'white'}}>Clear</Text></View>}
          eraseComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Eraser</Text></View>}
          strokeComponent={color => <View style={[{backgroundColor: color}, styles.strokeColorButton]}/>}
          strokeSelectedComponent={(color, index, changed) => {
            return <View style={[{backgroundColor: color, borderWidth: 2}, styles.strokeColorButton]}/>;
          }}
          strokeWidthStep={1}
          minStrokeWidth={1}
          maxStrokeWidth={10}
          strokeWidthComponent={(w) => {
            return (
              <View style={styles.strokeWidthButton}>
                <View style={{
                  backgroundColor: 'white', marginHorizontal: 2.5,
                  width: Math.sqrt(w / 3) * 10, height: Math.sqrt(w / 3) * 10, borderRadius: Math.sqrt(w / 3) * 10 / 2,
                }}/>
              </View>
            );
          }}
          saveComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Save</Text>
            </View>
          }
          savePreference={() => {
            return {
              folder: 'RNSketchCanvas',
              filename: String(Math.ceil(Math.random() * 100000000)),
              transparent: false,
              imageType: 'jpg',
            };
          }}
        />
      </View>
    </View>
  );
};

export default Sketch;
