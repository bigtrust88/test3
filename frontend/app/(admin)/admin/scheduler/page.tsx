/**
 * Scheduler Page
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SchedulerPage() {
  const schedules = [
    {
      time: '08:00',
      name: 'Premarket Briefing',
      status: 'active',
      lastRun: '2024-04-13 08:00:15',
      successRate: 100,
    },
    {
      time: '14:00',
      name: 'Deep Analysis',
      status: 'active',
      lastRun: '2024-04-13 14:00:42',
      successRate: 98,
    },
    {
      time: '22:00',
      name: 'Closing Recap',
      status: 'active',
      lastRun: '2024-04-13 22:00:15',
      successRate: 95,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          n8n automation schedule settings
        </p>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.time}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {schedule.time}
              </div>
              <p className="text-lg font-semibold mt-2">{schedule.name}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Badge
                  variant={schedule.status === 'active' ? 'success' : 'secondary'}
                  size="sm"
                >
                  {schedule.status === 'active' ? '✓ Active' : '○ Inactive'}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last Run
                </p>
                <p className="text-sm font-mono">{schedule.lastRun}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {schedule.successRate}%
                </p>
              </div>

              <Button variant="primary" size="sm" fullWidth>
                Run Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Global Settings */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Global Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Default Timezone (ET)
            </label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              <option>America/New_York</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              defaultChecked
              className="w-4 h-4 rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium">
              Enable automation
            </label>
          </div>

          <Button variant="primary">Save</Button>
        </div>
      </section>
    </div>
  );
}
