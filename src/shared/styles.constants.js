import {Dimensions, Platform} from 'react-native';

const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const {width, height} = Dimensions.get(platform);

//See https://facebook.github.io/react-native/docs/colors
export const LIGHTGREY = '#f7f7f7'; //(lightgrey)
export const MEDIUMGREY = 'darkgray'; //(#d3d3d3)
export const DARKGREY = 'dimgray';
export const BLUE = 'dodgerblue'; // (#1e90ff)
export const RED = 'red';
export const WHITE = '#ffffff';
export const BLACK = 'black';
export const GOLD = '#FFD700';
//export const REACT_NATIVE_ELEMENTS_BLUE = '#2089dc';

export const PRIMARY_BACKGROUND_COLOR = LIGHTGREY;
export const SECONDARY_BACKGROUND_COLOR = WHITE;

export const PRIMARY_TEXT_COLOR = BLACK;

export const WARNING_COLOR = RED;

export const PRIMARY_LISTITEM_FONTWEIGHT = '500';

export const PRIMARY_ACCENT_COLOR = BLUE;

export const LIST_BORDER_COLOR = MEDIUMGREY;

export const TEXT_WEIGHT = '500';
export const PRIMARY_TEXT_SIZE = Platform.OS === 'web' ? 12 : 16;
export const PRIMARY_HEADER_TEXT_SIZE = Platform.OS === 'web' ? 14 : 20;
export const SMALL_TEXT_SIZE = Platform.OS === 'web' ? 10 : 14;
export const MEDIUM_TEXT_SIZE = Platform.OS === 'web' ? 12 : 16;
export const SPOT_NAME_SIZE = Platform.OS === 'web' ? 20 : 30;
export const MODAL_TEXT_SIZE = Platform.OS === 'web' ? 10 : 14;

export const UPDATE_LABEL_WIDTH = 150;
export const UPDATE_LABEL_HEIGHT = 150;

export const SMALL_SCREEN = width < 768 || height < 768;
