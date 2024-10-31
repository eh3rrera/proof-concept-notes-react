import { Container, Paper, Typography } from '@mui/material';
import NoteEditor from './components/NoteEditor';
import './App.css';

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        SmartNotes
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <NoteEditor />
      </Paper>
    </Container>
  );
}

export default App;
