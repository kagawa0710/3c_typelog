import { render } from '@redwoodjs/testing/web'

import NlPlayPage from './NlPlayPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('NlPlayPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<NlPlayPage />)
    }).not.toThrow()
  })
})
