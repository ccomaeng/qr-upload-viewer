import React, { useState } from 'react';
import { clearAllCaches } from '../utils/cacheManager';

const ErrorRecoveryModal = ({ 
  isOpen, 
  onClose, 
  error, 
  onRetry, 
  onGoHome,
  onNewUpload 
}) => {
  const [isRecovering, setIsRecovering] = useState(false);

  if (!isOpen) return null;

  const isDataError = error?.code === 'UPLOAD_NOT_FOUND';
  const isNetworkError = error?.code === 'NETWORK_ERROR';

  const handleClearCacheAndRetry = async () => {
    setIsRecovering(true);
    try {
      await clearAllCaches();
      console.log('✅ Caches cleared, retrying...');
      
      // Wait a moment for caches to clear
      setTimeout(() => {
        setIsRecovering(false);
        if (onRetry) {
          onRetry();
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (clearError) {
      console.error('❌ Cache clear failed:', clearError);
      setIsRecovering(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
    onClose();
  };

  const handleNewUpload = () => {
    if (onNewUpload) {
      onNewUpload();
    } else {
      window.location.href = '/';
    }
    onClose();
  };

  const getIcon = () => {
    if (isDataError) return '📊';
    if (isNetworkError) return '🌐';
    return '⚠️';
  };

  const getTitle = () => {
    if (isDataError) return 'QR 데이터를 찾을 수 없습니다';
    if (isNetworkError) return '네트워크 연결 문제';
    return '오류가 발생했습니다';
  };

  const getMessage = () => {
    if (error?.message) {
      return error.message;
    }
    return '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  };

  const getActions = () => {
    if (isDataError) {
      return [
        {
          label: '새로 업로드하기',
          onClick: handleNewUpload,
          primary: true,
          icon: '📤'
        },
        {
          label: '홈으로 가기',
          onClick: handleGoHome,
          primary: false,
          icon: '🏠'
        }
      ];
    }

    if (isNetworkError) {
      return [
        {
          label: '캐시 정리 후 재시도',
          onClick: handleClearCacheAndRetry,
          primary: true,
          icon: '🔄'
        },
        {
          label: '새로 업로드하기',
          onClick: handleNewUpload,
          primary: false,
          icon: '📤'
        }
      ];
    }

    // Generic error
    return [
      {
        label: '캐시 정리 후 재시도',
        onClick: handleClearCacheAndRetry,
        primary: true,
        icon: '🔄'
      },
      {
        label: '홈으로 가기',
        onClick: handleGoHome,
        primary: false,
        icon: '🏠'
      }
    ];
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.icon}>{getIcon()}</div>
          <h2 style={styles.title}>{getTitle()}</h2>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.message}>{getMessage()}</p>

          {isRecovering && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>캐시를 정리하고 있습니다...</p>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          {getActions().map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={isRecovering}
              style={{
                ...styles.button,
                ...(action.primary ? styles.primaryButton : styles.secondaryButton),
                ...(isRecovering ? styles.disabledButton : {})
              }}
            >
              <span style={styles.buttonIcon}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {error?.recoverable && (
          <div style={styles.tip}>
            💡 <strong>팁:</strong> 문제가 계속 발생하면 브라우저를 완전히 닫고 다시 열어보세요.
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    padding: '24px 24px 16px 24px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  icon: {
    fontSize: '32px',
    marginRight: '12px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    flex: 1
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  content: {
    padding: '24px'
  },
  message: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#555',
    marginBottom: '20px',
    whiteSpace: 'pre-line'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    borderTop: '1px solid #eee',
    marginTop: '20px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '12px'
  },
  loadingText: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  actions: {
    padding: '16px 24px 24px 24px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    outline: 'none'
  },
  primaryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    ':hover': {
      backgroundColor: '#0056b3'
    }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'inherit'
    }
  },
  buttonIcon: {
    fontSize: '16px'
  },
  tip: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px 24px',
    borderTop: '1px solid #ffeaa7',
    fontSize: '14px',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px'
  }
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ErrorRecoveryModal;