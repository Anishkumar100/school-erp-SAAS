/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AuthContext } from '../context/AuthContext';
import Draggable from 'react-draggable';

const ThemeToggleButton = () => {
  const { themeDark, themeChange } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonStyle = {
    position: 'fixed',
    top: 10,
    right: 26,
    zIndex: 10000,
    backdropFilter: 'blur(8px)',
    borderRadius: '50%',
    boxShadow: themeDark
      ? '0 4px 12px rgba(0,0,0,0.6)'
      : '0 4px 12px rgba(0,0,0,0.2)',
    backgroundColor: themeDark
      ? 'rgba(18, 18, 18, 0.7)'
      : 'rgba(255, 255, 255, 0.6)',
    padding: 4,
    cursor: 'pointer',
    transition: 'background-color 0.3s, box-shadow 0.3s',
  };

  return (
    <Draggable disabled={isMobile}>
      <div style={buttonStyle}>
        <IconButton
          onClick={themeChange}
          sx={{
            color: themeDark ? '#ffffff' : '#222222',
            '&:hover': {
              backgroundColor: themeDark
                ? 'rgba(40, 40, 40, 0.8)'
                : 'rgba(240, 240, 240, 0.8)',
            },
            transition: 'background-color 0.3s, color 0.3s',
          }}
        >
          {themeDark ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </div>
    </Draggable>
  );
};

export default ThemeToggleButton;
