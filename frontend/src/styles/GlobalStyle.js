import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    /* Brand Colors */
    --primary: #4F46E5;
    --primary-dark: #4338CA;
    --primary-light: #818CF8;
    --primary-glow: rgba(79, 70, 229, 0.4);
    
    /* Semantic Colors */
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --info: #3B82F6;

    /* Gray Scale (Slate) */
    --gray-50: #F8FAFC;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-300: #CBD5E1;
    --gray-400: #94A3B8;
    --gray-500: #64748B;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --gray-900: #0F172A;

    /* Backgrounds & Glass */
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(255, 255, 255, 0.5);
    --glass-sidebar: rgba(15, 23, 42, 0.95);
    --bg-card: rgba(255, 255, 255, 0.8);
    --bg-gradient: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);

    
    /* Text Colors */
    --text-main: #1E293B;
    --text-muted: #64748B;
    --text-dim: #94A3B8;
    --text-white: #FFFFFF;

    /* UI Tokens */
    --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    --shadow-premium: 0 10px 40px -10px rgba(15, 23, 42, 0.2);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-xl: 30px;

    /* Spacing */
    --space-xs: 0.5rem;
    --space-sm: 1rem;
    --space-md: 1.5rem;
    --space-lg: 2rem;
    --space-xl: 3rem;
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
