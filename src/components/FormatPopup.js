import { Paper, Button, Popper, ClickAwayListener } from '@mui/material';

function FormatPopup({ anchorEl, onClose, onFormat }) {
  const open = Boolean(anchorEl);

  const formatOptions = [
    { label: 'Make it formal', instruction: 'Rewrite this in a formal tone' },
    { label: 'Make it concise', instruction: 'Make this more concise' },
    { label: 'Fix grammar', instruction: 'Fix any grammar issues in this text' },
    { label: 'Rephrase', instruction: 'Rephrase this text' },
  ];

  return (
    <Popper 
      open={open} 
      anchorEl={anchorEl} 
      placement="top-start"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, -8],
          },
        },
        {
          name: 'flip',
          enabled: true,
        },
      ]}
      style={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper 
          sx={{ 
            p: 1,
            backgroundColor: 'white',
            boxShadow: 3,
          }}
        >
          {formatOptions.map((option, index) => (
            <Button
              key={index}
              size="small"
              onClick={() => onFormat(option.instruction)}
              sx={{ 
                display: 'block', 
                mb: 0.5,
                minWidth: '150px',
                textAlign: 'left',
                '&:last-child': { mb: 0 }
              }}
            >
              {option.label}
            </Button>
          ))}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}

export default FormatPopup;