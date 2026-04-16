/**
 * Settings Page
 */

import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Site-wide configuration
        </p>
      </div>

      {/* Basic Info */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Site Title
            </label>
            <input
              type="text"
              defaultValue="US Stock Story"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Description
            </label>
            <textarea
              defaultValue="Daily US stock market analysis, earnings breakdowns, and investment strategies for global investors."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Owner Name
            </label>
            <input
              type="text"
              defaultValue="US Stock Story Team"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <Button variant="primary">Save</Button>
        </div>
      </section>

      {/* API Settings */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">API Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Backend API URL
            </label>
            <input
              type="url"
              defaultValue="http://localhost:3001"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Claude API Key (partially hidden)
            </label>
            <input
              type="password"
              defaultValue="sk-ant-v0-••••••••••••••••••••••••••••••••••••••••••••••••"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              API keys are managed in the backend environment only.
            </p>
          </div>

          <Button variant="primary">Save</Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Reset All Posts
          </button>
          <button className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Reset All Data
          </button>
        </div>
      </section>
    </div>
  );
}
