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
	FIND_PROGRAMING_NUMBER,
	DEC2HEX,
	CRC16,
	HEX_TO_BYTES
} from '../constants'
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

	}

	componentWillMount() {
		this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification );
	}

	componentDidMount() {
		if(this.view_kind == "normal")
			this.fetchFirmwareUpdate(this.firmware_file)
	}

	componentWillUnmount() {
		//this.handlerUpdate.remove()
	}

	fetchFirmwareUpdate(path){
		
		var {dispatch} = this.props		
		
		if(path){

			RNFetchBlob.fetch('GET', path,GET_HEADERS)
			.then((res) => {
				//console.log("file response on app",res)
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
				this.requestBootloaderInfo()
		  	})
		 	.catch((errorMessage, statusCode) => {
			    //console.log("ERROR",errorMessage)
			    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
			    // error handling 
		  	})
		}else{
			Alert.alert("File not found","The file firmware was not found.")
		}	
	}

	requestBootloaderInfo(){
		//console.log("requestBootloaderInfo()")
		this.write([8]) //should return a 7 on handleCharacteristicNotification
	}

	handleCharacteristicNotification(data){
		
		var {dispatch} = this.props
		var response = data.value[0]

		switch(response){
			case 0x01:
				//console.log("BleRsp_FirmwareVersion")
				return
			case 0x02:
				//console.log("BleRsp_QosConfig")
				return
			case 0x03:
				//console.log("BleRsp_UpdateStartSuccess")
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
					this.writeFirstPiece()
				return
			case 0x06: //Update Finish success
				if(this.props.viewKind == "normal")
					this.props.startNextUpdate("app")
				else{
					this.props.closeModal()
					Alert.alert("Success","The update was compled successfully")
				}
				return
			case 0x07:
				//console.log("BleRsp_BootloaderInfo")
				this.programNumber = FIND_PROGRAMING_NUMBER(data)
				this.writeStartUpdate(this.programNumber)
				return	
			case 0xE0:
				console.log("BleRsp_SecurityError")
				return
			case 0xE1:
				console.log("BleRsp_StartUpdateError")
				return
			case 0xE2:
				console.log("BleRsp_AlreadyStartedError")
				return
			case 0xE3:
				console.log("BleRsp_NotStartedError")
				return
			case 0xE4:
				console.log("BleRsp_InvalidNumBytesError")

				Alert.alert("Error","Error on firmware update")
				this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
				//this.errorProcessRows()
				return
			case 0xE5:
				console.log("BleRsp_PageFailure")
				Alert.alert("Error","Error on firmware update")
				this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
				return
			case 0xE6:
				console.log("BleRsp_ImageCrcFailureError")
				return
			case 0xE9:
				Alert.alert("Error","Error on firmware update")
				this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
				this.props.closeModal()					
				break

			default:
				console.log("No" + response + " option found")
			return
		}
	}

	writeFirstPiece(){
		var sum = 0
		var command = [5]
		
		while(this.current_row.length > 0){
			let page = this.current_row.splice(0,19)
			
			data = command.concat(page)
			this.writeWithoutResponse(data)
		}

		this.write([6])
	}


	write(data){
		let device = this.device;
		BleManagerModule.retrieveServices(device.id,() => {
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

	writeStartUpdate(programming_number){
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
		this.current_row = row.row
		this.write(
			[
				4,
				row.number.first,
				row.number.second,
				row.crc.first,
				row.crc.second,
				row.row_length.first,
				row.row_length.second
			]
		) // should excect a 5
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
								{progress.toFixed(2) * 100 } %
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
			var content = (
				<ActivityIndicator />
			)
		}
		return(
			<View style={{padding:50}}>
				{content}
			</View>
		)
	}

	getAdvanceView(){
		//console.log("this.props.firmware_files",this.props.firmware_files)
		return (
			<View>
				<View style={{height:100,width:width,marginVertical:5,marginBottom:20,alignItems:"center"}}>
					<View style={{padding:10,backgroundColor:"white",borderRadius:10}}>
						<Text style={{color:"black",fontSize:18,marginBottom:10}}>
							Bootloader App Data
						</Text>
						<Text>
							Upper CRC: 0000|0000 Version: 00.00 Prgm:0000
						</Text>
						<Text>
							Lower CRC: 0000|0000 Version: 00.00 Prgm:0000
						</Text>
					</View>
				</View>		
				<View>
					<SelectFirmwareCentral 
						device ={this.device}
						kind_firmware="application" 
						fetchFirmwareUpdate={(file) => this.fetchFirmwareUpdate(file)}
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
					<View style={{height:400}}>
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
});


export default connect(mapStateToProps)(AppFirmwareUpdate);