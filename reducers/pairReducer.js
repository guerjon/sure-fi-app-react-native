import { 
  LOADING,
  LOADED,
  DEVICES_FOUNDED,
  DEVICES_NOT_FOUNDED,
  CENTRAL_PAIRED,
  REMOTE_PAIRED,
  ADD_DEVICES

} from '../constants'


const initialState = {
  loaded: false,
  devices_founded: false,
  devices : [],
  remote_devices : [],
  central_paired : false,
  scanning_central_units :true,
  scanning_remote_units : true,
  scanner : null
}

export default function pairReducer (state = initialState, action) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loaded: false,
      }
    case LOADED:
      return {
        ...state,
        loaded: true
      }
    case DEVICES_FOUNDED:
      return{
        ...state,
        devices_founded: true,
        scanning_central_units: false,
        scanning_remote_units: false
      }
    case DEVICES_NOT_FOUNDED:
      return{
        ...state,
        scanning_central_units: false,
        scanning_remote_units: false,
        devices_founded: false
      }
    case CENTRAL_PAIRED :
      return {
        ...state,
        central_paired: true
      }
    case REMOTE_PAIRED:
      return {
        ...state,
        remote_paired
      }
    case "UPDATE_DEVICES" : 
      return {
        ...state,
        devices: action.devices,
        remote_devices : action.remote_devices,
        scanner : action.scanner
      }
    case "RESET_DEVICES":
      return {
        ...state,
        devices : []
      }
    case "RESET_PAIR_REDUCER":
      return {
        loaded: false,
        devices_founded: false,
        devices : [],
        remote_devices : [],
        central_paired : false,
        scanning_central_units :true,
        scanning_remote_units : true,
        scanner : null
      }
    default:
      return state
  }
}