import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react'; // Assuming you use lucide-react, or use any icon library you have

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};