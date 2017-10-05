import React, { Component } from 'react';
import {
  	Text,
  	View,
  	TouchableHighlight
} from 'react-native'
import {
	styles,
	first_color,
	height,
	width,
	option_blue
} from '../styles/index.js'

export const WhiteRowLink = params => {
	return(
		<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => params.callback()}>
			<View style={{padding:15,flexDirection:"row"}}>
				<Text style={{fontSize:16,color:option_blue}}>
					{params.name}
				</Text>
			</View>
		</TouchableHighlight>						
	)

}

export const WhiteRowInfoLink = params => {
	return (
		<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => params.callback()}>
			<View style={{padding:10,flexDirection:"row"}}>
				<View style={{flex:0.7}}>
					<Text style={{fontSize:14}}>
						{params.name}
					</Text>
				</View>
				<View style={{flex:1}}>
					<Text style={{fontSize:12}}>
						{params.value}
					</Text>
				</View>				
			</View>
		</TouchableHighlight>
	)
}

export const WhiteRowIconLink = params => {
	return (
	      <View style={styles.container}>
	        	<TouchableHighlight
	        		onPress={() => params.callback()}
	        		style={{backgroundColor:"white",height:50,borderTopRightRadius:10, borderTopLeftRadius: 10}} 
	        	>
	        		<View style={{flexDirection:"row",padding:10,width: Dimensions.get('window').width * 0.8,alignItems:"center",justifyContent:"center"}}>
		        		<View style={{flex:0.3,justifyContent:"center"}}>
		        			{params.icon}
		        		</View>
		        		<View style={{flex:0.7,justifyContent:"center"}}>
			        		<Text style={{fontSize:20}}>
			        			{params.name}
			        		</Text>
		        		</View>
	        		</View>
	        	</TouchableHighlight>
	         
	      </View>
	)
}