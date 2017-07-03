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
  	NativeModules
} from 'react-native'
import {styles,first_color,option_blue,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	IS_EMPTY
} from '../constants'
import CameraHelper from '../helpers/camera';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/FontAwesome';

var {width,height} = Dimensions.get('window')


class SetupRemote extends Component{
	
	static navigationOptions ={
		title : "Setep 2 - Setup Remote",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		this.dispatch = this.props.dispatch
		console.log("seutp_remote props",this.props)
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
                    style={styles.preview}
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
    	//this.camera.stopAll()
    	this.props.navigation.navigate("BridgeDetails", {scan : this.props.navigation.state.params.scan})
    	
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

    renderIndex(){
    	var {remote_photo_data} = this.props
    	console.log("show_remote_continue_button",this.props.show_remote_continue_button)

		return (
			<ScrollView style={styles.pairContainer}>
				<View style={styles.pairSectionsContainer}>
					<View style={{alignItems:"center"}}>
						<Text style={styles.bigTitle}>
							Remote Unit Settings
						</Text>
					</View>
					<View style={{marginHorizontal:10,marginVertical:10,flex:1}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<View style={{marginRight:10}}>
								<View style={{backgroundColor:"white",width:120,height:120,borderWidth:StyleSheet.hairlineWidth,borderRadius:10}}>
									{!IS_EMPTY(this.props.remote_photo_data)  &&  (
										<Image
								          style={{width: 120 , height:120,borderWidth:StyleSheet.hairlineWidth,borderRadius:10}}
								          source={{uri: this.props.remote_photo_data.path}}
								        >
						                </Image>)
									}
								</View>
								<TouchableHighlight 
									style={{backgroundColor:option_blue,width: width/3,marginVertical:10,borderRadius:5,padding:5,alignItems:"center"}}
									onPress={() => this.openCamera()}
								>
									<Text style={{color:"white"}}>
										Take Picture
									</Text>
								</TouchableHighlight>	
							</View>
							<View style={{width:width * 0.6 ,alignItems:"center",justifyContent:"center"}}>
								<Text>
									Take a picture of Remote unit of the Sure-Fi Bridge and ensure that you can clearly see what system/devices it is connected to.
									See examples images below
								</Text>
								<TouchableHighlight onPress={() => this.props.navigation.navigate("SetupRemoteExamples")} style={{padding:10}} >
									<Text style={styles.link} >
										Examples
									</Text>
								</TouchableHighlight>
							</View>
						</View>
						<View>
							<Text style={{marginVertical:10}}>
								Description of Remote Unit Installation
							</Text>
							<TextInput 
								onChangeText = {(text) => this.checkText(text)}
								style={{height: 90, width:width -20, borderColor: 'gray', borderWidth: 0.3,borderRadius:5,backgroundColor:"white"}} 
								underlineColorAndroid="transparent"
								placeholder={"Please provide a description... \n \n Example - This Sure-Fi Remote Unit is connected to a 4-Door controller from XYZ Company"}
							>
							</TextInput>
						</View>
						{ this.props.show_remote_continue_button &&
							<View>
								<TouchableHighlight 
									onPress={() => this.smartGoBack() } 
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
				return this.renderIndex()
			case "camera":
				return this.renderCamera()
			case "image":
				return this.renderImage()
			case "clean_setup_remote_camera":
				return <ActivityIndicator />
			default:
				return <ActivityIndicator/>
		}
	}
}

const mapStateToProps = state => ({
	screen_status : state.setupRemoteReducer.screen_status,
	show_remote_continue_button : state.setupRemoteReducer.show_remote_continue_button,
	remote_photo_data : state.setupRemoteReducer.remote_photo_data,
	remote_unit_description : state.setupRemoteReducer.remote_unit_description,
	remote_device: state.scanRemoteReducer.remote_device,
});

export default connect(mapStateToProps)(SetupRemote);