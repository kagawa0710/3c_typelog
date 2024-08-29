import { useState, useRef, useEffect } from 'react'

import { Button, Box, Typography, Slider } from '@mui/material'
import { styled } from '@mui/system'

import { Metadata } from '@redwoodjs/web'

const StyledTextareaWrapper = styled('div')(({ theme }) => ({
  width: '90%',
  margin: '10px auto',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  maxHeight: '300px',
  overflow: 'auto',
  position: 'relative',
}))

const NlPlayPage = () => {
  const [inputLog, setInputLog] = useState([])
  const [replayCode, setReplayCode] = useState('')
  const [isReplaying, setIsReplaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeThreshold, setTimeThreshold] = useState(1000)
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
        <StyledTextareaWrapper>
          <textarea
            value={replayCode}
            onChange={() => {}}
            style={{
              fontFamily: 'Inconsolata, monospace',
              fontSize: 16,
              flexGrow: 1,
              minHeight: '200px',
              border: `1px solid ${isReplaying ? 'red' : '#ccc'}`,
              backgroundColor: isReplaying ? '#f0f0f0' : 'transparent',
              lineHeight: '1.5em',
              color: 'black',
              width: '100%',
              resize: 'none',
            }}
            readOnly
            placeholder="ここに再生"
          />
        </StyledTextareaWrapper>
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
