import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton, ThemeProvider, createTheme, CssBaseline,
    CircularProgress, Alert, Grid, Paper, Chip, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Container,
    Tabs, Tab, Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,FormControlLabel, Switch
} from '@mui/material';
import {
    Dashboard as DashboardIcon, Folder as FolderIcon, Timer as TimerIcon, Event as EventIcon,
    CheckCircle as CheckCircleIcon, Group as GroupIcon, BarChart as BarChartIcon, Logout as LogoutIcon,
    Add as AddIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon, Delete as DeleteIcon,
    ChevronLeft, ChevronRight, PendingActions as PendingActionsIcon, HourglassTop as HourglassTopIcon, TaskAlt as TaskAltIcon,
    PlayArrow, Pause, Refresh
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

dayjs.extend(isBetween);

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#333333', secondary: '#666666' },
    },
    typography: { fontFamily: 'Inter, sans-serif' },
    components: {
        MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 'bold' } } },
        MuiCard: { styleOverrides: { root: { boxShadow: 'none', border: '1px solid #e0e0e0' } } }
    }
});

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const api = useMemo(() => ({
        get: async (url) => fetch(`http://localhost:3000${url}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        post: async (url, data) => fetch(`http://localhost:3000${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }),
        put: async (url, data) => fetch(`http://localhost:3000${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) }),
        delete: async (url) => fetch(`http://localhost:3000${url}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }),
    }), [token]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/api/auth/me');
                    if (response.ok) setUser(await response.json());
                    else logout();
                } catch (e) { logout(); }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token, api, logout]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const value = { user, token, login, logout, api, loading };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function App() {
    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <AuthProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Main />
                </LocalizationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function Main() {
    const { user, token, loading } = useAuth();
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    return token && user ? <Layout /> : <AuthScreen />;
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'background.default',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 720, 
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Typography>

        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm switchToLogin={() => setIsLogin(true)} />
        )}

        <Button fullWidth onClick={() => setIsLogin(!isLogin)} sx={{ mt: 2 }}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </Button>
      </Paper>
    </Box>
  );
}

function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            const { token } = await response.json();
            login(token);
        } else {
            setError('Login failed! Please check your credentials.');
        }
    };
    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{error}</Alert>}
            <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign In</Button>
        </Box>
    );
}

function RegisterForm({ switchToLogin }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [adminPin, setAdminPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) return setError("Passwords do not match.");
        if (role === 'Admin' && adminPin !== '1111') return setError("Invalid Supervisor PIN.");

        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password, role })
        });

        if (response.ok) {
            alert('Registration successful! Please sign in.');
            switchToLogin();
        } else {
            const data = await response.json();
            setError(data.message || 'Registration failed.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField name="firstName" required fullWidth label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField name="lastName" required fullWidth label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} /></Grid>
                <Grid item xs={12}><TextField name="email" required fullWidth label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} /></Grid>
                <Grid item xs={12}><TextField name="password" required fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></Grid>
                <Grid item xs={12}><TextField name="confirmPassword" required fullWidth label="Re-enter Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Role</InputLabel><Select value={role} label="Role" onChange={e => setRole(e.target.value)}><MenuItem value="Employee">Employee</MenuItem><MenuItem value="Admin">Supervisor</MenuItem></Select></FormControl></Grid>
                {role === 'Admin' && (<Grid item xs={12}><TextField name="adminPin" required fullWidth label="4-Digit Supervisor PIN" type="password" inputProps={{ maxLength: 4 }} value={adminPin} onChange={e => setAdminPin(e.target.value)} /></Grid>)}
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign Up</Button>
        </Box>
    );
}


