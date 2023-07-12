import React, { useState, useEffect, createRef } from 'react';
import {constraintsSinglton} from 'src/logic/constants.js'
import {isMobile} from 'react-device-detect';

const vidWidth = 720;
const vidHeight = 1280;
// console.log(streamSettings.width, streamSettings.height)
// 640 480
let constraintsHd = { video: { facingMode: "environment" , 
								width: {exact: 640 }, // 960 540
								height: {exact: 480  },
								frameRate: { ideal: 30, max: 30 }
								}, 
					audio: false };

if (isMobile){
	constraintsHd = { video: { facingMode: "environment" , 
		width: {exact: vidHeight }, // 960 540
		height: {exact: vidWidth },
		frameRate: { ideal: 30, max: 30 }
		}, 
	audio: false };
}

var constraintsAll = { video: { facingMode: "environment", frameRate: { ideal: 30, max: 30 } }, audio: false };

export const WebcamVideo = ({vidRef}) => {
	var observer = 1

    useEffect(() => {
        const timer = setTimeout(() => {
        //   console.log('This will run after 1 second!')
          cameraStart(vidRef)
        }, 1000);
        return () => clearTimeout(timer);
      })
	//   style={{display:'none'}} 
    return <video muted playsInline autoPlay ref={vidRef} style={{display:'none', position: 'absolute'}}  width="540" height="960" > </video>
}

export const HologramVideo = ({vidRef}) => {
	// playsInline autoPlay
    return <video playsInline ref={vidRef} style={{display:'none'}}  id="hologram" width="480" height="640" >
                 <source src="assets/model.mp4" type="video/mp4"/>
            </video>
}

function cameraStart(webcamRef) {

	try {
		// console.log("try", constraintsHd)
		navigator.mediaDevices.getUserMedia(constraintsHd).then(function(stream) {
		console.log("navigator")
		const streamSettings = stream.getVideoTracks()[0].getSettings()
		console.log(streamSettings.width, streamSettings.height)
		if (isMobile){
			webcamRef.current.width = streamSettings.height
			webcamRef.current.height = streamSettings.width
			constraintsSinglton.setConstantsWithVideoWidthHeight(streamSettings.height, streamSettings.width)
		} else{
			webcamRef.current.width = streamSettings.width
			webcamRef.current.height = streamSettings.height
			constraintsSinglton.setConstantsWithVideoWidthHeight(streamSettings.width, streamSettings.height)
		}
		webcamRef.current.srcObject = stream;
		webcamRef.current.play();
	}).catch(function(error) {
		console.error("Camera Start getUserMedia hd error error ", error);
		console.error("Camera Start getUserMedia hd error error ", error.constraint);

		navigator.mediaDevices.getUserMedia(constraintsAll).then(function(stream) {

		}).catch(function(error) {
			console.error("Camera Start getUserMedia not hd error ", error);
		});
	});
	} catch (err) {
		console.error("Camera Start error ", err);
	}
}

export default {WebcamVideo, HologramVideo}