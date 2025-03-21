import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import RNSketchCanvas from '@StraboSpot/react-native-sketch-canvas';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import styles from './sketch.styles';
import alert from '../../shared/ui/alert';
import {setModalVisible} from '../home/home.slice';
import {useImages} from '../images';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotImages} from '../spots/spots.slice';

const Sketch = ({navigation, route}) => {
  const image = route?.params?.imageInfo || {};
  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const {getLocalImageURI, saveFile} = useImages();

  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    console.log('UE Sketch [imageId]', image.id);
    if (image.id) setImageId(image.id);
  }, []);

  const saveSketch = async (success, path) => {
    try {
      console.log(success, 'Path:', path);
      if (success) {
        const savedSketch = await saveFile({...image, 'path': path});
        dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
        dispatch(editedSpotImages([{...savedSketch, image_type: 'sketch'}]));
        alert(
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
      alert('Error Saving Sketch!',
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
    <SafeAreaView style={styles.container}>
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
            filename: getLocalImageURI(image.id).replace('file://', ''),
            mode: 'AspectFit',
          }}
          defaultStrokeIndex={0}
          defaultStrokeWidth={1}
          onClosePressed={() => {
            dispatch(setModalVisible({modal: null}));
            navigation.goBack();
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
    </SafeAreaView>
  );
};

export default Sketch;
