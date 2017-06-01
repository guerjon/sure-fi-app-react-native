import {
  SET_MANUFACTURED_DATA, 
  REMOTE_DEVICE_MATCHED, 
  REMOTE_DEVICE_NOT_MATCHED,
  WRITING_ON_DEVICE,
  WROTE_ON_DEVICE,
  ERROR_ON_WROTE,
  RESET_QR_REMOTE_STATE,
  SCANNING_REMOTE_UNITS,
  SCANNED_REMOTE_UNITS,
  REMOTE_DEVICES_FOUNDED,
  REMOTE_DEVICES_NOT_FOUNDED
} from '../constants'

const initialState = {
  manufactured_data : [],
  remote_device_matched : false,
  remote_device : {}
}

export default function scanRemoteReducer (state = initialState, action) {
  switch (action.type) {
    case SET_MANUFACTURED_DATA:
      return {
        ...state,
        manufactured_data: action.manufactured_data,
      }
    case REMOTE_DEVICE_MATCHED:
    	return {
    		...state,
    		remote_device_matched: true,
    		remote_device: action.remote_device
    	}
    case REMOTE_DEVICE_NOT_MATCHED:
    	return {
    		...state,
    		remote_device_matched: false
    	}
    case RESET_QR_REMOTE_STATE:
      return {
        ...state,
        device_matched: false,
        device : {}
      }
    case SCANNING_REMOTE_UNITS:
      return {
        ...state,
        scanning_remote_units: true, 
      }
    case SCANNED_REMOTE_UNITS:
      return {
        ...state,
        scanned_remote_units: true,
        scanning_remote_units: false
      }
    case REMOTE_DEVICES_FOUNDED:
      return{
        ...state,
        devices_founded: true,
        scanning_remote_units: false,
        devices: action.devices
      }
    case REMOTE_DEVICES_NOT_FOUNDED:
      return{
        ...state,
        scanning_remote_units: false,
        devices_founded: false
      }
    default:
      return state
  }
}