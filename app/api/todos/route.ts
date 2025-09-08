import { NextRequest, NextResponse } from 'next/server';
import { TodoService, createDefaultTodoService } from '@/lib/todoService';
import { CreateTodoRequest } from '@/lib/types';

// GET /api/todos - Get all TODOs
export async function GET() {
  try {
    const todoService = createDefaultTodoService();
    const todos = await todoService.getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create new TODO
export async function POST(request: NextRequest) {
  try {
    const body: CreateTodoRequest = await request.json();
    const todoService = createDefaultTodoService();
    
    // Validation
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const newTodo = await todoService.createTodo(body);
    
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}