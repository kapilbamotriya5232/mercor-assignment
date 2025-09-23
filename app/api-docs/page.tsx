'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null);

  useEffect(() => {
    // Prefer static file generated at build time for production reliability
    fetch('/swagger.json')
      .then(response => response.json())
      .then(data => setSwaggerSpec(data))
      .catch(error => console.error('Error fetching swagger spec:', error));
  }, []);

  if (!swaggerSpec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-container">
      <SwaggerUI 
        spec={swaggerSpec}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration={true}
        filter={true}
        showExtensions={true}
        showCommonExtensions={true}
      />
    </div>
  );
}
