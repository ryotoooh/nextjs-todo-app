import { NextRequest, NextResponse } from 'next/server';
import { getTodoById, updateTodo, deleteTodo } from '@/lib/storage';
import { UpdateTodoRequest } from '@/lib/types';

// GET /api/todos/[id] - Get single TODO by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const todo = getTodoById(id);
    
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(todo);
  } catch (error) {
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
    
    // Check if todo exists
    const existingTodo = getTodoById(id);
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    // Validation
    if (body.title !== undefined && body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }
    
    const updatedTodo = updateTodo(id, body);
    
    if (!updatedTodo) {
      return NextResponse.json(
        { error: 'Failed to update todo' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedTodo);
  } catch (error) {
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
    
    // Check if todo exists
    const existingTodo = getTodoById(id);
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const deleted = deleteTodo(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete todo' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Todo deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}