import React from 'react';

export default function Demande() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
    return (
      <div className="flex h-screen overflow-hidden">
  
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
  
          {/*  Site header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
          <main className="grow">
            <div className="px-4 sm:px-6 lg:px-8  w-full max-w-9xl mx-auto">
  
              {/* Dashboard actions */}
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
  
                {/* Left: Title */}
                <div className="mb-4 text-center text-white w-full bg-gradient-to-r from-green-500 to-orange-500 rounded-lg p-2 sm:mb-0">
                  <h1 className="text-2xl md:text-2xl font-bold">LISTE DES DEMANDES</h1>
                    <div className="flex items-center justify-center">
                        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                            Ajouter une demande
                        </button>
                    </div>
                  
                    <DashboardCard07 />


                </div>
  
    
              </div>
  
            </div>
          </main>
        </div>
      </div>
    );
  } 

