import { useState, useEffect, useRef } from 'react'

import {
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material'
import { styled } from '@mui/system'
import Prism from 'prismjs'
import Editor from 'react-simple-code-editor'

import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-javascript'
import { Metadata, navigate } from '@redwoodjs/web'

const StyledEditorWrapper = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  '& pre': {
    margin: 0,
    padding: '10px',
    background: 'transparent',
  },
  maxHeight: '300px',
  overflow: 'auto',
}))

const LineNumbers = styled('div')(({ theme }) => ({
  paddingTop: '7px',
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  userSelect: 'none',
  textAlign: 'right',
  paddingRight: '10px',
}))

const HighlightedLineNumber = styled('div')(({ theme }) => ({
  padding: '7px',
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  userSelect: 'none',
  textAlign: 'right',
  paddingRight: '10px',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
}))

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}))

const CodePage = () => {
  const [inputLog, setInputLog] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(180)
  const [code, setCode] = useState('')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [highlightThreshold, setHighlightThreshold] = useState(3000)
  const [highlightLines, setHighlightLines] = useState(false)
  const timerRef = useRef(null)

  const handleClick = () => {
    setCode('')
    setInputLog([])
    setStartTime(Date.now())
    setTimeLeft(180)

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(interval)
          return 0
        }
        return prevTimeLeft - 1
      })
    }, 1000)
    timerRef.current = interval
  }

  const handleInput = (value) => {
    const currentTime = Date.now()
    setCode(value)
    setInputLog((prevInputLog) => [
      ...prevInputLog,
      {
        value,
        timestamp: currentTime,
      },
    ])
  }

  const handleStop = () => {
    clearInterval(timerRef.current)
  }

  const handleSpeedChange = (event) => {
    setPlaybackSpeed(event.target.value)
  }

  const handleThresholdChange = (event) => {
    setHighlightThreshold(event.target.value)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(inputLog, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inputLog.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  const getHighlightedLineNumbers = () => {
    const highlightedLines = new Set()
    inputLog.forEach((log, index) => {
      if (log.timeTaken > highlightThreshold && code.split('\n')[index]) {
        highlightedLines.add(index + 1)
      }
    })
    return highlightedLines
  }

  const highlightedLines = getHighlightedLineNumbers()

  const handleReplayRedirect = () => {
    navigate('/play')
  }

  return (
    <>
      <Metadata title="Test" description="Test page" />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h5" mt={2}>
          Input
        </Typography>
        <StyledEditorWrapper>
          <div>
            {code
              .split('\n')
              .map((_, i) =>
                highlightedLines.has(i + 1) && highlightLines ? (
                  <HighlightedLineNumber key={i}>{i + 1}</HighlightedLineNumber>
                ) : (
                  <LineNumbers key={i}>{i + 1}</LineNumbers>
                )
              )}
          </div>
          <Editor
            value={code}
            onValueChange={handleInput}
            highlight={(code) =>
              Prism.highlight(code, Prism.languages.javascript, 'javascript')
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              border: `1px solid #ccc`,
            }}
            placeholder="ここに入力"
          />
        </StyledEditorWrapper>
        <ButtonContainer>
          <Button variant="contained" color="primary" onClick={handleClick}>
            開始
          </Button>
          <Button variant="contained" color="secondary" onClick={handleStop}>
            終了
          </Button>
          <Button variant="contained" color="info" onClick={handleDownloadJson}>
            JSONダウンロード
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => (window.location.href = '/play')}
          >
            jsonファイルから再生してみる
          </Button>
        </ButtonContainer>
        <Typography variant="h6" mt={2}>
          残り時間: {timeLeft}秒
        </Typography>
      </Box>
    </>
  )
}

export default CodePage
