// import MaterialCommunityIconsI from 'react-native-vector-icons/MaterialCommunityIcons'
// import SimpleLineIconsI from 'react-native-vector-icons/SimpleLineIcons'
// import MaterialIconsI from 'react-native-vector-icons/MaterialIcons'
import FontAwesomeI from 'react-native-vector-icons/FontAwesome5'
// import FoundationI from 'react-native-vector-icons/Foundation'
// import EvilIconsI from 'react-native-vector-icons/EvilIcons'
import OcticonsI from 'react-native-vector-icons/Octicons'
import IoniconsI from 'react-native-vector-icons/Ionicons'
// import FeatherI from 'react-native-vector-icons/Feather'
// import EntypoI from 'react-native-vector-icons/Entypo'
// import ZocialI from 'react-native-vector-icons/Zocial'
import React from 'react'

export const MaterialCommunityIcons = props => (
  <MaterialCommunityIconsI {...props} />
);
// const SimpleLineIcons = props => <SimpleLineIconsI {...props} />;
// const MaterialIcons = props => <MaterialIconsI {...props} />;
const FontAwesome5 = props => <FontAwesomeI {...props} />;
// const Foundation = props => <FoundationI {...props} />;
// const EvilIcons = props => <EvilIconsI {...props} />;
const Ionicons = props => <IoniconsI {...props} />;
const Octicons = props => <OcticonsI {...props} />;
// const Feather = props => <FeatherI {...props} />;
// const Entypo = props => <EntypoI {...props} />;
// const Zocial = props => <ZocialI {...props} />;

export default  {
  MaterialCommunityIcons,
  // SimpleLineIcons,
  // MaterialIcons,
  FontAwesome5,
  // Foundation,
  // EvilIcons,
  Ionicons,
  Octicons,
  // Feather,
  // Entypo,
  // Zocial
}
