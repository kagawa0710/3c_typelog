import { useState, useRef, useEffect } from 'react'

import { Button, Box, Typography, Slider } from '@mui/material'
import { styled } from '@mui/system'
import Prism from 'prismjs'
import Editor from 'react-simple-code-editor'

import 'prismjs/themes/prism.css'
import { Metadata } from '@redwoodjs/web'

const StyledEditorWrapper = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'flex',
  position: 'relative', // 追加: 行番号を相対位置で配置するため
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Inconsolata", "Fira code", "Fira Mono", monospace', // "Inconsolata"フォントを追加
  fontSize: '16px',
  '& pre': {
    margin: 0,
    padding: '10px 0 10px 10px',
    background: 'transparent',
  },
  maxHeight: '300px',
  overflow: 'auto',
}))

const LineNumbers = styled('div')(({ theme, pad }) => ({
  fontFamily: 'Inconsolata, monospace',
  paddingTop: '10px',
  paddingRight: '10px',
  textAlign: 'right',
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  whiteSpace: 'pre',
  userSelect: 'none',
  background: `linear-gradient(90deg, #EDF2F7 ${20 + pad * 8}px, ${
    20 + pad * 8
  }px, #FFF 100%)`,
  opacity: 1,
  '& .highlighted': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}))

const NlPlayPage = () => {
  const [inputLog, setInputLog] = useState([])
  const [replayCode, setReplayCode] = useState('')
  const [isReplaying, setIsReplaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeThreshold, setTimeThreshold] = useState(1000) // デフォルト1秒
  const replayTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (validateJsonFormat(json)) {
          setInputLog(json)
          const startTime = json[0].timestamp
          const endTime = json[json.length - 1].timestamp
          setTimeLeft((endTime - startTime) / 1000) // 秒単位に変換
          alert('JSON file is valid and loaded successfully.')
        } else {
          alert('Invalid JSON format.')
        }
      } catch (error) {
        alert('Error reading JSON file.')
      }
    }

    reader.readAsText(file)
  }

  const validateJsonFormat = (json) => {
    return Array.isArray(json)
  }

  const handleReplay = () => {
    setReplayCode('')
    setIsReplaying(true)
    startCountdownTimer()
    let index = 0

    const replayNextChar = () => {
      if (index >= inputLog.length) {
        setIsReplaying(false)
        clearTimeout(replayTimerRef.current)
        clearInterval(countdownTimerRef.current)
        return
      }

      const event = inputLog[index]
      setReplayCode(event.value)

      index++
      if (index < inputLog.length) {
        const nextEvent = inputLog[index]
        const delay = (nextEvent.timestamp - event.timestamp) / playbackSpeed
        replayTimerRef.current = setTimeout(replayNextChar, delay)
      } else {
        setIsReplaying(false)
        clearInterval(countdownTimerRef.current)
      }
    }

    replayNextChar()
  }

  const handleReplayStop = () => {
    clearTimeout(replayTimerRef.current)
    clearInterval(countdownTimerRef.current)
    replayTimerRef.current = null
    setIsReplaying(false)
  }

  const handleSpeedChange = (event, newValue) => {
    setPlaybackSpeed(newValue)
    if (isReplaying) {
      clearInterval(countdownTimerRef.current)
      startCountdownTimer()
    }
  }

  const startCountdownTimer = () => {
    clearInterval(countdownTimerRef.current)
    const totalReplayTime =
      (inputLog[inputLog.length - 1].timestamp - inputLog[0].timestamp) / 1000
    let timeRemaining = totalReplayTime / playbackSpeed
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft(timeRemaining)
      if (timeRemaining <= 1) {
        clearInterval(countdownTimerRef.current)
        handleReplayStop() // タイマーが0になったら再生も停止
        return
      }
      timeRemaining -= 1 / playbackSpeed // 再生速度に応じて減少速度を調整
    }, 1000 / playbackSpeed)
  }

  const getHighlightedLineNumbers = () => {
    const highlightedLines = new Set()
    for (let i = 1; i < inputLog.length; i++) {
      const timeDiff = inputLog[i].timestamp - inputLog[i - 1].timestamp
      if (timeDiff > timeThreshold) {
        highlightedLines.add(i)
      }
    }
    return highlightedLines
  }

  const highlightedLines = getHighlightedLineNumbers()

  const renderLineNumbers = (lines) => {
    return lines.split('\n').map((line, index) => (
      <span
        key={index}
        className={highlightedLines.has(index + 1) ? 'highlighted' : ''}
      >
        {index + 1}
        {'\n'}
      </span>
    ))
  }

  const handleThresholdChange = (event, newValue) => {
    setTimeThreshold(newValue)
  }

  useEffect(() => {
    return () => {
      clearTimeout(replayTimerRef.current)
      clearInterval(countdownTimerRef.current)
    }
  }, [])

  return (
    <>
      <Metadata title="Play" description="Play page" />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h5" mt={2}>
          Replay Input
        </Typography>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
        />{' '}
        <StyledEditorWrapper>
          <LineNumbers>{renderLineNumbers(replayCode)}</LineNumbers>
          <Editor
            value={replayCode}
            onValueChange={() => {}}
            highlight={(code) =>
              Prism.highlight(code, Prism.languages.javascript, 'javascript')
            }
            padding={10}
            style={{
              fontFamily: 'Inconsolata, monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              border: `1px solid ${isReplaying ? 'red' : '#ccc'}`,
              backgroundColor: isReplaying ? '#f0f0f0' : 'transparent',
              lineHeight: '1.5em',
            }}
            readOnly
            placeholder="ここに再生"
            textareaId="codeArea"
            preClassName="language-javascript"
          />
        </StyledEditorWrapper>
        <Box sx={{ width: 300, mt: 2 }}>
          <Typography gutterBottom>再生速度: {playbackSpeed}x</Typography>
          <Slider
            value={playbackSpeed}
            onChange={handleSpeedChange}
            min={0.5}
            max={5}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ width: 300, mt: 2 }}>
          <Typography gutterBottom>時間閾値: {timeThreshold}ms</Typography>
          <Slider
            value={timeThreshold}
            onChange={handleThresholdChange}
            min={100}
            max={5000}
            step={100}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
        <Typography variant="h6" mt={2}>
          残り時間: {timeLeft.toFixed(1)}秒
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={handleReplay}
          disabled={isReplaying}
        >
          再生
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReplayStop}
          disabled={!isReplaying}
        >
          再生終了
        </Button>
      </Box>
    </>
  )
}

export default NlPlayPage
