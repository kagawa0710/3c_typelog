import { render } from '@redwoodjs/testing/web'

import NlPage from './NlPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('NlPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<NlPage />)
    }).not.toThrow()
  })
})
