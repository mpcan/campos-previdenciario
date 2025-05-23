// Componente de acessibilidade para o PowerPrev
// Implementa funcionalidades de acessibilidade seguindo diretrizes WCAG

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Estilos para o componente de acessibilidade
const accessibilityStyles = {
  menuButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
    fontSize: '24px'
  },
  menu: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '300px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    zIndex: 1000
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  menuTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px'
  },
  optionGroup: {
    marginBottom: '16px'
  },
  optionLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  button: {
    padding: '8px 12px',
    margin: '0 4px 8px 0',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer'
  },
  activeButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: '1px solid #2563eb'
  },
  resetButton: {
    width: '100%',
    padding: '8px',
    marginTop: '8px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: '0',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8px 16px',
    zIndex: 1001,
    transition: 'top 0.3s',
    textDecoration: 'none',
    borderRadius: '0 0 4px 0'
  },
  skipLinkFocus: {
    top: '0'
  }
};

/**
 * Componente principal de acessibilidade
 */
const AccessibilityProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    animations: 'enabled',
    spacing: 'normal',
    dyslexiaFont: false,
    focusIndicators: 'normal',
    screenReader: false
  });
  const menuRef = useRef(null);
  const router = useRouter();

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('powerprev_accessibility');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applyAccessibilitySettings(parsedSettings);
      } catch (error) {
        console.error('Erro ao carregar configurações de acessibilidade:', error);
      }
    }
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          event.target.id !== 'accessibility-toggle') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Resetar ao mudar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  // Aplicar configurações de acessibilidade
  const applyAccessibilitySettings = (newSettings) => {
    // Aplicar tamanho da fonte
    const fontSizeMap = {
      'small': '0.9rem',
      'medium': '1rem',
      'large': '1.1rem',
      'x-large': '1.2rem'
    };
    document.documentElement.style.fontSize = fontSizeMap[newSettings.fontSize] || '1rem';

    // Aplicar contraste
    document.body.classList.remove('high-contrast', 'inverted-colors');
    if (newSettings.contrast === 'high') {
      document.body.classList.add('high-contrast');
    } else if (newSettings.contrast === 'inverted') {
      document.body.classList.add('inverted-colors');
    }

    // Aplicar animações
    document.body.classList.remove('reduced-motion');
    if (newSettings.animations === 'reduced') {
      document.body.classList.add('reduced-motion');
    }

    // Aplicar espaçamento
    document.body.classList.remove('increased-spacing');
    if (newSettings.spacing === 'increased') {
      document.body.classList.add('increased-spacing');
    }

    // Aplicar fonte para dislexia
    document.body.classList.remove('dyslexia-font');
    if (newSettings.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    }

    // Aplicar indicadores de foco
    document.body.classList.remove('enhanced-focus');
    if (newSettings.focusIndicators === 'enhanced') {
      document.body.classList.add('enhanced-focus');
    }

    // Salvar configurações
    localStorage.setItem('powerprev_accessibility', JSON.stringify(newSettings));
  };

  // Atualizar configuração
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyAccessibilitySettings(newSettings);
  };

  // Resetar configurações
  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 'medium',
      contrast: 'normal',
      animations: 'enabled',
      spacing: 'normal',
      dyslexiaFont: false,
      focusIndicators: 'normal',
      screenReader: false
    };
    setSettings(defaultSettings);
    applyAccessibilitySettings(defaultSettings);
  };

  // Alternar menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Renderizar botão de opção
  const renderOptionButton = (optionKey, value, label, currentValue) => {
    const isActive = currentValue === value;
    const buttonStyle = {
      ...accessibilityStyles.button,
      ...(isActive ? accessibilityStyles.activeButton : {})
    };

    return (
      <button
        type="button"
        style={buttonStyle}
        onClick={() => updateSetting(optionKey, value)}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  // Renderizar botão de alternância
  const renderToggleButton = (optionKey, label, currentValue) => {
    const isActive = currentValue;
    const buttonStyle = {
      ...accessibilityStyles.button,
      ...(isActive ? accessibilityStyles.activeButton : {})
    };

    return (
      <button
        type="button"
        style={buttonStyle}
        onClick={() => updateSetting(optionKey, !currentValue)}
        aria-pressed={isActive}
      >
        {label}: {isActive ? 'Ativado' : 'Desativado'}
      </button>
    );
  };

  return (
    <>
      {/* Link de pular para conteúdo principal */}
      <a
        href="#main-content"
        style={accessibilityStyles.skipLink}
        onFocus={(e) => e.target.style.top = '0'}
        onBlur={(e) => e.target.style.top = '-40px'}
      >
        Pular para o conteúdo principal
      </a>

      {/* Botão de acessibilidade */}
      <button
        id="accessibility-toggle"
        aria-label="Opções de acessibilidade"
        style={accessibilityStyles.menuButton}
        onClick={toggleMenu}
      >
        <span aria-hidden="true">♿</span>
      </button>

      {/* Menu de acessibilidade */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={accessibilityStyles.menu}
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <div style={accessibilityStyles.menuHeader}>
            <h2 id="accessibility-title" style={accessibilityStyles.menuTitle}>
              Opções de Acessibilidade
            </h2>
            <button
              style={accessibilityStyles.closeButton}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu de acessibilidade"
            >
              ×
            </button>
          </div>

          {/* Tamanho da fonte */}
          <div style={accessibilityStyles.optionGroup}>
            <label style={accessibilityStyles.optionLabel}>Tamanho da fonte</label>
            {renderOptionButton('fontSize', 'small', 'Pequena', settings.fontSize)}
            {renderOptionButton('fontSize', 'medium', 'Média', settings.fontSize)}
            {renderOptionButton('fontSize', 'large', 'Grande', settings.fontSize)}
            {renderOptionButton('fontSize', 'x-large', 'Extra grande', settings.fontSize)}
          </div>

          {/* Contraste */}
          <div style={accessibilityStyles.optionGroup}>
            <label style={accessibilityStyles.optionLabel}>Contraste</label>
            {renderOptionButton('contrast', 'normal', 'Normal', settings.contrast)}
            {renderOptionButton('contrast', 'high', 'Alto contraste', settings.contrast)}
            {renderOptionButton('contrast', 'inverted', 'Cores invertidas', settings.contrast)}
          </div>

          {/* Animações */}
          <div style={accessibilityStyles.optionGroup}>
            <label style={accessibilityStyles.optionLabel}>Animações</label>
            {renderOptionButton('animations', 'enabled', 'Habilitadas', settings.animations)}
            {renderOptionButton('animations', 'reduced', 'Reduzidas', settings.animations)}
          </div>

          {/* Espaçamento */}
          <div style={accessibilityStyles.optionGroup}>
            <label style={accessibilityStyles.optionLabel}>Espaçamento</label>
            {renderOptionButton('spacing', 'normal', 'Normal', settings.spacing)}
            {renderOptionButton('spacing', 'increased', 'Aumentado', settings.spacing)}
          </div>

          {/* Opções adicionais */}
          <div style={accessibilityStyles.optionGroup}>
            <label style={accessibilityStyles.optionLabel}>Opções adicionais</label>
            {renderToggleButton('dyslexiaFont', 'Fonte para dislexia', settings.dyslexiaFont)}
            {renderOptionButton('focusIndicators', 'normal', 'Indicadores de foco padrão', settings.focusIndicators)}
            {renderOptionButton('focusIndicators', 'enhanced', 'Indicadores de foco aprimorados', settings.focusIndicators)}
          </div>

          {/* Botão de reset */}
          <button
            style={accessibilityStyles.resetButton}
            onClick={resetSettings}
            aria-label="Restaurar configurações padrão"
          >
            Restaurar padrões
          </button>
        </div>
      )}

      {/* Conteúdo principal */}
      <div id="main-content">
        {children}
      </div>

      {/* Estilos globais */}
      <style jsx global>{`
        /* Estilos para alto contraste */
        .high-contrast {
          background-color: #000 !important;
          color: #fff !important;
        }
        .high-contrast a {
          color: #ffff00 !important;
        }
        .high-contrast button, 
        .high-contrast input, 
        .high-contrast select, 
        .high-contrast textarea {
          background-color: #000 !important;
          color: #fff !important;
          border: 1px solid #fff !important;
        }
        
        /* Estilos para cores invertidas */
        .inverted-colors {
          filter: invert(100%) !important;
        }
        
        /* Estilos para movimento reduzido */
        .reduced-motion * {
          animation-duration: 0.001s !important;
          transition-duration: 0.001s !important;
        }
        
        /* Estilos para espaçamento aumentado */
        .increased-spacing * {
          line-height: 1.8 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        .increased-spacing p, 
        .increased-spacing h1, 
        .increased-spacing h2, 
        .increased-spacing h3, 
        .increased-spacing h4, 
        .increased-spacing h5, 
        .increased-spacing h6 {
          margin-bottom: 1.5em !important;
        }
        
        /* Estilos para fonte de dislexia */
        .dyslexia-font * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
        }
        
        /* Estilos para indicadores de foco aprimorados */
        .enhanced-focus *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
        }
      `}</style>
    </>
  );
};

/**
 * Hook para usar o contexto de acessibilidade
 */
export const useAccessibility = () => {
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    animations: 'enabled',
    spacing: 'normal',
    dyslexiaFont: false,
    focusIndicators: 'normal'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('powerprev_accessibility');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erro ao carregar configurações de acessibilidade:', error);
      }
    }
  }, []);

  return settings;
};

export default AccessibilityProvider;
