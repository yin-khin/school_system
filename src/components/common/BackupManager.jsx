import { useState } from 'react';
import { Download, Upload, Database, Loader2 } from 'lucide-react';
import { backupAPI } from '../../api';

const BackupManager = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  // Export and download
  const handleExport = async () => {
    setExporting(true);
    setError('');
    setMessage(null);
    try {
      const res = await backupAPI.exportData();
      const { data } = res.data;

      if (res.data.success) {
        // Create downloadable file
        const jsonString = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `school-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setMessage({
          type: 'success',
          text: `Backup downloaded! ${data.counts.total} total records exported.`
        });
      } else {
        setError('Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Parse selected file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setPreview(json);
      } catch (err) {
        setError('Invalid JSON file. Please select a valid backup file.');
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Import data
  const handleImport = async () => {
    if (!file || !preview) {
      setError('Please select a valid backup file first');
      return;
    }

    if (!window.confirm('This will import the backup data into your database. Continue?')) return;

    setImporting(true);
    setError('');
    setMessage(null);
    try {
      const res = await backupAPI.importData({ data: preview });
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: res.data.message || 'Import completed successfully'
        });
        setFile(null);
        setPreview(null);
        // Reset file input
        e.target.value = '';
      } else {
        setError(res.data.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const renderMessage = () => {
    if (!message && !error) return null;
    if (message) {
      return (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          ✅ {message.text}
        </div>
      );
    }
    return (
      <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
        ❌ {error}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-100 text-primary-600">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Backup</h1>
          <p className="text-gray-500 text-sm">Export and import the entire school database</p>
        </div>
      </div>

      {renderMessage()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Export Database</h2>
              <p className="text-sm text-gray-500">
                Download all records (students, teachers, classes, fees, etc.) as a JSON backup file.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Included data:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Students', 'Teachers', 'Parents', 'Classes', 'Subjects', 'Attendance', 'Exams', 'Marks', 'Fees', 'Payments', 'Books', 'Users', 'Timetables', 'Assignments'].map((item) => (
                <span key={item} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full py-3"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Backup (.json)
              </>
            )}
          </button>
        </div>

        {/* Import Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Import Database</h2>
              <p className="text-sm text-gray-500">
                Restore data from a previously exported JSON backup file.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Select Backup File (.json)</label>
              <input
                type="file"
                accept=".json,application/json"
                className="input"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  File preview loaded:
                </p>
                <div className="flex flex-wrap gap-2">
                  {preview.counts &&
                    Object.entries(preview.counts).filter(([key]) => key !== 'total').slice(0, 10).map(([key, value]) => (
                      <span key={key} className="badge-success text-xs">
                        {key.replace('_', ' ')}: {value}
                      </span>
                    ))}
                  {preview.counts && (
                    <span className="badge-info text-xs">
                      Total: {preview.counts.total}
                    </span>
                  )}
                </div>
                {preview.meta && (
                  <p className="text-xs text-gray-500 mt-2">
                    Exported: {preview.meta.exportedAt} | Version: {preview.meta.version}
                  </p>
                )}
              </div>
            )}

            {!preview && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Select a backup file to preview its contents</p>
              </div>
            )}

            <button
              className="btn-success w-full py-3"
              onClick={handleImport}
              disabled={importing || !file}
            >
              {importing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Import Backup Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;