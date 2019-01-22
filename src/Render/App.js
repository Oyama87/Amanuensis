import React, { Component } from 'react';
import './styles/App.css'
import Transcript from './Transcript';
import SplashScreen from './SplashScreen'
import NoteControls from './NoteControls';
import greenGlass from '../magnifierGreen.svg'
import redGlass from '../magnifierRed.svg'
const fs = window.require('fs')
const { ipcRenderer } = window.require('electron')


const audio = (source, ref) => React.createElement('audio', {src: source, ref, autoPlay: true, controls: true}, null)
  
  
class App extends Component {
    
  constructor() {
    super()
    this.state = {
      takingNotes: false,
      projectTitle: '',
      projectDir: '',
      audioPath: '',
      noteTitle: 'Jubilee',
      notes: '',
      searchResults: [],
      transcript: '',
      words: {},
      readyForSearch: false,
      recording: false,
      language: 'English',
      currentAudioTime: 0,
      allNotes: []
    }
    this.audioElement = React.createRef()
    // this.audio = document.createElement('audio')
    // this.audio.autoplay = true
    // this.audio = audio(this.state.audioPath)
    
    ipcRenderer.on('load-project', async (event, projectDir) => {
      await fs.readFile(`${projectDir}/transcript.txt`, (err, data) => {
        if(err) return console.log(err)
        this.setState({transcript: data.toString()})
      })
      await fs.readFile(`${projectDir}/words.json`, (err, data) => {
        if(err) return console.log(err)
        let dataString = data.toString()
        if(dataString) {
          this.setState({
            words: JSON.parse(dataString),
            readyForSearch: true
          })
        }
      })
      this.setState({
        projectDir,
        projectTitle: projectDir.slice(projectDir.lastIndexOf('/')+1),
      })
    })
    
    ipcRenderer.on('load-transcript', (event, text) => {
      this.setState({
        transcript: text
      })
    })
    
    ipcRenderer.on('load-words', (event, words) => {
      console.log('words:', words)
      fs.writeFile(`${this.state.projectDir}/transcript.txt`, this.state.transcript, err => {
        if(err) return console.log(err)
      })
      fs.writeFile(`${this.state.projectDir}/words.json`, JSON.stringify(words), err => {
        if(err) return console.log(err)
      })
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
  
  createProject = () => {
    ipcRenderer.send('create-project')
  } 
  
  loadProject = () => {
    ipcRenderer.send('get-project')
  }
  
  sendNewLanguage(language) {
    ipcRenderer.send('change-language', language)
    let languageName
    switch(language) {
      case 'en-US':
        languageName = 'English'
        break
      case 'ja-JP':
        languageName = 'Japanese'
        break
      default: language = 'English'
    }
    this.setState({
      language: languageName
    })
  }
  
  handleSearch = (evt) => {
    evt.preventDefault()
    this.setState({
      searchResults: this.state.words[evt.target.search.value.toUpperCase()]
    })
    evt.target.search.value = ''
  }
  
  seekToTimeStamp(timeStamp) {
    this.audioElement.current.currentTime = timeStamp
    this.setState({
      currentTime: timeStamp
    })
  }
  
  startNotes = () => {
    console.log('Running startNotes()')
    ipcRenderer.send('activate-dictation')
    this.setState({
      recording: true,
    })
    console.log(this.audioElement.current.currentTime)
  }
  
  stopNotes = () => {
    console.log('Stopping notes')
    ipcRenderer.send('cancel-dictation')
    this.setState({
      recording: false
    })
  }
  
  saveNote = () => {
    fs.writeFile(`${this.state.projectDir}/Notes/${this.state.noteTitle}.md`, 
    this.state.notes,
    err => {
      if(err) return console.log(err)
    })
  }
  
  storeNote = () => {
    this.setState(prev => {
      return {
        allNotes: [...prev.allNotes, {text: prev.notes, timestamp: prev.currentAudioTime}],
        notes: '',
        currentAudioTime: 0
      }
    })
  }
  
  updateNotes = (notes) => {
    this.setState({
      notes
    })
  }
  
  openNote = () => {
    this.setState({
      takingNotes: true,
      currentAudioTime: this.audioElement.current.currentTime
    })
  }
  
  cancelNote = () => {
    this.setState({
      takingNotes: false
    })
  }
  
  render() {
    if(!this.state.projectDir) return <SplashScreen create={this.createProject} load={this.loadProject} />
    else return (
      <div className="App">
        
        <div className='left-half'>
          <header>
            <div className='player-controller'>
              <p className='project-title'>{this.state.projectTitle}</p>
              {audio(this.state.audioPath, this.audioElement)}
            </div>
            
            <div className='language-container'>
              <p className='language-button' onClick={() => this.sendNewLanguage('ja-JP')}>Change to JP</p>
              <p className='language-button' onClick={() => this.sendNewLanguage('en-US')}>Change to EN</p>          
              <p className='language-indicator'>Current Language: {this.state.language}</p>
            </div>
          </header>
          <div className='transcript-container'>
            <Transcript transcriptText={this.state.transcript} />
          </div>
        </div>
          
        <div className='right-half'>
            
            <NoteControls 
              notes={this.state.notes}
              openNote={this.openNote}
              cancelNote={this.cancelNote}
              recording={this.state.recording}
              storeNote={this.storeNote}
              startNotes={this.startNotes}
              stopNotes={this.stopNotes}
              takingNotes={this.state.takingNotes}
              updateNotes={this.updateNotes}
              audioTime={this.state.currentAudioTime}
              allNotes={this.state.allNotes}
            />
          
          <div className='search-container'>
            <form onSubmit={this.handleSearch.bind(this)}>
              {
                this.state.readyForSearch ? 
                  <img src={greenGlass} style={{height: '18px'}} alt='green glass' /> 
                  :
                  <img src={redGlass} style={{height: '18px', width: '2em'}} alt='red glass' /> 
              }
              <label htmlFor='search' style={{margin: '0 10px', fontSize: '18px', textShadow: '1px 1px 1px rgba(0,0,0,0.3)'}}>Search Keyword</label>
              <input id='search' name='search' type='text' style={{outline: 'none', fontSize: '14px'}}/>
            </form>
          </div>
          
          <div className='search-results'>
            {
              this.state.searchResults ?
              this.state.searchResults.map(wordObj => {
                return (
                  <p className='search-item' onClick={() => this.seekToTimeStamp(wordObj.startTime.seconds)}>
                    {`00:${wordObj.startTime.seconds} -- `}... {getSurroundingText(wordObj)}...
                  </p>
                )
              })
              :
              <p>No Results</p>
            }
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
    if(wordObj.word === node.word) return <strong className='word-match'>{`${node.word} `}</strong>
    return <span>{`${wordObj.word} `}</span>
  })
}
