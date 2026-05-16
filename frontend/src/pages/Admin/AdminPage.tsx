import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../../api/api';
import { ConfirmDeleteDialog } from '../../components/ConfirmDeleteDialog';
import { usePageTitle } from '../../hooks/usePageTitle';

// ── Types ──────────────────────────────────────────────────────────────────

interface FeedbackEntry {
  id: string;
  category: string;
  rating: number;
  allowContact: boolean;
  message: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ratingColor = (r: number) => {
  if (r >= 4) return 'success';
  if (r === 3) return 'warning';
  return 'error';
};

// ── Component ──────────────────────────────────────────────────────────────

export const AdminPage = () => {
  usePageTitle('Admin Panel');
  const [tab, setTab] = useState(0);

  // Feedback state
  const [feedback, setFeedback] = useState<PageResponse<FeedbackEntry> | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbPage, setFbPage] = useState(0);
  const [fbPageSize, setFbPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackEntry | null>(null);

  // Users state
  const [users, setUsers] = useState<PageResponse<UserEntry> | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersPageSize, setUsersPageSize] = useState(10);

  // ── Fetch feedback ──────────────────────────────────────────────────────
  const fetchFeedback = async () => {
    setFbLoading(true);
    setFbError(null);
    try {
      const params = new URLSearchParams({ page: String(fbPage), size: String(fbPageSize) });
      const res = await api.get(`/feedback/admin/all?${params}`);
      if (!res.ok) throw new Error('Failed to load feedback');
      setFeedback(await res.json());
    } catch (e: any) {
      setFbError(e.message);
    } finally {
      setFbLoading(false);
    }
  };

  // ── Fetch users ─────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params = new URLSearchParams({ page: String(usersPage), size: String(usersPageSize) });
      const res = await api.get(`/users/admin/all?${params}`);
      if (!res.ok) throw new Error('Failed to load users');
      setUsers(await res.json());
    } catch (e: any) {
      setUsersError(e.message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [fbPage, fbPageSize]); // eslint-disable-line
  useEffect(() => { fetchUsers(); }, [usersPage, usersPageSize]); // eslint-disable-line

  // ── Delete feedback ─────────────────────────────────────────────────────
  const handleDeleteFeedback = async () => {
    if (!deleteTarget) return;
    await api.delete(`/feedback/admin/${deleteTarget.id}`);
    setDeleteTarget(null);
    fetchFeedback();
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Feedback" />
        <Tab label="Users" />
      </Tabs>

      {/* ── TAB 0: Feedback ── */}
      {tab === 0 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">All User Feedback</Typography>
          </Box>

          {fbError && <Alert severity="error" sx={{ mx: 2, mb: 1 }}>{fbError}</Alert>}

          {fbLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                    <TableCell><strong>Contact?</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedback?.content.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No feedback submitted yet.</TableCell>
                    </TableRow>
                  )}
                  {feedback?.content.map((fb) => (
                    <TableRow key={fb.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{fb.userName}</Typography>
                        <Typography variant="caption" color="text.secondary">{fb.userEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={fb.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${fb.rating} / 5`}
                          size="small"
                          color={ratingColor(fb.rating) as any}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography
                          variant="body2"
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={fb.message}
                        >
                          {fb.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={fb.allowContact ? 'Yes' : 'No'}
                          size="small"
                          color={fb.allowContact ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete feedback">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(fb)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={feedback?.totalElements ?? 0}
            page={fbPage}
            onPageChange={(_, v) => setFbPage(v)}
            rowsPerPage={fbPageSize}
            onRowsPerPageChange={(e) => { setFbPageSize(parseInt(e.target.value)); setFbPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* ── TAB 1: Users ── */}
      {tab === 1 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Registered Users</Typography>
          </Box>

          {usersError && <Alert severity="error" sx={{ mx: 2, mb: 1 }}>{usersError}</Alert>}

          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users?.content.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No users found.</TableCell>
                    </TableRow>
                  )}
                  {users?.content.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{u.name}</Typography>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          color={u.role === 'ADMIN' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={users?.totalElements ?? 0}
            page={usersPage}
            onPageChange={(_, v) => setUsersPage(v)}
            rowsPerPage={usersPageSize}
            onRowsPerPageChange={(e) => { setUsersPageSize(parseInt(e.target.value)); setUsersPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        message={`Delete feedback from "${deleteTarget?.userName}"? This cannot be undone.`}
        onConfirm={handleDeleteFeedback}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

