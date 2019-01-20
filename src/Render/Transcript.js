import React, { Component } from 'react'
// const { ipcRenderer } = window.require('electron')
import './App.css'

export default class Transcript extends Component {
  
  render() {
    return (
      <div className='transcript'>
        <textarea 
          style={{height: '100%', width: '100%', fontSize: '1em'}} 
          value={this.props.transcriptText} 
          readOnly 
        />
      </div>
    )
  }
}



















/*  */
