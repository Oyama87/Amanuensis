const speech = require('@google-cloud/speech')
const fs = require('fs')
const path = require('path')


module.exports = async function transcribe(filePath, windowContents, language) {
  const client = new speech.SpeechClient()
  
  // const file = fs.readFileSync(filePath)
  // const audioBytes = file.toString('base64')
  
  // const audio = {
  //   content: audioBytes
  // }
  
  console.log('in transcriber.js:', language)
  // if(language !== 'en-US') return
  
  const config = {
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
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
        windowContents.send('load-transcript', ts)
        if(data.results[0].alternatives[0].words.length > 0) {
          console.log('sending words')
          let wordsArray = data.results[0].alternatives[0].words
          let hashTable = {}
          wordsArray.forEach(wordObj => {
            if(hashTable.hasOwnProperty(wordObj.word.toUpperCase())) {
              hashTable[wordObj.word.toUpperCase()].push(wordObj.startTime.seconds)
            }
            else {
              hashTable[wordObj.word.toUpperCase()] = [wordObj.startTime.seconds]
            }
          })
          windowContents.send('load-words', hashTable)
        }
      }
      // console.log(ts)
      // console.log(windowContentsContents.send)
      // console.log(data.results[0].alternatives[0].words)
      
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
