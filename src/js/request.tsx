// Funciones para test de velocidad usando Cloudflare Speedtest
// Nota: Instalar con: npm install @cloudflare/speedtest

export interface SpeedTestResult {
  download: number;
  ping: number;
  timestamp: string;
  maxSpeed: number;
}

export interface BackupData {
  id: string;
  fecha: string;
  hora: string;
  resumenLog: string;
  estado: 'exitoso' | 'fallido' | 'en_progreso' | 'pendiente';
  timestamp: string;
}

export interface SpeedTestCallbacks {
  onSpeedUpdate: (speed: number) => void;
  onProgressUpdate: (progress: number) => void;
  onMaxSpeedUpdate: (maxSpeed: number) => void;
}

// Función para medir ping usando Cloudflare
export const measurePing = async (): Promise<number> => {
  try {
    const start = performance.now();
    const response = await fetch('https://speed.cloudflare.com/__down?bytes=0', {
      method: 'GET',
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const end = performance.now();
      return end - start;
    }
    return 0;
  } catch (error) {
    console.error('Error midiendo ping:', error);
    return 0;
  }
};

// Función para medir velocidad de descarga usando Cloudflare
export const measureDownloadSpeed = async (
  callbacks: SpeedTestCallbacks,
  testDuration: number = 10
): Promise<number> => {
  const fileSizes = [1, 5, 10, 25]; // MB
  let totalBytes = 0;
  let maxSpeed = 0;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const testInterval = setInterval(async () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;
      
      if (elapsed >= testDuration) {
        clearInterval(testInterval);
        const finalSpeed = (totalBytes * 8) / (1024 * 1024 * elapsed); // Mbps
        callbacks.onSpeedUpdate(finalSpeed);
        resolve(finalSpeed);
        return;
      }

      try {
        // Usar diferentes tamaños de archivo según el progreso
        const sizeIndex = Math.min(Math.floor(elapsed / 2), fileSizes.length - 1);
        const fileSize = fileSizes[sizeIndex];
        const bytes = fileSize * 1024 * 1024;
        
        const start = performance.now();
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, {
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const end = performance.now();
          
          const downloadTime = (end - start) / 1000;
          const instantSpeed = (blob.size * 8) / (1024 * 1024 * downloadTime); // Mbps
          
          if (instantSpeed > 0 && instantSpeed < 10000) { // Filtrar velocidades irreales
            totalBytes += blob.size;
            maxSpeed = Math.max(maxSpeed, instantSpeed);
            
            callbacks.onSpeedUpdate(instantSpeed);
            callbacks.onMaxSpeedUpdate(maxSpeed);
            callbacks.onProgressUpdate((elapsed / testDuration) * 100);
          }
        }
      } catch (error) {
        console.log('Error en descarga:', error);
      }
    }, 1000);
  });
};

// Funciones para manejo de datos locales
export const saveSpeedTestResult = (result: SpeedTestResult): void => {
  localStorage.setItem('lastSpeedTest', JSON.stringify(result));
};

export const getLastSpeedTestResult = (): SpeedTestResult | null => {
  const stored = localStorage.getItem('lastSpeedTest');
  return stored ? JSON.parse(stored) : null;
};

export const saveBackupData = (backup: BackupData): void => {
  const backups = getBackupHistory();
  backups.unshift(backup);
  localStorage.setItem('backup_history', JSON.stringify(backups.slice(0, 50))); // Mantener solo los últimos 50
};

export const getBackupHistory = (): BackupData[] => {
  const stored = localStorage.getItem('backup_history');
  return stored ? JSON.parse(stored) : [];
};

export const getLatestBackup = (): BackupData | null => {
  const backups = getBackupHistory();
  return backups.length > 0 ? backups[0] : null;
};

export const getAllBackups = (): BackupData[] => {
  return getBackupHistory();
};

export const deleteBackup = (timestamp: string): void => {
  const backups = getBackupHistory();
  const updatedBackups = backups.filter(backup => backup.timestamp !== timestamp);
  localStorage.setItem('backup_history', JSON.stringify(updatedBackups));
};

// Tipos para el monitoreo de sitios web
export interface WebsiteStatus {
  url: string;
  name: string;
  status: 'online' | 'offline' | 'checking';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

// Función para verificar el estado de un sitio web
export const checkWebsiteStatus = async (url: string, name: string): Promise<WebsiteStatus> => {
  const startTime = Date.now();
  
  try {
    // Usamos fetch con timeout para verificar el sitio
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    await fetch(url, {
      method: 'HEAD', // Solo necesitamos el header
      signal: controller.signal,
      mode: 'no-cors' // Para evitar problemas de CORS
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      name,
      status: 'online',
      responseTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      name,
      status: 'offline',
      responseTime,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para verificar múltiples sitios web
export const checkMultipleWebsites = async (websites: { url: string; name: string }[]): Promise<WebsiteStatus[]> => {
  const promises = websites.map(site => checkWebsiteStatus(site.url, site.name));
  return Promise.all(promises);
};

// Función para guardar el historial de monitoreo
export const saveMonitoringHistory = (results: WebsiteStatus[]): void => {
  const history = getMonitoringHistory();
  const newEntry = {
    timestamp: new Date().toISOString(),
    results
  };
  
  history.unshift(newEntry);
  localStorage.setItem('monitoring_history', JSON.stringify(history.slice(0, 100))); // Mantener últimos 100
};

// Función para obtener el historial de monitoreo
export const getMonitoringHistory = (): { timestamp: string; results: WebsiteStatus[] }[] => {
  const stored = localStorage.getItem('monitoring_history');
  return stored ? JSON.parse(stored) : [];
};

// Función para obtener el último resultado de monitoreo
export const getLatestMonitoringResult = (): { timestamp: string; results: WebsiteStatus[] } | null => {
  const history = getMonitoringHistory();
  return history.length > 0 ? history[0] : null;
};

// Función principal para ejecutar test completo con Cloudflare (solo ping y descarga)
export const runSpeedTest = async (callbacks: SpeedTestCallbacks, maxSpeed: number): Promise<SpeedTestResult> => {
  try {
    // Fase 1: Ping
    const ping = await measurePing();
    
    // Fase 2: Descarga
    const downloadSpeed = await measureDownloadSpeed(callbacks, 10);
    
    const result: SpeedTestResult = {
      ping,
      download: downloadSpeed,
      maxSpeed,
      timestamp: new Date().toISOString()
    };
    
    // Guardar resultado automáticamente
    saveSpeedTestResult(result);
    
    return result;
  } catch (error) {
    console.error('Error en test de velocidad:', error);
    throw error;
  }
};