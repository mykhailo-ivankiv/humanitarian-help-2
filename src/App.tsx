// @ts-nocheck
/* eslint-disable */
import MainMapDemo from "./MainMapDemo";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import DropPoints from "./DropPoints";
import "./App.css";
import BEM from "./helpers/BEM";
const b = BEM("App");

const App = () => {
  return (
    <BrowserRouter>
      <section className={b()}>
        <nav className={b("nav")}>
          Humanitarian help in Netherlands <br />
          drop points
          {/*<Link className={b("link")} to={"/demo"}>*/}
          {/*  Demo*/}
          {/*</Link>*/}
          {/*<Link className={b("link")} to="/drop-points">*/}
          {/*  Drop points Amsterdam*/}
          {/*</Link>*/}
        </nav>
        <Routes>
          <Route path="/demo" element={<MainMapDemo />} />
          <Route path="/drop-points" element={<DropPoints />} />

          <Route path="/*" element={<DropPoints />} />
        </Routes>
      </section>
    </BrowserRouter>
  );
};

export default App;
