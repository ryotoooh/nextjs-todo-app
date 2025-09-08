'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { openApiSpec } from '@/lib/openapi';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">API Documentation</h1>
                <SwaggerUI spec={openApiSpec} />
            </div>
        </div>
    );
}
