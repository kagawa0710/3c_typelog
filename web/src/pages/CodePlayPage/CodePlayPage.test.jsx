import { render } from '@redwoodjs/testing/web'

import CodePlayPage from './CodePlayPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('CodePlayPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<CodePlayPage />)
    }).not.toThrow()
  })
})
