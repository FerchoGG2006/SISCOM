import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #4F46E5;
    --primary-dark: #4338CA;
    --primary-light: #818CF8;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(255, 255, 255, 0.5);
    --glass-sidebar: rgba(15, 23, 42, 0.9);
    --text-main: #1E293B;
    --text-muted: #64748B;
    --bg-gradient: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
    --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Outfit', 'Inter', sans-serif;
  }

  body {
    background: var(--bg-gradient);
    min-height: 100vh;
    color: var(--text-main);
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

export default GlobalStyle;
