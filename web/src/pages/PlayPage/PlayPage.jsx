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
  flexDirection: 'row',
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[400]}`,
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: '16px',
  '& pre': {
    margin: 0,
    padding: '10px 0 10px 10px',
    background: 'transparent',
  },
  maxHeight: '300px',
  overflow: 'auto',
}))

const LineNumbers = styled('div')(({ theme }) => ({
  padding: '10px 0 10px 10px',
  borderRight: `1px solid ${theme.palette.grey[400]}`,
  userSelect: 'none',
  textAlign: 'right',
  paddingRight: '10px',
  lineHeight: '1.5em',
  fontSize: '16px',
  color: theme.palette.text.secondary,
}))

const HighlightedLineNumber = styled(LineNumbers)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
}))

const PlayPage = () => {
  const [inputLog, setInputLog] = useState([])
  const [replayCode, setReplayCode] = useState('')
  const [isReplaying, setIsReplaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const replayTimerRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (validateJsonFormat(json)) {
          setInputLog(json)
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
    let index = 0

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
        replayTimerRef.current = setTimeout(replayNextChar, delay)
      } else {
        setIsReplaying(false)
      }
    }

    replayNextChar()
  }

  const handleReplayStop = () => {
    clearTimeout(replayTimerRef.current)
    replayTimerRef.current = null
    setIsReplaying(false)
  }

  const handleSpeedChange = (event, newValue) => {
    setPlaybackSpeed(newValue)
  }

  const getHighlightedLineNumbers = () => {
    const highlightedLines = new Set()
    inputLog.forEach((log, index) => {
      if (log.timeTaken > 3000) {
        highlightedLines.add(index + 1)
      }
    })
    return highlightedLines
  }

  const highlightedLines = getHighlightedLineNumbers()

  useEffect(() => {
    return () => {
      clearTimeout(replayTimerRef.current)
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
        />
        <StyledEditorWrapper>
          <Editor
            value={replayCode}
            onValueChange={() => {}} // 読み取り専用のため空の関数
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
              lineHeight: '1.5em',
            }}
            readOnly
            placeholder="ここに再生"
            textareaId="codeArea"
            preClassName="language-javascript"
          />
          <div>
            {replayCode
              .split('\n')
              .map((_, i) =>
                highlightedLines.has(i + 1) ? (
                  <HighlightedLineNumber key={i}>{i + 1}</HighlightedLineNumber>
                ) : (
                  <LineNumbers key={i}>{i + 1}</LineNumbers>
                )
              )}
          </div>
        </StyledEditorWrapper>
        <Box sx={{ width: 300, mt: 2 }}>
          <Typography gutterBottom>再生速度: {playbackSpeed}x</Typography>
          <Slider
            value={playbackSpeed}
            onChange={handleSpeedChange}
            min={2}
            max={5}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
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

export default PlayPage
