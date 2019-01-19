import React, { Component } from 'react';
import './App.css';
import Sound from 'react-sound'
import Transcript from './Transcript';
const { ipcRenderer } = window.require('electron')

// audio.ontimeupdate = function() {
  
  // }
  
  
  class App extends Component {
    
    constructor() {
      super()
      this.state={
        // audioPath: '',
        // soundStatus: Sound.status.STOPPED,
        // currentTime: 0,
        // duration: 0,
        transcript: '',
        words: {}
      }
      
      ipcRenderer.on('load-transcript', (event, text) => {
        this.setState({
          transcript: text
        })
      })
      
      ipcRenderer.on('load-words', (event, words) => {
        console.log('words', words)
        this.setState({
          words
        })
      })
      
      this.audio = document.createElement('audio')
      this.audio.autoplay = true
      
      ipcRenderer.on('load-audio', (event, payload) => {
        console.log('load-audio callback')
        this.audio.src = `file://${payload}`
        this.audio.play()
        // this.setState({
        //   audioPath: payload,
        //   soundStatus: Sound.status.STOPPED
        // })
      })
  }
  
  render() {
    return (
      <div className="App">
        <header>
          <div>
            <button onClick={()=> this.audio.play()}>
              Play
            </button>
            <button onClick={()=> this.audio.pause()}>
              Stop
            </button>
          </div>
          <div className='progress-bar-container'>
            <progress className='progress' value={50} max={100}></progress>
            <span className='marker'>1</span>
          </div>
          <p>{this.state.currentTime}</p>
        </header>
        <hr />
        <div className='bottom-container'>
          <Transcript transcriptText={this.state.transcript} />
          <div className='annotations'>
            
          </div>
        </div>
      </div>
    );
  }
}

export default App;

/* <header className="App-header">
<img src={logo} className="App-logo" alt="logo" />
<p>
Edit <code>src/App.js</code> and save to reload.
</p>
<a
className="App-link"
href="https://reactjs.org"
target="_blank"
rel="noopener noreferrer"
>
Learn React
</a>
</header> */

/* <audio ref='audio_tag' id='audio' controls >
<source src={song} type='audio/mp4'/>
This is not supported
</audio> */

{/* <Sound 
  url={`file://${this.state.audioPath}`}
  playStatus={this.state.soundStatus}
  onLoad={audio => {
    if(audio.loaded) {
      this.setState({
        soundStatus: Sound.status.PLAYING
      })
    }
  }}
  onPlaying={audio => this.setState((prev)=> {
    if(Math.floor(audio.position/1000) === prev.currentTime)
    return prev
    else return {
      currentTime: Math.floor(audio.position/1000),
      duration: audio.duration/1000
    }
  })}
  playFromPosition={0}
  onFinishedPlaying={()=>{}}
/> */}
