import { NavigationActions } from 'react-navigation';
import { AppNavigator } from '../app';

const firstAction = AppNavigator.router.getActionForPathAndParams('Main');
const tempNavState = AppNavigator.router.getStateForAction(firstAction);
const initialNavState = AppNavigator.router.getStateForAction(firstAction, tempNavState);


export default function nav(state, action){
    const newState = AppNavigator.router.getStateForAction(action, state);
    return newState || state;
};