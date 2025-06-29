import React, { createContext, useContext, useRef } from 'react';

const ModalActionContext = createContext();

export function ModalActionProvider({ children }) {
  const actionRef = useRef(null);

  const triggerModalAction = (action) => {
    if (actionRef.current) {
      actionRef.current(action);
    }
  };

  const setModalActionHandler = (handler) => {
    actionRef.current = handler;
  };

  return (
    <ModalActionContext.Provider value={{ triggerModalAction, setModalActionHandler }}>
      {children}
    </ModalActionContext.Provider>
  );
}

export function useModalAction() {
  return useContext(ModalActionContext);
} 