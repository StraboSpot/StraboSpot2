import React, {Component} from 'react'
import {Button, Text, ScrollView, View} from 'react-native'
import styles from "./SettingsPanelStyles";
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {goSignIn} from '../../../routes/Navigation';
import UserProfileComponent from '../../../user/UserProfileComponent';


const SettingsPanel = props => (

<View style={styles.container}>
  <View style={styles.profile}>
    <UserProfileComponent/>
  </View>
  <ScrollView>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Attributes</Text>
      </View>
      <View style={styles.navSectionStyle}>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Spots List
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Image Gallery
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Samples
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Tags
        </ButtonNoBackground>
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>App Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Project Settings
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Manage Datasets
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Shortcuts
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Backup & Export
        </ButtonNoBackground>
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>App Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Custom Maps
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Image Basemaps
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Manage Offline Maps
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Units
        </ButtonNoBackground>
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>App Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        <ButtonNoBackground onPress={() => goSignIn()}>
          About Strabo
        </ButtonNoBackground>
        <ButtonNoBackground onPress={() => goSignIn()}>
          Documentation
        </ButtonNoBackground>
      </View>
    </View>
  </ScrollView>
</View>


);

export default SettingsPanel;


