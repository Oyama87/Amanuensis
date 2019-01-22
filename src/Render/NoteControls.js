import React from 'react'
import redMicroPhone from '../microphoneRed.svg'
import greenMicroPhone from '../microphoneGreen.svg'
import Notes from './Notes'
import AceEditor from 'react-ace'
import brace from 'brace'
import 'brace/mode/markdown'
import 'brace/theme/textmate'
import 'brace/theme/xcode'
import 'brace/theme/github'
import './styles/NoteControlStyles.css'

export default props => {
  return (
    <div className='note-control-container'>
      <div className='top-bar'>
        {
          props.takingNotes ?
            !props.recording ?
            <img src={redMicroPhone} onClick={props.startNotes} className='microphone' alt='redMicro' />
            :
            <img src={greenMicroPhone} onClick={props.stopNotes} className='microphone' alt='greenMicro' />
          :
          null
        }
        <button onClick={props.openNote} className='note-button'>
          Start Note
        </button>
        <button onClick={props.storeNote} className='note-button'>
          Save Note
        </button>
        <button onClick={props.cancelNote} className='note-button'>
          Cancel Note
        </button>
        {
          props.allNotes.map((note, i) => {
            return <span style={{margin: '0 5px'}}>{note.timeStamp}</span>
          })
        }
      </div>
      <div className='note-content-container'>
        <AceEditor 
          mode='markdown'
          theme='textmate'
          value={props.notes}
          onChange={props.updateNotes}
          height='150px'
          width='300px'
          showGutter={false}
          wrapEnabled={true}
          fontSize={16}
          style={{width: '50%', height: '100%'}}
        />
        <Notes notes={props.notes} />
      </div>
    </div>
  )
}
