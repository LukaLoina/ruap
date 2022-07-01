import React from 'react';
import * as tf from '@tensorflow/tfjs';
import preprocessData from '../helpers/preprocessData.js'

class Trainer extends React.Component {
    constructor(props){
	super(props)
	this.state = {
	    training: false,
	    trained: false
	}
    }

    loadTrainingData = async (limit) => {
	let data = []

	for(let i=0; i<=1; i++){
	    const recording = await fetch(`/speakers/noise/${i}.wav`)
	    const blob = await recording.blob()
	    data.push(blob)
	}
	
	for(let i = 0; i<1500; i++){
	    for(let j=0; j<5; j++){
		if(limit && (i*5+j > limit)){break;}
		const recording = await fetch(`/speakers/${j}/${i}.wav`)
		const blob = await recording.blob()
		data.push(blob)
	    }
	    if(limit && (i*5 > limit)){break;}
	}
	const result = await preprocessData(data, [0, 1])
	return result;
    }
    
    fitNN = (model) => {
	const onTrainingFinished = this.props.onTrainingFinished;
	preprocessData(this.props.recordings)
	    .then(([data, labels]) => {
		let onBatchEnd = (batch, logs) => {
		    console.log('Accuracy', logs.acc);
		}
		this.loadTrainingData(data.length).then(([otherData, otherLabels]) => {
		    const inputTensor = tf.tensor3d([...data, ...otherData], [data.length+otherData.length, 20, 32])
		    const labelTensor = tf.tensor([...labels, ...otherLabels], [labels.length+otherLabels.length, 2])
		    model.fit(inputTensor, labelTensor, {
			epochs: 5,
			batchSize: 32,
			callbacks: {onBatchEnd}
		    }).then(info => {
			for(const layer of model.layers){
			    layer.trainable = true
			}
			model.compile({
			    optimizer: 'adam',
			    loss: 'categoricalCrossentropy',
			    metrics: ['accuracy']
			});
			model.fit(inputTensor, labelTensor, {
			    epochs: 5,
			    batchSize: 32,
			    callbacks: {onBatchEnd}
			}).then(info => {
			    console.log('Final accuracy', info.history.acc);
			    if(onTrainingFinished) onTrainingFinished(model, info)
			    this.setState({training: false, trained: true})
			})
		    });
		})
		
	    })
    }
    
    trainNN = () => {
	this.setState({training: true})
	tf.loadLayersModel('./initial-model.json')
	    .then(model => {
		model.layers.pop()
		for(const layer of model.layers){
		    layer.trainable = false
		}
		const output = tf.layers.dense({units: 2, activation: 'softmax'}).apply(model.layers[model.layers.length-1].output)
		const newModel = tf.model({inputs: model.inputs, outputs: output})
		newModel.compile({
		    optimizer: 'adam',
		    loss: 'categoricalCrossentropy',
		    metrics: ['accuracy']
		});
		this.fitNN(newModel)
	    })
    }
    
    render(){
	let button;
	if(!this.props.recordings || (this.props.recordings && Array.isArray(this.props.recordings) && this.props.recordings.length === 0) || this.state.training){
	    button = <button className="container-element-button container-element-button-disabled">treniraj neuronsku mrežu</button>
	} else {
	    button = <button className="container-element-button container-element-button-start" onClick={this.trainNN}>treniraj neuronsku mrežu</button>
	}
	return <>
		   {this.state.training ? <p className="training-in-progress">treniranje u tijeku</p> : ""}
		   {!this.state.training && this.state.trained ? <p className="training-in-progress">mreža je istrenirana</p> : ""}
		   {button}
	       </>
    }
}

export default Trainer
