import React, { Component } from 'react'
// const { ipcRenderer } = window.require('electron')

export default class Transcript extends Component {
  // constructor() {
  //   super()
  //   this.state = {
  //     transcriptText: ''
  //   }
  //   ipcRenderer.on('load-transcript', (event, text) => {
  //     // console.log('load-transcript callback')
  //     this.setState({
  //       transcriptText: text
  //     })
  //   })
  // }
  
  render() {
    return (
      <div className='transcript'>
        <textarea 
          style={{height: '100%', width: '100%'}} 
          value={this.props.transcriptText} 
          readOnly 
        />
      </div>
    )
  }
}



















/*  */
