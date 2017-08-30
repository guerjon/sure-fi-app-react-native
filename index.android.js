<<<<<<< HEAD
__STRESS_TEST__ = false;
import App from './app';
=======
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *adb shell am start -n "com.surefi/com.surefi.MainActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER
 * @flow
*/

import React from 'react'
import { Provider } from 'react-redux'
import configureStore from "./configureStore"
import AppWithNavigationState from './app'
import {
   	AppRegistry,
} from 'react-native';


const navReducer = (state, action) => {
    const newState = AppNavigator.router.getStateForAction(action, state);
    return newState || state;
};

const store = configureStore(navReducer);

const SureFiApp = () => (
	<Provider store={store}>
		<AppWithNavigationState/>
	</Provider>
);


AppRegistry.registerComponent('SureFi', () => SureFiApp);



>>>>>>> ed56243632d38a858d414022c96cb7be62d79511
