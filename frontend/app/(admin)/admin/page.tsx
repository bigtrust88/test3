/**
 * Admin Dashboard
 */

import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Posts"
          value="42"
          icon="📝"
          color="blue"
        />
        <StatsCard
          title="Published Today"
          value="2/3"
          icon="🎯"
          color="green"
        />
        <StatsCard
          title="AI Success Rate"
          value="98%"
          icon="🤖"
          color="purple"
        />
        <StatsCard
          title="Monthly Views"
          value="12.5K"
          icon="👁️"
          trend={12}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new">
            <Button variant="primary">
              ✍️ New Post
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="secondary">
              📋 Manage Posts
            </Button>
          </Link>
          <Link href="/admin/ai-logs">
            <Button variant="secondary">
              🤖 AI Logs
            </Button>
          </Link>
          <Link href="/admin/scheduler">
            <Button variant="secondary">
              ⏰ Scheduler
            </Button>
          </Link>
        </div>
      </section>

      {/* Recent AI Runs */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Recent AI Runs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Post</th>
                <th className="text-left py-3 px-4">Tokens</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 22:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ Success
                  </span>
                </td>
                <td className="py-3 px-4">Closing Recap</td>
                <td className="py-3 px-4">2,156</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 14:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ Success
                  </span>
                </td>
                <td className="py-3 px-4">Deep Analysis</td>
                <td className="py-3 px-4">2,089</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 08:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ Success
                  </span>
                </td>
                <td className="py-3 px-4">Premarket Briefing</td>
                <td className="py-3 px-4">1,945</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* System Status */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Backend API</span>
            <span className="text-green-600 dark:text-green-400">✓ Online</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Database</span>
            <span className="text-green-600 dark:text-green-400">✓ Online</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">n8n Workflow</span>
            <span className="text-green-600 dark:text-green-400">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Claude API</span>
            <span className="text-green-600 dark:text-green-400">✓ Online</span>
          </div>
        </div>
      </section>
    </div>
  );
}
