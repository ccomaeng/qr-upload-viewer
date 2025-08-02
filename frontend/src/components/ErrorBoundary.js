import React, { Component } from 'react';
import { clearAllCaches, handleCacheError } from '../utils/cacheManager';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Handle cache-related errors
    if (error.message.includes('cache') || error.message.includes('Failed to fetch')) {
      this.handleAutoRecovery();
    }
  }

  handleAutoRecovery = async () => {
    this.setState({ isRecovering: true });
    
    try {
      console.log('🔄 Attempting automatic recovery...');
      await handleCacheError(this.state.error, 'ErrorBoundary');
      
      // If we reach here, recovery was successful
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    } catch (recoveryError) {
      console.error('❌ Auto-recovery failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  };

  handleManualRecovery = async () => {
    this.setState({ isRecovering: true });
    
    try {
      await clearAllCaches();
      
      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
      
      // Force page reload
      window.location.reload();
    } catch (error) {
      console.error('❌ Manual recovery failed:', error);
      this.setState({ isRecovering: false });
    }
  };

  handleGoHome = () => {
    // Clear error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Navigate to home
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDataError = this.state.error?.message?.includes('UPLOAD_NOT_FOUND') || 
                          this.state.error?.message?.includes('404');

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>
              {isDataError ? '📊' : '⚠️'}
            </div>
            
            <h2 style={styles.title}>
              {isDataError ? '데이터를 찾을 수 없습니다' : '오류가 발생했습니다'}
            </h2>
            
            <p style={styles.message}>
              {isDataError 
                ? '시스템이 재시작되어 업로드된 데이터가 초기화되었을 수 있습니다.'
                : '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
              }
            </p>

            {this.state.isRecovering && (
              <div style={styles.recovering}>
                <div style={styles.spinner}></div>
                <p>복구 중...</p>
              </div>
            )}

            <div style={styles.actions}>
              <button 
                onClick={this.handleGoHome}
                style={styles.primaryButton}
                disabled={this.state.isRecovering}
              >
                {isDataError ? '새로 업로드하기' : '홈으로 돌아가기'}
              </button>
              
              <button 
                onClick={this.handleManualRecovery}
                style={styles.secondaryButton}
                disabled={this.state.isRecovering}
              >
                캐시 정리 후 재시도
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details style={styles.errorDetails}>
                <summary>기술적 세부사항</summary>
                <pre style={styles.errorText}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px'
  },
  message: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '32px'
  },
  recovering: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
    color: '#666'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '8px'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#0056b3'
    },
    ':disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#007bff',
      color: 'white'
    },
    ':disabled': {
      borderColor: '#ccc',
      color: '#ccc',
      cursor: 'not-allowed'
    }
  },
  errorDetails: {
    marginTop: '24px',
    textAlign: 'left'
  },
  errorText: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px'
  }
};

export default ErrorBoundary;