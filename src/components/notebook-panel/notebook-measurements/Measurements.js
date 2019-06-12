import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Button, Divider} from "react-native-elements";
import {SpotPages} from "../Notebook.constants";
import * as actionCreators from '../../../store/actions/index';
// import {SET_SPOT_PAGE_VISIBLE} from "../../../store/Constants";
import styles from './MeasurementsStyles';
import spotPageStyles from '../SpotPageStyles';
import NotebookBackButton from '../../../shared/ui/NotebookBackButton';

const MeasurementPage = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  const openMeasurementDetail = (item) => {
    console.log('item', item);
    props.setPageVisible(SpotPages.MEASUREMENTDETAIL);
  };

  // Render an individual measurement
  const renderMeasurement = ({item}) => {
    return (
      <TouchableOpacity style={styles.measurementsListItem}
                        onPress={() => openMeasurementDetail(item)}>
        <View style={[styles.textBubble, styles.mainText]}>
          {'strike' in item && 'dip' in item ?
            <Text>
              {item.strike}/{item.dip}
            </Text> : null}
          {'trend' in item && 'plunge' in item ?
            <Text>
              {item.trend}/{item.plunge}
            </Text> : null}
        </View>
        <View style={[styles.textBubble, styles.propertyText]}>
          <Text>
            {item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a measurement block in a list
  const renderItem = ({item}) => {
    return (
      <View style={{backgroundColor: 'white', paddingTop: 20}}>
        {typeof (item) !== 'undefined' &&
        <View >
          {renderMeasurement({item})}
          {'associated_orientation' in item && item.associated_orientation.length > 0 &&
          <FlatList
            data={item.associated_orientation}
            renderItem={renderMeasurement}
            keyExtractor={(aoItem, aoIndex) => aoIndex.toString()}
          /> }
          {/*<View style={styles.horizontalLine}/>*/}
        </View>}
      </View>
    );
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <React.Fragment>
      <NotebookBackButton
        onPress={() => {
          const pageVisible = props.setPageVisible(SpotPages.OVERVIEW)
          if (pageVisible.page !== SpotPages.MEASUREMENT) props.showCompass(false);
        }}
      />
      <Button
        // icon={{
        //   name: 'arrow-back',
        //   size: 20,
        //   color: 'black'
        // }}
        containerStyle={styles.backButton}
        titleStyle={{color: 'blue'}}
        title={'Open Compass'}
        type={'clear'}
        onPress={props.showCompass}
      />
      <ScrollView>
        {/*<View style={styles.compassContainer}>*/}
        {/*  <Compass/>*/}
        {/*</View>*/}
        {/*  <Modal*/}
        {/*    onBackdropPress={() => setIsModalVisible(false)}*/}
        {/*    backdropOpacity={.50}*/}
        {/*    isVisible={isModalVisible}*/}
        {/*    style={styles.modalContainer}*/}
        {/*    useNativeDriver={true}*/}
        {/*    animationOut={'slideOutDown'}*/}
        {/*  >*/}
        {/*    <CompassModal*/}
        {/*      close={() => toggleModal()}*/}
        {/*    />*/}
        {/*  </Modal>*/}
        {/*<View>*/}
        {/*  {isModalVisible ? <CompassModal*/}
        {/*    style={styles.modalContainer}*/}
        {/*  close={() => toggleModal()}/> : null}*/}
        {/*</View>*/}
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Measurements</Text>
        </Divider>
        <FlatList
          data={props.spot.properties.orientations}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page))
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementPage);
