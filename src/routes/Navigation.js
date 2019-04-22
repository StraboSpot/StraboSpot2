import {Navigation} from 'react-native-navigation'

export const goHome = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'App',
      children: [
        {
          component: {
            name: 'SpotPage',
            id: 'spotPage',
          }
        },
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

export const goToImages = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'Images',
      children: [
        {
          component: {
            name: 'Images'
          }
        }
      ]
    }
  }
});

export const goToSpotPage = () => Navigation.setRoot({
  root: {
    stack: {
      id: 'SpotPage',
      children: [
        {
          component: {
            name: 'SpotPage',
            id: 'spotPage',
          }
        }
      ]
    }
  }
});

