import React, {useState} from 'react';
import {Alert, FlatList, Linking, View} from 'react-native';

import {Button, Icon, ListItem, Overlay} from 'react-native-elements';
import {WebView} from 'react-native-webview';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {BLACK, BLUE} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';
import styles from './documentation.styles';

const Documentation = (props) => {
  const isOnline = useSelector(state => state.home.isOnline.isInternetReachable);

  const [visible, setVisible] = useState(false);
  const [doc, setDoc] = useState('');

  const helpUrl = 'https://strabospot.org/help';
  const files = [
    {
      name: 'How to Airdrop backup files to other iPads',
      pdf: require('../../assets/documents/AirdropFromIPadToIPad.pdf'),
    },
    {
      name: 'Moving backups out of StraboSpot 2 folder ',
      pdf: require('../../assets/documents/MovingProjectBackupsOutOfStraboSpot2.pdf'),
    },
  ];

  const toggleOverlay = (pdf) => {
    setDoc(pdf);
    setVisible(!visible);
  };

  const viewOnlineHelp = async (path) => {
    try {
      const canOpen = await Linking.canOpenURL(path);
      canOpen && await Linking.openURL(path);
    }
    catch (err) {
      console.error('Can\t open URL', err);
      Alert.alert(' Unable to open URL!');
    }
  };

  const viewPDF = () => {
    return (
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay} overlayStyle={styles.overlayContainer}>
        <Button
          type={'clear'}
          containerStyle={{alignItems: 'flex-end'}}
          onPress={() => setVisible(!visible)}
          icon={
            <Icon
              name='close-outline'
              type={'ionicon'}
              size={30}
              color={BLACK}
            />
          }
        />
        <WebView source={doc}/>
      </Overlay>
    );
  };

  const renderFAQListItem = ({item}) => (
    <ListItem key={item} onPress={() => toggleOverlay(item.pdf)} containerStyle={commonStyles.listItem}>
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

  const renderHelpLink = () => (
    <View style={styles.bottomButton}>
      {isOnline && <Button
        title={'StraboSpot Help Center'}
        type={'clear'}
        onPress={() => viewOnlineHelp(helpUrl)}
        icon={
          <Icon
            name='globe-outline'
            type={'ionicon'}
            iconStyle={{paddingRight: 10}}
            size={20}
            color={BLUE}
          />
        }
      />}
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <SectionDivider dividerText={'FAQ\'s'}/>
      {renderFAQitems()}
      {renderHelpLink()}
      {viewPDF()}
    </View>
  );
};

export default Documentation;
