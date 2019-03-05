import React from 'react'
import {View, Button} from 'react-native'
import styles from './Styles';
import {goToAuth, goSignIn, splitView} from '../../routes/Navigation'
import MapView from '../../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import IconButton from '../../ui/IconButton';
import MapActionsDialog from '../../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../../components/modals/base-maps/BaseMapDialogBox";
import NotebookPanel from '../../components/sidebar-views/notebook-panel/NotebookPanel';
import Drawer from 'react-native-drawer';
import SettingsPanel from '../../components/sidebar-views/settings-panel/SettingsPanel';
import {MapModes} from '../../components/map/Map.constants';
import ShortcutMenu from '../../components/sidebar-views/settings-panel/shortcuts-menu/ShortcutsMenu';

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
      mapMode: MapModes.VIEW,
      noteBookPanelVisible: false,
      settingsMenuVisible: 'settingsMain',
      drawerVisible: false,
      shortcutSwitchPosition: {
        Tag: false,
        Measurement: false,
        Sample: false,
        Note: false,
        Photo: false,
        Sketch: false
      },
      isShortcutButtonVisible: {
        Tag: false,
        Measurement: false,
        Sample: false,
        Note: false,
        Photo: false,
        Sketch: false
      }
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
        this.openSettingsDrawer();
        break;

      // Map Actions
      case MapModes.DRAW.POINT:
        this.mapViewElement.current.setPointAtCurrentLocation();
        break;
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        console.log('Selected', name);
        if (this.state.mapMode === MapModes.VIEW) {
          this.setMapMode(name);
          this.toggleButton('endDrawButtonVisible');
        }
        else this.cancelDraw(name);
        break;
      case "endDraw":
        this.endDraw();
        break;
      case "currentLocation":
        console.log(`${name}`, " was clicked");
        this.mapViewElement.current.goToCurrentLocation();
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

  setMapMode = mapMode => {
    if (this._isMounted) {
      this.setState(prevState => {
        if (prevState.mapMode === mapMode) mapMode = MapModes.VIEW;
        return {
          ...prevState,
          mapMode: mapMode
        }
      }, () => {
        console.log('Map Mode set to:', mapMode);
      });
    }
    else console.log('Attempting to set the state for the map mode but Home Component not mounted.');

  };

  cancelDraw = async (name) => {
    await this.mapViewElement.current.cancelDraw();
    this.setMapMode(name);
    if (this.state.mapMode === MapModes.VIEW) this.toggleButton('endDrawButtonVisible');
  };

  endDraw = async () => {
    await this.mapViewElement.current.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
  };

  // Toggle given button between true (on) and false (off)
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

  closeDrawer = () => {
    this.drawer.close();
    console.log("Drawer Close")

  };
  openDrawer = () => {
    this.drawer.open();
    console.log("Drawer Open")
  };

  // Toggle given dialog between true (visible) and false (hidden)
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

  toggleDrawer = () => {
    // console.log('Toggle drawer');
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          drawerVisible: !prevState.drawerVisible
        }
      }, () => {
        console.log("DrawerVisible state", this.state.drawerVisible)
      });
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    this.setState(prevState => {
      return {
        shortcutSwitchPosition: {
          ...prevState.shortcutSwitchPosition,
          [switchName]: !prevState.shortcutSwitchPosition[switchName]
        },
        isShortcutButtonVisible: {
          ...prevState.isShortcutButtonVisible,
          [switchName]: !prevState.shortcutSwitchPosition[switchName]
        }
      }
    }, () => {
      console.log('Switch Position', this.state.shortcutSwitchPosition);
    });
  };

  setVisibleMenuState = (state) => {
    this.setState(prevState => {
      return {
        ...prevState,
        settingsMenuVisible: state
      }
    }, () => {
      console.log('State updated:', this.state);
    })
  };

  closeSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.close();
    this.setVisibleMenuState('settingsMain');
    console.log("Drawer Closed");
  };

  openSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.open();
    console.log("Drawer Opened");
  };

  openNotebookPanel = () => {
    this.setState({
      noteBookPanelVisible: true
    });
  };

  closeNotebookPanel = () => {
    this.setState({
      noteBookPanelVisible: false
    });
  };

  dialogClickHandler = (dialog, name) => {
    this.clickHandler(name);
    this.toggleDialog(dialog);
  };

  settingsClickHandler = (name) => {
    console.log(name);
    switch (name) {
      case "Shortcut Menu":
        console.log(name);
        this.setVisibleMenuState('Shortcut Menu');
        break;
      case 'Sign Out':

    }
  };

  render() {
    let content = null;

    if (this.state.settingsMenuVisible === 'settingsMain') {
      content = <SettingsPanel onPress={(name) => this.settingsClickHandler(name)}/>
    }
    else if (this.state.settingsMenuVisible === 'Shortcut Menu') {
      content =
        <ShortcutMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
          shortcutSwitchPosition={this.state.shortcutSwitchPosition}
        />
    }
    return (
      <Drawer
        tweenHandler={(ratio) => ({
          main: {opacity: (2 - ratio) / 2}
        })}
        type={'displace'}
        ref={ref => this.drawer = ref}
        openDrawerOffset={.70}
        tapToClose={true}
        onClose={this.closeSettingsDrawer}
        content={content}
      >
        <View style={styles.container}>
          <MapView ref={this.mapViewElement} mapMode={this.state.mapMode}/>
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
            <View style={styles.sideIconsGroupContainer}>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Tag ?
                  <IconButton
                    source={require('../../assets/icons/TagButton.png')}
                    onPress={this.clickHandler.bind(this, "tag")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Measurement ?
                  <IconButton
                    source={require('../../assets/icons/MeasurementButton.png')}
                    onPress={this.clickHandler.bind(this, "measurement")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Sample ?
                  <IconButton
                    source={require('../../assets/icons/SampleButton.png')}
                    onPress={this.clickHandler.bind(this, "sample")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Note ?
                  <IconButton
                    name={"Note"}
                    source={require('../../assets/icons/NoteButton.png')}
                    onPress={this.clickHandler.bind(this, "note")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Photo ?
                  <IconButton
                    source={require('../../assets/icons/PhotoButton.png')}
                    onPress={this.clickHandler.bind(this, "photo")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Sketch ?
                  <IconButton
                    source={require('../../assets/icons/SketchButton.png')}
                    onPress={this.clickHandler.bind(this, "sketch")}
                  /> : null}
              </View>
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
                source={this.state.mapMode === MapModes.DRAW.POINT ?
                  require('../../assets/icons/PointButton_pressed.png') : require('../../assets/icons/PointButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POINT)}
              />
            </View>
            <View style={styles.lineIcon}>
              <IconButton
                source={this.state.mapMode === MapModes.DRAW.LINE ?
                  require('../../assets/icons/LineButton_pressed.png') : require('../../assets/icons/LineButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.LINE)}
              />
            </View>
            <View style={styles.polygonIcon}>
              <IconButton
                source={this.state.mapMode === MapModes.DRAW.POLYGON ?
                  require('../../assets/icons/PolygonButton_pressed.png') :
                  require('../../assets/icons/PolygonButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POLYGON)}
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
      </Drawer>
    )
  }
}
