import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2 mb-8">
                    Sorry, we couldn't find the page you're looking for.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

