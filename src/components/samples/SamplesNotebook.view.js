import React from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {Icon, ListItem} from "react-native-elements";
import styles from './samples.style';
import NotebookBackButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {SpotPages} from "../notebook-panel/Notebook.constants";
import * as actionCreators from "../../store/actions";
import {connect} from "react-redux";
import SectionDivider from "../../shared/ui/SectionDivider";

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
                  color='blue'
                  onPress={() => console.log('Samples item pressed', item.id, item.label)}
                />}
            />
          )
        })
    };

return (
  <React.Fragment>
    <NotebookBackButton
      onPress={() => {
        const pageVisible = props.setPageVisible(SpotPages.OVERVIEW);
        if (pageVisible.page !== SpotPages.SAMPLE) {
          props.showModal('isSamplesModalVisible', false);
        }
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
  </React.Fragment>
);
};

const mapStateToProps = (state) => {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page))
};

export default connect(mapStateToProps, mapDispatchToProps)(samplesNotebookView);

