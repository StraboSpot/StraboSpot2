import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {Button, Card, Icon} from 'react-native-elements';

import macrostratOverlayStyles from './macrostratOverlay.styles';
import useServerRequests from '../../../services/useServerRequests';
import {isEmpty} from '../../../shared/Helpers';
import {SMALL_SCREEN} from '../../../shared/styles.constants';

const MacrostratOverlay = ({
                             visible,
                             closeModal,
                             coords,
                           }) => {

  let ref = useRef(null);
  const [expandedGeologicMap, setExpandedGeologicMap] = useState(true);
  const [dataObject, setDataObject] = useState({});
  const [showMore, setShowMore] = useState(true);
  const [showMapRef, setShowMapRef] = useState(false);

  const {getMacrostratData} = useServerRequests();

  useEffect(() => {
    return () => {
      console.log('Closing Macrostrat modal and setting to {}');
      setDataObject({});
    };
  }, []);

  useEffect(() => {
    macrostratDataRequest().then((res) => {
      console.log('complete', res);
    });
  }, [coords]);

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleShowRef = () => {
    setShowMapRef(!showMapRef);
  };

  const macrostratDataRequest = async () => {
    try {
      const res = await getMacrostratData(coords);
      console.log('Here is the data for the point', res);

      setDataObject(res.success.data);
    }
    catch (err) {
      console.error('Error getting Macrostrat Data', err);
    }
  };

  const renderContent = () => {
    const {age, name, rocktype} = dataObject;
    const commaSeparatedString = rocktype?.join(', ');

    return (
      <View style={{padding: 10}}>
        <Text style={macrostratOverlayStyles.contentKey}>Name: <Text
          style={macrostratOverlayStyles.contentText}>{isEmpty(name) ? 'N/A' : name}</Text></Text>
        <Text style={macrostratOverlayStyles.contentKey}>Age: <Text
          style={macrostratOverlayStyles.contentText}>{isEmpty(age) ? 'N/A' : age}</Text></Text>
        <Text style={macrostratOverlayStyles.contentKey}>Lithology: <Text
          style={macrostratOverlayStyles.contentText}>{isEmpty(
          rocktype) || (rocktype?.[0] === null) ? 'N/A' : commaSeparatedString}</Text></Text>
        <TouchableOpacity onPress={handleShowMore}>
          <Text style={macrostratOverlayStyles.showButton}>
            {showMore ? ' Show Less' : ' Show More'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDescription = () => {
    return (
      <ScrollView style={macrostratOverlayStyles.descriptionContainer}>
        <Card.Divider/>
        {isEmpty(dataObject.desc) || isEmpty(dataObject.comm)
          ? (
            <View style={{alignItems: 'center'}}>
              <Text style={macrostratOverlayStyles.descriptionContent}>Description Not Available</Text>
            </View>
          )
          : (
            <>
              <Text
                style={macrostratOverlayStyles.descriptionContent}>{dataObject.desc} {'\n\n'}{dataObject.comm}</Text>
            </>
          )
        }
        <TouchableOpacity onPress={handleShowRef}>
          <Text style={macrostratOverlayStyles.showButton}>
            {showMapRef ? 'Hide Map Ref' : 'Show Map Ref'}
          </Text>
        </TouchableOpacity>
        {showMapRef && renderMapRef()}
      </ScrollView>
    );
  };

  const renderMapRef = () => {
    const {url, name, authors, isbn_doi, ref_year, ref_title, source_id, ref_source} = dataObject.map_ref;
    return (
      <View>
        <Card.Divider/>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Url:</Text> {url}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Name:</Text> {name}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Authors:</Text> {authors}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text style={macrostratOverlayStyles.mapRefBoldText}>ISBN
          DOI:</Text> {isbn_doi}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Year:</Text> {ref_year}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Title:</Text> {ref_title}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text
          style={macrostratOverlayStyles.mapRefBoldText}>Source:</Text> {ref_source}</Text>
        <Text style={macrostratOverlayStyles.mapRefContent}><Text style={macrostratOverlayStyles.mapRefBoldText}>Source
          ID:</Text> {source_id}</Text>
      </View>
    );
  };

  return (
    <>
      {visible
        && <Card
          containerStyle={SMALL_SCREEN ? [macrostratOverlayStyles.containerPositionSmallScreen] : [macrostratOverlayStyles.container]}>
          <Card.Title>{isEmpty(dataObject.name) ? 'Un-Named' : dataObject.name}</Card.Title>
          {coords && (
            <Text style={macrostratOverlayStyles.coordsText}>Lat: {coords[1].toFixed(4)}, Lng: {coords[0].toFixed(
              4)}
            </Text>
          )}
          {renderContent()}
          {showMore && renderDescription()}
          <View style={{alignItems: 'center', justifyContent: 'flex-end'}}>
            <Button
              title={'Close'}
              onPress={closeModal}
              type={'clear'}
            />
          </View>
        </Card>}
    </>
  );
};

export default MacrostratOverlay;