function Layout() {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const navItems = user.role === 'Admin' ?
        [
            //{ text: 'Team Dashboard', icon: <GroupIcon />, page: 'dashboard' },
            { text: 'Projects', icon: <FolderIcon />, page: 'projects' },
            { text: 'Approvals', icon: <CheckCircleIcon />, page: 'approvals' },
            { text: 'Reports', icon: <BarChartIcon />, page: 'reports' }
        ] :
        [
            { text: 'My Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
            { text: 'My Timesheet', icon: <TimerIcon />, page: 'timesheet' },
            { text: 'My Projects', icon: <FolderIcon />, page: 'kanban' },
            { text: 'My Leave', icon: <EventIcon />, page: 'leave' }
        ];

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <Box sx={{ width: 260, bgcolor: 'background.paper', p: 2, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>ProTime</Typography>
                <List>
                    {navItems.map(item => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton selected={currentPage === item.page} onClick={() => setCurrentPage(item.page)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <Divider />
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{user.name.charAt(0)}</Avatar>
                    <ListItemText primary={user.name} secondary={user.role} />
                    <IconButton onClick={logout}><LogoutIcon /></IconButton>
                </Box>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
                {currentPage === 'dashboard' && (user.role === 'Admin' ? <AdminDashboard /> : <MemberDashboard />)}
                {currentPage === 'projects' && <ProjectsPage />}
                {currentPage === 'approvals' && <ApprovalsPage />}
                {currentPage === 'reports' && <ReportsPage />}
                {currentPage === 'timesheet' && <MyTimesheetPage />}
                {currentPage === 'leave' && <MyLeavePage />}
                {currentPage === 'kanban' && <EmployeeKanban />}
            </Box>
        </Box>
    );
}



//Main Functions
function MemberDashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    weeklyHours: 0,
    pendingLeaveRequests: 0,
    approvedLeaveDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const startOfWeek = dayjs().startOf('week').toISOString();
    try {
      let weeklyHours = 0;
      const tsRes = await api.get(`/api/timesheets/my-sheets?startDate=${startOfWeek}&endDate=${dayjs().endOf('week').toISOString()}`);
      if (tsRes.ok) {
        const sheets = await tsRes.json();
        if (sheets?.[0]) weeklyHours = Number(sheets[0].totalHours || 0);
      } else {
        const entriesRes = await api.get(`/api/time-entries/week?date=${startOfWeek}`);
        if (entriesRes.ok) {
          const entries = await entriesRes.json();
          weeklyHours = (entries || []).reduce((acc, e) => acc + (Number(e.duration || 0) / 3600), 0);
        }
      }

      const running = loadActiveTimer();
      if (running) {
        const extra = (Date.now() - new Date(running.lastSavedAt || running.start).getTime()) / 3600_000;
        weeklyHours += Math.max(0, extra);
      }

      let pendingLeaveRequests = 0;
      let approvedLeaveDays = 0;
      const leaveRes = await api.get('/api/leave');
      if (leaveRes.ok) {
        const history = await leaveRes.json();
        pendingLeaveRequests = (history || []).filter(l => (l.status || '').toLowerCase() === 'pending').length;
        approvedLeaveDays = (history || []).filter(l => (l.status || '').toLowerCase() === 'approved')
          .reduce((total, leave) => total + (dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1), 0);
      }

      setStats({ weeklyHours, pendingLeaveRequests, approvedLeaveDays });
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 60_000); 
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  if (loading) return <CircularProgress />;

  const weeklyGoal = user.weeklyHoursGoal || 40;
  const progress = weeklyGoal > 0 ? (stats.weeklyHours / weeklyGoal) * 100 : 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><Typography variant="h4" component="h1" gutterBottom>My Dashboard</Typography></Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>This Week's Progress</Typography>
          <Box sx={{ width: 170, height: 170 }}>
            <CircularProgressbar
              value={progress}
              text={`${stats.weeklyHours.toFixed(1)} hrs`}
              styles={buildStyles({ pathColor: '#1976d2', trailColor: '#e0e0e0', textColor: '#333' })}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <KpiCard title="Pending Leave" value={`${stats.pendingLeaveRequests} requests`} />
      </Grid>

      <Grid item xs={12} md={4}>
        <KpiCard title="Approved Leave" value={`${stats.approvedLeaveDays} days`} />
      </Grid>
    </Grid>
  );
}



function AdminDashboard() {
    const { api } = useAuth();
    const [kpiData, setKpiData] = useState({ pendingApprovals: 0 });
    useEffect(() => {
        const fetchKpis = async () => {
            const res = await api.get('/api/timesheets/pending');
            if (res.ok) {
                const pending = await res.json();
                setKpiData(prev => ({...prev, pendingApprovals: pending.length}));
            }
        };
        fetchKpis();
    }, [api]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h5" gutterBottom>Team Overview</Typography></Grid>
            <Grid item xs={12}>
                <Paper sx={{p:3}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Team Hours Today" value="--" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Pending Approvals" value={kpiData.pendingApprovals} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Overtime This Week" value="--" /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="On Leave Today" value="--" /></Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
}

function ProjectsPage() {
    const { api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchProjectsAndUsers = useCallback(async () => {
        try {
            const [projRes, usersRes] = await Promise.all([
                api.get('/api/projects'),
                api.get('/api/users')
            ]);
            if (projRes.ok) setProjects(await projRes.json());
            if (usersRes.ok) {
                const allUsers = await usersRes.json();
                setUsers(allUsers.filter(u => u.role === 'Employee'));
            }
        } catch (error) {
            console.error('Failed to fetch projects or users:', error);
        }
    }, [api]);

    useEffect(() => { fetchProjectsAndUsers(); }, [fetchProjectsAndUsers]);

    const handleOpenDialog = (project = null) => { setEditingProject(project); setDialogOpen(true); };
    const handleCloseDialog = () => { setDialogOpen(false); setEditingProject(null); };

    const handleSaveProject = async (projectData) => {
        const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
        const method = editingProject ? 'put' : 'post';
        const res = await api[method](url, projectData);
        if (res.ok) { fetchProjectsAndUsers(); handleCloseDialog(); } else { alert('Failed to save project'); }
    };

    const handleDeleteProject = async (projectId) => {
        const res = await api.delete(`/api/projects/${projectId}`);
        if(res.ok) { fetchProjectsAndUsers(); setConfirmDelete(null); } else { const err = await res.json(); alert(`Failed to delete project: ${err.message}`); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Projects</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Create Project</Button>
            </Box>
            <Paper>
                <List>
                    {projects.map(p => (
                        <ListItem key={p._id} secondaryAction={<IconButton edge="end" onClick={() => setConfirmDelete(p)}><DeleteIcon /></IconButton>}>
                            <ListItemButton onClick={() => handleOpenDialog(p)}>
                                <ListItemText primary={p.name} secondary={`${p.tasks?.length || 0} tasks | ${p.assignedMembers?.length || 0} members | Budget: ${p.budgetedHours || 'N/A'} hrs`} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <ProjectDialog open={dialogOpen} onClose={handleCloseDialog} onSave={handleSaveProject} project={editingProject} allUsers={users} />
            <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
                <DialogTitle>Delete Project?</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete the project "{confirmDelete?.name}"? This action cannot be undone.</Typography></DialogContent>
                <DialogActions><Button onClick={() => setConfirmDelete(null)}>Cancel</Button><Button onClick={() => handleDeleteProject(confirmDelete._id)} color="error">Delete</Button></DialogActions>
            </Dialog>
        </Box>
    );
}


function ApprovalsPage() {
  const { api } = useAuth();
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [pendingLeave, setPendingLeave] = useState([]);
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState({ open: false, item: null });

  const VIRTUAL_STATUS_KEY = 'protime_virtual_task_status_v1';
  const TASK_PROGRESS_KEY  = 'protime_task_progress_v1';
  const loadVirtualStatus  = () => { try { return JSON.parse(localStorage.getItem(VIRTUAL_STATUS_KEY) || '{}'); } catch { return {}; } };
  const saveVirtualStatus  = (m) => localStorage.setItem(VIRTUAL_STATUS_KEY, JSON.stringify(m));
  const loadProgress       = () => { try { return JSON.parse(localStorage.getItem(TASK_PROGRESS_KEY) || '{}'); } catch { return {}; } };
  const localSpentHrsFor   = (pid) => {
    const m = loadProgress();
    const k = `proj:${pid}`;
    const ms = Number(m[k]?.accumulatedMs || 0);
    return ms / 3600000;
  };

  const fetchAllApprovals = useCallback(async () => {
    const NEEDS = new Set(['done', 'submitted', 'submitted for approval', 'awaiting approval', 'ready for review']);
    const norm = (v) => (v || '').toString().toLowerCase();
    const needsApproval = (o={}) => NEEDS.has(norm(o.status || o.state || o.stage || o.progress));
    const getJson = async (urls) => {
      for (const u of urls) { try { const r = await api.get(u); if (r.ok) return await r.json(); } catch {} }
      return null;
    };

    const items = [];
    const add = ({ project, task, virtual=false, spentHrs=0 }) => {
      const pid = project?._id || project?.id || project;
      if (!pid) return;
      const tid = task?._id || task?.id || task || null;
      items.push({
        projectId: pid,
        projectName: project?.name || task?.project?.name || 'Project',
        taskId: tid,
        taskName: task?.name || task?.title || 'General',
        spentHrs: Number(spentHrs || 0),
        virtual,
      });
    };

    const direct = await getJson([
      '/api/projects/pending-approvals',
      '/api/tasks/pending-approvals',
      '/api/tasks?status=Submitted%20for%20Approval',
      '/api/tasks?status=Done',
      '/api/tasks?state=Done',
      '/api/tasks?stage=Done',
    ]) || [];
    if (Array.isArray(direct)) {
      for (const x of direct) {
        if ((x.projectId || x.project) && (x.taskId || x.task)) {
          add({ project: x.projectId || x.project, task: x.taskId || x.task });
        } else if (needsApproval(x)) {
          add({ project: x.project || x.projectId, task: x });
        }
      }
    }

    const allProjects = await getJson(['/api/projects/all', '/api/projects']) || [];
    for (const p of allProjects) {
      if (needsApproval(p)) add({ project: p, task: { name: 'General' }, virtual: true });
      let tasks = Array.isArray(p.tasks) ? p.tasks : [];
      if (tasks.length && typeof tasks[0] !== 'object') {
        const fetched = await getJson([
          `/api/projects/${p._id || p.id}/tasks`,
          `/api/tasks?project=${p._id || p.id}`,
          `/api/tasks?projectId=${p._id || p.id}`,
        ]);
        if (Array.isArray(fetched)) tasks = fetched;
      }
      for (const t of tasks) if (needsApproval(t)) add({ project: p, task: t });
    }

    const start = dayjs().subtract(60, 'day').startOf('day').toISOString();
    const end   = dayjs().endOf('day').toISOString();
    const byPid = new Map(items.map(i => [i.projectId, 0]));
    for (const pid of byPid.keys()) {
      const entries = await getJson([
        `/api/time-entries?project=${pid}&startDate=${start}&endDate=${end}`,
        `/api/time-entries/range?project=${pid}&startDate=${start}&endDate=${end}`,
      ]) || [];
      let hrs = 0;
      if (Array.isArray(entries)) {
        for (const e of entries) hrs += (e.hours != null ? Number(e.hours) : Number(e.duration || 0) / 3600) || 0;
      }
      byPid.set(pid, hrs);
    }
    let out = items.map(i => ({ ...i, spentHrs: byPid.get(i.projectId) || 0 }));

    const vmap = loadVirtualStatus();
    for (const [pid, st] of Object.entries(vmap)) {
      if (/done/i.test(st)) {
        const proj = allProjects.find(p => (p._id || p.id) === pid);
        add({ project: proj ? proj : { _id: pid, name: proj?.name || 'Project' }, task: { name: 'General' }, virtual: true, spentHrs: localSpentHrsFor(pid) });
      }
    }

    const seen = new Set();
    out = [...out, ...items.filter(() => false)]; 
    out = (out.length ? out : items).filter(i => {
      const key = `${i.projectId}|${i.taskId || 'virt'}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    setProjectSubmissions(out);

    try {
      const leaves = await getJson(['/api/leave/pending','/api/leave?status=Pending','/api/leave/all?status=Pending']) || [];
      setPendingLeave(leaves.filter(l => norm(l.status) === 'pending'));
    } catch { setPendingLeave([]); }
  }, [api]);

  useEffect(() => {
    fetchAllApprovals();
    const id = setInterval(fetchAllApprovals, 30000);
    return () => clearInterval(id);
  }, [fetchAllApprovals]);

  const handleProjectDecision = async ({ projectId, taskId, virtual }, decision) => {
    const approve = decision === 'approve';
    const status = approve ? 'Completed' : 'In Progress';

    if (!virtual && taskId) {
      const attempts = [
        () => api.put(`/api/projects/${projectId}/tasks/${taskId}`, { status }),
        () => api.put(`/api/projects/${projectId}/tasks/${taskId}/status`, { status }),
        () => api.put(`/api/tasks/${taskId}/status`, { status }),
        () => api.post(`/api/tasks/${taskId}/status`, { status }),
      ];
      for (const call of attempts) { try { const r = await call(); if (r.ok) { await fetchAllApprovals(); return; } } catch {} }
    }

    const projAttempts = [
      () => api.put(`/api/projects/${projectId}`, { status }),
      () => api.put(`/api/projects/${projectId}/status`, { status }),
      () => api.post(`/api/projects/${projectId}/status`, { status }),
    ];
    let ok = false;
    for (const call of projAttempts) { try { const r = await call(); if (r.ok) { ok = true; break; } } catch {} }

    const m = loadVirtualStatus();
    m[projectId] = approve ? 'Completed' : 'In Progress';
    saveVirtualStatus(m);

    await fetchAllApprovals();
    if (!ok) {
      setProjectSubmissions((prev) => prev.filter(x => x.projectId !== projectId || x.taskId !== taskId));
    }
  };

  const handleLeaveApproval = async (id, action) => {
    const isReject = action === 'reject';
    const body = { status: isReject ? 'Rejected' : 'Approved', comments: isReject ? 'Rejected by admin' : 'Approved by admin' };
    const attempts = [
      () => api.put(`/api/leave/${id}/${action}`, body),
      () => api.post(`/api/leave/${id}/${action}`, body),
      () => api.put(`/api/leaves/${id}/${action}`, body),
      () => api.post(`/api/leaves/${id}/${action}`, body),
      () => api.put(`/api/leave/${id}`, body),
      () => api.post(`/api/leave/action`, { id, action, ...body }),
    ];
    for (const call of attempts) { try { const res = await call(); if (res.ok) { await fetchAllApprovals(); return; } } catch {} }
    alert(`Failed to ${action} leave.`);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Approvals</Typography>
      <Paper>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Project Approvals (${projectSubmissions.length})`} />
          <Tab label={`Leave Requests (${pendingLeave.length})`} />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            {projectSubmissions.length ? (
              <List>
                {projectSubmissions.map((item) => (
                  <ListItem
                    key={`${item.projectId}:${item.taskId || 'virtual'}`}
                    secondaryAction={
                      <>
                        <IconButton color="success" onClick={() => handleProjectDecision(item, 'approve')}><ThumbUpIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleProjectDecision(item, 'review')}><ThumbDownIcon /></IconButton>
                      </>
                    }
                  >
                    <ListItemButton onClick={() => setDialog({ open: true, item })}>
                      <ListItemText
                        primary={item.projectName || 'Project'}
                        secondary={`${item.spentHrs.toFixed(2)}h spent`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ textAlign: 'center', my: 2 }}>No project submissions pending.</Typography>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {pendingLeave.length ? (
              <List>
                {pendingLeave.map((leave) => (
                  <ListItem
                    key={leave._id}
                    secondaryAction={
                      <>
                        <IconButton color="success" onClick={() => handleLeaveApproval(leave._id, 'approve')}><ThumbUpIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleLeaveApproval(leave._id, 'reject')}><ThumbDownIcon /></IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={leave.user?.name || 'Unknown'}
                      secondary={`${dayjs(leave.startDate).format('MMM D')} to ${dayjs(leave.endDate).format('MMM D')}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ textAlign: 'center', my: 2 }}>No pending leave requests.</Typography>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, item: null })}>
        <DialogTitle>Approve project work?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}><b>Project:</b> {dialog.item?.projectName}</Typography>
          <Typography><b>Task:</b> {dialog.item?.taskName}</Typography>
          <Typography><b>Time Spent:</b> {dialog.item?.spentHrs?.toFixed(2)}h</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, item: null })}>Cancel</Button>
          <Button color="warning" onClick={() => handleProjectDecision(dialog.item, 'review')}>Send to Review</Button>
          <Button variant="contained" onClick={() => handleProjectDecision(dialog.item, 'approve')}>Mark Complete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}




function ReportsPage() {
  const { api } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [approvedOnly, setApprovedOnly] = useState(false);

  const DEFAULT_HOURLY_RATE = 600;

  useEffect(() => {
    (async () => {
      const projRes = await api.get('/api/projects');
      if (projRes.ok) setProjects(await projRes.json());
      const usersRes = await api.get('/api/users');
      if (usersRes.ok) setUsers(await usersRes.json());
    })();
  }, [api]);

  useEffect(() => {
    const p = consumeReportPrefill();
    if (p) {
      if (p.projectId) setSelectedProject(p.projectId);
      if (p.startDate && p.endDate) setDateRange([dayjs(p.startDate), dayjs(p.endDate)]);
    }
  }, []);

  const projectById = useMemo(() => {
    const m = {};
    (projects || []).forEach((p) => { m[p._id] = p; });
    return m;
  }, [projects]);

  const userById = useMemo(() => {
    const m = {};
    (users || []).forEach((u) => { m[u._id] = u; });
    return m;
  }, [users]);

  const completedSet = useMemo(() => {
    const s = new Set();
    (projects || []).forEach(p => {
      const st = (p.status || '').toLowerCase();
      if (st === 'completed') s.add(p._id);
    });
    return s;
  }, [projects]);

  const getHourlyRate = (u) => {
    const r = Number(u?.hourlyRate ?? u?.rate ?? u?.salaryPerHour ?? u?.payRate);
    return Number.isFinite(r) && r > 0 ? r : DEFAULT_HOURLY_RATE;
  };

  const computeRows = useCallback(async () => {
    const startISO = dateRange[0]?.toISOString();
    const endISO = dateRange[1]?.toISOString();

    const agg = new Map();
    const add = (pid, pname, uid, uname, hoursFloat) => {
      if (!pid || !uid) return;
      const key = `${pid}|${uid}`;
      const prev = agg.get(key) || { projectId: pid, projectName: pname || 'Project', userId: uid, userName: uname || 'User', tookHrs: 0 };
      prev.tookHrs += Number(hoursFloat || 0);
      agg.set(key, prev);
    };

    let loaded = false;
    try {
      const url = `/api/timesheets/report?project=${selectedProject || ''}&startDate=${startISO}&endDate=${endISO}`;
      const r = await api.get(url);
      if (r.ok) {
        const data = await r.json();
        (data || []).forEach((sheet) => {
          const u = sheet.user || {};
          (sheet.entries || []).forEach((e) => {
            const p = e.project || {};
            const hrs = e.hours != null ? Number(e.hours) : Number(e.duration || 0) / 3600;
            add(p._id || p.id || selectedProject, p.name || projectById[p._id || p.id || selectedProject]?.name || 'Project',
                u._id || u.id, u.name || 'User', hrs);
          });
        });
        loaded = true;
      }
    } catch {}

    if (!loaded) {
      const tries = [
        `/api/time-entries?startDate=${startISO}&endDate=${endISO}${selectedProject ? `&project=${selectedProject}` : ''}`,
        `/api/time-entries/range?startDate=${startISO}&endDate=${endISO}${selectedProject ? `&project=${selectedProject}` : ''}`,
      ];
      for (const u of tries) {
        try {
          const r = await api.get(u);
          if (!r.ok) continue;
          const entries = await r.json();
          (entries || []).forEach((e) => {
            const p = e.project || {};
            const usr = e.user || {};
            const hrs = e.hours != null ? Number(e.hours) : Number(e.duration || 0) / 3600;
            const pid = p._id || p.id || selectedProject;
            add(pid, p.name || projectById[pid]?.name || 'Project',
                usr._id || usr.id, usr.name || userById[usr._id || usr.id]?.name || 'User', hrs);
          });
          loaded = true;
          break;
        } catch {}
      }
    }

    const out = [];
    for (const { projectId, projectName, userId, userName, tookHrs } of agg.values()) {
      const rate = getHourlyRate(userById[userId]);
      out.push({
        projectId,
        projectName,
        employeeName: userName,
        reqHrs: Number(projectById[projectId]?.budgetedHours || 0) || 0,
        tookHrs: Number(tookHrs || 0),
        rate: Number(rate || 0),
        total: Number((tookHrs || 0) * (rate || 0)),
      });
    }

    let finalRows = out;
    if (selectedProject) {
      const pname = projectById[selectedProject]?.name;
      finalRows = finalRows.filter((r) => r.projectName === (pname || r.projectName));
    }
    if (approvedOnly) {
      finalRows = finalRows.filter((r) => completedSet.has(r.projectId));
    }
    setRows(finalRows);
  }, [api, dateRange, selectedProject, projectById, userById, approvedOnly, completedSet]);

  useEffect(() => {
    setLoading(true);
    computeRows().finally(() => setLoading(false));
  }, [computeRows]);

  const grandTotal = rows.reduce((s, r) => s + (r.total || 0), 0);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const fileName = `project_payroll_${dayjs(dateRange[0]).format('YYYYMMDD')}_${dayjs(dateRange[1]).format('YYYYMMDD')}.csv`;
      let csv = 'Project Name,Employee Name,Time Required (hrs),Time Worked (hrs),Wage/hr,Total Pay\n';
      rows.forEach((r) => {
        csv += [
          `"${r.projectName}"`,
          `"${r.employeeName}"`,
          r.reqHrs.toFixed(2),
          r.tookHrs.toFixed(2),
          r.rate.toFixed(2),
          r.total.toFixed(2),
        ].join(',') + '\n';
      });
      csv += `,,,,,${grandTotal.toFixed(2)}\n`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Reports / Payroll</Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <DatePicker label="Start Date" value={dateRange[0]} onChange={(val) => setDateRange([val, dateRange[1]])} />
        <DatePicker label="End Date" value={dateRange[1]} onChange={(val) => setDateRange([dateRange[0], val])} />
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Project</InputLabel>
          <Select value={selectedProject} label="Project" onChange={(e) => setSelectedProject(e.target.value)}>
            <MenuItem value=""><em>All Projects</em></MenuItem>
            {projects.map((p) => (<MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>))}
          </Select>
        </FormControl>
        <Chip label={`Default Wage: taka ${DEFAULT_HOURLY_RATE}/hr`} />
        <FormControlLabel
          control={<Switch checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />}
          label="Approved only"
        />
        <Button variant="contained" onClick={handleExportCsv} disabled={exporting || loading}>
          {exporting ? 'Exporting…' : 'Export Payroll CSV'}
        </Button>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : rows.length ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Required (hrs)</TableCell>
                  <TableCell align="right">Worked (hrs)</TableCell>
                  <TableCell align="right">Wage/hr ($)</TableCell>
                  <TableCell align="right">Total Pay ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.projectName}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell align="right">{r.reqHrs.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.tookHrs.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.rate.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>Grand Total ($)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center' }}>No data for the selected range.</Typography>
        )}
      </Paper>
    </Box>
  );
}



function MyTimesheetPage() {
  const { api, user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [timesheet, setTimesheet] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimesheetForWeek = useCallback(
    async (week, assignedProjects) => {
      if (!assignedProjects || assignedProjects.length === 0) return;
      const startDate = week.toISOString();
      const endDate = week.endOf('week').toISOString();
      try {
        const sheetRes = await api.get(
          `/api/timesheets/my-sheets?startDate=${startDate}&endDate=${endDate}`
        );
        if (sheetRes.ok) {
          const sheets = await sheetRes.json();
          setTimesheet(sheets[0] || null);
        }
      } catch (e) {
        console.error('Failed to fetch timesheet', e);
      }
    },
    [api]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        let assignedProjects = [];
        const projRes = await api.get('/api/projects/my-projects');
        if (projRes.ok) assignedProjects = await projRes.json();
        if (!assignedProjects || assignedProjects.length === 0) {
          const allRes = await api.get('/api/projects');
          if (allRes.ok) {
            const all = await allRes.json();
            const myId = user?._id || null;
            assignedProjects = (all || []).filter((p) =>
              (p.assignedMembers || []).includes(myId)
            );
          }
        }
        setProjects(assignedProjects);
        await fetchTimesheetForWeek(currentWeek, assignedProjects);
      } catch (e) {
        console.error('Failed to fetch initial data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();

    const id = setInterval(() => fetchTimesheetForWeek(currentWeek, projects), 60_000);
    return () => clearInterval(id);
  }, [api, currentWeek, fetchTimesheetForWeek, user?._id]);

  const handleWeekChange = (direction) =>
    setCurrentWeek((prevWeek) => prevWeek.add(direction, 'week'));

  const totalHours =
    timesheet?.entries?.reduce?.(
      (acc, entry) => acc + (Number(entry.hours) || 0),
      0
    ) || Number(timesheet?.totalHours || 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">My Timesheet</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => handleWeekChange(-1)}><ChevronLeft /></IconButton>
          <Typography>{`${currentWeek.format('MMM D')} - ${currentWeek.endOf('week').format('MMM D, YYYY')}`}</Typography>
          <IconButton onClick={() => handleWeekChange(1)}><ChevronRight /></IconButton>
        </Box>
      </Box>

      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6">Total Hours: {Number(totalHours || 0).toFixed(2)}</Typography>
        </Box>

        {loading ? (
          <CircularProgress sx={{ m: 4 }} />
        ) : (
          <TimesheetGrid
            timesheet={timesheet}
            projects={projects}
            reload={() => fetchTimesheetForWeek(currentWeek, projects)}
            week={currentWeek}
            api={api}
          />
        )}
      </Paper>
    </Box>
  );
}


function TimesheetGrid({ timesheet, projects, reload, week, api }) {
  const days = Array.from({ length: 7 }, (_, i) => week.add(i, 'day'));

  if (!projects || projects.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: 'center' }}>
        You are not assigned to any projects. Please contact your supervisor to be added to a project before you can log time.
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {days.map((day) => (
                <TableCell key={day.toString()} align="center">
                  {day.format('ddd, MMM D')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {days.map((day) => {
                const dayEntries =
                  timesheet?.entries?.filter?.((e) =>
                    dayjs(e.date).isSame(day, 'day')
                  ) || [];
                const dayTotal = dayEntries.reduce(
                  (acc, e) => acc + (Number(e.hours) || 0),
                  0
                );
                return (
                  <TableCell
                    key={day.toString()}
                    sx={{
                      verticalAlign: 'top',
                      border: '1px solid #f0f0f0',
                      p: 1,
                      minWidth: 120,
                    }}
                  >
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      {dayTotal.toFixed(2)} hrs
                    </Typography>
                    {dayEntries.map((entry) => (
                      <Paper
                        key={entry._id}
                        variant="outlined"
                        sx={{ p: 1, mb: 1, fontSize: '0.8rem', position: 'relative' }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {entry.project?.name || 'Project'}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {entry.task?.name || 'Task'}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {Number(entry.hours || 0)} hrs
                        </Typography>
                      </Paper>
                    ))}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}




function MyLeavePage() {
  const { api } = useAuth();
  const [leaveHistory, setLeaveHistory] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchLeaveHistory = React.useCallback(async () => {
    const res = await api.get('/api/leave');
    if (res.ok) setLeaveHistory(await res.json());
  }, [api]);

  React.useEffect(() => { fetchLeaveHistory(); }, [fetchLeaveHistory]);

  const handleRequestLeave = async (leaveData) => {
    const res = await api.post('/api/leave', leaveData);
    if (res.ok) { fetchLeaveHistory(); setDialogOpen(false); }
    else { alert('Failed to submit leave request.'); }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ width: 1200, maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">My Leave</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Request Time Off</Button>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <List>
          {leaveHistory.length > 0 ? (
            leaveHistory.map((leave) => (
              <ListItem key={leave._id} sx={{ px: 1, py: 1.25 }} secondaryAction={<Chip label={leave.status} color={getStatusColor(leave.status)} sx={{ fontWeight: 600 }} />}>
                <ListItemText
                  primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{leave.leaveType}</Typography>}
                  secondary={`${dayjs(leave.startDate).format('MMM D, YYYY')} to ${dayjs(leave.endDate).format('MMM D, YYYY')}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="No leave history." sx={{ textAlign: 'center', my: 2 }} /></ListItem>
          )}
        </List>
      </Paper>

      <LeaveRequestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleRequestLeave} />
    </Box>
  );
}


const KANBAN_COLUMNS = ['Not Started', 'In Progress', 'Done', 'Completed'];

function EmployeeKanban() {
  const { api, user } = useAuth();
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);

  const warnedRef = React.useRef({});

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const id = setInterval(async () => {
      const t = loadActiveTimer();
      if (!t) return;
      const now = new Date();
      const last = t.lastSavedAt ? new Date(t.lastSavedAt) : (t.start ? new Date(t.start) : now);
      const elapsedMs = now.getTime() - last.getTime();
      if (elapsedMs < 60_000) return;
      try {
        await api.post('/api/time-entries', {
          project: t.projectId,
          taskName: t.taskName || 'General',
          startTime: last.toISOString(),
          endTime: now.toISOString(),
          description: 'Auto-save timer segment',
          isBreak: false,
        });
        const key = t.taskId || `proj:${t.projectId}`;
        const prev = getProgressFor(key);
        setProgressFor(key, { accumulatedMs: (prev.accumulatedMs || 0) + elapsedMs });
        saveActiveTimer({ ...t, lastSavedAt: now });
        setTick((x) => x + 1);
      } catch {}
    }, 30_000);
    return () => clearInterval(id);
  }, [api]);

  const refreshAssignedProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      let assigned = [];
      const mine = await api.get('/api/projects/my-projects');
      if (mine.ok) assigned = await mine.json();
      if (!assigned?.length) {
        const all = await api.get('/api/projects');
        if (all.ok) {
          const allProjects = await all.json();
          assigned = (allProjects || []).filter((p) => (p.assignedMembers || []).includes(user?._id));
        }
      }
      setProjects(assigned || []);
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally { setLoading(false); }
  }, [api, user?._id]);

  React.useEffect(() => { refreshAssignedProjects(); }, [refreshAssignedProjects]);

  const cards = React.useMemo(() => {
    const list = [];
    for (const p of projects) {
      const tlist = Array.isArray(p.tasks) && p.tasks.length ? p.tasks : [{
        _id: `proj:${p._id}`,
        name: p.name || 'Project',
        status: p.status || 'Not Started',
        estimatedMinutes: (Number(p?.budgetedHours) || 0) > 0 ? Number(p.budgetedHours) * 60 : 60,
        __virtual: true,
      }];
      for (const t of tlist) {
        list.push({
          ...t,
          __projectId: p._id,
          __projectName: p.name,
          __projectStatus: p.status || '',
          __plannedMinutesFromProject: (Number(p?.budgetedHours) || 0) > 0 ? Number(p.budgetedHours) * 60 : null,
        });
      }
    }
    return list;
  }, [projects]);

  const active = React.useMemo(() => loadActiveTimer(), [tick]);
  const isTaskRunning = (card) => active && active.taskId === card._id && active.projectId === card.__projectId;

  const fmt = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(total / 3600)).padStart(2, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const STARTED_PROJECTS_KEY = 'protime_started_projects_v1';
  const getStartedProjects = () => {
    try { return new Set(JSON.parse(localStorage.getItem(STARTED_PROJECTS_KEY) || '[]')); }
    catch { return new Set(); }
  };
  const addStartedProject = (pid) => {
    const s = getStartedProjects(); s.add(pid);
    localStorage.setItem(STARTED_PROJECTS_KEY, JSON.stringify([...s]));
  };

  const VIRTUAL_STATUS_KEY = 'protime_virtual_task_status_v1';
  const loadVirtualStatus = () => {
    try { return JSON.parse(localStorage.getItem(VIRTUAL_STATUS_KEY) || '{}'); }
    catch { return {}; }
  };
  const setVirtualStatus = (projectId, status) => {
    const m = loadVirtualStatus();
    m[projectId] = status;
    localStorage.setItem(VIRTUAL_STATUS_KEY, JSON.stringify(m));
    setTick((t) => t + 1);
  };
  const getVirtualStatus = (projectId) => loadVirtualStatus()[projectId] || 'Not Started';

  const notify30s = async (title, body) => {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
        return;
      }
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') new Notification(title, { body });
      }
    } catch {}
  };


  React.useEffect(() => {
    const t = loadActiveTimer();
    if (!t) return;

    const key = `${t.projectId}|${t.taskId || `proj:${t.projectId}`}`;

    const card = cards.find(
      c => c._id === (t.taskId || `proj:${t.projectId}`) && c.__projectId === t.projectId
    );

    const prog = getProgressFor(t.taskId || `proj:${t.projectId}`);
    const plannedMin =
      (prog.plannedMinutes != null)
        ? prog.plannedMinutes
        : (card?.__plannedMinutesFromProject ?? card?.estimatedMinutes ?? (card?.estimatedHours ? card.estimatedHours * 60 : 60) ?? 60);

    const plannedMs = Number(plannedMin || 60) * 60_000;

    const last = t.lastSavedAt ? new Date(t.lastSavedAt).getTime()
               : t.start       ? new Date(t.start).getTime()
                               : Date.now();

    const extraMs = Date.now() - last;
    const spentMs = (prog.accumulatedMs || 0) + Math.max(0, extraMs);
    const remainingMs = plannedMs - spentMs;

    if (remainingMs <= 30_000 && !warnedRef.current[key]) {
      warnedRef.current[key] = true;
      notify30s('⏳ 30 seconds remaining', `${t.taskName || 'Task'} (${t.projectName || 'Project'}) is about to hit planned time.`);
    }
  }, [tick, cards]);

  const handleStart = async (card) => {
    const running = loadActiveTimer();
    if (running && !projects.some(p => p._id === running.projectId)) {
      clearActiveTimer();
    } else if (running) {
      alert('Pause the running timer first.');
      return;
    }

    const startedProjects = getStartedProjects();
    const progress = getProgressFor(card._id);

    if (startedProjects.has(card.__projectId) && !(progress.accumulatedMs > 0)) {
      alert('This project is already in your list. Resume your existing task or submit it for approval.');
      return;
    }

    try {
      if (!card.__virtual && !['In Progress', 'Done', 'Completed'].includes(card.status)) {
        await api.put(`/api/projects/${card.__projectId}/tasks/${card._id}`, { status: 'In Progress' }).catch(()=>{});
      }

      addStartedProject(card.__projectId);

      const plannedMinutes =
        (progress.plannedMinutes != null)
          ? progress.plannedMinutes
          : (card.__plannedMinutesFromProject ?? (card.estimatedMinutes || (card.estimatedHours ? card.estimatedHours * 60 : 60)));

      setProgressFor(card._id, { plannedMinutes });


      warnedRef.current = {};

      saveActiveTimer({
        projectId: card.__projectId,
        projectName: card.__projectName,
        taskId: card._id,
        taskName: card.name || 'General',
        start: new Date(),
        lastSavedAt: new Date(),
        accumulatedMs: progress.accumulatedMs || 0,
      });

      setTick((t) => t + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async (card) => {
    const t = loadActiveTimer();
    if (!t) return;
    const end = new Date();
    const startForSegment = t.lastSavedAt ? new Date(t.lastSavedAt) : new Date(t.start);
    const elapsedMs = end.getTime() - startForSegment.getTime();

    const p = getProgressFor(card._id);
    setProgressFor(card._id, { accumulatedMs: (p.accumulatedMs || 0) + elapsedMs });

    try {
      await api.post('/api/time-entries', {
        project: t.projectId,
        taskName: t.taskName || 'General',
        startTime: startForSegment.toISOString(),
        endTime: end.toISOString(),
        description: 'Timer segment',
        isBreak: false,
      });
    } catch (e) {
      console.error('Timer save failed', e);
    }
    clearActiveTimer();
    setTick((x) => x + 1);
  };
  const submitForApproval = async (card) => {
    if (isTaskRunning(card)) await handlePause(card);

    if (!card.__virtual) {
      const tries = [
        () => api.put(`/api/projects/${card.__projectId}/tasks/${card._id}`, { status: 'Submitted for Approval' }),
        () => api.put(`/api/tasks/${card._id}/status`, { status: 'Submitted for Approval' }),
        () => api.post(`/api/tasks/${card._id}/status`, { status: 'Submitted for Approval' }),
        () => api.put(`/api/projects/${card.__projectId}/tasks/${card._id}`, { status: 'Done' }),
      ];
      for (const call of tries) { try { const r = await call(); if (r.ok) break; } catch {} }
      setVirtualStatus(card.__projectId, 'Done');
      await refreshAssignedProjects();
      return;
    }

    let ok = false;
    try {
      const res = await api.post(`/api/projects/${card.__projectId}/tasks`, {
        name: card.name || 'General',
        status: 'Submitted for Approval',
        estimatedMinutes:
          getProgressFor(card._id).plannedMinutes ??
          card.__plannedMinutesFromProject ?? 60,
      });
      ok = res.ok;
    } catch {}

    if (!ok) {
      const body = { status: 'Submitted for Approval' };
      const fallback = [
        () => api.put(`/api/projects/${card.__projectId}`, body),
        () => api.put(`/api/projects/${card.__projectId}/status`, body),
        () => api.post(`/api/projects/${card.__projectId}/status`, body),
      ];
      for (const call of fallback) { try { const r = await call(); if (r.ok) { ok = true; break; } } catch {} }
    }

    setVirtualStatus(card.__projectId, 'Done');
    await refreshAssignedProjects();
  };



  const tasksByCol = React.useMemo(() => {
    const g = { 'Not Started': [], 'In Progress': [], 'Done': [], 'Completed': [] };
    for (const t of cards) {
      let col;
      if (t.__virtual) {
        const vs = getVirtualStatus(t.__projectId);
        const ps = (t.__projectStatus || '').toLowerCase();
        if ((vs || '').toLowerCase() === 'completed' || ps === 'completed') col = 'Completed';
        else if ((vs || '').toLowerCase() === 'done' || ps === 'done' || /submitted/i.test(ps)) col = 'Done';
        else if (isTaskRunning(t)) col = 'In Progress';
        else col = 'Not Started';
      } else {
        const s = (t.status || '').toLowerCase();
        col = s === 'completed' ? 'Completed'
          : s === 'done' || /submitted/i.test(s) ? 'Done'
          : s === 'in progress' ? 'In Progress'
          : 'Not Started';
      }
      g[col].push(t);
    }
    return g;
  }, [cards, active, tick]);

  const remainingFor = (card) => {
    const p = getProgressFor(card._id);
    const plannedMin =
      (p.plannedMinutes != null)
        ? p.plannedMinutes
        : (card.__plannedMinutesFromProject ?? (card.estimatedMinutes || (card.estimatedHours ? card.estimatedHours * 60 : 60)));
    const plannedMs = plannedMin * 60000;
    const extra = isTaskRunning(card) ? Date.now() - new Date(active.start).getTime() : 0;
    const spent = (p.accumulatedMs || 0) + extra;
    return { remainingMs: Math.max(0, plannedMs - spent), spentMs: spent, plannedMs };
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!projects.length) return <Typography>You have no assigned projects.</Typography>;

  const COLUMN_WIDTH = 360;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
        {KANBAN_COLUMNS.map((col) => (
          <Box key={col} sx={{ minWidth: COLUMN_WIDTH, maxWidth: COLUMN_WIDTH, flex: '0 0 auto' }}>
            <Paper sx={{ p: 2.5, minHeight: 520, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>{col}</Typography>
              <Divider sx={{ mb: 1.5 }} />
              {tasksByCol[col]?.length ? (
                tasksByCol[col].map((card) => {
                  const { remainingMs, spentMs, plannedMs } = remainingFor(card);
                  const running = isTaskRunning(card);
                  const overtimeMs = Math.max(0, spentMs - plannedMs);
                  return (
                    <Paper key={`${card.__projectId}:${card._id}`} variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {card.__virtual ? (card.__projectName || 'Project') : card.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Project: {card.__projectName || '—'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`Remaining ${fmt(remainingMs)}`} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {Math.floor(spentMs / 3600000)}h {Math.floor((spentMs % 3600000) / 60000)}m spent
                        </Typography>
                        {overtimeMs > 0 && <Chip label={`Overtime ${fmt(overtimeMs)}`} size="small" />}

                        {(col === 'Not Started' || col === 'In Progress') && (
                          running ? (
                            <Button size="small" color="warning" startIcon={<Pause />} onClick={() => handlePause(card)}>
                              Pause
                            </Button>
                          ) : (
                            <Button size="small" startIcon={<PlayArrow />} onClick={() => handleStart(card)}>
                              Start
                            </Button>
                          )
                        )}

                        {col === 'In Progress' && (
                          <Button size="small" onClick={() => submitForApproval(card)}>
                            Submit for Approval
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">No tasks</Typography>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
}



function ProjectDialog({ open, onClose, onSave, project, allUsers }) {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [assignedMembers, setAssignedMembers] = useState([]);

    useEffect(() => {
        if (open) {
            if (project) {
                setName(project.name || '');
                setBudget(project.budgetedHours || '');
                const assignedUserObjects = allUsers.filter(u => (project.assignedMembers || []).includes(u._id));
                setAssignedMembers(assignedUserObjects);
            } else {
                setName('');
                setBudget('');
                setAssignedMembers([]);
            }
        }
    }, [project, open, allUsers]);

    const handleSave = () => {
        onSave({ name, budgetedHours: Number(budget) || 0, assignedMembers: assignedMembers.map(u => u._id) });
    };

    if (!open) return null;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Project Name" fullWidth name="name" value={name} onChange={(e) => setName(e.target.value)} sx={{mb: 2}} />
                <TextField margin="dense" label="Budgeted Hours" type="number" fullWidth name="budget" value={budget} onChange={(e) => setBudget(e.target.value)} sx={{mb: 2}} />
                <Autocomplete multiple options={allUsers} getOptionLabel={(option) => option.name} value={assignedMembers} onChange={(event, newValue) => { setAssignedMembers(newValue); }} isOptionEqualToValue={(option, value) => option._id === value._id} renderInput={(params) => (<TextField {...params} label="Assigned Team Members" placeholder="Select Employees" />)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">{project ? 'Save Changes' : 'Create'}</Button>
            </DialogActions>
        </Dialog>
    );
}

function LeaveRequestDialog({ open, onClose, onSave }) {
    const [leaveType, setLeaveType] = useState('Vacation');
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
    const [reason, setReason] = useState('');

    const handleSave = () => {
        onSave({ leaveType, startDate: dateRange[0].toISOString(), endDate: dateRange[1].toISOString(), reason });
        setLeaveType('Vacation'); setDateRange([dayjs(), dayjs()]); setReason('');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="dense" sx={{mb: 2}}>
                    <InputLabel>Leave Type</InputLabel>
                    <Select value={leaveType} label="Leave Type" onChange={e => setLeaveType(e.target.value)}>
                        <MenuItem value="Vacation">Vacation</MenuItem>
                        <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                        <MenuItem value="Personal">Personal</MenuItem>
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                    <DatePicker label="Start Date" value={dateRange[0]} onChange={(val) => setDateRange([val, dateRange[1]])} sx={{flex: 1}}/>
                    <DatePicker label="End Date" value={dateRange[1]} onChange={(val) => setDateRange([dateRange[0], val])} sx={{flex: 1}}/>
                </Box>
                <TextField margin="dense" label="Reason / Comments (optional)" fullWidth multiline rows={3} value={reason} onChange={e => setReason(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Submit Request</Button>
            </DialogActions>
        </Dialog>
    );
}
function TimeEntryDialog({ open, onClose, onStarted, projects, entry }) {
  const [projectId, setProjectId] = React.useState('');
  const [date, setDate] = React.useState(dayjs(entry?.date));

  React.useEffect(() => {
    setDate(dayjs(entry?.date));
    setProjectId('');
  }, [entry]);

  const handleStart = () => {
    if (!projectId) { alert('Please select a project.'); return; }
    const proj = projects.find(p => p._id === projectId);
    saveActiveTimer({
      projectId,
      projectName: proj?.name || 'Project',
      taskId: null,
      taskName: 'General',
      start: new Date()
    });
    if (onStarted) onStarted();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Start Timer</DialogTitle>
      <DialogContent>
        <DatePicker label="Date" value={date} onChange={setDate} sx={{ width: '100%', mb: 2 }} readOnly />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Project</InputLabel>
          <Select value={projectId} label="Project" onChange={e => setProjectId(e.target.value)}>
            {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          Timer will start immediately. You can pause from the top bar or the Kanban view.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleStart}>Start</Button>
      </DialogActions>
    </Dialog>
  );
}


function KpiCard({ title, value, icon }) {
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography color="text.secondary">{title}</Typography>
                {icon}
            </Box>
            <Typography variant="h4" sx={{fontWeight: 'bold', mt: 2}}>{value}</Typography>
        </Paper>
    );
}

export default App;

export const ACTIVE_TIMER_KEY = 'protime_active_timer_v2';
export const TASK_PROGRESS_KEY = 'protime_task_progress_v1';
export const clearActiveTimer = () => localStorage.removeItem(ACTIVE_TIMER_KEY);

export const loadTaskProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(TASK_PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
};
export const saveTaskProgress = (map) =>
  localStorage.setItem(TASK_PROGRESS_KEY, JSON.stringify(map));

export const getProgressFor = (taskId) =>
  loadTaskProgress()[taskId] || { accumulatedMs: 0, plannedMinutes: null };

export const setProgressFor = (taskId, patch) => {
  const map = loadTaskProgress();
  map[taskId] = {
    ...(map[taskId] || { accumulatedMs: 0, plannedMinutes: null }),
    ...patch,
  };
  saveTaskProgress(map);
};


export const loadActiveTimer = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    return {
      ...t,
      start: t.start ? new Date(t.start) : null,
      lastSavedAt: t.lastSavedAt ? new Date(t.lastSavedAt) : null,
    };
  } catch {
    return null;
  }
};


export const saveActiveTimer = (t) => {
  const out = {
    ...t,
    start: t.start instanceof Date ? t.start.toISOString() : t.start,
    lastSavedAt:
      t.lastSavedAt instanceof Date ? t.lastSavedAt.toISOString() : t.lastSavedAt,
  };
  localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(out));
};


export const REPORT_PREFILL_KEY = 'protime_report_prefill_v1';

export const setReportPrefill = (payload) => {
  localStorage.setItem(REPORT_PREFILL_KEY, JSON.stringify(payload));
};

export const consumeReportPrefill = () => {
  try {
    const raw = localStorage.getItem(REPORT_PREFILL_KEY);
    if (!raw) return null;
    localStorage.removeItem(REPORT_PREFILL_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
