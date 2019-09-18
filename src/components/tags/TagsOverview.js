import React, {Component} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {ListItem, Icon} from 'react-native-elements'
import {isEmpty} from "../../shared/Helpers";

// Styles
import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';

const SpotTag = props => {
  if (!isEmpty(data)) {
    return (
      <ScrollView style={{height: 250}}>
        {data.map((l, i) => (
          <ListItem
            key={l.id}
            title={l.name}
            titleStyle={commonStyles.listItemTitle}
            containerStyle={commonStyles.listItem}
            chevron={true}
            rightIcon={
              <Icon
                name='ios-information-circle-outline'
                type='ionicon'
                color={themes.PRIMARY_ACCENT_COLOR}
                onPress={() => console.log('Tag item pressed', l.id, l.name)}
              />}
          />
        ))}
      </ScrollView>
    );
  }
  else {
    return (
      <View>
        <Text style={{textAlign: 'center', fontSize: themes.PRIMARY_TEXT_SIZE}}>No Tags</Text>
      </View>
    )
  }

};

const data = [
  {id: 1, name: "Blue racer", description: "Crona, Rodriguez and Kovacek"},
  {"id": 2, "name": "Western lowland gorilla", "description": "Hermiston LLC"},
  {"id": 3, "name": "Beisa oryx", "description": "Effertz Group"},
  {"id": 4, "name": "Grison", "description": "Beer, Eichmann and Corkery"},
  {"id": 5, "name": "Rhinoceros, square-lipped", "description": "Krajcik LLC"},
  {"id": 6, "name": "Grey fox", "description": "Hansen-Monahan"},
  {"id": 7, "name": "Gerenuk", "description": "Hintz LLC"},
  {"id": 8, "name": "Sloth, hoffman's", "description": "Leuschke-Rowe"},
  {"id": 9, "name": "Cape white-eye", "description": "Beer, Mosciski and Reilly"},
  {"id": 10, "name": "Red-tailed wambenger", "description": "Kunze, Gusikowski and Rath"},
  {"id": 11, "name": "Common long-nosed armadillo", "description": "Fahey and Sons"},
  {"id": 12, "name": "Blue fox", "description": "Lesch-Olson"},
  {"id": 13, "name": "Otter, african clawless", "description": "Bauch and Sons"},
  {"id": 14, "name": "Thomson's gazelle", "description": "O'Keefe-Marquardt"},
  {"id": 15, "name": "Nuthatch, red-breasted", "description": "Jakubowski-Schimmel"},
];

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot.properties
  }
};

export default connect(mapStateToProps, null)(SpotTag);
