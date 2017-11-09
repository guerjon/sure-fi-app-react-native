export const COMMAND_GET_DEVICE_DATA = 0x08
export const COMMAND_GET_FIRMWARE_VERSION = 0x01
export const COMMAND_GET_RADIO_FIRMWARE_VERSION = 0x02
export const COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION = 0x1B
export const COMMAND_GET_RADIO_SETTINGS = 0x09
export const COMMAND_GET_VOLTAGE = 0X1E
export const COMMAND_MAKE_DEPLOY = 0x1F
export const COMMAND_FORCE_UNPAIR = [0x20,0x01]

export const COMMAND_GET_DEBUG_MODE_STATUS = 0x29

export const COMMAND_START_FIRWMARE_UPDATE = 0x03
export const COMMAND_START_ROW = 0x04
export const COMMAND_ROW_PIECE = 0x05
export const COMMAND_END_ROW = 0x06
export const COMMAND_FINISH_FIRMWARE_UPDATE = 0x07

export const COMMAND_GET_REGISTERED_BOARD_1 = 0x18
export const COMMAND_GET_REGISTERED_BOARD_2 = 0x19

export const COMMAND_GET_APP_PIC_VERSION = 0x33
export const COMMAND_GET_RADIO_PIC_VERSION = 0x34

export const COMMAND_START_MSG_PACKAGE = 0x30
export const COMMAND_PACKAGE_MSG_PIECE = 0x31
export const COMMAND_SEND_MSG_PACKAGE = 0x32


export const COMMAND_GET_HOPPING_TABLE = 0X2F


export const COMMAND_GET_BOOTLOADER_INFO = 0X08
export const COMMAND_GET_ALL_VERSIONS = 0x2D

export const COMMAND_GET_RUN_TIME = 0x38
export const COMMAND_RESET_RUN_TIME = 0x39
export const COMMAND_GET_SETTIAL_SETTINGS = 0x3A
export const COMMAND_SET_SERIAL_SETTINGS = 0x3B


export const COMMANDS = 
[
    [0x01, "GetFirmwareVersion"],            
    [0x02, "GetRadioFirmwareVersion"],       
    [0x03, "DFU_StartFirmwareUpdate"],       
    [0x04, "DFU_StartRow"],                  
    [0x05, "DFU_RowPiece"],                  
    [0x06, "DFU_EndRow"],                    
    [0x07, "DFU_FinishFirmwareUpdate"],      
    [0x08, "GetBootloaderInfo"],             
    [0x09, "GetRadioSettings"],              
    [0x0A, "SetRadioSettings"],              
    [0x0B, "GetQosConfig"],                  
    [0x0C, "SetQosConfig"],                  
    [0x0D, "DFU_RadioStartFirmwareUpdate"],  
    [0x0E, "DFU_RadioStartRow"],             
    [0x0F, "DFU_RadioRowPiece"],             
    [0x10, "DFU_RadioEndRow"],               
    [0x11, "DFU_RadioFinishFirmwareUpdate"], 
    [0x12, "RegisterName"],                  
    [0x13, "RegisterBoard1"],                
    [0x14, "RegisterBoard2"],                
    [0x15, "Register"],                      
    [0x16, "Unregister"],                    
    [0x17, "GetRegisteredName"],             
    [0x18, "GetRegisteredBoard1"],           
    [0x19, "GetRegisteredBoard2"],           
    [0x1A, "StartBootloader"],               
    [0x1B, "GetBluetoothVersion"],           
    [0x1C, "ResetApplicationBoard"],         
    [0x1D, "GetAllState"],                   
    [0x1E, "GetVoltageLevels"],              
    [0x1F, "Deploy"],                        
    [0x20, "ForceNextPair"],                 
    [0x21, "GetPairResult"],                 
    [0x22, "GetUnpairResult"],               
    [0x23, "SetFailSafeOption"],             
    [0x24, "GetFailSafeOption"],             
    [0x25, "GetOperatingValues"],            
    [0x26, "GetResetCauses"],                
    [0x27, "ClearResetCauses"],        
	[0x28,"SetDebugModeEnabled"],
	[0x29,"GetDebugModeEnabled"],
	[0x2A,"GetLastPacketTime"],
	[0x2B,"TestWriteRegister"],
	[0x2C,"TestReadRegister"],
	[0x2D,"GetAllVersions"],
	[0x2E,"GetRadioUpdateStatus"],
	[0x2F,"GetHoppingTable"],
	[0x30,"StartPacket"],
	[0x31,"PacketPiece"],
	[0x32,"SendPacket"],
	[0x33,"GetAppPicVersion"],
	[0x34,"GetRadioPicVersion"],
	[0x35,"SetCriticalBluetooth"],
	[0x36,"SetWiegandLedMode"],
	[0x37,"GetWeigandLedMode"],
];

export const RESPONSES =
[
    [0x01, "FirmwareVersion"],
    [0x02, "QosConfig"],                 
    [0x03, "UpdateStartSuccess"],        
    [0x04, "PageSuccess"],               
    [0x05, "GenericOk"],                 
    [0x06, "UpdateFinishSuccess"],       
    [0x07, "BootloaderInfo"],            
    [0x08, "RadioSettings"],             
    [0x09, "RadioFirmwareVersion"],      
    [0x0A, "RadioUpdateStartSuccess"],   
    [0x0B, "RadioPageSuccess"],          
    [0x0C, "RadioGenericOk"],            
    [0x0D, "RadioUpdateFinishSuccess"],  
    [0x0E, "RegisterSuccess"],           
    [0x0F, "RegisteredName"],            
    [0x10, "RegisteredBoard1"],          
    [0x11, "RegisteredBoard2"],          
    [0x12, "BluetoothVersion"],          
    [0x13, "AllState"],                  
    [0x14, "Voltages"],                  
    [0x15, "DeploySuccess"],             
    [0x16, "PairResult"],                
    [0x17, "UnpairResult"],              
    [0x18, "FailSafeOption"],            
    [0x19, "OperatingValues"],           
    [0x1A, "ResetCauses"],               
    [0x1B, "DebugModeEnabled"],
    [0x1C,"LastPacketTime"],
    [0x1D,"TestRegisterValue"],
    [0x1E,"AllVersions"],
    [0x1F,"RadioUpdateStatus"],
    [0x20,"HoppingTable"],
    [0x21,"PacketSending"],
    [0x22,"PacketComplete"],
    [0x23,"PacketReceived"],
    [0x24,"PacketPiece"],
    [0x25,"AppPicVersion"],
    [0x26,"RadioPicVersion"],
    [0x27,"WiegandLedMode"],
    [0xE0, "SecurityError"],
    [0xE1, "StartUpdateError"],     
    [0xE2, "AlreadyStartedError"],  
    [0xE3, "NotStartedError"],      
    [0xE4, "InvalidNumBytesError"], 
    [0xE5, "PageFailure"],          
    [0xE6, "ImageCrcFailureError"], 
    [0xE7, "RegisterFailure"],      
    [0xE8, "DeployFailure"],        	

];

export const ACTIONS = [
    [0xA1, "SURE-FI Bridge"],
    [0xA2, "SURE-FI Bridge"],
    [0xA3, "SURE-FI Bridge"],
    [0xA4, "DFU"]
]
