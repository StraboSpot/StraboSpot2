import {Navigation} from 'react-native-navigation'
import {IMAGEGALLERY, IMAGEINFO} from "./ScreenNameConstants";

export const goHome = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'App',
      children: [
        {
          component: {
            name: 'Home',
            id: 'home'
          }
        },
      ],
    }
  }
});

export const goSignUp = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'SignUp',
      children: [
        {
          component: {
            name: 'SignUp',
          }
        }
      ],
    }
  }
});

export const goSignIn = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'SignIn',
      children: [
        {
          component: {
            name: 'SignIn',
          }
        }
      ],
    }
  }
});

export const goToImageGallery = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'ImageGallery',
      children: [
        {
          component: {
            name: IMAGEGALLERY
          }
        }
      ]
    }
  }
});

export const goToImageInfo = (id) => Navigation.setRoot({
  root: {
    stack: {
      id: 'ImageInfo',
      children: [
        {
          component: {
            name: IMAGEINFO,
            passProps: {
              id: id
            }
          }
        }
      ]
    }
  }
});

