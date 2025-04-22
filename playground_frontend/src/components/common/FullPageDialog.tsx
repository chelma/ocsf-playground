import React, { ReactNode } from 'react';
import { Box, Button, Header, SpaceBetween } from '@cloudscape-design/components';

interface FullPageDialogProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
  disableConfirm?: boolean;
  hideCancel?: boolean;
}

const FullPageDialog: React.FC<FullPageDialogProps> = ({
  title,
  visible,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  children,
  disableConfirm = false,
  hideCancel = false,
}) => {
  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose} // Close when clicking the backdrop
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '2200px',
          height: '90%',
          backgroundColor: 'white',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #eaeded' }}>
          <Header variant="h1">{title}</Header>
        </div>
        
        {/* Content Area - scrollable */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {children}
        </div>
        
        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #eaeded' }}>
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              {!hideCancel && (
                <Button variant="link" onClick={onClose}>
                  {cancelLabel}
                </Button>
              )}
              {onConfirm && (
                <Button 
                  variant="primary" 
                  onClick={onConfirm}
                  disabled={disableConfirm}
                >
                  {confirmLabel}
                </Button>
              )}
            </SpaceBetween>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default FullPageDialog;