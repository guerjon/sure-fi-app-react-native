import React, {Component} from 'react'
import {
	View,
	Text,
	Image,
	StyleSheets,
	ScrollView,
	TouchableHighlight,
	ActivityIndicator,
	Alert,
	FlatList

} from 'react-native'
import {styles,first_color} from '../../styles/index.js'
import {connect} from 'react-redux'
import {
	FIRMWARE_CENTRAL_ROUTE
} from '../../constants'


function selectValues(status){
	status = parseInt(status, 10)
	switch(status){
		case 0 : //development
			return {
				style : {
					color: "blue"
				},
				text : "Developmnet"
			}
		case 1 : //release
			return {
				style: {
					color: "green"	
				},
				text: "Release"
			}
		case 2 : //beta
			return {
				style: {
					color : "orange"	
				},
				text: "Beta"
				
			}
		case 3: //Deprecated
			return {
				style: {
					color : "red"
				},
				text: "Deprecated"
			}
		default:
			return {
				color : "white",
				text: "Error"
			}
	}
}


class selectFirmwareFile extends Component{

	componentDidMount() {
		this.dispatch = this.props.dispatch
		this.navigate = this.props.navigation.navigate
		this.downloadFirmwareFiles()
	}

	static navigationOptions = {
		title : "Select Firmware File",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	downloadFirmwareFiles(){
		var dispatch = this.dispatch;

		dispatch({type:"DOWNLOADING_FIRMWARE_FILES"})

		dispatch({type: "FETCH_STATUS_LOADING"})

		var body = JSON.stringify({
			hardware_type_key : "eaa4c810-e477-489c-8ae8-c86387b1c62e",
			firmware_type : this.props.kind_firmware
		})

		fetch(FIRMWARE_CENTRAL_ROUTE, {
			headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json',				
			},
			method: 'POST',
			body : body
		})
		.then((response) => response.json())
      	.then((responseJson) => {
      		

	        if(responseJson.status == "success"){
	        	let files = responseJson.data.files.sort()
	        	
		        dispatch({type: "DOWNLOADED_FIRMWARE_FILES",central_firmware_files : files })
	        }else{
	        	console.log(responseJson)
	        }
      	})
		.catch((error) => {
		  console.warn(error);
		});


	}

	getFirmwareList(central_firmware_files,dispatch,central_firmware_file_selected){

		return (
			<ScrollView style={{paddingBottom: 50}}>
				<FlatList 
					data={central_firmware_files} 
					renderItem={
						(item) => this.listItem(item) 
					} 
					extraData ={central_firmware_file_selected}
					keyExtractor={(item,index) => item.firmware_id }/>
			</ScrollView>
		)
	}

	listItem(item){
		var file = item.item
		var file_selected = this.props.central_firmware_file_selected
		var backgroundColor = file.firmware_id == file_selected.firmware_id ? "#CCCCCC" :"white" 
		var values = selectValues(file.firmware_status)

		return( 
			<TouchableHighlight 
				style={{backgroundColor:backgroundColor,marginVertical:5}} 
				onPress={() => this.changeRender(file) }
			>
				<View style={{padding:30}}>
					<Text>
						{file.firmware_title}
					</Text>
					<Text>
						{file.firmware_description}
					</Text>
					<Text style={values.style}>
						{values.text}
					</Text>
					<Text>
						{file.firmware_version}
					</Text>
				</View>
			</TouchableHighlight>
		)
	}

	changeRender(file){
		this.dispatch({type: "SET_CENTRAL_FIRMWARE_FILE", firmware_file : file})
		Alert.alert(
			"Select this Firmware?",
			"Are you sure to select this firmware to update?",
			[
				{text: "Cancel",onPress : () => this.deleteFiles() },
				{text: "Continue",onPress : () => this.props.navigation.goBack()}
			]
		)
	}

	deleteFiles(){
		this.dispatch({type: "DELETE_FIRMWARE_SELECTED"})
		this.dispatch({type: "DELETE_CENTRAL_FIRMWARE_FILE"})
	}

	render(){
		
		var {central_firmware_file_selected,dispatch,download_firmware_files,central_firmware_files} = this.props;
		

		if(download_firmware_files == "inactive" || download_firmware_files == "downloaded"){
			var content = <View style={{flex:1,alignItems:"center",justifyContent:"center"}} ><ActivityIndicator /></View>
		}

		if(download_firmware_files == "downloaded"){
			var content = this.getFirmwareList(central_firmware_files,dispatch,central_firmware_file_selected)
		}

		return(
			<Image  
				source={require('../../images/temp_background.imageset/temp_background.png')} 
				style={styles.image_complete_container}
			>					
				<ScrollView style={{flex:1}}>
					{content}	
				</ScrollView>
			</Image>
		);
	}
}


const mapStateToProps = state => ({
	download_firmware_files : state.selectFirmwareCentralReducer.download_firmware_files,
	central_firmware_files : state.selectFirmwareCentralReducer.central_firmware_files,
	central_firmware_file_selected : state.selectFirmwareCentralReducer.central_firmware_file_selected,
	kind_firmware : state.selectFirmwareCentralReducer.kind_firmware
});

export default connect(mapStateToProps)(selectFirmwareFile)