import MainMapDemo from './MainMapDemo'
import { Routes, Route, HashRouter } from 'react-router-dom'
import DropPoints from './DropPoints'
import './App.css'
import BEM from './helpers/BEM'
const b = BEM('App')

const App = () => {
  return (
    <HashRouter>
      <section className={b()}>
        <nav className={b('nav')}>
          Humanitarian help in Netherlands <br />
          drop points
        </nav>
        <Routes>
          <Route path="demo" element={<MainMapDemo />} />
          <Route path="drop-points" element={<DropPoints />} />

          <Route path="/">
            <Route path="/:storageId" element={<DropPoints />} />
            <Route path="" element={<DropPoints />} />
          </Route>
        </Routes>
      </section>
    </HashRouter>
  )
}

export default App
