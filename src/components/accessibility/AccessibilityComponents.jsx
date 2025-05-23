// Componentes adicionais de acessibilidade para o PowerPrev
// Implementa componentes específicos para melhorar a acessibilidade

import React, { useRef, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider';

/**
 * Componente de leitor de tela simplificado
 * Fornece feedback auditivo para elementos importantes
 */
export const ScreenReader = ({ children }) => {
  const { screenReader } = useAccessibility();
  
  if (!screenReader) {
    return <>{children}</>;
  }
  
  return (
    <div className="screen-reader-enabled">
      {children}
      <div aria-live="polite" className="sr-announcer" />
      <style jsx>{`
        .screen-reader-enabled :focus {
          outline: 3px solid #2563eb !important;
        }
        .sr-announcer {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
};

/**
 * Componente para anunciar mudanças de página
 * Útil para usuários de leitores de tela
 */
export const PageAnnouncer = ({ title }) => {
  const announcerRef = useRef(null);
  
  useEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = `Página carregada: ${title}`;
    }
  }, [title]);
  
  return (
    <div 
      ref={announcerRef}
      aria-live="assertive" 
      className="sr-only"
      role="status"
    />
  );
};

/**
 * Componente para texto alternativo aprimorado para imagens
 */
export const EnhancedImage = ({ 
  src, 
  alt, 
  longDescription, 
  width, 
  height, 
  className, 
  ...props 
}) => {
  const id = `img-desc-${Math.random().toString(36).substring(2, 10)}`;
  
  return (
    <figure className={className}>
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        aria-describedby={longDescription ? id : undefined}
        {...props}
      />
      {longDescription && (
        <figcaption id={id} className="sr-only">
          {longDescription}
        </figcaption>
      )}
      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </figure>
  );
};

/**
 * Componente para tabelas acessíveis
 */
export const AccessibleTable = ({ 
  caption, 
  headers, 
  data, 
  summary,
  className 
}) => {
  return (
    <div className={`table-responsive ${className || ''}`}>
      <table summary={summary}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .table-responsive {
          overflow-x: auto;
          max-width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        caption {
          font-weight: bold;
          text-align: left;
          margin-bottom: 0.5rem;
        }
        th, td {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

/**
 * Componente para formulários acessíveis
 */
export const AccessibleForm = ({ 
  children, 
  onSubmit, 
  className, 
  ...props 
}) => {
  return (
    <form 
      onSubmit={onSubmit} 
      className={className} 
      noValidate
      {...props}
    >
      <fieldset>
        {children}
      </fieldset>
      <style jsx>{`
        fieldset {
          border: none;
          padding: 0;
          margin: 0;
        }
      `}</style>
    </form>
  );
};

/**
 * Componente para campo de formulário acessível
 */
export const AccessibleField = ({ 
  label, 
  id, 
  type = 'text', 
  required = false, 
  error, 
  helpText,
  className,
  ...props 
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substring(2, 10)}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  return (
    <div className={`form-field ${className || ''}`}>
      <label htmlFor={fieldId}>
        {label}
        {required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      
      <input
        id={fieldId}
        type={type}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`}
        {...props}
      />
      
      {error && (
        <div id={errorId} className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {helpText && (
        <div id={helpId} className="help-text">
          {helpText}
        </div>
      )}
      
      <style jsx>{`
        .form-field {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .required {
          color: #e53e3e;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
        }
        input:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        input[aria-invalid="true"] {
          border-color: #e53e3e;
        }
        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .help-text {
          color: #4a5568;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

/**
 * Componente para botão acessível
 */
export const AccessibleButton = ({ 
  children, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  className,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #2563eb;
          color: white;
          border: 1px solid #2563eb;
        `;
      case 'secondary':
        return `
          background-color: white;
          color: #2563eb;
          border: 1px solid #2563eb;
        `;
      case 'danger':
        return `
          background-color: #e53e3e;
          color: white;
          border: 1px solid #e53e3e;
        `;
      default:
        return `
          background-color: #f8fafc;
          color: #1e293b;
          border: 1px solid #e2e8f0;
        `;
    }
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={`accessible-button ${variant} ${className || ''}`}
      {...props}
    >
      {children}
      <style jsx>{`
        .accessible-button {
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
          ${getVariantStyles()}
        }
        .accessible-button:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .accessible-button:hover:not(:disabled) {
          opacity: 0.9;
        }
        .accessible-button:active:not(:disabled) {
          transform: translateY(1px);
        }
        .accessible-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};

/**
 * Componente para modal acessível
 */
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className
}) => {
  const modalRef = useRef(null);
  
  // Focar no modal quando abrir
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  // Capturar tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className={`modal ${className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background-color: white;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        #modal-title {
          margin: 0;
          font-size: 1.25rem;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
        }
        .modal-content {
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

/**
 * Componente para navegação por teclado
 */
export const KeyboardNavigation = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Navegação por teclas de atalho
      if (e.altKey) {
        switch (e.key) {
          case 'h':
            // Ir para a página inicial
            window.location.href = '/';
            break;
          case 's':
            // Pular para o conteúdo principal
            document.getElementById('main-content')?.focus();
            break;
          case 'n':
            // Pular para a navegação
            document.querySelector('nav')?.focus();
            break;
          case 'f':
            // Pular para o formulário
            document.querySelector('form')?.focus();
            break;
          case 'a':
            // Abrir menu de acessibilidade
            document.getElementById('accessibility-toggle')?.click();
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return <>{children}</>;
};

/**
 * Componente para dicas de acessibilidade
 */
export const AccessibilityTips = ({ isOpen, onClose }) => {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dicas de Acessibilidade"
    >
      <div className="tips-container">
        <h3>Atalhos de Teclado</h3>
        <ul>
          <li><strong>Alt + H</strong>: Ir para a página inicial</li>
          <li><strong>Alt + S</strong>: Pular para o conteúdo principal</li>
          <li><strong>Alt + N</strong>: Pular para a navegação</li>
          <li><strong>Alt + F</strong>: Pular para o formulário</li>
          <li><strong>Alt + A</strong>: Abrir menu de acessibilidade</li>
          <li><strong>Tab</strong>: Navegar entre elementos</li>
          <li><strong>Enter/Espaço</strong>: Ativar elemento selecionado</li>
          <li><strong>Esc</strong>: Fechar diálogos ou menus</li>
        </ul>
        
        <h3>Navegação por Leitor de Tela</h3>
        <p>O PowerPrev é compatível com leitores de tela como NVDA, JAWS e VoiceOver. Utilize os comandos específicos do seu leitor de tela para navegar pelo sistema.</p>
        
        <h3>Personalizações</h3>
        <p>Utilize o menu de acessibilidade (botão ♿ no canto inferior direito) para personalizar a aparência do sistema de acordo com suas necessidades.</p>
        
        <AccessibleButton onClick={onClose}>Fechar</AccessibleButton>
      </div>
      <style jsx>{`
        .tips-container {
          max-height: 60vh;
          overflow-y: auto;
        }
        h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        ul {
          padding-left: 1.5rem;
        }
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </AccessibleModal>
  );
};

export default {
  ScreenReader,
  PageAnnouncer,
  EnhancedImage,
  AccessibleTable,
  AccessibleForm,
  AccessibleField,
  AccessibleButton,
  AccessibleModal,
  KeyboardNavigation,
  AccessibilityTips
};
