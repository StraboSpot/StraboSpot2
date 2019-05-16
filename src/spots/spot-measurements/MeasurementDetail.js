import React, {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, ButtonGroup, Divider, Input} from "react-native-elements";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import styles from './MeasurementsStyles';
import * as themes from '../../themes/ColorThemes';
import spotPageStyles from "../spot-page/SpotPageStyles";

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANARLINEAR: 'Planar/Linear',
    THREEDSTRUCTURES: '3D Structures',
    TENSOROTHER: 'Tensor/Other'
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(0);

  const updateFeatureTypeIndex = (i) => {
    console.log(i);
    setFeatureTypeIndex(i);
  };

  // Render the switches to select a feature type
  const renderTypeSwitches = () => {
    const buttons = [featureTypes.PLANARLINEAR, featureTypes.THREEDSTRUCTURES, featureTypes.TENSOROTHER];
    return (
      <ButtonGroup
        onPress={updateFeatureTypeIndex}
        selectedIndex={selectedFeatureTypeIndex}
        buttons={buttons}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.BLUE}}
        textStyle={{color: themes.BLUE}}
      />
    );
  };

  const renderNotesField = () => {
    return (
      <View>
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Notes</Text>
        </Divider>
        <Input
          placeholder='Enter your notes here'
          inputStyle={{backgroundColor: themes.WHITE, fontSize: 16, height: null}}
          inputContainerStyle={{borderBottomWidth: 0}}
          multiline={true}
          numberOfLines={4}
          textAlignVertical={'top'}
        />
      </View>
    );
  };

  const renderFormFields = () => {
    return (
      <View>
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Feature Type</Text>
        </Divider>
        {selectedFeatureTypeIndex === 0 ? renderPlanarLinearFields() : null}
        {selectedFeatureTypeIndex === 1 ? render3DStructuresFields() : null}
        {selectedFeatureTypeIndex === 2 ? renderTensorOtherFields() : null}
      </View>
    );
  };

  const renderPlanarLinearFields = () => {
    return (
      <View>
        <Text>Planar and Linear form goes here</Text>
      </View>
    );
  };

  const render3DStructuresFields = () => {
    return (
      <View>
        <Text>3D Structures form goes here</Text>
      </View>
    );
  };

  const renderTensorOtherFields = () => {
    return (
      <View>
        <Text>Tensor and Other forms goes here</Text>
      </View>
    );
  };

  return (
    <React.Fragment>

      <View style={styles.measurementDetailContainer}>
        <View style={styles.navButtonsContainer}>
          <View style={styles.leftContainer}>
            <Button
              titleStyle={{color: themes.BLUE}}
              title={'Cancel'}
              type={'clear'}
              onPress={() => props.setPageVisible(SpotPages.MEASUREMENT)}
            />
          </View>
          <View style={styles.rightContainer}>
            <Button
              titleStyle={{color: themes.BLUE}}
              title={'Save'}
              type={'clear'}
              onPress={() => props.setPageVisible(SpotPages.MEASUREMENT)}
            />
          </View>
        </View>
        <View style={styles.measurementDetailSwitchesContainer}>
          {renderTypeSwitches()}
        </View>
        <ScrollView style={{backgroundColor: themes.WHITE}}>
          {renderNotesField()}
          {renderFormFields()}
        </ScrollView>
      </View>

    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
