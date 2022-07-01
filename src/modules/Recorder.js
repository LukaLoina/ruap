import React from "react";

class Recorder extends React.Component {
    constructor(props){
	super(props)
	this.state = {
	    state: "waiting",
	    recorder: null
	}
    }

    startRecording = () => {
	const onStop = (blob) => this.props.onStop(blob)
	const setState = (set) => this.setState(set)
	const chunks = [];
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	    navigator.mediaDevices.getUserMedia ({audio: true})
		.then(function(stream) {
		    const mediaRecorder = new MediaRecorder(stream);
		    mediaRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
		    }
		    mediaRecorder.onstop = (e) => {
			const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
			if(onStop){onStop(blob)};
		    }
		    mediaRecorder.start();
		    setState({state:"recording", recorder: mediaRecorder})
		})
		.catch(function(err) {
		    console.log('The following getUserMedia error occurred: ' + err);
		});
	} else {
	    console.log('getUserMedia not supported on your browser!');
	}
    }

    stopRecording = () => {
	this.state.recorder.stop();
	this.setState({state: "waiting", recorder: null})
    }
    
    render(){
	let button;
	if(this.state.state === "waiting"){
	    button = <button className="container-element-button container-element-button-start" onClick={this.startRecording}>snimaj</button>
	} else {
	    button = <button className="container-element-button container-element-button-stop" onClick={this.stopRecording}>stani</button>
	}
	return <>
		   {this.props.recordings && this.props.recordings.map((element, index) => { 
		       return <div key={element.key} className="recording-container">
			   <audio controls>
			       <source type="audio/ogg" src={window.URL.createObjectURL(element.blob)} />
			   </audio>
			   <button className="recording-container-button" onClick={() => this.props.removeRecording(index)}>X</button>
		       </div>
		   })}
		   {button}
	       </>
    }

}

export default Recorder;
