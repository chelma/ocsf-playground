import React, { ReactNode } from 'react';
import { Box, Button, Modal, SpaceBetween } from '@cloudscape-design/components';

export interface ModalDialogProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  disableConfirm?: boolean;
  hideCancel?: boolean;
  footer?: ReactNode;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  title,
  visible,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  size = 'medium',
  children,
  disableConfirm = false,
  hideCancel = false,
  footer
}) => {
  // Default footer with standard buttons
  const defaultFooter = (
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
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      header={title}
      size={size}
      footer={footer || defaultFooter}
    >
      {children}
    </Modal>
  );
};

export default ModalDialog;
