import {name, version} from '../../package.json';

// Be sure to change the version in X-Code to match TODO: Change X-Code version and package.json to match!!
export const BUNDLE_ID = `org.${name}`;
export const VERSION_NUMBER = version;
export const RELEASE_NAME = `${BUNDLE_ID}-${VERSION_NUMBER}`;
