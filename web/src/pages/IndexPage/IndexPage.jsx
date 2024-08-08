import { Button, Container } from '@mui/material'

import { Link, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

const IndexPage = () => {
  return (
    <>
      <Metadata title="Index" description="Index page" />

      <Container
        maxWidth="sm"
        style={{ textAlign: 'center', marginTop: '2rem' }}
      >
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/code"
          style={{ margin: '1rem' }}
        >
          コードを書く場合
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/code/play"
          style={{ margin: '1rem' }}
        >
          コードを再生する場合
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/nl"
          style={{ margin: '1rem' }}
        >
          自然言語を書く場合
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/nl/play"
          style={{ margin: '1rem' }}
        >
          自然言語を再生する場合
        </Button>
      </Container>
    </>
  )
}

export default IndexPage
