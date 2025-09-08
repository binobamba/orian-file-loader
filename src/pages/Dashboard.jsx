import React, { useState } from 'react';

import DashboardCard01 from '../components/dashboard/DashboardCard01';
import DashboardCard02 from '../components/dashboard/DashboardCard02';
import DashboardCard03 from '../components/dashboard/DashboardCard03';
import DashboardCard04 from '../components/dashboard/DashboardCard04';
import DashboardCard05 from '../components/dashboard/DashboardCard05';
import DashboardCard06 from '../components/dashboard/DashboardCard06';
import DashboardCard08 from '../components/dashboard/DashboardCard08';
import DashboardCard09 from '../components/dashboard/DashboardCard09';
import DashboardCard10 from '../components/dashboard/DashboardCard10';
import DashboardCard11 from '../components/dashboard/DashboardCard11';
import DashboardCard12 from '../components/dashboard/DashboardCard12';
import DashboardCard13 from '../components/dashboard/DashboardCard13';
// importer tableau

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

    
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8  w-full max-w-9xl mx-auto">

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardCard04/>

                    <DashboardCard01 />
                    <DashboardCard02 />
                    <DashboardCard03 />
                    <DashboardCard05 />
                    <DashboardCard06 />
                    <DashboardCard08 />
                    <DashboardCard09 />
                    <DashboardCard10 />
                    <DashboardCard11 />
                    <DashboardCard12 />
                    <DashboardCard13 />
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;