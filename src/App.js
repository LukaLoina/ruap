import React from 'react';
import './App.css';
import Recorder from './modules/Recorder'
import Trainer from './modules/Trainer'
import Recognizer from './modules/Recognizer'


class App extends React.Component {
    constructor(props){
	super(props);

	const network = localStorage.getItem("network");
	this.state = {
	    state: (network === null) ? null : "ready",
	    recordings: [],
	    predictions: [],
	    model: null,
	    acc: null,
	    loss: null
	}
    }

    blobCounter = 0;
    addRecording = (blob) => {
	this.setState(prevState => ({
	    recordings: [...prevState.recordings, {blob: blob, key: this.blobCounter++}]
	}))
    }

    removeRecording = (id) => {
	this.setState({recordings: this.state.recordings.filter((_, index) => (index !== id))}, () => this.setState(this.state))
    }

    addPrediction = (blob, results) => {
	const obj = {blob, results}
	this.setState(prevState => ({
	    predictions: [...prevState.predictions, obj]
	}))
    }

    onTrainingFinished = (model, info) => {
	const acc = info.history.acc[info.history.acc.length-1]
	const loss = info.history.loss[info.history.loss.length-1]
	this.setState({model, acc, loss})
    }
    
    componentDidMount(){
	const component = this;
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
	    navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream){
		component.setState({audioStream: stream})
	    })
	}
	else{/*mediaDevicesApi not supported*/}
    }
    
    render(){
	return (
	    <div className="App">
		<div className="container">
		    <div className="container-element">
			<div className="container-numbering container-numbering-first">0.</div>
			<div className="container-content">
			    Aplikacija za prepoznavanje govornika izrađena je za potrebe kolegija Računarstvo usluga i analiza podataka. Korištenje aplikacije odvija se u nekoliko jednostavnih koraka. Kako bi aplikacija mogla koristiti za prepoznavanje Vašega glasa prvo je potrebno snimiti ga i trenirati neuronsku mrežu. Nakon što je neuronska mreža istrenirana za prepoznavanje glasa možete koristiti aplikaciju za prepoznavanje.
			</div>
			<div className="container-numbering container-numbering-first"></div>
		    </div>
		    <div className="container-element">
			<div className="container-numbering container-numbering-second">1.</div>
			<div className="container-content">
			    <p>
				Prvi korak u postavljanju aplikacije je snimanje Vašega glasa. Bez ovih snimki aplikacija ne može podesiti model za prepoznavanje Vašega glasa. Kako bi snimili svoj glas pritisnite tipku snimaj, a kako bi zaustavili snimanje pritisnite tipku stani koja će se pojaviti kada započne snimanje. Snimanje glasa možete ponoviti više puta. Ukoliko niste zadovljni nekom od snimki istu možete ukloniti pritiskom na tipku X koja se nalazi uz snimku.
			    </p>
			    <Recorder recordings={this.state.recordings} onStop={this.addRecording} removeRecording={this.removeRecording} />
			</div>
			<div className="container-numbering container-numbering-second"></div>
		    </div>
		     <div className="container-element">
			<div className="container-numbering container-numbering-third">2.</div>
			 <div className="container-content">
			     <p>
				 Drugi korak u postavljanju aplikacije je treniranje neuronske mreže za prepoznavanje Vašega glasa. Kako bi započeli treniranje pritisnite tipku treniraj neuronsku mrežu. Za treniranje neuronske mreže koriste se sve snimke koje ste izradili u prošlome koraku. Ukoliko stvorite nove snimke ili uklonite neku od postojećih model se neće automatski prilagoditi novim podacima. Model možete prilagoditi novim podacima ponovnim pokretanjem procesa treniranja neuronske mreže. </p>
			     <Trainer recordings={this.state.recordings.map(element=>element.blob)} onTrainingFinished={this.onTrainingFinished} />
			 </div>
			 <div className="container-numbering container-numbering-third"></div>
		     </div>
		     <div className="container-element">
			<div className="container-numbering container-numbering-fourth">3.</div>
			 <div className="container-content">
			     <p>
				 Nakon što ste trenirali neuronsku mrežu ista je spremna za prepoznavanje Vašega glasa. U ovoj aplikaciji glas se prepoznaje na snimkama. Kako bi snimili svoj glas pritisnite tipku snimaj, a kako bi zaustavili snimanje pritisnite tipku stani koja će se pojaviti kada započne snimanje. Nakon snimanja glasa aplikacija će reći sa kolikom sigurnošću je prepoznala Vaš glas.
			     </p>
			     <Recognizer predictions={this.state.predictions} onStop={this.addPrediction} model={this.state.model} />
			 </div>
			 <div className="container-numbering container-numbering-fourth"></div>
		     </div>
		</div>
	    </div>
	)
    }
}

export default App;
