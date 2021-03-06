import React from "react";
import * as tf from '@tensorflow/tfjs';
import preprocessData from '../helpers/preprocessData.js'

class Recognizer extends React.Component {
    constructor(props){
	super(props)
	this.state = {
	    state: "waiting",
	    recorder: null
	}
    }

    startRecording = () => {
	const onStop = this.props.onStop
	const setState = (set) => this.setState(set)
	const chunks = [];
	const model = this.props.model;
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	    navigator.mediaDevices.getUserMedia ({audio: true})
		.then(function(stream) {
		    const mediaRecorder = new MediaRecorder(stream);
		    mediaRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
		    }
		    mediaRecorder.onstop = (e) => {
			const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
			preprocessData([blob]).then(([data, _]) => {
			    const inputTensor = tf.tensor3d(data, [data.length, 20, 32])
			    const results = model.predict(inputTensor).arraySync();
			    console.log("recognition results");
			    console.log(results)
			    if(onStop){onStop(blob, results)};
			})
			
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
	if (!this.props.model){
	    button = <button className="container-element-button container-element-button-disabled">snimaj</button>
	}
	else if(this.state.state === "waiting"){
	    button = <button className="container-element-button container-element-button-start" onClick={this.startRecording}>snimaj</button>
	} else {
	    button = <button className="container-element-button container-element-button-stop" onClick={this.stopRecording}>stani</button>
	}
	return <>
		   {this.props.predictions && this.props.predictions.map((prediction, index) => {
		       return <div className="recognizer-container" key={index}>
				  <audio controls><source type="audio/ogg" src={window.URL.createObjectURL(prediction.blob)} /></audio>
				  <div>Govornik:{(prediction.results.map(r => r[0]).reduce((sum, x) => {return sum + x}, 0)/prediction.results.length * 100).toFixed(2)}%</div>
				  <div>Nije govornik:{(prediction.results.map(r => r[1]).reduce((sum, x) => {return sum + x}, 0)/prediction.results.length * 100).toFixed(2)}%</div>
			      </div>
		   })}
		   {button}
	       </>
    }

}

export default Recognizer;
