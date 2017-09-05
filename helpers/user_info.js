import React, {Component} from 'react'
import {WhiteRow} from '../bridges/white_row';
import {
	styles,
	first_color,
	height,
	width,
	option_blue
} from '../styles/index.js'
import {
  	View,
  	TouchableHighlight
} from 'react-native'

export const UserInfo = params => {
	return (
		<View>
			<WhiteRow name="Email" value={params.email} />
			<WhiteRow name="Last Name" value={params.last_name} />
			<WhiteRow name="Last Name" value={params.first_name} />
		</View>
	)
}

export const AccountInformation = params => {
	return (
		<View>
			<WhiteRow name="User ID" value={params.user_login}/>
			<WhiteRow name="Account ID" value={params.user_key}/>
			<WhiteRow name="Status" value="Active"/>
			<WhiteRow name="Type" value={params.user_type}/>
			<WhiteRow name="Authorization" value={params.user_auth_level}/>
		</View>
	)
}
