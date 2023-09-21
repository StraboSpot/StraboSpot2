import React, {useState} from 'react';
import {Alert, FlatList, Linking, Platform, Text, View} from 'react-native';

import {Button, Icon, ListItem, Overlay} from 'react-native-elements';
import Pdf from 'react-native-pdf';
import {useSelector} from 'react-redux';

import {STRABO_APIS} from '../../services/urls.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {BLACK, BLUE} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';
import styles from './documentation.styles';
import mainMenuPanelStyles from './mainMenuPanel.styles';

const Documentation = () => {

  const isOnline = useSelector(state => state.home.isOnline.isInternetReachable);

  const [visible, setVisible] = useState(false);
  const [doc, setDoc] = useState('');

  const helpUrl = STRABO_APIS.STRABO + '/help';

  const files = [
    {
      id: 1,
      platform: ['ios'],
      label: 'airdrop',
      name: 'How to Airdrop backup files to other iPads',
      file: require('../../assets/documents/Airdrop-from-iPad-to-iPad.pdf'),
    },
    {
      id: 2,
      platform: ['ios'],
      label: 'moveFiles',
      name: 'Moving backups out of StraboSpot 2 folder ',
      file: Platform.OS === 'ios' && require('../../assets/documents/MovingProjectBackupsOutOfStraboSpot2.pdf'),
    },
    {
      id: 3,
      platform: ['ios', 'android'],
      label: 'helpDocument',
      name: 'Strabo Help Guide',
      file:
        Platform.OS === 'ios' ? require('../../assets/documents/Strabo_Help_Guide.pdf') : {uri: 'bundle-assets://Strabo_Help_Guide.pdf'},
    },
  ];

  const handlePress = (document) => {
    setDoc(document);
    setVisible(!visible);
  };

  const viewOnlineHelp = async (path) => {
    try {
      const canOpen = await Linking.canOpenURL(path);
      if (canOpen) await Linking.openURL(path);
      else Alert.alert('Uh Oh!', `Can not open the url ${path}`);
    }
 catch (err) {
      console.error('Can\t open URL', err);
      Alert.alert(' Unable to open URL!');
    }
  };

  const viewPDF = () => (
    <Overlay isVisible={visible} overlayStyle={styles.overlayContainer}>
      <Button
        type={'clear'}
        containerStyle={{alignItems: 'flex-end'}}
        onPress={() => setVisible(!visible)}
        icon={
          <Icon
            name={'close-outline'}
            type={'ionicon'}
            size={30}
            color={BLACK}
          />
        }
      />
      {!isEmpty(doc) && (
        <Pdf
          source={doc.file}
          style={{flex: 1}}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
        />
      )}
    </Overlay>
  );

  const renderFAQListItem = item => (
    <ListItem
      onPress={() => handlePress(item)}
      containerStyle={mainMenuPanelStyles.documentListItem}>
      <ListItem.Content style={commonStyles.listItemContent}>
        <ListItem.Title style={commonStyles.listItemTitle}>
          {item.name}
        </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron size={20} />
    </ListItem>
  );

  const renderFAQItems = () => {
    let filteredDocs = [];
    files.forEach((file) => {
      if (Platform.OS === 'ios' && file.platform.includes('ios')) {
        filteredDocs.push(file);
      }
 else if (
        Platform.OS === 'android'
        && file.platform.includes('android')
      ) {
        filteredDocs.push(file);
      }
    });
    console.log(filteredDocs);

    return (
      <View style={{maxHeight: '80%'}}>
        <FlatList
          keyExtractor={item => item.id}
          data={filteredDocs}
          renderItem={({item}) => renderFAQListItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </View>
    );
  };

  const renderHelpLink = () => (
    <View style={styles.bottomButton}>
      {isOnline && (
        <Button
          title={'StraboSpot Help Center'}
          type={'clear'}
          onPress={() => viewOnlineHelp(helpUrl)}
          icon={
            <Icon
              name={'globe-outline'}
              type={'ionicon'}
              iconStyle={{paddingRight: 10}}
              size={20}
              color={BLUE}
            />
          }
        />
      )}
    </View>
  );

  return (
    <View style={{flex: 1}}>
      {renderHelpLink()}
      <View style={{alignItems: 'center'}}>
        <SectionDivider dividerText={'FAQ\'s'} />
      </View>
      {renderFAQItems()}
      {viewPDF()}
    </View>
  );
};

export default Documentation;
