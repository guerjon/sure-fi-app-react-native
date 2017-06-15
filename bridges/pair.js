import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	ActivityIndicator,
  	FlatList,
  	Alert
} from 'react-native'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	LOADED,
	DEVICES_FOUNDED,
	DEVICES_NOT_FOUNDED,
	TO_HEX_STRING,
	SCANNING_CENTRAL_UNITS,
	SCANNING_REMOTE_UNITS,
	RESET_QR_CENTRAL_STATE,
	RESET_QR_REMOTE_STATE
	
} from '../constants'
import modules from '../CustomModules.js'
import { NavigationActions } from 'react-navigation'


var ScanCentral = modules.ScanCentral
var ConnectDevice = modules.ConnectDevice

class PairBridge extends Component{
	
	static navigationOptions ={
		title : "Pair New Sure-Fi Bridge",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		var {dispatch} = this.props;
		dispatch({type: "RESET_PAIR_REDUCER"})
	}

	scanRemoteDevices(){
		var {dispatch,navigation} = this.props;
		this.props.navigation.navigate("ScanRemoteUnits")
	}

	scanCentralDevices(){
		var {dispatch,navigation} = this.props;
		this.props.navigation.navigate("ScanCentralUnits")
	}

	renderDevice(device){
		return(
			<View style={{backgroundColor:"white",marginVertical: 5}}>
				<View style={{padding: 10}}>
					<Text>Name: {device.name}</Text>
					<Text>Address: {device.address} </Text>
					<Text>Manufactured data : {TO_HEX_STRING(device.manufacturerData)}</Text>
					<Text>Uuid : {device.uuids} </Text>
				</View>
			</View>
		);
	}

	showAlert(){
		Alert.alert(
			"Initiate Bridge Configuration",
			"Are you sure you are ready to initiate configuration of this Sure-Fi Bridge?",
			[
				{text: "Cancel",onPress : () => null},
				{text: "Continue",onPress : () => this.props.navigation.navigate("WriteBridgeConfiguration")}
			]
		);
	}

	resetState(){
		var {dispatch} = this.props;
		dispatch({type : RESET_QR_CENTRAL_STATE});
		dispatch({type : RESET_QR_REMOTE_STATE});
	}

	render(){
		
		var {devices,central_matched,remote_matched,central_device,remote_device} = this.props;
		
		if(central_matched){
			if(remote_matched){
				return(
					<ScrollView style={styles.pairContainer}>
						<Image  
							source={require('../images/temp_background.imageset/temp_background.png')} 
							style={styles.image_complete_container}
						>	
							<View style={styles.pairSectionsContainer}>
								<View style={styles.titleContainer}>
									<Text style={styles.title}>
										Central Unit
									</Text>
								</View>
								<View style={styles.touchableSectionContainer}>
									<View style={styles.touchableSection}>
										<View style={styles.touchableSectionInner}>
											<Image 
												source={require('../images/hardware_bridge.imageset/hardware_bridge.png')} 
												style={styles.touchableSectionInnerImage}
											>
											</Image>
											<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
												<Text >
													Sure-Fi Bridge Central
												</Text>
												<Text style={{fontSize:22}}>
													{central_device.manufactured_data.device_id.toUpperCase()}
												</Text>
											</View>
										</View>
									</View>
								</View>
							</View>
							<View style={styles.pairSectionsContainer}>
								<View style={styles.titleContainer}>
									<Text style={styles.title}>
										Remote Unit
									</Text>
								</View>
								<View style={styles.touchableSectionContainer}>
									<View style={styles.touchableSection}>
										<View style={styles.touchableSectionInner}>
											<Image 
												source={require('../images/hardware_bridge.imageset/hardware_bridge.png')} 
												style={styles.touchableSectionInnerImage}
											>
											</Image>
											<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
												<Text >
													Sure-Fi Bridge Remote
												</Text>
												<Text style={{fontSize:22}}>
													{remote_device.manufactured_data.device_id.toUpperCase()}
												</Text>
											</View>
										</View>
									</View>
								</View>
							</View>	
							<View style={styles.bigButtonContainer}>
								<TouchableHighlight onPress={() => this.resetState()} style={styles.bigRedButton}>
									<Text style={styles.bigGreenButtonText}>
										Reset Units
									</Text>
								</TouchableHighlight>
								<TouchableHighlight onPress={() => this.showAlert()} style={styles.bigGreenButton}>
									<Text style={styles.bigGreenButtonText}>
										Initiate Configuration
									</Text>
								</TouchableHighlight>

							</View>
						</Image>
					</ScrollView>
				);
			}else{
				return(
					<ScrollView style={styles.pairContainer}>
						<Image  
							source={require('../images/temp_background.imageset/temp_background.png')} 
							style={styles.image_complete_container}
						>	
							<View style={styles.pairSectionsContainer}>
								<View style={styles.titleContainer}>
									<Text style={styles.title}>
										Central Unit
									</Text>
								</View>
								<View style={styles.touchableSectionContainer}>
									<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
										<View style={styles.touchableSectionInner}>
											<Image 
												source={require('../images/hardware_bridge.imageset/hardware_bridge.png')} 
												style={styles.touchableSectionInnerImage}
											>
											</Image>
											<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
												<Text >
													Sure-Fi Bridge Central
												</Text>
												<Text style={{fontSize:22}}>
													{central_device.manufactured_data.device_id.toUpperCase()}
												</Text>
											</View>
										</View>
									</TouchableHighlight>
								</View>					
								<View style={{margin:5}}>
								</View>
								<View style={styles.touchableSectionContainer}>
									<TouchableHighlight onPress={()=> this.scanRemoteDevices()} style={styles.touchableSection}>
										<View style={styles.touchableSectionInner}>
											<Image 
												source={require('../images/hardware_select.imageset/hardware_select.png')} 
												style={styles.touchableSectionInnerImage}
											>
											</Image>
											<Text style={styles.touchableSectionInnerText}>
												Select Remote Unit
											</Text>
										</View>
									</TouchableHighlight>								
								</View>		
								
							</View>
						</Image>
					</ScrollView>
				);
			}
		}else{
			return(
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../images/hardware_select.imageset/hardware_select.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<Text style={styles.touchableSectionInnerText}>
											Select Central Unit
										</Text>
									</View>
								</TouchableHighlight>
							</View>							
						</View>
					</Image>
				</ScrollView>
			);	
		}
	}
}

const mapStateToProps = state => ({
  	central_matched : state.scanCentralReducer.central_device_matched,
  	central_device: state.scanCentralReducer.central_device,

  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device
});

export default connect(mapStateToProps)(PairBridge);