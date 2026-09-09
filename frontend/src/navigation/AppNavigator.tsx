import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { AuthNavigator } from './AuthNavigator';
import { ResidentNavigator } from './ResidentNavigator';
import { AdminNavigator } from './AdminNavigator';
import { SecurityNavigator } from './SecurityNavigator';

export const AppNavigator = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Initializing Society Connect..." />;
  }

  if (!token || !user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {user.role === 'admin' ? (
        <AdminNavigator />
      ) : user.role === 'security' ? (
        <SecurityNavigator />
      ) : (
        <ResidentNavigator />
      )}
    </NavigationContainer>
  );
};
