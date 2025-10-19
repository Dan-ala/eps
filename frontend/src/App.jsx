import { Outlet } from "react-router-dom"
import Signin from "./components/Signin"


function App() {

  return (
    <>
    <main>
      <Signin/>
      <Outlet/>
    </main>
    </>
  )
}

export default App
