const speech = require('@google-cloud/speech')
const fs = require('fs')
const path = require('path')


module.exports = async function transcribe(filePath, window) {
  const client = new speech.SpeechClient()
  
  // const file = fs.readFileSync(filePath)
  // const audioBytes = file.toString('base64')
  
  // const audio = {
  //   content: audioBytes
  // }
  
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  }
  
  const request = {
    config,
    interimResults: true
  }
  
  try {
    // Stream the audio to the Google Cloud Speech API
    const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      let ts = data.results[0].alternatives[0].transcript
      // console.log(ts)
      // console.log(window.send)
      window.send('load-transcript', ts)
      
      // console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`)
    })

    // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
    fs.createReadStream(filePath).pipe(recognizeStream);
    
  }
  catch(err) {
    console.error(err)
  }
}

// transcribe(request)

// const [operation] = await client.longRunningRecognize(request)
// const [response] = await operation.promise()
// const transcription = response.results
//   .map(result => result.alternatives[0].transcript)
//   .join('\n');
// console.log(`Transcription: ${transcription}`);
// // const audioTranscript = response.results[0].alternatives[0].transcript
// // return audioTranscript
// return transcription
