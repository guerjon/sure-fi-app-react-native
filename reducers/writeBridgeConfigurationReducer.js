import {
  SCANNING_UNITS,
  CONNECTING_CENTRAL_UNIT,
  WRITING_CENTRAL_UNIT,
  WROTE_CENTRAL_UNIT,

  CONNECTING_REMOTE_UNIT,
  WRITING_REMOTE_UNIT,
  WROTE_REMOTE_UNIT,
  ERROR_ON_CENTRAL_SCANNING,
  ERROR_ON_CENTRAL_WROTE,
  ERROR_ON_REMOTE_SCANNING,
  ERROR_ON_REMOTE_WROTE
} from '../constants'

const initialState = {
  scanning_units :false,
  connecting_central_unit: false,
  connected_central_unit : false,
  writing_central_unit: false,
  wrote_central_unit: false,
  connecting_remote_unit: false,
  writing_remote_unit: false,
  wrote_remote_unit: false,
  error_on_central_scanning: false,
  error_on_central_wrote : false,
  error_on_remote_scanning: false,
  error_on_remote_wrote: false
}

export default function writeBridgeConfigurationReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_STATE":
      return {
        scanning_units :false,
        connecting_central_unit: false,
        writing_central_unit: false,
        wrote_central_unit: false,
        connecting_remote_unit: false,
        writing_remote_unit: false,
        wrote_remote_unit: false,
        error_on_central_scanning: false,
        error_on_central_wrote : false,
        error_on_remote_scanning: false,
        error_on_remote_wrote: false
      }
    case  SCANNING_UNITS :
      return {
        ...state,
        scanning_units :true
      }
    case  CONNECTING_CENTRAL_UNIT :
      return {
        ...state,
        connecting_central_unit: true
      }
    case  WRITING_CENTRAL_UNIT :
      return {
        ...state,
        writing_central_unit: true
      }
    case  WROTE_CENTRAL_UNIT :
      return {
        ...state,
        wrote_central_unit :true
      }
    case  CONNECTING_REMOTE_UNIT :
      return {
        ...state,
        connecting_remote_unit: true
      }
    case  WRITING_REMOTE_UNIT :
      return {
        ...state,
        writing_remote_unit: true
      }
    case  WROTE_REMOTE_UNIT :
      return {
        ...state,
        wrote_remote_unit: true
      }
    case  ERROR_ON_CENTRAL_SCANNING :
      return {
        ...state,
        error_on_central_scanning: true
      }
    case  ERROR_ON_CENTRAL_WROTE :
      return {
        ...state,
        error_on_central_wrote: true
      }
    case  ERROR_ON_REMOTE_SCANNING :
      return {
        ...state,
        error_on_remote_scanning: true
      }
    case  ERROR_ON_REMOTE_WROTE :
      return {
        ...state,
        error_on_remote_wrote: true
      }
    case "CONNECTED_CENTRAL_UNIT":
      return {
        ...state,
        connected_central_unit : true
      }
    case "DISCONNECTED_CENTRAL_UNIT":
      return{
        ...state,
        connected_central_unit: false
      }
    default:
      return state
  }
}