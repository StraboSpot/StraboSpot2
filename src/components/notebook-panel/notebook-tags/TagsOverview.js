import React, {Component} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {ListItem, Icon} from 'react-native-elements'

// Styles
import commonStyles from '../../../shared/common.styles';

const SpotTag = props => (
  <View style={{height: 300}}>
    <ScrollView>
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
            color='blue'
            onPress={() => console.log('Tag item pressed', l.id, l.name)}
          />}
        />
      ))}
    </ScrollView>
  </View>
);

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
  {"id": 16, "name": "Black vulture", "description": "Brakus LLC"},
  {"id": 17, "name": "Savanna fox", "description": "Flatley and Sons"},
  {"id": 18, "name": "Blue and gold macaw", "description": "Carter LLC"},
  {"id": 19, "name": "Bat, madagascar fruit", "description": "Champlin-Jacobson"},
  {"id": 20, "name": "Platypus", "description": "McKenzie and Sons"},
  {"id": 21, "name": "Indian tree pie", "description": "Herman-Botsford"},
  {"id": 22, "name": "Antelope ground squirrel", "description": "Ryan-Parker"},
  {"id": 23, "name": "Pine squirrel", "description": "Murray-Mills"},
  {"id": 24, "name": "Phalarope, red-necked", "description": "Watsica Inc"},
  {"id": 25, "name": "Great skua", "description": "Corwin Inc"},
  {"id": 26, "name": "Deer, spotted", "description": "Berge-Trantow"},
  {"id": 27, "name": "Capybara", "description": "Haag-Kessler"},
  {"id": 28, "name": "Grenadier, common", "description": "Windler-Stokes"},
  {"id": 29, "name": "Tortoise, radiated", "description": "Corkery-Schultz"},
  {"id": 30, "name": "Scottish highland cow", "description": "Keebler LLC"},
  {"id": 31, "name": "Hartebeest, red", "description": "Wehner, Pagac and Bode"},
  {"id": 32, "name": "Tawny eagle", "description": "McCullough, Robel and Toy"},
  {"id": 33, "name": "Cormorant, javanese", "description": "Gibson Inc"},
  {"id": 34, "name": "Bustard, denham's", "description": "Streich LLC"},
  {"id": 35, "name": "White-fronted bee-eater", "description": "Lebsack, Kautzer and Dickinson"},
  {"id": 36, "name": "Mountain lion", "description": "Okuneva Inc"},
  {"id": 37, "name": "Alligator, american", "description": "Bartoletti, Kovacek and Rau"},
  {"id": 38, "name": "Long-tailed skua", "description": "Shields-McLaughlin"},
  {"id": 39, "name": "Serval", "description": "Nolan-Cummerata"},
  {"id": 40, "name": "Leadbeateri's ground hornbill", "description": "Stracke Inc"},
  {"id": 41, "name": "Crab, sally lightfoot", "description": "Barton-Dibbert"},
  {"id": 42, "name": "Indian mynah", "description": "Hammes Group"},
  {"id": 43, "name": "African darter", "description": "Walsh LLC"},
  {"id": 44, "name": "Glossy starling (unidentified)", "description": "Rolfson, Pouros and Adams"},
  {"id": 45, "name": "Sheep, american bighorn", "description": "Kutch Group"},
  {"id": 46, "name": "Savanna fox", "description": "Hyatt-Durgan"},
  {"id": 47, "name": "Alligator, american", "description": "Huel, Schoen and Becker"},
  {"id": 48, "name": "Killer whale", "description": "Schmeler-Gleason"},
  {"id": 49, "name": "Cook's tree boa", "description": "Ebert-Hilll"},
  {"id": 50, "name": "Bohor reedbuck", "description": "Balistreri-Jerde"}
];

export default SpotTag;
