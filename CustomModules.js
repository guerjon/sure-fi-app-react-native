'use strict';
/**
 * This exposes the native NativeModules modules as a JS module. This has a
 * function 'show' which takes the following parameters:
 *
 * 1. String message: A string with the text to toast
 * 2. int duration: The duration of the toast. May be ToastAndroid.SHORT or
 *    ToastAndroid.LONG
 */
import { NativeModules } from 'react-native'

module.exports = {
	ConnectDevice : NativeModules.ConnectDevice,
	ScanCentral : NativeModules.ScanCentral,
	ScanRemote : NativeModules.ScanRemote,
	InitiateCentralWrite : NativeModules.InitiateCentralWrite,
	InitiateRemoteWrite : NativeModules.InitiateRemoteWrite,
	BluetoothStatus : NativeModules.BluetoothStatus

}
