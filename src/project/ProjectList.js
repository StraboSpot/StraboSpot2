import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Text, Button, TouchableOpacity, View, FlatList} from 'react-native';
import {connect} from 'react-redux';
import * as RemoteServer from '../services/Remote-server.factory';
import {settingPanelReducers} from "../components/settings-panel/settingsPanel.constants";
import {USER_DATA} from "../services/user/User.constants";
import Loading from '../shared/ui/Loading';
import {ListItem} from "react-native-elements";

const ProjectList = (props) => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect( () =>  {
     getProject();
  }, []);

  const getProject = async () => {

    setLoading(true);
    const projects = await RemoteServer.getMyProjects(props.userProfile.encoded_login);
    console.log('Projects', projects.projects);
    setProjects(projects);
    setLoading(false);
  };

  const renderProjects = (data) => {
    return (
      <View>
        <Text>{data.name}</Text>
        <Text>{data.id}</Text>
      </View>
      )
  };

  return (
    <View style={{}}>
      <Text>Project List</Text>
      <Button
        title={'Get Project'}
        onPress={() => getProject()}/>
      <View style={{alignItems: 'center'}}>
        <Text>LIST</Text>
        {loading ?
          <View >
            <ActivityIndicator size="large" color="#0c9"/>
          </View> :
          <FlatList
            keyExtractor={item => item.id.toString()}
            data={projects.projects}
            renderItem={({item}) => renderProjects(item)}/>
        }
        {/*{projects.map((data, i) => {*/}
        {/*  console.log(data,' ', i)*/}
        {/*})}*/}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    settingsPageVisible: state.settingsPanel.settingsPageVisible,
    userProfile: state.user.userData,
    isOnline: state.home.isOnline
  }
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setUserData: (userData) => ({type: USER_DATA, userData: userData}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
