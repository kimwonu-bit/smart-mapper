import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  defaultRadius: 'md',
  colors: {
    // Custom neon colors mapped to Mantine shades
    // We'll use these as primary accents
    'neon-blue': [
        '#e0fbff', '#cbf6ff', '#9aeaff', '#64dfff', '#3cd5fe', 
        '#22cffe', '#09ccfe', '#00b3e4', '#009fcc', '#008ab4'
    ],
    'neon-green': [
        '#e3ffef', '#d0fce0', '#a4f6c4', '#75f1a5', '#4fee8a', 
        '#36ec7a', '#26eb71', '#14d05e', '#00b852', '#00a044'
    ],
    'neon-orange': [
        '#fff4e0', '#ffe8cc', '#ffd09c', '#ffb86b', '#ffa039', 
        '#ff9d00', '#cc7d00', '#995e00', '#663f00', '#331f00'
    ],
    'dark-ui': [
        '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', 
        '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113'
    ],
  },
  primaryColor: 'neon-blue',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
  },
  // Add some global component defaults if needed
  components: {
    Paper: {
      defaultProps: {
        bg: 'transparent',
      }
    }
  }
});
