import React from 'react'

const Navbar: React.FC = () => {
  return (
    <nav className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-900">
            Apigee Manager
          </span>
          
          <div className="ml-10 flex space-x-4">
            <NavLink active>Dashboard</NavLink>
            <NavLink>Deployments</NavLink>
            <NavLink>Settings</NavLink>
          </div>
        </div>
        
        <button className="btn btn-primary">
          + New Deployment
        </button>
      </div>
    </nav>
  )
}

const NavLink: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ 
  children,
  active 
}) => (
  <a
    href="#"
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      active 
        ? 'text-gray-900 bg-gray-100'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {children}
  </a>
)

export default Navbar