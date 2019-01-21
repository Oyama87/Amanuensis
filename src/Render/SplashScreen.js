import React from 'react'
import './styles/SplashStyles.css'
import logo from '../writing.svg'

export default props => {
  return (
    <div className='splash-container'>
      <img src={logo} alt='app icon' className='icon'/>
      <h1>Amanuensis</h1>
      <div className='splash-btn-container'>
        <button className='splash-button' onClick={props.load}>New Project</button>
        <button className='splash-button'>Open Project</button>
      </div>
      <div>Icons made by Freepik from www.flaticon.com are licensed by CC 3.0 BY</div>
    </div>
  )
}
