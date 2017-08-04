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
	FlatList,
	
} from 'react-native'
import {styles,first_color,width,height} from '../../styles/index.js'
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
				text: "Development"
			}
		case 2 : //beta
			return {
				style: {
					color : "orange"	
				},
				text: "Release"
				
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

	static navigationOptions = {
		title : "Select Firmware File",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		this.device = this.props.device
		this.firwmare_files = this.props.firmware_files
		this.dispatch = this.props.dispatch
	}

	componentWillMount() {
		this.props.dispatch({type: "PARTIAL_RESET_FIRMWARE_CENTRAL_REDUCER"})
	}

	sortByFirmwareVersion(files){
		var order_files = files.sort((a,b) => b.firmware_version.localeCompare(a.firmware_version))
		//console.log(order_files)
		return order_files;
	}

	renderFirmwareFileList(firmware_files){
		//console.log("renderFirmwareFileList",firmware_files)
		return (
			<ScrollView >
				<FlatList
					data={firmware_files} 
					renderItem={
						(item) => this.listItem(item) 
					} 
					keyExtractor={(item,index) => item.firmware_id }/>
			</ScrollView>
		)
	}

	listItem(item){

		var file = item.item
		var values = selectValues(file.firmware_status)
		
		return( 
			<View style={{flexDirection:"row",flex:1}}>
				<View style={{backgroundColor:values.style.color,width:80,alignItems:"center",justifyContent:"center",borderBottomWidth:0.3}}>
					<Text style={{color:"white",fontSize:12}}>
						{values.text}
					</Text>
				</View>
				<TouchableHighlight
					style={{backgroundColor:"white",borderBottomWidth:0.3,width:(width-80)}} 
					onPress={() => this.changeRender(file) }
				>
					<View style={{paddingLeft:15,paddingTop:10}}>
						<Text>
							{file.firmware_title} {file.firmware_version}
						</Text>
						<Text>
							{file.firmware_description.substr(0,30)} ...
						</Text>
					</View>
				</TouchableHighlight>
			</View>
		)
	}


	changeRender(file){
		Alert.alert(
			"Select this Firmware?",
			"Are you sure to select this firmware to update?",
			[
				{text: "Cancel",onPress : () => this.deleteFiles() },
				{text: "Continue",onPress : () => this.props.fetchFirmwareUpdate(file)}
			]
		)
	}

	deleteFiles(){
		this.dispatch({type: "DELETE_FIRMWARE_SELECTED"})
		this.dispatch({type: "DELETE_CENTRAL_FIRMWARE_FILE"})
	}

	render(){

		if(this.props.update_status == "without_activity"){

			if(this.props.firmware_files){
				var content = this.renderFirmwareFileList(this.props.firmware_files)
			}
			else{
				var content = <ActivityIndicator/>
			}

			return(
				<View>
					<View style={{marginBottom:40}}>
						{content}
					</View>
				</View>
			);			
		}else{
			
			return this.props.getStartRow()
		}

	}
}


const mapStateToProps = state => ({
	download_firmware_files : state.selectFirmwareCentralReducer.download_firmware_files,
	central_firmware_file_selected : state.selectFirmwareCentralReducer.central_firmware_file_selected,
	update_status : state.selectFirmwareCentralReducer.update_status
});

export default connect(mapStateToProps)(selectFirmwareFile)