const initialState = {
	loading_videos : true,
	videos : [],
	video_status: false,
	video_height: 301
}

export default function videosReducer (state = initialState, action) {
  switch (action.type) {
  	case "SET_VIDEOS":
  		return {
  			...state,
  			videos: action.videos
  		}
  	case "SET_LOADING_VIDEOS":
  		return {
  			...state,
  			loading_videos: action.loading_videos
  		}
  	case "SET_VIDEO_STATUS":
  		return{
  			...state,
  			video_status: action.video_status
  		}
  	case "SET_VIDEO_HEIGHT":
  		return {
  			...state,
  			video_height: action.video_height
  		}
    default:
      return state
  }
}