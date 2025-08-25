import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoginIcon from '@mui/icons-material/Login';
import { Link } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { AuthContext } from '../../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { authenticated, user } = React.useContext(AuthContext);
  const theme = useTheme();

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper + 'CC', // semi-transparent background
        color: theme.palette.text.primary,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid rgba(0,0,0,0.1)`,
        zIndex: 9999,
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 70 }}>

          {/* Desktop logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              alignItems: 'center',
            }}
          >
            
            SPARK SCHOOL MANAGEMENT SYSTEM
          </Typography>

          {/* Mobile menu button */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {!authenticated
                ? [
                  <MenuItem key="register" onClick={handleCloseNavMenu}>
                    <Button component={Link} to="/register" fullWidth color="inherit">
                      Register
                    </Button>
                  </MenuItem>,
                  <MenuItem key="login" onClick={handleCloseNavMenu}>
                    <Button component={Link} to="/login" startIcon={<LoginIcon />} fullWidth color="inherit">
                      Login
                    </Button>
                  </MenuItem>
                ]
                : [
                  <MenuItem key="logout" onClick={handleCloseNavMenu}>
                    <Button component={Link} to="/logout" fullWidth color="inherit">
                      Log Out
                    </Button>
                  </MenuItem>,
                  user && (
                    <MenuItem key="dashboard" onClick={handleCloseNavMenu}>
                      <Button component={Link} to={`/${user.role.toLowerCase()}`} fullWidth color="inherit">
                        Dashboard
                      </Button>
                    </MenuItem>
                  )
                ]}
            </Menu>

          </Box>

          {/* Mobile logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            SSMS
          </Typography>

          {/* Desktop buttons */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {!authenticated ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{
                    mx: 1,
                    px: 2,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  sx={{
                    mx: 1,
                    px: 2,
                    color: theme.palette.secondary.contrastText,
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/logout"
                  sx={{
                    mx: 1,
                    px: 2,
                    color: theme.palette.error.contrastText,
                    backgroundColor: theme.palette.error.main,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  Log Out
                </Button>
                {user && (
                  <Button
                    component={Link}
                    to={`/${user.role.toLowerCase()}`}
                    sx={{
                      mx: 1,
                      px: 2,
                      color: theme.palette.info.contrastText,
                      backgroundColor: theme.palette.info.main,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.info.dark,
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                )}
              </>
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
