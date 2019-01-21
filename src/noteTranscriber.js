const speech = require('@google-cloud/speech')
// const fs = require('fs')
// const path = require('path')
const record = require('node-record-lpcm16')
// const { ipcMain } = 'electron'


module.exports = async function takeDictation(windowContents, language, ipc) {
  const client = new speech.SpeechClient()
  
  console.log('in takeDictation.js:', language)
  // if(language !== 'en-US') return
  
  const SAMPLE_RATE = 16000
  
  const config = {
    // enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    sampleRateHertz: SAMPLE_RATE,
    languageCode: language,
  }
  
  const request = {
    config,
    interimResults: true
  }
  
  const totalNote = []
  
  try {
    // Stream the audio to the Google Cloud Speech API
    const noteTranscriber = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      // console.log(data.results[0].alternatives[0].stability)
      console.log('got data')
      let ts = data.results[0].alternatives[0].transcript 
      if(data.results[0].stability > 0.90 || data.results[0].alternatives[0].confidence){
        totalNote.push(ts)
        console.log('sending note')
        windowContents.send('load-note', totalNote.join(' '))
      }
    })
    
    // Goes Here
    record
    .start({
      sampleRateHertz: 16000,
      // threshold: 0,
      thresholdStart: 0,
      thresholdEnd: 0,
      verbose: true,
      recordProgram: 'rec',
      silence: '6.0',
    })
    .on('error', console.error)
    .on('end', () => {
      console.log('******ENDED******')
      windowContents.send('stopped-note')
    })
    .pipe(noteTranscriber)
    
    
    ipc.on('cancel-dictation', () => {
      console.log('trying to stop recording')
      record.stop()
    })
      
  }
  catch(err) {
    console.error(err)
  }
  
}

