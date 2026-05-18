'use client';

import * as React from 'react';
import { styled, useTheme as useMUITheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  LayoutDashboard,
  Library,
  Settings,
  Layers,
  LogOut,
  Menu,
  GraduationCap,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/utils/supabase/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 260;

const AUTH_ROUTES = ['/login', '/signup'];

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  transition: theme.transitions.create(['margin', 'padding'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
  ...(open && !isMobile && {
    transition: theme.transitions.create(['margin', 'padding'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [open, setOpen] = React.useState(!isMobile);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const muiTheme = useMUITheme();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Decks', icon: <Library size={20} />, path: '/decks' },
    { text: 'Manage Cards', icon: <Layers size={20} />, path: '/manage' },
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <Box sx={{
            p: 1,
            borderRadius: '12px',
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={24} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            FlashAI
          </Typography>
        </motion.div>
      </Toolbar>

      <Box sx={{ overflow: 'auto', mt: 4, px: 2, flexGrow: 1 }}>
        <Typography variant="overline" sx={{ px: 2, opacity: 0.5, fontWeight: 700, mb: 1, display: 'block' }}>
          Menu
        </Typography>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={pathname === item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: pathname === item.path ? 'white' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontWeight: pathname === item.path ? 700 : 500, fontSize: '0.95rem' } } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {user && (
        <Box sx={{ p: 2, mb: 2 }}>
          <Box sx={{
            p: 2,
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, fontWeight: 600 }}>
                Signed in as
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {user.email?.split('@')[0]}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'error.light' }}>
              <LogOut size={18} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
        <AppBar position="fixed">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2 }}
              >
                <Menu size={24} />
              </IconButton>
              {!isMobile && !open && (
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  FlashAI
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  color: 'primary.main'
                }}
              >
                {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: muiTheme.palette.mode === 'dark'
                ? 'rgba(15, 23, 42, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid var(--glass-border)',
            },
          }}
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={open}
          onClose={isMobile ? handleDrawerToggle : undefined}
        >
          {drawerContent}
        </Drawer>

        <Main open={open} isMobile={isMobile}>
          <Toolbar />
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ maxWidth: 1200, mx: 'auto' }}
          >
            {children}
          </Box>
        </Main>
      </Box>
    </ProtectedRoute>
  );
}
