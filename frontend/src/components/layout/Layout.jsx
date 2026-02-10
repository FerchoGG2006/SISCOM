import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  BarChart,
  UserCog
} from 'lucide-react';

import { Outlet } from 'react-router-dom';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled(motion.aside)`
  width: 280px;
  background: var(--glass-sidebar);
  backdrop-filter: blur(20px);
  color: white;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.collapsed ? '80px' : '280px'};
  padding: 2rem;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  background: #f8fafc;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding-left: 0.5rem;
`;

const LogoText = styled(motion.span)`
  font-size: 1.6rem;
  font-weight: 900;
  color: white;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;


const NavLink = styled(motion(Link))`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: #CBD5E1;

  text-decoration: none;
  font-weight: 500;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  &.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  margin-top: auto;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  right: -12px;
  top: 32px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const menuItems = [
  { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/' },
  { icon: <FileText size={20} />, label: 'Radicación', path: '/radicacion' },
  { icon: <Users size={20} />, label: 'Expedientes', path: '/expedientes' },
  { icon: <UserCircle size={20} />, label: 'Personas', path: '/personas' },
  { icon: <BarChart size={20} />, label: 'Reportes', path: '/reportes' },
  { icon: <UserCog size={20} />, label: 'Usuarios', path: '/usuarios' },
  { icon: <Settings size={20} />, label: 'Configuración', path: '/config' },
];


export const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <LayoutContainer>
      <Sidebar
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SidebarHeader>
          <ShieldCheck size={32} color="#4F46E5" />
          <AnimatePresence>
            {!isCollapsed && (
              <LogoText
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                SISCOM
              </LogoText>
            )}
          </AnimatePresence>
        </SidebarHeader>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              whileHover={{ x: 5 }}
            >
              {item.icon}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}

          <LogoutButton whileHover={{ x: 5 }}>
            <LogOut size={20} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </LogoutButton>
        </nav>

        <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </CollapseButton>
      </Sidebar>

      <MainContent collapsed={isCollapsed}>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

