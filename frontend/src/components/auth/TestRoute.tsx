import React from 'react';

export const TestRoute: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Test Route Working!
        </h1>
        <p className="text-gray-600">
          If you can see this, the routing is working correctly.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current URL: {window.location.href}
        </p>
      </div>
    </div>
  );
}; 