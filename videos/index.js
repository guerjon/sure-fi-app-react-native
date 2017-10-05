import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	ActivityIndicator,
  	FlatList,
  	TouchableHighlight,
  	Alert
} from 'react-native'
import {styles,first_color,width,link_color} from '../styles/index.js'
import { connect } from 'react-redux';
import {YouTubeStandaloneAndroid} from 'react-native-youtube'
import { 
	LOADING,
	GET_USER_VIDEOS
} from '../constants'
import Background from '../helpers/background'

class Videos extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }
    
	componentWillMount() {
	  	
	  	fetch(GET_USER_VIDEOS,{
	  		method: "POST",
	  		headers: {
	  			'Accept' : 'application/json',
	  			'Content-Type' : 'application/json'
	  		},
	  		body: JSON.stringify({
	  			session_key : this.props.session_key
	  		})
	  	}).then(response => {
	  		
	  		var data = JSON.parse(response._bodyInit)
	  		if(data.status == "success"){
	  			
	  			var videos = data.data.videos
	  			videos = this.getInstrictionVideos(videos)
	  			this.props.dispatch({type: "SET_VIDEOS",videos: videos})
	  			this.props.dispatch({type: "SET_LOADING_VIDEOS",loading_videos: false})

	  		}else{	
	  			Alert.alert("Error","Error on get the videos.")
	  		}
	  		
	  	}).catch(error => {
	  		Alert.alert("Error",error)
	  	})
	}

	getInstrictionVideos(videos){
		var instructional_videos = []
		videos.map(video => {
			if(video.video_type.includes("INSTRUCTIONS")){
				instructional_videos.push(video)
			}
		})

		return instructional_videos
	}

	getIdVideo(url){
		var data_array = url.split("/")
		if(data_array.length > 3)
			return data_array[3]
		else{
			Alert.alert("Error","Error on got the YouTube id.")
			return false
		}
	}

	playVideo(id){
		YouTubeStandaloneAndroid.playVideo({
  			apiKey: 'AIzaSyCaDihG0kl8iM_sUMLIVAkv7WHmRWRBboA',     // Your YouTube Developer API Key
  			videoId: id,     // YouTube video ID
  			autoplay: true,             // Autoplay the video
		})
	}

	renderVideo(item){
		var video = item.item
		var id = this.getIdVideo(video.video_link)
		var array_title = video.video_title.split('Bridge')

		console.log("video",id);
		return (
			<View style={{backgroundColor:"white",marginVertical:10,width:width,height:100,alignItems:"center",justifyContent:"center"}}>
				<TouchableHighlight  onPress={() => this.playVideo(id)} style={{alignItems:"center",justifyContent:"center"}}>
					
					<Text style={{color:link_color,fontSize:18,paddingVertical:25,textAlign:"center"}}>
						{video.video_title}
					</Text>
					
				</TouchableHighlight>
			</View>
		)
	}

	render(){	
		if(this.props.loading_videos){
			return (
				<Background>
					<ActivityIndicator/>
				</Background>
			)
		}
		console.log("videos",this.props.videos);
		return(
			<Background>
				<View style={{alignItems:"center",justifyContent:"center"}}>
					<Text style={{marginTop:20,fontSize:20,fontWeight: '900'}}>	
						
					</Text>
				</View>
				<View style={{marginVertical:20}}>
					<FlatList data={this.props.videos} renderItem={(video) => this.renderVideo(video)} keyExtractor={(item,index) => index} />
				</View>
			</Background>
		);	
	}
}

const mapStateToProps = state => ({
	loading_videos : state.videosReducer.loading_videos,
	videos : state.videosReducer.videos,
	session_key : state.mainScreenReducer.session_key,

});

export default connect(mapStateToProps)(Videos);
