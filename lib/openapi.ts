import { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'TODO API',
        version: '1.0.0',
        description: 'A simple TODO API built with Next.js',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
    paths: {
        '/api/todos': {
            get: {
                summary: 'Get all TODOs',
                description: 'Retrieve all TODO items',
                responses: {
                    '200': {
                        description: 'List of TODOs',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Todo',
                                    },
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new TODO',
                description: 'Create a new TODO item',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateTodoRequest',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'TODO created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Todo',
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/todos/{id}': {
            get: {
                summary: 'Get TODO by ID',
                description: 'Retrieve a specific TODO item by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'TODO ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'TODO found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Todo',
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'TODO not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update TODO by ID',
                description: 'Update a specific TODO item by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'TODO ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateTodoRequest',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'TODO updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Todo',
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'TODO not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Delete TODO by ID',
                description: 'Delete a specific TODO item by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'TODO ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'TODO deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Todo deleted successfully',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'TODO not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Todo: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Unique identifier for the TODO',
                    },
                    title: {
                        type: 'string',
                        description: 'Title of the TODO',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the TODO',
                    },
                    is_done: {
                        type: 'boolean',
                        description: 'Whether the TODO is completed',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                    },
                },
                required: ['id', 'title', 'is_done', 'createdAt', 'updatedAt'],
            },
            CreateTodoRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Title of the TODO',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the TODO',
                    },
                    is_done: {
                        type: 'boolean',
                        description: 'Whether the TODO is completed',
                        default: false,
                    },
                },
                required: ['title'],
            },
            UpdateTodoRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Title of the TODO',
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the TODO',
                    },
                    is_done: {
                        type: 'boolean',
                        description: 'Whether the TODO is completed',
                    },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Error message',
                    },
                },
                required: ['error'],
            },
        },
    },
};
