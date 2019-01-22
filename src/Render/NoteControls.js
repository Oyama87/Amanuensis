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
    <div>
      <div className='top-bar'>
      {
        !props.recording ?
        <img src={redMicroPhone} className='microphone' alt='redMicro' />
        :
        <img src={greenMicroPhone} className='microphone' alt='greenMicro' />
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
        />
        <Notes notes={props.notes} />
      </div>
    </div>
  )
}
