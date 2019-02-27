import React from 'react'
import {Text, View, Button} from 'react-native'
import styles from './Styles';
import {goToAuth, goSignIn, splitView} from '../../routes/Navigation'
import MapView, {getCurrentLocation} from '../../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import IconButton from '../../ui/IconButton';
import MapActionsDialog from '../../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../../components/modals/base-maps/BaseMapDialogBox";
import NotebookPanel from '../../components/sidebar-views/notebook-panel/NotebookPanel';
//import SettingsSideMenu from '../../components/sidebars/SettingsSideMenu/SettingsSideMenu';
//import {Drawer} from "native-base";

export default class Home extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.mapViewElement = React.createRef();
    this.state = {
      dialogs: {
        mapActionsMenuVisible: false,
        mapSymbolsMenuVisible: false,
        baseMapMenuVisible: false
      },
      buttons: {
        endDrawButtonVisible: false,
        drawButtonOn: undefined,
      },
      noteBookPanelVisible: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    Icon.getImageSource("pin", 30)
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  clickHandler = (name) => {
    switch (name) {
      case "search":
        console.log(`${name}`, " was clicked");
        break;
      case "tag":
        console.log(`${name}`, " was clicked");
        break;
      case "measurement":
        console.log(`${name}`, " was clicked");
        break;
      case "sample":
        console.log(`${name}`, " was clicked");
        break;
      case "note":
        console.log(`${name}`, " was clicked");
        break;
      case "photo":
        console.log(`${name}`, " was clicked");
        break;
      case "sketch":
        console.log(`${name}`, " was clicked");
        break;
      case "notebook":
        console.log(`${name}`, " was clicked");
        break;
      case "settings":
        console.log(`${name}`, " was clicked");
        goSignIn();
        break;

      // Map Actions
      case "point":
        console.log(`${name}`, " was clicked");
        this.setDrawButtonOn(name);
        if (this.state.buttons.endDrawButtonVisible) this.toggleButton('endDrawButtonVisible');
        this.setDrawType(name);
        break;
      case "line":
        console.log(`${name}`, " was clicked");
        this.setDrawButtonOn(name);
        this.toggleButton('endDrawButtonVisible');
        this.setDrawType(name);
        break;
      case "polygon":
        console.log(`${name}`, " was clicked");
        this.setDrawButtonOn(name);
        this.setDrawType(name);
        break;
      case "endDraw":
        console.log(`${name}`, " was clicked");
        this.setDrawButtonOn(undefined);
        this.endDraw();
        break;
      case "currentLocation":
        console.log(`${name}`, " was clicked");
        // this.getLocation();
        break;

      // Map Actions
      case "zoom":
        console.log(`${name}`, " was clicked");
        break;
      case "saveMap":
        console.log(`${name}`, " was clicked");
        break;
      case "addTag":
        console.log(`${name}`, " was clicked");
        break;
      case "stereonet":
        console.log(`${name}`, " was clicked");
        break;

      // Map Basemap Layers
      case "mapboxSatellite":
        this.newBasemapDisplay(name);
        break;
      case "mapboxOutdoors":
        this.newBasemapDisplay(name);
        break;
      case "osm":
        this.newBasemapDisplay(name);
        break;
      case "macrostrat":
        this.newBasemapDisplay(name);
        break;
      case "custom":
        this.newBasemapDisplay(name);
        break;
    }
  };

  newBasemapDisplay = (name) => {
    this.mapViewElement.current.changeMap(name);
  };

  setDrawType = drawType => {
    this.mapViewElement.current.setDrawType(drawType);
  };

  endDraw = () => {
    this.mapViewElement.current.endDraw();
    this.toggleButton('endDrawButtonVisible');
  };

  toggleButton = (button) => {
    console.log('Toggle Button', button);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          buttons: {
            ...prevState.buttons,
            [button]: !prevState.buttons[button]
          }
        }
      });
    }
    else console.log('Attempting to toggle', button, 'but Home Component not mounted.');
  };

  setDrawButtonOn = button => {
    if (this._isMounted) {
      console.log('Set', button, 'draw button pressed to ON');
      this.setState(prevState => {
        if (prevState.buttons.drawButtonOn === button) button = undefined;
        return {
          ...prevState,
          buttons: {
            ...prevState.buttons,
            drawButtonOn: button
          }
        }
      });
    }
    else console.log('Attempting to toggle', button, 'but Home Component not mounted.');
  };

  //RN Maps ***
  // getLocation = () => {
  //   this.mapViewElement.current.getCurrentLocation();
  // };

  /*closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };*/

  toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          dialogs: {
            ...prevState.dialogs,
            [dialog]: !prevState.dialogs[dialog]
          }
        }
      });
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  openNotebookPanel = () => {
    this.setState({
      noteBookPanelVisible: true
    })
  };

  closeNotebookPanel = () => {
    this.setState({
      noteBookPanelVisible: false
    })
  };

  dialogClickHandler = (dialog, name) => {
    this.clickHandler(name);
    this.toggleDialog(dialog);
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView ref={this.mapViewElement}/>
        {this.state.noteBookPanelVisible ?
          <NotebookPanel
            close={() => this.closeNotebookPanel()}
          />
          : null}
        <View style={styles.topCenter}>
          {this.state.buttons.endDrawButtonVisible ?
            <Button title={'End Draw'} onPress={this.clickHandler.bind(this, "endDraw")}/> : null}
        </View>
        <View style={styles.rightsideIcons}>
          <View style={styles.searchAndSettingsIcons}>
            <IconButton
              source={require('../../assets/icons/SearchButton.png')}
              // onPress={this.clickHandler.bind(this, "search")}
            />
          </View>
          <View style={styles.tagIcon}>
            <IconButton
              source={require('../../assets/icons/TagButton.png')}
              onPress={this.clickHandler.bind(this, "tag")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/MeasurementButton.png')}
              onPress={this.clickHandler.bind(this, "measurement")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/SampleButton.png')}
              onPress={this.clickHandler.bind(this, "sample")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              name={"Note"}
              source={require('../../assets/icons/NoteButton.png')}
              onPress={this.clickHandler.bind(this, "note")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/PhotoButton.png')}
              onPress={this.clickHandler.bind(this, "photo")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/SketchButton.png')}
              onPress={this.clickHandler.bind(this, "sketch")}
            />
          </View>
          <View style={styles.notebookViewIcon}>
            <IconButton
              source={require('../../assets/icons/NotebookViewButton.png')}
              onPress={() => this.openNotebookPanel()}
            />
          </View>
        </View>
        <View style={styles.bottomRightIcons}>
          <View style={styles.pointIcon}>
            <IconButton
              source={this.state.buttons.drawButtonOn === 'point' ?
                require('../../assets/icons/PointButton_pressed.png') : require('../../assets/icons/PointButton.png')}
              onPress={this.clickHandler.bind(this, "point")}
            />
          </View>
          <View style={styles.lineIcon}>
            <IconButton
              source={this.state.buttons.drawButtonOn === 'line' ?
                require('../../assets/icons/LineButton_pressed.png') : require('../../assets/icons/LineButton.png')}
              onPress={this.clickHandler.bind(this, "line")}
            />
          </View>
          <View style={styles.polygonIcon}>
            <IconButton
              source={this.state.buttons.drawButtonOn === 'polygon' ?
                require('../../assets/icons/PolygonButton_pressed.png') :
                require('../../assets/icons/PolygonButton.png')}
              onPress={this.clickHandler.bind(this, "polygon")}
            />
          </View>
        </View>
        <View style={styles.leftsideIcons}>
          <View style={styles.searchAndSettingsIcons}>
            <IconButton
              source={require('../../assets/icons/SettingsButton.png')}
              onPress={this.clickHandler.bind(this, "settings")}
            />
          </View>
        </View>
        <View style={styles.bottomLeftIcons}>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/MapActionsButton.png')}
              onPress={() => this.toggleDialog("mapActionsMenuVisible")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/SymbolsButton.png')}
              onPress={() => this.toggleDialog("mapSymbolsMenuVisible")}
            />
          </View>
          <View style={styles.layersIcon}>
            <IconButton
              source={require('../../assets/icons/LayersButton.png')}
              onPress={() => this.toggleDialog("baseMapMenuVisible")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../../assets/icons/MyLocationButton.png')}
              onPress={this.clickHandler.bind(this, "currentLocation")}
            />
          </View>
        </View>
        <MapActionsDialog
          visible={this.state.dialogs.mapActionsMenuVisible}
          onPress={(name) => this.dialogClickHandler("mapActionsMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("mapActionsMenuVisible")}
        />
        <MapSymbolsDialog
          visible={this.state.dialogs.mapSymbolsMenuVisible}
          onPress={(name) => this.dialogClickHandler("mapSymbolsMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("mapSymbolsMenuVisible")}
        />
        <BaseMapDialog
          visible={this.state.dialogs.baseMapMenuVisible}
          onPress={(name) => this.dialogClickHandler("baseMapMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("baseMapMenuVisible")}
        />
      </View>
    )
  }
}
