import React from 'react'

const WelcomeCard = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome to Apigee Manager
          </h2>
          <p className="mt-2 text-gray-600">
            Manage your Apigee proxy deployments with our intuitive interface.
            Get started by creating a new deployment or viewing existing ones.
          </p>
        </div>

        <div className="space-y-4">
          <Feature 
            title="Easy Deployment" 
            description="Deploy proxies with just a few clicks"
          />
          <Feature 
            title="Multi-Environment" 
            description="Manage deployments across different environments"
          />
          <Feature 
            title="Real-time Status" 
            description="Monitor deployment progress in real-time"
          />
        </div>
      </div>
    </div>
  )
}

const Feature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
        <svg
          className="h-4 w-4 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  </div>
)

export default WelcomeCard