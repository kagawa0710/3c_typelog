// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      <Route path="/" page={IndexPage} name="index" />
      <Route path="/matsuda" page={MatsudaPage} name="matsuda" />
      <Route path="/play" page={PlayPage} name="play" />
      <Route path="/code" page={CodePage} name="code" />
      <Route path="/code/play" page={CodePlayPage} name="code-play" />
      <Route path="/nl" page={NlPage} name="nl" />
      <Route path="/nl/play" page={NlPlayPage} name="nl-play" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
