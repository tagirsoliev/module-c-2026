import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Reg from './Reg/Reg'
import Login from './Login/Login'
import BoardsList from './BoardsList/BoardsList'
import CreateBoard from './CreateBoard/CreateBoard'
import Board from './Board/Board'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Reg />} />
        <Route path='/login' element={<Login />} />
        <Route path='/boards' element={<BoardsList />} />
        <Route path='/create-board' element={<CreateBoard />} />
        <Route path='/boards/:id' element={<Board />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
