import React, { Component } from 'react';
import './App.css';
// import Sound from 'react-sound'
import Transcript from './Transcript';
import Notes from './Notes'
const { ipcRenderer } = window.require('electron')

const audio = (source, ref) => React.createElement('audio', {src: source, ref, autoPlay: true, controls: true}, null)
  
  
class App extends Component {
    
  constructor() {
    super()
    this.state = {
      audioPath: '',
      notes: '',
      searchResults: [],
      transcript: '',
      words: {},
      readyForSearch: false,
      recording: false
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
      console.log('words:', words)
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
    
    ipcRenderer.on('load-note', (event, notes) => {
      this.setState(prev => {
        return {
          notes
        }
      })
    })
    
    ipcRenderer.on('stopped-note', () => {
      this.setState({
        recording: false
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
    this.audioElement.current.currentTime = timeStamp
  }
  
  startNotes() {
    console.log('Running startNotes()')
    ipcRenderer.send('activate-dictation')
    this.setState({
      recording: true
    })
  }
  
  stopNotes() {
    console.log('Stopping notes')
    ipcRenderer.send('cancel-dictation')
  }
  
  seekSearchResult = (timestamp) => {
    this.seekToTimeStamp(timestamp)
  }
  render() {
    return (
      <div className="App">
        <header>
          {audio(this.state.audioPath, this.audioElement)}
          <div className='progress-bar-container'>
            <progress className='progress' value={50} max={100}></progress>
            <span className='marker'>1</span>
          </div>
          <p onClick={() => this.sendNewLanguage('ja-JP')}>Change to JP</p>
          <p onClick={this.startNotes}>Start Note</p>
          <p onClick={this.stopNotes}>Stop Note</p>
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
                this.state.searchResults.map(wordObj => {
                  return (
                    <p onClick={this.seekToTimeStamp(wordObj.startTime.seconds)}>
                      {`00:${wordObj.startTime.seconds} -- `} ...{getSurroundingText(wordObj)}...
                    </p>
                  )
                })
                :
                <p>No Results</p>
              }
              <Notes notes={this.state.notes}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;

/* 
  function takes in a node and and gets three nodes before it as well as
  three nodes after it, handling head and tail cases. returns an array of 
  <spans> with the original word bolded or emphasized in some way.
*/

const getSurroundingText = function(node) {
  const prevNodes = []
  const nextNodes = []
  let prev = node.prev
  // console.log(prev)
  let next = node.next
  // console.log(next)
  for(let i = 0; i < 3; i++) {
    if(prev) {
      prevNodes.unshift(prev)
      prev = prev.prev
    }
    else break
  }
  for(let i = 0; i < 3; i++) {
    if(next) {
      nextNodes.push(next)
      next = next.next
    }
    else break
  }
  // console.log('prevNodes:', prevNodes)
  // console.log('nextNodes:', nextNodes)
  let interimArray = [...prevNodes, node, ...nextNodes]
  console.log('interimArray:', interimArray)
  return interimArray.map(wordObj => {
    if(wordObj.word === node.word) return <strong>{`${node.word} `}</strong>
    return <span>{`${wordObj.word} `}</span>
  })
}



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
