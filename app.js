import {Platform} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens';
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducers,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

// screen related book keeping
registerScreens(store,Provider);

// this will start our app
Navigation.startSingleScreenApp({
  screen: {
    screen : "MainScreen",
    title: 'MainScreen',
    //screen : "DeviceControlPanel",
    //title: "DeviceControlPanel",
    navigatorStyle : {
      navBarHidden : true,
      orientation: 'portrait'
    },
    navigatorButtons: {},
    passProps: {},
    animationType: 'slide-down'
  }
});


