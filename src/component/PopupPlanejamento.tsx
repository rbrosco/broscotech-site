import React from 'react';
import { FiCheckCircle, FiXCircle, FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiHash, FiTrash2 } from 'react-icons/fi';

type ProjectDetails = {
  title?: string;
  status?: string;
  progress?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  project_type?: string;
  final_date?: string | null;
  [key: string]: unknown;
};

type UpdateDetails = {
  created_at: string;
  message: string;
  [key: string]: unknown;
};

interface PopupPlanejamentoProps {
  open: boolean;
  onClose: () => void;
  project: ProjectDetails | null;
  update: UpdateDetails | null;
  isAdmin: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  acceptedStatus?: 'accepted' | 'rejected' | null;
}

const PopupPlanejamento: React.FC<PopupPlanejamentoProps> = ({
  open,
  onClose,
  project,
  update,
  isAdmin,
  onAccept,
  onReject,
  acceptedStatus,
  onDelete,
}) => {
  const handleDelete = onDelete || (() => {});
  if (!open || !update) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex items-start justify-center bg-black/40 animate-fade-in">
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in-up border border-blue-100 dark:border-gray-800" style={{ fontSize: '1.1em' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-blue-700 dark:hover:text-white transition">×</button>
        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <FiFileText className="inline-block text-blue-400" /> Detalhes do Planejamento
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <FiCalendar /> {new Date(update.created_at).toLocaleString()}
        </div>
        <div className="mb-4 text-base text-slate-800 dark:text-slate-100 font-medium border-l-4 border-blue-400 pl-3 bg-blue-50/60 dark:bg-blue-900/20 rounded">
          {update.message}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 dark:text-slate-200 mb-4">
          <div className="flex items-center gap-2"><FiHash /> <b>Título:</b> {project?.title}</div>
          <div className="flex items-center gap-2"><FiFileText /> <b>Status:</b> {project?.status}</div>
          <div className="flex items-center gap-2"><FiCheckCircle className="text-green-500" /> <b>Progresso:</b> {project?.progress}%</div>
          <div className="flex items-center gap-2"><FiUser /> <b>Nome:</b> {project?.client_name || '-'}</div>
          <div className="flex items-center gap-2"><FiMail /> <b>E-mail:</b> {project?.client_email || '-'}</div>
          <div className="flex items-center gap-2"><FiPhone /> <b>Telefone:</b> {project?.client_phone || '-'}</div>
          <div className="flex items-center gap-2"><FiFileText /> <b>Tipo de projeto:</b> {project?.project_type || '-'}</div>
          <div className="flex items-center gap-2"><FiCalendar /> <b>Data final:</b> {project?.final_date ? String(project.final_date).slice(0,10) : '-'}</div>
        </div>
        <hr className="my-4 border-blue-200 dark:border-gray-700" />
        {isAdmin && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-3 items-center">
              <span className="font-semibold">Aceite do projeto:</span>
              {acceptedStatus === 'accepted' ? (
                <span className="flex items-center gap-1 text-green-600 font-bold"><FiCheckCircle /> ACEITO</span>
              ) : acceptedStatus === 'rejected' ? (
                <span className="flex items-center gap-1 text-red-600 font-bold"><FiXCircle /> RECUSADO</span>
              ) : (
                <>
                  <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-1 text-xs font-semibold shadow transition flex items-center gap-1"><FiCheckCircle /> Aceitar</button>
                  <button onClick={onReject} className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-1 text-xs font-semibold shadow transition flex items-center gap-1"><FiXCircle /> Recusar</button>
                </>
              )}
            </div>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white rounded px-4 py-1 text-xs font-semibold shadow transition w-fit mt-2"
              title="Excluir projeto"
            >
              <FiTrash2 /> Excluir projeto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupPlanejamento;
