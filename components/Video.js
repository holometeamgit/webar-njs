const Video = (video_file_name__mp4, video_file_name__ogg) => {

    return <video style={{display:'none'}} width="320" height="240" controls ref={this.videoRef}>
    <source src={video_file_name__mp4} type="video/mp4" />
    <source src={video_file_name__ogg} type="video/ogg" />
  Your browser does not support the video tag.
  </video>
}

export default Video