import React from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {Icon, ListItem} from "react-native-elements";
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {notebookReducers, NotebookPages} from "../notebook-panel/Notebook.constants";
import {connect} from "react-redux";
import SectionDivider from "../../shared/ui/SectionDivider";

// Styles
import styles from './samples.style';
import * as themes from '../../shared/styles.constants';
import {homeReducers, Modals} from "../../views/home/Home.constants";

const samplesNotebookView = (props) => {

  // const renderItem = ({item}) => {
  //   // console.log('ITEM', item)
  //
  //   let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';
  //   // return (
  //   //   <View style={styles.notebookListContainer}>
  //   //     {/*<Text style={styles.listText}>{item.label}</Text>*/}
  //   //     {/*<Text>{oriented}</Text>*/}
  //   //   </View>
  //   // );
  //
  //   return (
  //     <View style={styles.notebookListContainer}>
  //       <Text style={styles.listLabel}>{item.label}</Text>
  //       <Text numberOfLines={1} style={styles.listText}>{oriented} - {item.sample_description}</Text>
  //
  //     </View>
  //   );
  // };

  const renderSampleList = () => {
    return props.spot.properties.samples.map(item => {
      // console.log('LIST', item);
      let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';
      return (
        <View key={item.id}>
        <ListItem
          key={item.id}
          containerStyle={styles.notebookListContainer}
          title={item.label}
          // contentContainerStyle={{ paddingBottom: 10}}
          subtitleStyle={styles.listText}
          subtitle={<Text numberOfLines={1} style={styles.listText}>{oriented} - {item.sample_description}</Text>}
          chevron={true}
          rightIcon={
            <Icon
              name='ios-information-circle-outline'
              type='ionicon'
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => console.log('Samples item pressed', item.id, item.label)}
            />}
        />
        </View>
      )
    })
  };

  const renderNotebookView = () => {
    return (
      <View>
        <ReturnToOverviewButton
          onPress={() => {
            props.setNotebookPageVisible(NotebookPages.OVERVIEW);
            props.setModalVisible(null);
          }}
        />
        <SectionDivider dividerText='Samples'/>
        {/*<FlatList*/}
        {/*  keyExtractor={(item, index) => index.toString()}*/}
        {/*  data={props.spot}*/}
        {/*  renderItem={renderItem}*/}
        {/*/>*/}
        <ScrollView>
          {props.spot.properties.samples ? renderSampleList() : null}
        </ScrollView>
      </View>
    )
  };

  const renderShortcutView = () => {
    return (
      <View style={styles.sampleContentContainer}>
        <SectionDivider dividerText='Samples'/>
        <ScrollView>
          {props.spot.properties.samples ? renderSampleList() : null}
        </ScrollView>
      </View>
    )
  };

  return (
    <React.Fragment>
      {props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? renderShortcutView() : renderNotebookView()}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible
  }
};

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(samplesNotebookView);

