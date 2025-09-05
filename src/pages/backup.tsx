import { useState, useEffect } from "react";
import { getAllBackups, deleteBackup } from "../js/request";
import type { BackupData } from "../js/request";
import BackupForm from "../components/BackupForm";

function Backup() {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [showBackupForm, setShowBackupForm] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    setBackups(getAllBackups());
  };

  const handleDelete = (timestamp: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro de backup?')) {
      deleteBackup(timestamp);
      loadBackups();
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Historial de Backups</h1>
            <p className="text-gray-600">Gestión y seguimiento de todos los backups registrados</p>
          </div>
          <button
            onClick={() => setShowBackupForm(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center space-x-2"
          >
            <span>+</span>
            <span>Nuevo Backup</span>
          </button>
        </div>

        {backups.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resumen del Log
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup, index) => (
                    <tr key={backup.timestamp} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getEstadoIcon(backup.estado)}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(backup.estado)}`}>
                            {backup.estado.charAt(0).toUpperCase() + backup.estado.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {backup.fecha}
                        </div>
                        <div className="text-sm text-gray-500">
                          {backup.hora}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={backup.resumenLog}>
                          {backup.resumenLog}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(backup.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(backup.timestamp)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💾</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay backups registrados</h3>
            <p className="text-gray-600 mb-6">Comienza registrando tu primer backup para llevar un seguimiento completo</p>
            <button
              onClick={() => setShowBackupForm(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Registrar Primer Backup
            </button>
          </div>
        )}

        {/* Estadísticas rápidas */}
        {backups.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-gray-800">{backups.length}</div>
              <div className="text-sm text-gray-600">Total Backups</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {backups.filter(b => b.estado === 'exitoso').length}
              </div>
              <div className="text-sm text-gray-600">Exitosos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {backups.filter(b => b.estado === 'fallido').length}
              </div>
              <div className="text-sm text-gray-600">Fallidos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {backups.filter(b => b.estado === 'en_progreso').length}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal del formulario de backup */}
      {showBackupForm && (
        <BackupForm
          onClose={() => setShowBackupForm(false)}
          onSave={loadBackups}
        />
      )}
    </div>
  );
}

export default Backup;
