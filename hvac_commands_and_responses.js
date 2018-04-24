// +==============================+
// |       Get Information        |
// +==============================+
export const PhoneCmd_GetRadioVersion = 0x20;
export const PhoneCmd_GetAppVersion = 0x21;
export const PhoneCmd_GetBluetoothVersion = 0x22;
export const PhoneCmd_GetBootloaderInfo = 0x23;
export const PhoneCmd_GetRegistration = 0x24;
export const PhoneCmd_GetVoltageLevels = 0x25;
export const PhoneCmd_GetOperatingValues = 0x26;
export const PhoneCmd_GetResetCauses = 0x27;
export const PhoneCmd_GetLastPacketTime = 0x28;
export const PhoneCmd_GetRadioUpdateStatus = 0x29;
export const PhoneCmd_GetHoppingTable = 0x2A;
export const PhoneCmd_GetRunTime = 0x2B;
export const PhoneCmd_GetPairingInfo = 0x2C
export const PhoneCmd_GetPowerOnTime = 0x2D

// +==============================+
// |           Run-Time           |
// +==============================+
export const PhoneCmd_SecurityHash = 0x40;
export const PhoneCmd_FactoryReset = 0x41;
export const PhoneCmd_Register = 0x42;
export const PhoneCmd_ResetApplication = 0x43;
export const PhoneCmd_Pair = 0x44;
export const PhoneCmd_GetPairResult = 0x45;
export const PhoneCmd_Unpair = 0x46;
export const PhoneCmd_GetUnpairResult = 0x47;
export const PhoneCmd_ClearResetCauses = 0x48;
export const PhoneCmd_ResetRunTime = 0x49;
// +==============================+
// |       Firmware Update        |
// +==============================+
export const PhoneCmd_RadioStartFirmwareUpdate = 0x60;
export const PhoneCmd_RadioStartRow = 0x61;
export const PhoneCmd_RadioRowPiece = 0x62;
export const PhoneCmd_RadioEndRow = 0x63;
export const PhoneCmd_RadioFinishFirmwareUpdate = 0x64;
export const PhoneCmd_AppStartFirmwareUpdate = 0x65;
export const PhoneCmd_AppStartRow = 0x66;
export const PhoneCmd_AppRowPiece = 0x67;
export const PhoneCmd_AppEndRow = 0x68;
export const PhoneCmd_AppFinishFirmwareUpdate = 0x69;
export const PhoneCmd_StartBleBootloader = 0x6A;
// +==============================+
// |             Set              |
// +==============================+
export const PhoneCmd_SetActivated = 0x80;
export const PhoneCmd_SetRadioSettings = 0x81;
export const PhoneCmd_SetLedsEnabled = 0x82;
export const PhoneCmd_SetFailSafeOption = 0x83;
export const PhoneCmd_SetDebugModeEnabled = 0x84;
export const PhoneCmd_SetQuietMode = 0x85;
export const PhoneCmd_SetWiegandLedMode = 0x86;
export const PhoneCmd_SetDemoModeTime = 0x87;
export const PhoneCmd_SetHeartbeatTime = 0x88;
// +==============================+
// |             Get              |
// +==============================+
export const PhoneCmd_GetActivated = 0xA0;
export const PhoneCmd_GetRadioSettings = 0xA1; 
export const PhoneCmd_GetLedsEnabled = 0xA2;
export const PhoneCmd_GetFailSafeOption = 0xA3;
export const PhoneCmd_GetDebugModeEnabled = 0xA4;
export const PhoneCmd_GetQuietMode = 0xA5;
export const PhoneCmd_GetWiegandLedMode = 0xA6;
export const PhoneCmd_GetDemoModeTime = 0xA7;
export const PhoneCmd_GetHeartbeatTime = 0xA8

// +============================================================+
// |         				Responses          					|
// +============================================================+

// +==============================+
// |         Information          |
// +==============================+
export const PhoneRsp_RadioVersion = 0x20;
export const PhoneRsp_AppVersion = 0x21;
export const PhoneRsp_BluetoothVersion = 0x22;
export const PhoneRsp_BootloaderInfo = 0x23;
export const PhoneRsp_Registration = 0x24;
export const PhoneRsp_VoltageLevels = 0x25;
export const PhoneRsp_OperatingValues = 0x26;
export const PhoneRsp_ResetCauses = 0x27;
export const PhoneRsp_LastPacketTime = 0x28;
export const PhoneRsp_RadioUpdateStatus = 0x20;
export const PhoneRsp_HoppingTable = 0x2A;
export const PhoneRsp_RunTime = 0x2B;
export const PhoneRsp_PairingInfo = 0x2C;
export const PhoneRsp_PowerOnTime = 0x2D;

