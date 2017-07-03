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
  	ActivityIndicator
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


class SetupCentral extends Component{
	
	static navigationOptions ={
		title : "Central Device Picture",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		this.dispatch = this.props.dispatch
	}

	openCamera(){
		var {dispatch} = this.props
		dispatch({type: "SHOW_CAMERA"})
	}

	takeCapture(){
	    this.camera.capture()
	      	.then((central_photo_data) =>{
	      		this.props.dispatch({type: "SHOW_IMAGE",central_photo_data : central_photo_data})
	       	})

	      .catch(err => console.error(err));		
	}




    smartGoBack(){
    	this.props.navigation.navigate("ScanRemoteUnits", {scan : this.props.navigation.state.params.scan})
    }

    checkText(text){
    	
    	var {dispatch} = this.props

    	dispatch({type: "UPDATE_CENTRAL_UNIT_DESCRIPTION",central_unit_description : text})

    	if(text.length > 0 &&  !IS_EMPTY(this.props.central_photo_data)){
    		dispatch({type: "SHOW_CONTINUE_BUTTON"})
    	}else{
    		dispatch({type: "HIDE_CONTINUE_BUTTON"})
    	}
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

    renderIndex(){
    	var {central_photo_data} = this.props

		return (
			<ScrollView style={styles.pairContainer}>
				<View style={styles.pairSectionsContainer}>
					<View style={{alignItems:"center"}}>
						<Text style={styles.bigTitle}>
							Central Unit Settings
						</Text>
					</View>
					<View style={{marginHorizontal:10,marginVertical:10,flex:1}}>
						<View style={{flex:1,flexDirection:"row"}}>
							<View style={{marginRight:10}}>
								<View style={{backgroundColor:"white",width:120,height:120,borderWidth:StyleSheet.hairlineWidth,borderRadius:10}}>
									{!IS_EMPTY(this.props.central_photo_data)  &&  (
										<Image
								          style={{width: 120 , height:120,borderWidth:StyleSheet.hairlineWidth,borderRadius:10}}
								          source={{uri: this.props.central_photo_data ? this.props.central_photo_data.path : "/"}}
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
									Take a picture of Central unit of the Sure-Fi Bridge and ensure that you can clearly see what system/devices it is connected to.
									See examples images below
								</Text>
								<TouchableHighlight onPress={() => this.props.navigation.navigate("SetupCentralExamples")} style={{padding:10}} >
									<Text style={styles.link} >
										Examples
									</Text>
								</TouchableHighlight>
							</View>
						</View>
						<View>
							<Text style={{marginVertical:10}}>
								Description of Central Unit Installation
							</Text>
							<TextInput 
								onChangeText = {(text) => this.checkText(text)}
								style={{height: 90, width:width -20, borderColor: 'gray', borderWidth: 0.3,borderRadius:5,backgroundColor:"white"}} 
								underlineColorAndroid="transparent"
								placeholder={"Please provide a description... \n \n Example - This Sure-Fi Central Unit is connected to a 4-Door controller from XYZ Company"}
							>
							</TextInput>
						</View>
						{ this.props.show_continue_button &&
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
    	
    	var {central_photo_data} = this.props
    	
    	return (
	    	<ScrollView>
		        <Image
		          style={{width: width , height: height-80-80}}
		          source={{uri: central_photo_data.path}}
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
				        <TouchableHighlight style={{backgroundColor: "black",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() =>  this.props.dispatch({type: "SHOW_INDEX"})}>
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
			default:
				return <ActivityIndicator/>
		}
	}
}

const mapStateToProps = state => ({
	screen_status : state.setupCentralReducer.screen_status,
	show_continue_button : state.setupCentralReducer.show_continue_button,
	central_photo_data : state.setupCentralReducer.central_photo_data,
	central_unit_description : state.setupCentralReducer.central_unit_description
});

export default connect(mapStateToProps)(SetupCentral);