import React, { CSSProperties, ReactNode } from 'react';
import Split from 'react-split';
import { getGutterStyle } from '../../utils/styles';

export interface SplitLayoutProps {
  children: ReactNode[];
  direction?: 'horizontal' | 'vertical';
  sizes?: number[];
  minSize?: number;
  style?: CSSProperties;
  className?: string;
  gutterSize?: number;
  snapOffset?: number;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({
  children,
  direction = 'horizontal',
  sizes = [50, 50],
  minSize = 100,
  style = {},
  className = 'split',
  gutterSize = 10,
  snapOffset = 30,
}) => {
  // Default style for the split container
  const defaultStyle: CSSProperties = {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  // Combined style with user overrides
  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <Split
      className={className}
      style={combinedStyle}
      gutterStyle={getGutterStyle as any}
      sizes={sizes}
      minSize={minSize}
      gutterSize={gutterSize}
      snapOffset={snapOffset}
      dragInterval={1}
      direction={direction}
    >
      {children}
    </Split>
  );
};

export default SplitLayout;
