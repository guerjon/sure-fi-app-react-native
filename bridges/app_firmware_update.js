import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	TouchableHighlight,
  	Alert,
  	BackHandler
} from 'react-native'
import {styles,first_color,height,width,success_green,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	GET_HEADERS,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	DEC2HEX,
	CRC16,
	HEX_TO_BYTES,
	BYTES_TO_HEX,
	INCREMENT_PROGRAM_NUMBER,
	COMMAND,
	NOTIFICATION
} from '../constants'
import {LOG_INFO} from '../action_creators'
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectFirmwareCentral from './bridges_configuration/select_firmware_central'
import RNFetchBlob from 'react-native-fetch-blob'
import ProgressBar from 'react-native-progress/Bar';
import {
    NavigationActions
} from 'react-navigation'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class AppFirmwareUpdate extends Component{
	
	constructor(props) {
		super(props);
		this.device = props.device
		this.firmware_file = props.firmwareFile
		this.row_number = [0,0]
		this.current_row = {}
		this.write_status = 0
		this.view_kind = props.viewKind
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this);
		this.should_try_again = true
	}

	componentWillMount() {
		this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification );
	}

	componentDidMount() {
		if(this.view_kind == "normal")
			this.fetchFirmwareUpdate(this.firmware_file,this.props.version)
	}

	componentWillUnmount() {
		this.handlerUpdate.remove()
	}

	fetchFirmwareUpdate(path,version){
		console.log("fetchFirmwareUpdate()",path,version);
		var {dispatch} = this.props		
		
		if(path){

			RNFetchBlob.fetch('GET', path,GET_HEADERS)
			.then((res) => {
				console.log("file response on app",res)
			  	var byteCharacters = res.text()
			  	var byteArrays = [];
			  	var sliceSize = 2048
			  	
				for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				    const slice = byteCharacters.slice(offset, offset + sliceSize);
				    
				    const byteNumbers = new Array(slice.length);
				    for (let i = 0; i < slice.length; i++) {
				      byteNumbers[i] = slice.charCodeAt(i);
				    }
				    
				    byteArrays.push(byteNumbers);

				}	
				this.bytes_file = byteArrays;
				
				if(version){
					
					if(this.device.manufactured_data.hardware_type == "01")
						this.props.saveOnCloudLog(version,'FIRMWARE-CENTRAL-APPLICATION')
					else
						this.props.saveOnCloudLog(version,'FIRMWARE-REMOTE-APPLICATION')
				}	

				this.requestBootloaderInfo()

		  	})
		 	.catch((errorMessage, statusCode) => {
			    //console.log("ERROR",errorMessage)
			    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
			    // error handling 
		  	})
		}else{
			//Alert.alert("File not found","The file firmware was not found.")
		}	
	} 

	requestBootloaderInfo(just_request){
		console.log("requestBootloaderInfo()",just_request)
		if(just_request){
			this.just_request = just_request
		}
		this.write([0x08]) //should return a 7 on handleCharacteristicNotification
	}

	handleCharacteristicNotification(data){
		//console.log("data",data)
		var {dispatch} = this.props
		
		LOG_INFO(data.value,NOTIFICATION)

		var response = data.value[0]

		switch(response){
			case 0x03:
				this.startRow()
				return								
			case 0x04: 
				//console.log("BleRsp_PageSuccess")
				this.write_status = 0
				this.calculateProgress()
				if(this.new_rows.length > 0)
					this.processRows()
				else{
					this.write([7])
				}
				return
			case 0x05:
				//console.log("BleRsp_GenericOk")
					this.should_try_again = true
					this.writeFirstPiece()
				return
			case 0x06: //Update Finish success
				if(this.props.viewKind == "normal"){
					this.props.startNextUpdate("app") // app is the current firmware update
				}
				else{
					this.props.closeModal()
					Alert.alert("Success","The update was compled successfully")
				}
				return
			case 0x07:
				console.log("BleRsp_BootloaderInfo")
				data.value.shift()

				this.checkBootloaderInfo(data.value)
				
				if(this.just_request)
					this.writeStartUpdate()
				return	

			case 0xE0:
				Alert.alert("Error","BleRsp_SecurityError")
				return
			case 0xE1:
				Alert.alert("Error","BleRsp_StartUpdateError")
				return
			case 0xE2:
				Alert.alert("Error","BleRsp_AlreadyStartedError")
				return
			case 0xE3:
				Alert.alert("Error","BleRsp_NotStartedError")
				return
			case 0xE4:
				console.log("BleRsp_InvalidNumBytesError")
				this.errorHandleRow()
				return
			case 0xE5:
				console.log("")
				Alert.alert("Error","BleRsp_PageFailure")
				return
			case 0xE6:
				Alert.alert("Error","BleRsp_ImageCrcFailureError")
				return
			case 0xE9:
				Alert.alert("Error","UnsupportedCMD")
				break
			default:
				console.log("No " + response + " option found")
			return
		}
	}

	handleKindOfView(file){
		console.log("handleKindOfView()");

		if(this.view_kind == "normal"){
			this.fetchFirmwareUpdate(file,this.props.version)
		}else{
			var path = file.firmware_path
			var version = file.firmware_version
			this.fetchFirmwareUpdate(path,version)
		}
	}

	getBootLoaderData(data){

		var bootloader_info =
		{
			"lowerReadCrc" : BYTES_TO_HEX(data.slice(0,2)).toUpperCase(),
			"lowerCalcCrc" : BYTES_TO_HEX(data.slice(2,4)).toUpperCase(),
			"lowerVersionMajor" : BYTES_TO_HEX(data.slice(4,5)).toUpperCase(),
			"lowerVersionMinor" : BYTES_TO_HEX(data.slice(5,6)).toUpperCase(),
			"lowerVersionBuild" : BYTES_TO_HEX(data.slice(6,7)).toUpperCase(),
			"lowerProgramNumber" : BYTES_TO_HEX(data.slice(7,8)).toUpperCase(),
			"upperReadCrc" : BYTES_TO_HEX(data.slice(8,10)).toUpperCase(),
			"upperCalcCrc" : BYTES_TO_HEX(data.slice(10,12)).toUpperCase(),
			"upperVersionMajor" : BYTES_TO_HEX(data.slice(12,13) ).toUpperCase(),
			"upperVersionMinor" : BYTES_TO_HEX(data.slice(13,14)).toUpperCase(),
			"upperVersionBuild" : BYTES_TO_HEX(data.slice(14,15)).toUpperCase(),
			"upperProgramNumber" : BYTES_TO_HEX(data.slice(15,16)).toUpperCase(),
			"bootingUpperMemory" : BYTES_TO_HEX(data.slice(16)).toUpperCase(),
		}
		
		return bootloader_info
	}

	updateBootLoaderInfo(bootloader_info){
		console.log("updateBootLoaderInfo()")
		this.props.dispatch({type:"SET_BOOTLOADER_INFO",bootloader_info:bootloader_info})
	}

	checkBootloaderInfo(bootloader_info){
		
		var bootloader_data = this.getBootLoaderData(bootloader_info)
		console.log("checkBootloaderInfo()",bootloader_data)

		if(bootloader_data.lowerReadCrc == "0000" && bootloader_data.upperReadCrc == "0000"){
			console.log("1")
			this.write([0x1C])
		}else{		
			console.log("2")
			this.updateBootLoaderInfo(bootloader_data)
			this.programNumber = this.calculateProgramingNumber(bootloader_data)
			this.requestBootloaderInfo(true)
		}
	}

	calculateProgramingNumber(bootloader_info){
		console.log("calculateProgramingNumber()",bootloader_info)
		var {
			lowerProgramNumber,
			upperProgramNumber,
			lowerReadCrc,
			lowerCalcCrc,
			upperReadCrc,
			upperCalcCrc,
			bootingUpperMemory
		} = bootloader_info

		console.log("lowerProgramNumber",lowerProgramNumber)
		if(lowerProgramNumber == "FF") {
			console.log("1")
		    lowerProgramNumber = "00"
		}
		console.log("upperProgramNumber",upperProgramNumber)
		if( upperProgramNumber == "FF" ){
			console.log("2")
		    upperProgramNumber = "00"
		}

		console.log("lowerReadCrc",lowerReadCrc)
		console.log("lowerCalculatedCrc",lowerCalcCrc)

		if( lowerReadCrc == lowerCalcCrc) {
			console.log("3")
		    lowerProgramNumber = INCREMENT_PROGRAM_NUMBER(lowerProgramNumber)
		}

		console.log("upperReadCrc",upperReadCrc)
		console.log("upperCalcCrc",upperCalcCrc)

		if (upperReadCrc == upperCalcCrc){
			console.log("4")
		    upperProgramNumber = INCREMENT_PROGRAM_NUMBER(upperProgramNumber)
		}
		console.log("bootingUpperMemory",bootingUpperMemory)
		if( bootingUpperMemory == "00") {
			console.log("5 ---", lowerProgramNumber)

			return lowerProgramNumber
		}else if  (bootingUpperMemory == "01") {

			console.log("6 ---", upperProgramNumber)

			return upperProgramNumber
		}

		else {
			console.log("CRC ERROR","Error Updating Firmware. CRC Error on Bridge Device")
		    return 0
		}	
	}

	write(data){
		let device = this.device;

		BleManagerModule.retrieveServices(device.id,() => {
			LOG_INFO(data,COMMAND)
			BleManagerModule.specialWrite(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
		})
	}

	writeWithoutResponse(data){
		let device = this.device;
		BleManagerModule.specialWriteWithoutResponse(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20,16)
	}

	calculateProgress(){
		var {dispatch} = this.props
		var columnas_restantes =  this.new_rows.length
		var columnas_totales = rows_to_write

		var restante = 1 - (columnas_restantes / columnas_totales);

		dispatch({type: "CHANGE_PROGRESS", new_progress: restante})
	}

	writeStartUpdate(){
		this.props.dispatch({type: "START_UPDATE"})
		this.write([3]) // should expect a 3 on handleCharacteristic Notification
	}

	startRow(){
		if(this.bytes_file){
			let rows = this.bytes_file
			new_rows = []
			rows.map(row => {
				let pages = this.cutRowToPages(row)
				new_rows.push(pages)
			})  

			this.new_rows = new_rows

			rows_to_write = this.new_rows.length
			
			this.processRows()
		}else{
			console.log("There are not bytes_file")	
		}
	}

	cutRowToPages(row){

		var {dispatch} = this.props

		var row_number = this.row_number
		
		var first_number = row_number[0]
		var second_number = row_number[1]

		if(first_number == 0 && second_number == 0){
			console.log("entro aqui en app -------",this.programNumber)
			row[3] = this.programNumber[0]
			row[2] = this.programNumber[1]
		}

		var hex_lenght = DEC2HEX(row.length)
		var byte_lenght = HEX_TO_BYTES(DEC2HEX(row.length))
		var row_length = byte_lenght
		let curt_pages = []
		let crc = HEX_TO_BYTES(DEC2HEX(CRC16(row)))

		var json = 
			{
				command: 4,
				number : {
					first :  first_number,
					second : second_number
				},
				crc : {
					first:  crc[0],
					second: crc[1]
				},
				row_length: {
					first : row_length[0],
					second: row_length[1] ? row_length[1] : 0
				},
				row: row
			}
		this.sumRow()
		return json
	}

	sumRow(){
		var row_number = this.row_number
		let first_num = row_number[0]
		let second_num = row_number[1]

		if(second_num >= 255){
			if(first_num >= 255){
			  console.log("error on firmwareReducer you can't sum anymore")
			}else{
			  first_num = first_num + 1 
			}
		}else{
			second_num = second_num + 1
		}
		this.row_number = [first_num,second_num]
	}	

	processRows(){	
		console.log("processRows()")
		if(this.new_rows){
			if(this.new_rows.length > 0){
				this.new_current_row = this.new_rows.shift()
				this.processRow(this.new_current_row) //solo pasamos la primer row de new_rows donde estan todos a processRow	
			}else{
				console.log("entra aqui 1")
				this.new_rows = null;
				this.write([7]) //finish the rows sending
			}
		}else{
			console.log("there is not rows array on processRows")
		}
	}

	processRow(row){
		console.log("processRow()")
		this.current_row = row.row
		this.write(
			[
				0x04,
				row.number.first,
				row.number.second,
				row.crc.first,
				row.crc.second,
				row.row_length.first,
				row.row_length.second
			]
		) // should excect a 5
	}

	writeFirstPiece(){
		console.log("writeFirstPiece()")
		var sum = 0
		var command = [5]
		var current_row = this.current_row.slice(0)
		while(current_row.length > 0){
			let page = current_row.splice(0,19)
			
			data = command.concat(page)
			this.writeWithoutResponse(data)
		}

		setTimeout(() => this.write([0x06]),2000) // you should wait a 0x0B if all is ok
	}


	errorHandleRow(){
		console.log("errorHandleRow()")
		//console.log("this.new_current_row",this.new_current_row)
		this.processRow(this.new_current_row)
	}	

	getStartRow(){
		var {progress,app_version} = this.props 

		if(progress > 0){

			var content = (
				<View style={{backgroundColor:"white",width:width,height:100,alignItems:"center"}}>
					<View style={{justifyContent:"space-between"}}>
						<View>
							<Text style={{fontSize:16,padding:10,textAlign:"center"}}>
								Updating App
							</Text>
						</View>
						<View style={{padding:10}}>
							<Text style={{textAlign:"center"}}>
								{Math.trunc(progress * 100)} %
							</Text>
						</View>
					</View>
					<View >
						<View >
							<ProgressBar progress={progress} width={width-60} height={5} borderRadius={5} color={option_blue}/>
						</View>
					</View>
				</View>
			)
		}else{
			return null
		}
		return(
			<View style={{padding:50}}>
				{content}
			</View>
		)
	}

	getAdvanceView(){
		console.log("getAdvanceView()")
		//console.log("this.props.firmware_files",this.props.firmware_files)
		var bi = this.props.bootloader_info

		return (
			<View style={{alignItems:"center"}}>
				<View style={{height:100,width:width-20,marginVertical:5,marginBottom:20,alignItems:"center",borderWidth:1,borderRadius:10}}>
					<View style={{padding:10,backgroundColor:"white",borderRadius:10}}>
						<View style={{flexDirection:"row",justifyContent:"space-between"}}>
							<Text style={{color:"black",fontSize:18,marginBottom:10}}>
								Bootloader App Data
							</Text>
							<TouchableHighlight onPress={() => this.requestBootloaderInfo(true)} style={{borderColor:option_blue, borderWidth:2,alignItems:"center",justifyContent:"center",borderRadius:10}}> 
								<Text style={{color:option_blue,fontSize:10,paddingVertical:5,paddingHorizontal:5}}>
									Refresh
								</Text>
							</TouchableHighlight >
						</View>
						<Text>
							Upper CRC: {bi.upperReadCrc} | {bi.upperCalcCrc} Version: {bi.upperVersionMajor}.{bi.upperVersionMinor} Prgm:{bi.upperProgramNumber}
						</Text>
						<Text>
							Lower CRC: {bi.lowerReadCrc}|{bi.lowerCalcCrc} Version: {bi.lowerVersionMajor}.{bi.lowerVersionMinor}  Prgm:{bi.lowerProgramNumber}
						</Text>
					</View>
				</View>		
				<View>
					<SelectFirmwareCentral 
						device ={this.device}
						kind_firmware="application" 
						fetchFirmwareUpdate={(file) => this.handleKindOfView(file)}
						getStartRow={() => this.getStartRow()}
						firmware_files={this.props.firmware_files}
					/>
				</View>
			</View>
		)
	}

	render(){
		return(
			<View>
				<View style={{alignItems:"center"}}>
					<View style={{backgroundColor:"white"}}>
						{this.props.viewKind == "normal" ? this.getStartRow() : this.getAdvanceView()}				
					</View>
				</View>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
    firmware_update_state: state.firmwareUpdateReducer.firmware_update_state,
    progress: state.firmwareUpdateReducer.progress,
    app_version : state.setupCentralReducer.app_version,
    active_tab : state.updateFirmwareCentralReducer.active_tab,
    bootloader_info : state.updateFirmwareCentralReducer.bootloader_info
});


export default connect(mapStateToProps)(AppFirmwareUpdate);