import MainMapDemo from './MainMapDemo'
import { Routes, Route, HashRouter } from 'react-router-dom'
import DropPoints from './DropPoints'
import './App.css'
import BEM from './helpers/BEM'
import 'antd/dist/antd.css'
const b = BEM('App')

const App = () => {
  return (
    <HashRouter>
      <section className={b()}>
        <nav className={b('nav')}>
          <h1>Humanitarian help in Netherlands</h1>

          <dl>
            <dt>from 9:00 to 18:00</dt>
            <dd>
              ✉️ <a href="mailto:support@ukrainians.nl">support@ukrainians.nl</a><br/>
              📞 <a href="tel:+31102005661">+31 102005661</a>
            </dd>
          </dl>
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
