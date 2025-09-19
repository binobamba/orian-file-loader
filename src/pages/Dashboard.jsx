import React, { useState } from 'react';

import DashboardCard01 from '../components/ui/DashboardCard01';
import DashboardCard02 from '../components/ui/DashboardCard02';
import DashboardCard03 from '../components/ui/DashboardCard03';
import DashboardCard04 from '../components/ui/DashboardCard04';
import DashboardCard05 from '../components/ui/DashboardCard05';
import DashboardCard06 from '../components/ui/DashboardCard06';
import DashboardCard08 from '../components/ui/DashboardCard08';
import DashboardCard09 from '../components/ui/DashboardCard09';
import DashboardCard10 from '../components/ui/DashboardCard10';
import DashboardCard11 from '../components/ui/DashboardCard11';
import DashboardCard12 from '../components/ui/DashboardCard12';
import DashboardCard13 from '../components/ui/DashboardCard13';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="flex flex-col md:flex-row mb-8 gap-4">
              {/* Carte principale - 4/5 de largeur */}
              <div className="w-full md:w-4/5">
                <DashboardCard01 />
              </div>
              
              {/* Carte secondaire - 1/5 de largeur */}
              <div className="w-full md:w-1/5">
                <DashboardCard06 />
              </div>
            </div>
            
            {/* Grille des autres cartes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard08 />
              <DashboardCard09 />
              <DashboardCard10 />
              <DashboardCard11 />
              <DashboardCard12 />
              <DashboardCard13 />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;