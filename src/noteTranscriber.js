const speech = require('@google-cloud/speech')
// const fs = require('fs')
// const path = require('path')
const record = require('node-record-lpcm16')


module.exports = async function takeDictation(windowContents, language) {
  const client = new speech.SpeechClient()
  
  console.log('in takeDictation.js:', language)
  // if(language !== 'en-US') return
  
  const SAMPLE_RATE = 16000
  
  const config = {
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    sampleRateHertz: SAMPLE_RATE,
    languageCode: language,
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
      // console.log(data.results[0].alternatives[0].stability)
      let ts 
      if(data.results[0].stability > 0.75 || data.results[0].alternatives[0].confidence){
        ts = data.results[0].alternatives[0].transcript
        // console.log('sending transcript')
        windowContents.send('load-note', ts)
      }
    })
    record
    .start({
      sampleRateHertz: SAMPLE_RATE,
      threshold: 0.5,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: true,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '5.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream)
  }
  catch(err) {
    console.error(err)
  }
}

