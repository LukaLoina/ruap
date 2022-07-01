import Meyda from 'meyda';

const preprocessData = async (recordings, label=[1,0]) => {
    console.log("preprocessing data")
    if(!recordings){ return [[], []] }
    const data = []
    const labels = []
    for(let recording of recordings){
	const recordingArray = await recording.arrayBuffer()
	const ctx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 16384});
	const decodedData = await ctx.decodeAudioData(recordingArray)
	const signal = decodedData.getChannelData(0)
	const slices = []
	const frameLength = 16384/32
	for(let i=0; i*frameLength < signal.length; i++){
	    let slice = signal.slice(i*frameLength, (i+1)*frameLength);
	    if(slice.length < frameLength){
		const newSlice = new Float32Array(frameLength)
		for(let i=0; i<slice.length; i++){
		    newSlice[i] = slice[i];
		}
		slice = newSlice;
	    }
	    slices.push(slice)
	}
	let mfccs = []
	slices.forEach(slice => {
	    Meyda.numberOfMFCCCoefficients = 20;
	    Meyda.sampleRate = 16384;
	    const result = Meyda.extract(["mfcc"], slice)
	    const mfcc = result["mfcc"]
	    mfccs.push(mfcc)
	})
	for(let i = 0; i*32 < mfccs.length; i++){
	    let group = mfccs.slice(i*32, (i+1)*32);
	    if(group.length < 32){
		group = group.concat(Array(32-group.length).fill(Array(20).fill(0)))
	    }
	    const groupT = group[0].map((_, colIndex) => group.map(row => row[colIndex]))
	    data.push(groupT)
	    labels.push(label)
	}
	
    }
    return [data, labels]
}

export default preprocessData;
