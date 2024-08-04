import React from 'react'
import './contextpage.css'
import Navbar from '../../components/Navbar/Navbar'
import Talk from '../../components/TalkToPDF/Talk'

const ContextPage = () => {
  return (
    <div className='bg-container'>
        <Navbar />
        <Talk />
    </div>
  )
}

export default ContextPage