import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Linking, Platform, View} from 'react-native';

import {Button, Icon, ListItem, Overlay} from 'react-native-elements';
import PDFView from 'react-native-view-pdf';
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
      label: 'airdrop',
      name: 'How to Airdrop backup files to other iPads',
      file: Platform.OS === 'ios' ? 'Airdrop-from-iPad-to-iPad.pdf' : '/sdcard/Download/Airdrop-from-iPad-to-iPad.pdf',
    },
    {
      label: 'moveFiles',
      name: 'Moving backups out of StraboSpot 2 folder ',
      file: Platform.OS === 'ios' ? 'Moving-Project-Backups-Out-of-StraboSpot2.pdf' : '/sdcard/Download/Moving-Project-Backups-Out-of-StraboSpot2.pdf',
    },
  ];

  const toggleOverlay = (pdfLabel) => {
    setDoc(pdfLabel);
    Platform.OS === 'ios' ? setVisible(!visible) : Alert.alert('Currently not available on Android',
      `Visit ${helpUrl}`);
    // setVisible(!visible);
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

  const findFile = () => {
    const file = files.find((pdf, index) => {
      if (pdf.label === doc) return pdf.file;
    });
    return file && file.file;
  };

  const viewPDF = () => {
    const resourceType = 'file';
    return (
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay} overlayStyle={styles.overlayContainer}>
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
        {/*<WebView source={doc}/>*/}
        <PDFView
          fadeInDuration={250.0}
          style={{flex: 1}}
          resource={findFile()}
          resourceType={resourceType}
          onLoad={() => console.log(`PDF rendered from ${resourceType}`)}
          onError={(error) => console.log('Cannot render PDF', error)}
        />
      </Overlay>
    );
  };

  const renderFAQListItem = ({item}) => (
    <ListItem key={item} onPress={() => toggleOverlay(item.label)} containerStyle={commonStyles.listItem}>
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
      <SectionDivider dividerText={'FAQ\'s'}/>
      {renderFAQitems()}
      {renderHelpLink()}
      {viewPDF()}
    </View>
  );
};

export default Documentation;
