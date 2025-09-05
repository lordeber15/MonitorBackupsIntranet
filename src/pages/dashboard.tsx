import { useState, useEffect } from "react";
import { getLastSpeedTestResult, getLatestBackup } from "../js/request";
import type { SpeedTestResult, BackupData } from "../js/request";
import BackupForm from "../components/BackupForm";

function Dashboard() {
  const [lastSpeedTest, setLastSpeedTest] = useState<SpeedTestResult | null>(null);
  const [latestBackup, setLatestBackup] = useState<BackupData | null>(null);
  const [showBackupForm, setShowBackupForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLastSpeedTest(getLastSpeedTestResult());
    setLatestBackup(getLatestBackup());
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'exitoso': return 'bg-green-100 text-green-800 border-green-200';
      case 'fallido': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'exitoso': return '✅';
      case 'fallido': return '❌';
      case 'en_progreso': return '🔄';
      case 'pendiente': return '⏳';
      default: return '❓';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard de Monitoreo</h1>
          <p className="text-gray-600">Resumen del estado de backups y conectividad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Último Test de Velocidad */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Último Test de Velocidad</h2>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>

            {lastSpeedTest ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Ping</div>
                    <div className="text-2xl font-bold text-green-700">
                      {lastSpeedTest.ping.toFixed(0)} ms
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Descarga</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {lastSpeedTest.download.toFixed(1)} Mbps
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium">Velocidad Máxima</div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {lastSpeedTest.maxSpeed.toFixed(1)} Mbps
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  Último test: {formatDateTime(lastSpeedTest.timestamp)}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Estado de Conexión</div>
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    lastSpeedTest.download > 25 ? 'bg-green-100 text-green-800' : 
                    lastSpeedTest.download > 10 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {lastSpeedTest.download > 25 ? '🚀 Excelente' : 
                     lastSpeedTest.download > 10 ? '⚡ Buena' : 
                     '🐌 Lenta'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-500">No hay datos de test de velocidad</p>
                <p className="text-sm text-gray-400 mt-2">Ejecuta un test desde la página de Speed Tests</p>
              </div>
            )}
          </div>

          {/* Estado del Backup */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Estado del Backup</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            {latestBackup ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getEstadoIcon(latestBackup.estado)}</div>
                  <div>
                    <div className="font-semibold text-gray-800">Último Backup</div>
                    <div className="text-sm text-gray-600">
                      {latestBackup.fecha} a las {latestBackup.hora}
                    </div>
                  </div>
                </div>

                <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(latestBackup.estado)}`}>
                  {latestBackup.estado.charAt(0).toUpperCase() + latestBackup.estado.slice(1).replace('_', ' ')}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Resumen del Log</div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {latestBackup.resumenLog}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Registrado: {formatDateTime(latestBackup.timestamp)}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Recomendación</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {latestBackup.estado === 'exitoso' ? 
                      '✅ Sistema funcionando correctamente' :
                      latestBackup.estado === 'fallido' ?
                      '⚠️ Revisar configuración de backup' :
                      latestBackup.estado === 'en_progreso' ?
                      '🔄 Backup en ejecución, monitorear progreso' :
                      '📋 Programar ejecución de backup'
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">💾</div>
                <p className="text-gray-500">No hay registros de backup</p>
                <p className="text-sm text-gray-400 mt-2">Ve a la página de Backup para registrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen General */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <div className="text-sm text-gray-600">Conectividad</div>
              <div className="font-semibold text-gray-800">
                {lastSpeedTest ? 'Monitoreada' : 'Sin datos'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💾</div>
              <div className="text-sm text-gray-600">Backups</div>
              <div className="font-semibold text-gray-800">
                {latestBackup ? 'Registrados' : 'Sin registros'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-600">Estado General</div>
              <div className="font-semibold text-gray-800">
                {lastSpeedTest && latestBackup ? 'Operativo' : 'Configurando'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del formulario de backup */}
      {showBackupForm && (
        <BackupForm
          onClose={() => setShowBackupForm(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
}

export default Dashboard;
