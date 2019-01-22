import React from 'react'
import Markdown from 'markdown-to-jsx'
import './styles/NoteControlStyles.css'

export default (props) => {
  return <Markdown options={{forceBlock: true}} className='note-markdown'>{props.notes}</Markdown>
}
