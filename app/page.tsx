import Link from 'next/link';
import TodoList from './components/features/TodoList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Todo App (Client Version)
        </h1>
        <div className="text-center mb-6">
          <Link 
            href="/ssr" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View SSR Version
          </Link>
        </div>
        <TodoList />
      </div>
    </div>
  );
}
