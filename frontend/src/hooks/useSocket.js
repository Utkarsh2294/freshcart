import { useEffect } from 'react';
import { useAuth } from './useAuth';
import * as socketService from '../services/socketService';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    let socket = null;
    if (isAuthenticated && token) {
      socket = socketService.connect(token);
    }
    
    return () => {
      if (socket) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, token]);
};
