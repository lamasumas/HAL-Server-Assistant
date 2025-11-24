"use client";
import React from 'react';
import { useSettings } from '../context/settings-context';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useSettings();

  const handleSystemPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      systemPrompt: event.target.value,
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg z-50 w-1/2"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="mb-4">
          <label htmlFor="system-prompt" className="block text-sm font-medium mb-2">
            System Prompt
          </label>
          <textarea
            id="system-prompt"
            value={settings.systemPrompt}
            onChange={handleSystemPromptChange}
            className="w-full h-40 bg-gray-700 border border-gray-600 rounded-md p-2 text-sm"
          />
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
