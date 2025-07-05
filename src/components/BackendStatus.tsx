import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { checkBackendHealth } from '../services/analysisService';

const BackendStatus: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);
      try {
        const healthy = await checkBackendHealth();
        setIsHealthy(healthy);
      } catch {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span>Checking backend status...</span>
      </div>
    );
  }

  if (isHealthy === null) return null;

  return (
    <div className={`flex items-center space-x-2 text-sm ${
      isHealthy ? 'text-green-600' : 'text-red-600'
    }`}>
      {isHealthy ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Backend Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Backend Offline</span>
        </>
      )}
    </div>
  );
};

export default BackendStatus;