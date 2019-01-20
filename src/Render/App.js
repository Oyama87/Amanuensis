import React, { Component } from 'react';
import './App.css';
// import Sound from 'react-sound'
import Transcript from './Transcript';
const { ipcRenderer } = window.require('electron')

const audio = (source, ref) => React.createElement('audio', {src: source, ref, autoPlay: true, controls: true}, null)
  
  
class App extends Component {
    
  constructor() {
    super()
    this.state = {
      audioPath: '',
      // soundStatus: Sound.status.STOPPED,
      // currentTime: 0,
      // duration: 0,
      searchResults: [],
      transcript: '',
      words: {},
      readyForSearch: false
    }
    this.audioElement = React.createRef()
    // this.audio = document.createElement('audio')
    // this.audio.autoplay = true
    // this.audio = audio(this.state.audioPath)
    
    ipcRenderer.on('load-transcript', (event, text) => {
      this.setState({
        transcript: text
      })
    })
    
    ipcRenderer.on('load-words', (event, words) => {
      console.log('words', words)
      this.setState({
        words,
        readyForSearch: true
      })
    })
    
    ipcRenderer.on('load-audio', (event, payload) => {
      console.log('load-audio callback')
      // audio.src = `file://${payload}`
      // audio.load()
      // audio.play()
      this.setState({
        audioPath: `file://${payload}`,
      })
    })
    
    this.seekToTimeStamp = this.seekToTimeStamp.bind(this)
  }
  
  sendNewLanguage(language) {
    ipcRenderer.send('change-language', language)
  }
  
  handleSearch = (evt) => {
    evt.preventDefault()
    this.setState({
      searchResults: this.state.words[evt.target.search.value.toUpperCase()]
    })
  }
  
  seekToTimeStamp(timeStamp) {
    // this.setState({
    //   currentTime: timeStamp
    // })
    this.audioElement.current.currentTime = timeStamp
  }
  
  render() {
    return (
      <div className="App">
        <header>
          {audio(this.state.audioPath, this.audioElement)}
          {/* <audio controls autoPlay>
            <source src={this.state.audioPath}/>
            Audio source unsupported or missing.
          </audio> */}
          <div>
            {/* <button onClick={()=> this.audio.play()}>
              Play
            </button>
            <button onClick={()=> this.audio.pause()}>
              Stop
            </button> */}
          </div>
          <div className='progress-bar-container'>
            <progress className='progress' value={50} max={100}></progress>
            <span className='marker'>1</span>
          </div>
          <p onClick={() => this.sendNewLanguage('ja-JP')}>Change to JP</p>
        </header>
        <hr />
        <div className='bottom-container'>
          <Transcript transcriptText={this.state.transcript} />
          <div className='annotations'>
            <form onSubmit={this.handleSearch.bind(this)}>
              <label htmlFor='search'>Search Keyword</label>
              <input id='search' name='search' type='text' />
            </form>
            <div>
              {
                this.state.searchResults ?
                this.state.searchResults.map(timestamp => {
                  return <p onClick={() => this.seekToTimeStamp(timestamp)}>{`00:${timestamp}`}</p>
                })
                :
                <p>No Results</p>
              }
            </div>
          </div>
        </div>
      </div>
    )
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

/* <Sound 
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
/> */
