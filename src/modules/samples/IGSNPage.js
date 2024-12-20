import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import myStraboSpot from '../project/MyStraboSpot';

const IGSNPage = ({route, navigation}) => {
  const orcidToken = route.params.id;

  const [SesarToken, setSesarToken] = useState('');


  useEffect(() => {
    getSesarToken()
  }, []);

  const getSesarToken = async () => {
    const sesarToken = await fetch('https://app.geosamples.org/webservices/get_token.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({connection: 'strabospot', orcid_id_token: orcidToken})
    });
    console.log('Sesar JWT', sesarToken);
  };

  console.log('Orcid Token', orcidToken);
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text >This is the IGSN Page</Text>
      <Text >This is the Orcid Token: {orcidToken}</Text>
      <Button onPress={() => navigation.goBack()} title={'Back'}/>
    </View>
  );
};

export default IGSNPage;
