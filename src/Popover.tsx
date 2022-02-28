/* eslint-disable */
import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

const modalRoot = document.getElementById('modal-root');

type Props = {
  targetEl: HTMLElement;
}

const Popover: React.FC<Props> = ({ targetEl, children }) => {
  const el = useMemo(() => document.createElement('div'), []);

  const elBbox = targetEl.getBoundingClientRect();

  useEffect(() => {
    modalRoot?.appendChild(el);

    return () => {
      modalRoot?.removeChild(el);
    };
  }, []);

  return ReactDOM.createPortal(
    <div
      style={{
        zIndex: 9999,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        position: 'absolute',
        top: elBbox.bottom,
        left: elBbox.left,
        minWidth: elBbox.width,
      }}
    >
      {children}
    </div>,
    el
  );
};

export default Popover;
