import { render } from '@redwoodjs/testing/web'

import MatsudaPage from './MatsudaPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('MatsudaPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<MatsudaPage />)
    }).not.toThrow()
  })
})
