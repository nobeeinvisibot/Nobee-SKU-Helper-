/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-[#eac415]/20 p-4 rounded-full mb-6">
          <KeyRound className="w-12 h-12 text-[#ab6b00]" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">Paid API Key Required</h2>
        <p className="text-zinc-600 mb-6">
          This application uses premium AI models.
          <br/>
          You must select a <strong>Paid Google Cloud Project</strong> API key to proceed.
        </p>
        <p className="text-zinc-500 mb-8 text-sm">
          Free tier keys will not work. For more information, see{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ab6b00] hover:underline font-medium"
          >
            Billing Documentation
          </a>.
        </p>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-[#eac415] hover:bg-[#d9b612] text-black font-semibold rounded-lg transition-colors text-lg shadow-lg shadow-[#eac415]/20"
        >
          Select Paid API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;