import { render } from '@redwoodjs/testing/web'

import CodePage from './CodePage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('CodePage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<CodePage />)
    }).not.toThrow()
  })
})
