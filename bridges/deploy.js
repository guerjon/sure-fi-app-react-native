import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	TouchableHighlight,
  	Dimensions,
  	TextInput,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter,
  	Alert
} from 'react-native'
import {styles,first_color,option_blue,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	IS_EMPTY,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID
} from '../constants'
import {
	PUSH_CLOUD_STATUS,
	READ_STATUS
} from '../action_creators/index'
import {COMMAND_MAKE_DEPLOY} from '../commands'
import {
	NavigationActions
} from 'react-navigation'
import CameraHelper from '../helpers/camera';
import Background from '../helpers/background';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/FontAwesome';

import BleManager from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


var {width,height} = Dimensions.get('window')


class SetupRemote extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

	constructor(props) {
		super(props);
		console.log("props",props)
		this.device = props.device;
		this.dispatch = props.dispatch
	}

	componentWillUnmount() {
		this.dispatch({type: "HIDE_REMOTE_CAMERA"})
	}

	componentDidMount() {
		this.props.dispatch({type: "RESET_SETUP_REMOTE_REDUCER"})
	}

	openCamera(){
		var {dispatch} = this.props
		dispatch({type: "SHOW_REMOTE_CAMERA"})
	}

	takeCapture(){
	    this.camera.capture()
	      	.then((remote_photo_data) =>{
	      		this.props.dispatch({type: "SHOW_REMOTE_IMAGE",remote_photo_data : remote_photo_data})
	       	})

	      .catch(err => console.error(err));		
	}

    renderCamera() {
        return (
            <View style={{flex:1}}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={{
						justifyContent: 'flex-end',
						alignItems: 'center',
						width:width,
						height: (height-150)
                    }}
                    aspect={Camera.constants.Aspect.fill}
                    captureQuality={"low"}
                >
                    <View/>
                </Camera>
                <View style={{flexDirection:"row",height:80}}>
			        <TouchableHighlight style={{backgroundColor: "black",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() =>  this.takeCapture()}>
						<Icon name="camera" size={30} color="white" />
			        </TouchableHighlight>                    
                </View>
            </View>
        )
    }

    smartGoBack(){
    	console.log("smartGoBack()")

    	this.device.manufactured_data.device_state = "0004"
    	this.props.dispatch({
            type: "CENTRAL_DEVICE_MATCHED",
            central_device: this.device,
        });
        this.props.navigator.dismissModal();
    	this.props.getCloudStatus(this.device)
    }

    goBack(){
    	this.props.navigator.dismissAllModals()
    }
    
    showAlertDeploy(){
    	Alert.alert(
    		"Deploy Device",
    		"Are you sure you wish to Deploy this Sure-Fi Device: " + this.device.manufactured_data.device_id.toUpperCase(),
    		[
    		 	
    		 	{text : "Cancel", onPress: () => console.log(("CANCEL"))},
    		 	{text : "Deploy", onPress: () => this.deploy()},
    		]
    	)    	
    }

    deploy(){
    	READ_STATUS(this.device.id)
    	.then(response => {
	    	this.pushStatusToCloud(response[0])

    	})
    	.catch(error => console.log("error",error))
    }

    pushStatusToCloud(device_status){
    	let expected_status = device_status + 1
    	let rxUUID = this.device.manufactured_data.device_id.toUpperCase()
    	let txUUID = IS_EMPTY(this.props.remote_device) ? this.device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()
    	let device_id = this.device.manufactured_data.device_id
    	let hardware_status = "0" + device_status + "|" + "0" + expected_status + "|" + rxUUID + "|" + txUUID
    	
    	PUSH_CLOUD_STATUS(device_id,hardware_status)
    	.then(response => {
    		console.log("response deploy",response)
	    	if(this.device.manufactured_data.hardware_type == "01"){
	    		var message = "This Central Unit has been deployed. If you have not done so, you must still deploy the Remote Unit before the bridge will function properly"
	    	}else{
	    		var message = "This Remote Unit has been deployed. If you have not done so, you must still deploy the Remote Unit before the bridge will function properly"
	    	}

	    	BleManagerModule.retrieveServices(this.device.id,() => {
	    		BleManager.write(this.device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_MAKE_DEPLOY],20).then(() => {
						Alert.alert(
							"Deployment Complete",
							message,
							[
								{text : "Ok",onPress: () => this.smartGoBack()}
							],
							{ cancelable: false }
						)
	    		}).catch(error => console.log("error on Write Central",error))
	    	})    		
    	})
    	.catch(error => console.log("error",error))
    }



    checkText(text){
    	var {dispatch} = this.props

    	dispatch({type: "UPDATE_REMOTE_UNIT_DESCRIPTION",remote_unit_description : text})

    	if(text.length > 0 &&  !IS_EMPTY(this.props.remote_photo_data)){
    		
    		dispatch({type: "SHOW_REMOTE_CONTINUE_BUTTON"})

    	}else{
    		
    		dispatch({type: "HIDE_REMOTE_CONTINUE_BUTTON"})

    	}
    }

    goToExamples(){
    	this.props.navigator.showModal({
    		screen : "SetupCentralExamples",
    		title: "Examples Central",
    		navigatorStyle: {
    			screenBackgroundColor: "white"
    		},
    	})
    }

    renderIndex(){
    	var {remote_photo_data} = this.props
    	//console.log("show_remote_continue_button",this.props.show_remote_continue_button)

		return (
			<ScrollView style={styles.pairContainer}>
				<View style={styles.pairSectionsContainer}>
					<View style={{alignItems:"center"}}>
						<Text style={styles.bigTitle}>
							{this.device.manufactured_data.hardware_type == "01" ? "Central Bridge" : "Remote Bridge"}
						</Text>
					</View>
					<View style={{marginHorizontal:10,marginVertical:10,flex:1}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<View style={{marginRight:10}}>
								<TouchableHighlight
									style={{
											backgroundColor:"white",
											width:120,
											height:120,
											borderWidth:StyleSheet.hairlineWidth,
											borderRadius:10,
											alignItems:"center",
											justifyContent:"center"
										}}
									onPress={() => this.openCamera()}	
								>
									<View>
									{IS_EMPTY(this.props.remote_photo_data) && (
										<Icon name="camera" size={50} color="black"/>
									)}
									{!IS_EMPTY(this.props.remote_photo_data)  &&  (
										<Image
								          style={{width: 120 , height:120,borderWidth:StyleSheet.hairlineWidth,borderRadius:10}}
								          source={{uri: this.props.remote_photo_data.path}}
								        >
						                </Image>)
									}
									</View>
								</TouchableHighlight>
							</View>
							<View style={{width:width * 0.6 ,alignItems:"center",justifyContent:"center"}}>
								<Text>
									Take a picture of {this.device.manufactured_data.hardware_type == "01" ? "Central Bridge" : "Remote Bridge"}  the Sure-Fi Bridge and ensure that you can clearly see what system/devices it is connected to.
									See examples images below
								</Text>
								<TouchableHighlight onPress={() => this.goToExamples()} style={{padding:10}} >
									<Text style={styles.link} >
										Examples
									</Text>
								</TouchableHighlight>
							</View>
						</View>
						<View>
							<Text style={{marginVertical:10}}>
								Description of {this.device.manufactured_data.hardware_type == "01" ? "Central Bridge" : "Remote Bridge"} Unit Installation
							</Text>
							<View style={{width:width-40,height:80,margin:10,alignItems:"center",justifyContent:"center"}}>
								<View style={{alignItems:"center",justifyContent:"center",height:80,width:width-40,backgroundColor:"white"}}>
									<TextInput 
										style={{flex:1,justifyContent:"center",fontSize:12,width:width-40}} 
										keyboardType="default" 
										underlineColorAndroid="transparent" 
										onChangeText = {(text) => this.checkText(text)}
										multiline = {true}
										placeholder={"Please provide a description... \n Example - \nThis Sure-Fi Unit is connected to a 4-Door controller from XYZ Company"}
									/>
								</View>
							</View>
						</View>
						{ this.props.show_remote_continue_button &&
							<View>
								<TouchableHighlight 
									onPress={() => this.showAlertDeploy() } 
									style={{height:40,width: width-20,backgroundColor:success_green,marginVertical: 20,alignItems:"center",justifyContent: "center",borderRadius:5}}
								>
									<Text style={{color:"white",fontSize:18}}>
										Continue
									</Text>
								</TouchableHighlight>
							</View>
						}
					</View>
				</View>
			</ScrollView>    	
		)
    }

    renderImage(){
    	
    	var {remote_photo_data} = this.props
    	
    	return (
	    	<ScrollView>
		        <Image
		          style={{width: width , height: height-80-80}}
		          source={{uri: remote_photo_data.path}}
		        >
                </Image>
                <View style={{justifyContent:"flex-end",flexDirection:"row"}}>
	                <View style={{height:80,flex:1}}>
				        <TouchableHighlight style={{backgroundColor: "black",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() =>  this.openCamera()}>
							<Text style={{color:"white"}}>
								Retake
							</Text>
				        </TouchableHighlight>
	                </View>		        
	                <View style={{height:80,flex:1}}>
				        <TouchableHighlight style={{backgroundColor: "black",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() =>  this.props.dispatch({type: "SHOW_REMOTE_INDEX"})}>
							<Text style={{color:"white"}}>
								Use photo
							</Text>
				        </TouchableHighlight>

	                </View>
                </View>
	    	</ScrollView>
	    )
    }

	render(){	
		var {screen_status} = this.props
		
		switch(screen_status){
			case "index":
				var content = this.renderIndex()
				break;
			case "camera":
				var content = this.renderCamera()
				break;
			case "image":
				var content = this.renderImage()
				break;
			case "clean_setup_remote_camera":
				var content = <ActivityIndicator />
				break;
			default:
				var content = <ActivityIndicator/>
				break
		}

		return <Background>{content}</Background>
	}
}

const mapStateToProps = state => ({
	screen_status : state.setupRemoteReducer.screen_status,
	show_remote_continue_button : state.setupRemoteReducer.show_remote_continue_button,
	remote_photo_data : state.setupRemoteReducer.remote_photo_data,
	remote_unit_description : state.setupRemoteReducer.remote_unit_description,
	device_status : state.setupCentralReducer.device_status,
	remote_device : state.scanRemoteReducer.remote_device,
	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(SetupRemote);