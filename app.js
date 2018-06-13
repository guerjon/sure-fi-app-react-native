import {Platform} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens';
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
export const store = createStoreWithMiddleware(reducers);


// screen related book keeping
registerScreens(store,Provider);

// this will start our app
Navigation.startSingleScreenApp({
  screen: {
    screen : "Bridges",
    title: 'Scan QR Code',
//    screen : "HelpScreen",
//    title: "HelpScreen",
//    screen : "Documentation",
//    title: 'Documentation',

    navigatorStyle : {
      navBarHidden : true,
    },
    passProps: {},
    animationType: 'slide-up',
  },
  appStyle: {
    orientation: 'portrait'
  }    

});


