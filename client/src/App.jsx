import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent,
  TextField, Autocomplete, Stack, createTheme, ThemeProvider, CssBaseline,
  Menu, MenuItem, DialogActions, Snackbar, Alert, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PlayArrow as PlayArrowIcon,
  Pause as PauseIcon, MoreVert as MoreVertIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

const darkTheme = createTheme({palette: {mode: 'dark',primary: { main: '#90caf9' },secondary: { main: '#f48fb1' },background: {default: '#121212',paper: '#1e1e1e',},
    text: {primary: '#e0e0e0',secondary: '#b0b0b0',},},
  typography: {fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const API_URL = 'http://localhost:3000/api';
const SOFTWARE_OPTIONS = ['Adobe Photoshop', 'VS Code', 'Figma', 'Microsoft Word', 'Blender', 'Slack'];

const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <TimeTrackerApp />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

function TimeTrackerApp() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const activeTimers = useRef({});
  const notificationTimers = useRef({});

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    return () => {
      Object.values(activeTimers.current).forEach(clearInterval);
      Object.values(notificationTimers.current).forEach(clearTimeout);
    };
  }, [fetchTasks]);

  useEffect(() => {
    scheduleNotifications(tasks);
  }, [tasks]);

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = () => {
    fetchTasks();
    handleCloseModal();
  };

  const handleDeleteRequest = (id) => {
    setTaskToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await fetch(`${API_URL}/tasks/${taskToDelete}`, { method: 'DELETE' });
        fetchTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
      } finally {
        setConfirmOpen(false);
        setTaskToDelete(null);
      }
    }
  };
  
  const handleMarkComplete = async (task) => {

    if (activeTimers.current[task._id]) {
        clearInterval(activeTimers.current[task._id]);
        delete activeTimers.current[task._id];
    }
    try {
        await fetch(`${API_URL}/tasks/${task._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed', remainingDuration: 0 })
        });
        fetchTasks();
    } catch (error) {
        console.error("Failed to mark task as complete:", error);
    }
  };

  const scheduleNotifications = (currentTasks) => {

    Object.values(notificationTimers.current).forEach(clearTimeout);

    notificationTimers.current = {};

    currentTasks.forEach(task => {
      const due = new Date(task.dueDate).getTime();
      const notificationTime = due - (task.duration * 60 * 1000);
      const now = new Date().getTime();

      if (notificationTime > now) {
        const timeUntilNotification = notificationTime - now;

        const timeoutId = setTimeout(() => {

          setSnackbar({
            open: true,

            message: `Reminder: '${task.taskName}' is due in ${task.duration} minutes.`,

            severity: 'info'
          });
        }, timeUntilNotification);
        notificationTimers.current[task._id] = timeoutId;
      }
    });
  };

  const startTimer = (taskId) => {
    if (activeTimers.current[taskId]) clearInterval(activeTimers.current[taskId]);

    const intervalId = setInterval(() => {
      setTasks(currentTasks =>

        currentTasks.map(task => {
          if (task._id === taskId && task.remainingDuration > 0) {
            const newRemaining = task.remainingDuration - 1;

            if (newRemaining <= 0) {
              pauseTimer(taskId, 0);

              return { ...task, remainingDuration: 0, status: 'Completed' };

            }
            return { ...task, remainingDuration: newRemaining };
          }
          return task;
        })
      );
    }, 1000);

    activeTimers.current[taskId] = intervalId;
  };

  const pauseTimer = async (taskId, remainingDuration) => {
    if (activeTimers.current[taskId]) {

      clearInterval(activeTimers.current[taskId]);

      delete activeTimers.current[taskId];
    }
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {

        method: 'PUT',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ remainingDuration, status: 'Pending' })

      });
    } catch (error) {
      console.error("Failed to save remaining time:", error);
    }
  };

  const handlePlayPause = (task) => {
    const isRunning = !!activeTimers.current[task._id];

    if (isRunning) {
      pauseTimer(task._id, task.remainingDuration);

    } else {
      startTimer(task._id);
    }
    setTasks(currentTasks =>

      currentTasks.map(t =>

        t._id === task._id ? { ...t, status: isRunning ? 'Pending' : 'In Progress' } : t
      )
    );
  };

  const handleSnackbarClose = (event, reason) => {

    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  const activeTasks = tasks.filter(task => task.status !== 'Completed');

  const completedTasks = tasks.filter(task => task.status === 'Completed');

  return (
    <Box sx={{ display: 'flex', height: '100vh', p: 2 }}>

      <Box sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, p: 3, display: 'flex', flexDirection: 'column' }}>

        <Typography variant="h5" sx={{ mb: 2 }}>Today</Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {activeTasks.map(task => (

            <TaskItem

              key={task._id}

              task={task}
              onPlayPause={handlePlayPause}
              onEdit={handleOpenModal}

              onDelete={handleDeleteRequest}

              onMarkComplete={handleMarkComplete}
            />
          ))}
          {completedTasks.length > 0 && (
            <>
              <Divider sx={{ my: 2 }}>Completed</Divider>
              {completedTasks.map(task => (
                <TaskItem

                  key={task._id}
                  task={task}
                  onPlayPause={handlePlayPause}

                  onEdit={handleOpenModal}
                  onDelete={handleDeleteRequest}
                  onMarkComplete={handleMarkComplete}
                />
              ))}
            </>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Add Task
        </Button>

      </Box>
      <TaskDialog open={isModalOpen} onClose={handleCloseModal} task={editingTask} onSave={handleSaveTask} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}

        onConfirm={handleConfirmDelete}
        title="Delete Task"

        message="Are you sure you want to delete this task?"
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}

      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function TaskItem({ task, onPlayPause, onEdit, onDelete, onMarkComplete }) {
  const isRunning = task.status === 'In Progress';
  const isCompleted = task.status === 'Completed';

  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);

  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit(task);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(task._id);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, bgcolor: isCompleted ? 'action.disabledBackground' : 'action.hover', borderRadius: 1.5, opacity: isCompleted ? 0.6 : 1 }}>
      <IconButton onClick={() => onMarkComplete(task)} color="success" disabled={isCompleted}>
        <CheckCircleIcon />
      </IconButton>
      <Box sx={{ flexGrow: 1, ml: 1.5 }}>
        <Typography variant="body1" sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.taskName}</Typography>
        
        <Typography variant="body2" color="text.secondary">{task.software}</Typography>
      </Box>
      <Typography variant="h6" sx={{ mr: 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
        {formatTime(task.remainingDuration)}
      </Typography>
      {!isCompleted && (
        <>
          <IconButton onClick={() => onPlayPause(task)} color={isRunning ? "secondary" : "primary"}>
            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
            <MenuItem onClick={handleEditClick}><EditIcon sx={{ mr: 1.5 }} fontSize="small" /> Edit</MenuItem>
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'secondary.main' }}><DeleteIcon sx={{ mr: 1.5 }} fontSize="small" /> Delete</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}

const TaskDialog = ({ open, onClose, task, onSave }) => {
  const [formState, setFormState] = useState({ taskName: '', duration: '', software: null });
  const [dueDate, setDueDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (task) {
        setFormState({ taskName: task.taskName, duration: task.duration, software: task.software });
        setDueDate(dayjs(task.dueDate));
      } else {
        setFormState({ taskName: '', duration: '', software: null });
        setDueDate(dayjs());
      }
    }
  }, [task, open]);

  const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });
  const handleSoftwareChange = (e, newValue) => setFormState({ ...formState, software: newValue });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!dueDate || !formState.software) {
      setError("All fields are required.");
      return;
    }

    const payload = { ...formState, duration: Number(formState.duration), dueDate: dueDate.toDate() };
    const url = task ? `${API_URL}/tasks/${task._id}` : `${API_URL}/tasks`;
    const method = task ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save task');
      }
      onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <TextField name="taskName" label="Task Name" value={formState.taskName} onChange={handleChange} fullWidth margin="normal" required />
          <TextField name="duration" label="Total Duration (minutes)" type="number" value={formState.duration} onChange={handleChange} fullWidth margin="normal" required inputProps={{ min: 0 }} />
          <Autocomplete freeSolo options={SOFTWARE_OPTIONS} value={formState.software} onChange={handleSoftwareChange} renderInput={(params) => (<TextField {...params} label="Software" margin="normal" required />)} />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <DatePicker label="Due Date" value={dueDate} onChange={setDueDate} renderInput={(params) => <TextField {...params} fullWidth />} />
            <TimePicker label="Due Time" value={dueDate} onChange={setDueDate} renderInput={(params) => <TextField {...params} fullWidth />} />
          </Stack>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
            <Button type="submit" variant="contained">{task ? 'Save Changes' : 'Add Task'}</Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="secondary" variant="contained">
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default App;
