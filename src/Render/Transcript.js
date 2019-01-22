import React, { Component } from 'react'
// const { ipcRenderer } = window.require('electron')
import './styles/App.css'

export default class Transcript extends Component {
  
  render() {
    return (
      <textarea
      className='transcript-contents'
        value={this.props.transcriptText} 
        readOnly 
      />
    )
  }
}



















/*  */
