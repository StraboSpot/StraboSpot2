import React from 'react';
import {Alert, FlatList, Linking, ListView, Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';

const Documentation = () => {

  const files = [
    {
      name: 'How to Airdrop backup files to other iPads',
      path: 'https://strabospot.org/files/helpFiles/Airdrop_from_iPad_to_iPad.pdf',
    },
    {
      name: 'Moving backups out of StraboSpot 2 folder ',
      path: 'https://strabospot.org/files/helpFiles/Moving_Project_Backups_Out_of%20StraboSpot2.pdf',
    },
    {
      name: 'Other Strabo Help Docs ',
      path: 'https://strabospot.org/help',
    },
  ];

  const viewFile = async (path) => {
    try {
      const canOpen = await Linking.canOpenURL(path);
      canOpen && await Linking.openURL(path);
    }
    catch (err) {
      console.error('Can\t open URL', err);
      Alert.alert(' Unable to open URL!');
    }
  };

  const renderFAQListItem = ({item}) => (
    <ListItem key={item} onPress={() => viewFile(item.path)} containerStyle={commonStyles.listItem}>
      <ListItem.Title>{item.name}</ListItem.Title>
    </ListItem>
  );

  const renderFAQitems = () => (
    <FlatList
      keyExtractor={(item) => item.toString()}
      data={files}
      renderItem={renderFAQListItem}
      ItemSeparatorComponent={FlatListItemSeparator}
    />
  );

  return (
    <View style={{flex: 1}}>
      <View>
        <SectionDivider dividerText={'FAQ\'s'}/>
        {renderFAQitems()}
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 15}}>
      </View>
    </View>
  );
};

export default Documentation;
