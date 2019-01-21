import React from 'react'
import './App.css'
import Markdown from 'markdown-to-jsx'

export default (props) => {
  return <Markdown options={{forceBlock: true}} style={{fontSize: '24px'}}>{props.notes}</Markdown>
}
