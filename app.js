import {Platform} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens';
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
import reducers from "./reducers";
const store = createStoreWithMiddleware(reducers);

// screen related book keeping
registerScreens(store,Provider);

// this will start our app
Navigation.startSingleScreenApp({
  screen: {
    screen : "MainScreen",
    title: 'MainScreen',
    navigatorStyle : {
      navBarHidden : true
    },
    navigatorButtons: {},
    passProps: {},
    animationType: 'slide-down'
  }
});


