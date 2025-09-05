import { useState } from "react";
import { saveBackupData } from "../js/request";
import type { BackupData } from "../js/request";

interface BackupFormProps {
  onClose: () => void;
  onSave: () => void;
}

function BackupForm({ onClose, onSave }: BackupFormProps) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [resumenLog, setResumenLog] = useState('');
  const [estado, setEstado] = useState<'exitoso' | 'fallido' | 'en_progreso' | 'pendiente'>('exitoso');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const backupData: BackupData = {
      id: Date.now().toString(),
      fecha,
      hora,
      resumenLog,
      estado,
      timestamp: new Date().toISOString()
    };

    saveBackupData(backupData);
    onSave();
    onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Backup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del Backup
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora del Backup
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Backup
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getEstadoColor(estado)}`}
              required
            >
              <option value="exitoso">✅ Exitoso</option>
              <option value="fallido">❌ Fallido</option>
              <option value="en_progreso">🔄 En Progreso</option>
              <option value="pendiente">⏳ Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumen del Log
            </label>
            <textarea
              value={resumenLog}
              onChange={(e) => setResumenLog(e.target.value)}
              placeholder="Ingrese un resumen del log del backup..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Guardar Backup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BackupForm;
