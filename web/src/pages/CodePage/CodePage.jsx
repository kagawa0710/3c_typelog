import { useState, useEffect, useRef } from 'react'

import { Button, Box, Typography } from '@mui/material'
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
  position: 'relative',
}))

const LineNumbers = styled('div')(({ theme, lines }) => ({
  fontFamily: 'Fira code, Fira Mono, monospace',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '10px 0 10px 10px',
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  userSelect: 'none',
  textAlign: 'right',
  color: theme.palette.text.secondary,
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: `${String(lines).length + 2}ch`,
}))

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}))

const CodePage = () => {
  const [inputLog, setInputLog] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(360)
  const [code, setCode] = useState('')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [highlightThreshold, setHighlightThreshold] = useState(3000)
  const [highlightLines, setHighlightLines] = useState(false)
  const [isRunning, setRun] = useState(false)

  const timerRef = useRef(null)

  const handleClick = () => {
    if (isRunning) return
    setRun(true)

    setCode('')
    setInputLog([])
    setStartTime(Date.now())
    setTimeLeft(360)

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(interval)
          handleStop()
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
    setRun(false)
    clearInterval(timerRef.current)
    alert('制限時間になったか、終了ボタンが押されました！')
    const shouldDownload = window.confirm(
      '入力データのJSONファイルをダウンロードしますか？'
    )
    if (shouldDownload) {
      handleDownloadJson()
    }
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

  const lines = code.split('\n').length

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
        <StyledEditorWrapper lines={lines}>
          <LineNumbers lines={lines}>
            {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
          </LineNumbers>
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
              marginLeft: `${String(lines).length + 2}ch`,
              border: 'none',
            }}
            placeholder="ここに入力"
          />
        </StyledEditorWrapper>
        <ButtonContainer>
          <Button variant="contained" color="primary" onClick={handleClick} disabled={isRunning}>
            開始
          </Button>
          <Button variant="contained" color="secondary" onClick={handleStop}>
            終了
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
