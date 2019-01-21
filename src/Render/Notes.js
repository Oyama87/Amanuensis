import React from 'react'
import './App.css'
import Markdown from 'markdown-to-jsx'

export default (props) => {
  return <Markdown>{props.notes}</Markdown>
}