// +==============================+
// |           Run-Time           |
// +==============================+
export const PhoneRsp_PairResult = 0x45;
export const PhoneRsp_UnpairResult = 0x47;
// +==============================+
// |       Success/Failure        |
// +==============================+
export const PhoneRsp_Success = 0x80;
export const PhoneRsp_Failure = 0x81;
export const PhoneRsp_UartTimeout = 0x82;
// +==============================+
// |           Settings           |
// +==============================+
export const PhoneRsp_Activated = 0xA0;
export const PhoneRsp_RadioSettings = 0xA1;
export const PhoneRsp_LedsEnabled = 0xA2;
export const PhoneRsp_FailSafeOption = 0xA3;
export const PhoneRsp_DebugModeEnabled = 0xA4;
export const PhoneRsp_QuietMode = 0xA5;
export const PhoneRsp_WiegandLedMode = 0xA6;
export const PhoneRsp_DemoModeTime = 0xA7;
export const PhoneRsp_HeartbeatTime = 0xA8

// +============================================================+
// |         				Errors          					|
// +============================================================+

export const PhoneError_ValueTooLow      = 0x01;
export const PhoneError_ValueTooHigh     = 0x02;
export const PhoneError_InvalidValue     = 0x03;
export const PhoneError_PayloadTooLarge  = 0x04;
export const PhoneError_PayloadTooSmall  = 0x05;
export const PhoneError_Busy             = 0x06;
export const PhoneError_InvalidSettings  = 0x07;
export const PhoneError_NotFccApproved   = 0x08;
export const PhoneError_AlreadyStarted   = 0x09;
export const PhoneError_Unsupported      = 0x0A;
export const PhoneError_NotStarted       = 0x0B;
export const PhoneError_Security         = 0x0C;
export const PhoneError_TooMany          = 0x0D;


export const get_codes = [
	[PhoneCmd_GetRadioVersion,"PhoneCmd_GetRadioVersion"],
	[PhoneCmd_GetAppVersion,"PhoneCmd_GetAppVersion"],
	[PhoneCmd_GetBluetoothVersion,"PhoneCmd_GetBluetoothVersion"],
	[PhoneCmd_GetBootloaderInfo,"PhoneCmd_GetBootloaderInfo"],
	[PhoneCmd_GetRegistration,"PhoneCmd_GetRegistration"],
	[PhoneCmd_GetVoltageLevels,"PhoneCmd_GetVoltageLevels"],
	[PhoneCmd_GetOperatingValues,"PhoneCmd_GetOperatingValues"],
	[PhoneCmd_GetResetCauses,"PhoneCmd_GetResetCauses"],
	[PhoneCmd_GetLastPacketTime,"PhoneCmd_GetLastPacketTime"],
	[PhoneCmd_GetRadioUpdateStatus,"PhoneCmd_GetRadioUpdateStatus"],
	[PhoneCmd_GetHoppingTable,"PhoneCmd_GetHoppingTable"],
	[PhoneCmd_GetRunTime,"PhoneCmd_GetRunTime"],
	[PhoneCmd_GetActivated,"PhoneCmd_GetActivated"],
	[PhoneCmd_GetRadioSettings,"PhoneCmd_GetRadioSettings"],
	[PhoneCmd_GetLedsEnabled,"PhoneCmd_GetLedsEnabled"],
	[PhoneCmd_GetFailSafeOption,"PhoneCmd_GetFailSafeOption"],
	[PhoneCmd_GetDebugModeEnabled,"PhoneCmd_GetDebugModeEnabled"],
	[PhoneCmd_GetQuietMode,"PhoneCmd_GetQuietMode"],
	[PhoneCmd_GetWiegandLedMode,"PhoneCmd_GetWiegandLedMode"],
	[PhoneCmd_GetDemoModeTime,"PhoneCmd_GetDemoModeTime"],	
]

export const error_codes = [
	[PhoneError_ValueTooLow,"PhoneError_ValueTooLow"],
	[PhoneError_ValueTooHigh,"PhoneError_ValueTooHigh"],
	[PhoneError_InvalidValue,"PhoneError_InvalidValue"],
	[PhoneError_PayloadTooLarge,"PhoneError_PayloadTooLarge"],
	[PhoneError_PayloadTooSmall,"PhoneError_PayloadTooSmall"],
	[PhoneError_Busy,"PhoneError_Busy"],
	[PhoneError_InvalidSettings,"PhoneError_InvalidSettings"],
	[PhoneError_NotFccApproved,"PhoneError_NotFccApproved"],
	[PhoneError_AlreadyStarted,"PhoneError_AlreadyStarted"],
	[PhoneError_Unsupported,"PhoneError_Unsupported"],
	[PhoneError_AlreadyStarted,"PhoneError_AlreadyStarted"],
	[PhoneError_NotStarted,"PhoneError_NotStarted"],
	[PhoneError_Security,"PhoneError_Security"],
	[PhoneError_TooMany,"PhoneError_TooMany"]
]
