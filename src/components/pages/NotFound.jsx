import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertTriangle" size={48} className="text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold text-secondary mb-4">404</h1>
        <h2 className="text-xl font-semibold text-secondary mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <ApperIcon name="Home" size={16} className="mr-2" />
              Go Back Home
            </Button>
          </Link>
          
          <Link to="/events">
            <Button variant="secondary" className="w-full">
              <ApperIcon name="Calendar" size={16} className="mr-2" />
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;