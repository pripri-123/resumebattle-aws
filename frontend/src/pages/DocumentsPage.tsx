import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const { toast } = useToast();

  const loadDocs = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleRenameSubmit = async (id: string) => {
    if (!newTitle.trim()) return;
    try {
      await api.renameDocument(id, newTitle.trim());
      toast('Document renamed.', 'success');
      setRenameId(null);
      setNewTitle('');
      loadDocs();
    } catch (err: any) {
      toast(err.message || 'Rename failed.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document permanently?')) return;
    try {
      await api.deleteDocument(id);
      toast('Document permanently deleted from storage.', 'info');
      loadDocs();
    } catch (err: any) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  const handleDownload = (storageKey: string, filename: string) => {
    const downloadUrl = `http://localhost:5000/api/v1/documents/raw/${storageKey}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Download initiated.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-dark-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold z tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-violet" />
            Document Management
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Secure, encrypted document repository with automated storage abstraction (Local & AWS S3)
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Private Document Isolation Enabled</span>
        </div>
      </div>

      {/* Document List Table */}
      <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Document Title</th>
                <th className="py-3 px-3">Original File</th>
                <th className="py-3 px-3">File Size</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Uploaded Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-dark-card/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-white">
                    {renameId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="px-2 py-1 rounded bg-dark-bg border border-brand-violet text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleRenameSubmit(doc.id)}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenameId(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span>{doc.title}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-400 text-[11px]">
                    {doc.original_filename}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-400">
                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Text only'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-400">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownload(doc.storage_key, doc.original_filename)}
                        className="p-1.5 text-gray-400 hover:text-brand-cyan hover:bg-dark-hover rounded-lg transition-colors"
                        title="Download document bytes"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setRenameId(doc.id);
                          setNewTitle(doc.title);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
                        title="Rename document"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
