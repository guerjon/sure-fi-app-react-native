import React, {Component} from 'react'
import {
  	Text,
  	View,
  	StyleSheet,
  	Dimensions,
  	FlatList,
  	TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux';
import {width,height} from "./styles"

class DocumentationModal extends Component{
	
	constructor(props) {
	  	super(props);	  	
	}

	closeModal() {
        this.props.navigator.dismissLightBox();
    }

    renderDocumentation(item){
    	const documentation = item.item
    	return(
    		<TouchableOpacity style={{padding:10,borderBottomWidth:1}} onPress={() => this.props.openLink(documentation.document_path)}>
    			<Text style={{color:"blue",fontSize:18}}>
    				{documentation.document_title}
    			</Text>
    		</TouchableOpacity>
    	)
    }

  	render() {
  		const videos_info = this.props.videos_info
  		if(videos_info.length > 0){
  			return(
  				<View style={{width:width,alignItems:"center",justifyContent:"center"}}>
  					<View style={{backgroundColor:"white",width:width,height:400,alignItems:"center"}}>
	  					<Text style={{fontSize:24,marginBottom:5,marginTop:20}}>
	  						Videos documentation
	  					</Text>
	  					<Text style={{marginBottom:5,color:"black"}}>
	  						Please select the video you wish to view:
	  					</Text>
	  					<FlatList data={videos_info} renderItem={item => this.renderDocumentation(item)} keyExtractor={(item,index) => index}/>					        
			        
			        	<TouchableOpacity
			        		onPress={() => this.closeModal()}
			        		style={{borderTopWidth:1, backgroundColor:"white",height:60,width:200,borderBottomLeftRadius: 10,alignItems:"center",justifyContent:"center"}} 
			        	>	
			        		<Text style={{fontSize:20,color:"red"}}>
			        			Cancel
			        		</Text>
			        	</TouchableOpacity>  			
					</View>			        						        
  				</View>
  			)
  		}else{
  			return (
  				<View>
  					<Text style={{color:"red"}}>
  						Error, The video was not found.
  					</Text>
  				</View>
  			)
  		}
	}
}

const mapStateToProps = state => ({
	videos_info: state.loginReducer.videos_info,
});

export default connect(mapStateToProps)(DocumentationModal);
