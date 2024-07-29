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

// Load the language syntax for PrismJS
import 'prismjs/components/prism-javascript'

import { Metadata } from '@redwoodjs/web'

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
  // color: theme.palette.text.secondary,
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

const OutputBox = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  padding: '10px',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  backgroundColor: theme.palette.grey[100],
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  whiteSpace: 'pre-wrap',
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
  const [replayCode, setReplayCode] = useState('')
  const [output, setOutput] = useState('')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [highlightThreshold, setHighlightThreshold] = useState(3000)
  const [isReplaying, setIsReplaying] = useState(false)
  const [highlightLines, setHighlightLines] = useState(false)
  const timerRef = useRef(null)
  const replayTimerRef = useRef(null)

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

  const handleReplay = () => {
    setReplayCode('')
    setIsReplaying(true)
    let index = 0
    let lastTimestamp = inputLog[0]?.timestamp || 0

    const replayNextChar = () => {
      if (index >= inputLog.length) {
        setIsReplaying(false)
        return
      }

      const event = inputLog[index]
      setReplayCode(event.value)

      index++
      if (index < inputLog.length) {
        const nextEvent = inputLog[index]
        const delay = (nextEvent.timestamp - event.timestamp) / playbackSpeed
        setTimeout(replayNextChar, delay)
      } else {
        setIsReplaying(false)
      }
    }

    replayNextChar()
  }

  const handleReplayStop = () => {
    clearInterval(replayTimerRef.current)
    setIsReplaying(false)
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
      clearInterval(replayTimerRef.current)
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
              border: `1px solid ${isReplaying ? 'red' : '#ccc'}`,
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
          <Button
            variant="contained"
            color="warning"
            onClick={() => setHighlightLines((prev) => !prev)}
          >
            ハイライト{highlightLines ? '解除' : '適用'}
          </Button>
          <Button variant="contained" color="info" onClick={handleDownloadJson}>
            JSONダウンロード
          </Button>
        </ButtonContainer>
        <Typography variant="h6" mt={2}>
          残り時間: {timeLeft}秒
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 120, mt: 2 }}>
          <InputLabel id="playback-speed-label">速度</InputLabel>
          <Select
            labelId="playback-speed-label"
            id="playback-speed"
            value={playbackSpeed}
            onChange={handleSpeedChange}
            label="速度"
          >
            <MenuItem value={0.5}>0.5x</MenuItem>
            <MenuItem value={1}>1x</MenuItem>
            <MenuItem value={2}>2x</MenuItem>
            <MenuItem value={3}>3x</MenuItem>
            <MenuItem value={5}>5x</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="highlight-threshold"
          label="ハイライト閾値(ms)"
          type="number"
          value={highlightThreshold}
          onChange={handleThresholdChange}
          sx={{ mt: 2, minWidth: 120 }}
        />
        <Typography variant="h5" mt={4}>
          Output
        </Typography>
        <StyledEditorWrapper>
          <div>
            {replayCode
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
            value={replayCode}
            highlight={(code) =>
              Prism.highlight(code, Prism.languages.javascript, 'javascript')
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              border: `1px solid ${isReplaying ? 'red' : '#ccc'}`,
              backgroundColor: isReplaying ? '#f0f0f0' : 'transparent',
            }}
            readOnly
            placeholder="ここに再生"
          />
        </StyledEditorWrapper>
        <ButtonContainer>
          <Button variant="contained" color="success" onClick={handleReplay}>
            再生
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleReplayStop}
          >
            再生終了
          </Button>
        </ButtonContainer>
      </Box>
    </>
  )
}

export default CodePage
