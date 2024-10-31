import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Chip,
    Stack,
    Typography,
    Fade,
    CircularProgress,
    Snackbar,
    Alert,
  } from '@mui/material';
import FormatPopup from './FormatPopup';
import { 
  generateTitle, 
  generateTags, 
  formatText,
  generateAutoCompletion 
} from '../utils/openai';

function NoteEditor() {
  const [noteContent, setNoteContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState({
    title: false,
    tags: false,
    suggestion: false,
    format: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setNoteContent(newContent);
    
    // If user is deleting text, hide suggestion
    if (newContent.length < noteContent.length) {
      setShowSuggestion(false);
    }
  };

  const handleKeyDown = async (event) => {
    handleClosePopup();

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      if (!noteContent.trim()) {
        setSnackbar({
          open: true,
          message: 'Please add some content first',
          severity: 'warning'
        });
        return;
      }

      setIsLoading(prev => ({ ...prev, suggestion: true }));
      try {
        const suggestion = await generateAutoCompletion(noteContent);
        setSuggestion(suggestion);
        setShowSuggestion(true);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error generating suggestion',
          severity: 'error'
        });
      } finally {
        setIsLoading(prev => ({ ...prev, suggestion: false }));
      }
    }
  };

  const applySuggestion = () => {
    // Trim any extra spaces from the end of noteContent and beginning of suggestion
    const trimmedContent = noteContent.trimEnd();
    const trimmedSuggestion = suggestion.trimStart();

    // Add a single space between the content and suggestion
    setNoteContent(trimmedContent + ' ' + trimmedSuggestion);
    setSuggestion('');
    setShowSuggestion(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection.toString();
  
    if (selected && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSelectedText(selected);
  
      // Create a span element
      const span = document.createElement('span');
      span.textContent = '\u200b'; // Zero-width space
      span.style.position = 'absolute';
      span.style.width = '1px';
      span.style.height = '1px';
  
      // Insert the span at the end of the selection
      range.collapse(false);
      range.insertNode(span);
  
      setPopupAnchor(span);
    } else {
      setPopupAnchor(null);
    }
  };

  const handleClosePopup = () => {
    if (popupAnchor && popupAnchor.parentNode) {
      popupAnchor.parentNode.removeChild(popupAnchor);
    }
    setPopupAnchor(null);
  };

  const handleFormat = async (instruction) => {
    try {
      const formattedText = await formatText(selectedText, instruction);
      const newContent = noteContent.replace(selectedText, formattedText);
      setNoteContent(newContent);
      setSnackbar({
        open: true,
        message: 'Text formatted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error formatting text',
        severity: 'error',
      });
    } finally {
        handleClosePopup();
    }
  };

  const handleGenerateTitle = async () => {
    if (!noteContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please add some content first',
        severity: 'warning'
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, title: true }));
    try {
      const generatedTitle = await generateTitle(noteContent);
      setTitle(generatedTitle);
      setSnackbar({
        open: true,
        message: 'Title generated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error generating title',
        severity: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, title: false }));
    }
  };

  const handleSuggestTags = async () => {
    if (!noteContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please add some content first',
        severity: 'warning'
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, tags: true }));
    try {
      const generatedTags = await generateTags(noteContent);
      setTags(generatedTags);
      setSnackbar({
        open: true,
        message: 'Tags generated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error generating tags',
        severity: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, tags: false }));
    }
  };

  return (
    <Box>
      {/* Title Section */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button 
          variant="contained" 
          onClick={handleGenerateTitle}
          disabled={isLoading.title}
          startIcon={isLoading.title ? <CircularProgress size={20} /> : null}
        >
          Generate Title
        </Button>
      </Stack>

      {/* Tags Section */}
      <Box mb={2}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => {
              setTags(tags.filter((_, i) => i !== index));
            }}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
        <Button 
          variant="outlined" 
          onClick={handleSuggestTags}
          disabled={isLoading.tags}
          startIcon={isLoading.tags ? <CircularProgress size={20} /> : null}
          sx={{ mt: 1 }}
        >
          Suggest Tags
        </Button>
      </Box>

      {/* Main Text Area */}
      <Box position="relative">
        <TextField
          fullWidth
          multiline
          minRows={10}
          value={noteContent}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={handleTextSelection}
          variant="outlined"
          placeholder="Start typing your note... (Press Shift+Enter for suggestions)"
        />
        
        {/* Auto-completion suggestion */}
        <Fade in={showSuggestion}>
          <Box 
            sx={{ 
              mt: 1,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              display: showSuggestion ? 'block' : 'none'
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Suggested continuation:
            </Typography>
            <Typography>{suggestion}</Typography>
            <Button 
              size="small" 
              onClick={applySuggestion}
              sx={{ mt: 1 }}
            >
              Apply Suggestion
            </Button>
            <Button 
              size="small" 
              onClick={() => setShowSuggestion(false)}
              sx={{ mt: 1, ml: 1 }}
            >
              Dismiss
            </Button>
          </Box>
        </Fade>
      </Box>

      <FormatPopup
        anchorEl={popupAnchor}
        onClose={handleClosePopup}
        onFormat={handleFormat}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default NoteEditor;