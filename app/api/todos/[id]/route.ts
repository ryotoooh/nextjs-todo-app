import { NextRequest, NextResponse } from 'next/server';
import { TodoService, createDefaultTodoService } from '@/lib/todoService';
import { UpdateTodoRequest } from '@/lib/types';

// GET /api/todos/[id] - Get single TODO by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const todoService = createDefaultTodoService();
    
    const todo = await todoService.getTodoById(id);
    
    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Todo not found') {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - Update TODO by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTodoRequest = await request.json();
    const todoService = createDefaultTodoService();
    
    // Validation
    if (body.title !== undefined && body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }
    
    const updatedTodo = await todoService.updateTodo(id, body);
    
    return NextResponse.json(updatedTodo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Todo not found') {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete TODO by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const todoService = createDefaultTodoService();
    
    await todoService.deleteTodo(id);
    
    return NextResponse.json(
      { message: 'Todo deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Todo not found') {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}