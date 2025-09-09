import Link from 'next/link';
import TodoList from './components/client/features/TodoList';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-light text-black mb-4">
            Todo
          </h1>
          <p className="text-gray-600 text-sm">
            Simple task management
          </p>
          <div className="mt-8">
            <Link 
              href="/ssr" 
              className="text-black hover:text-gray-600 text-sm underline underline-offset-4 transition-colors"
            >
              View SSR Version
            </Link>
          </div>
        </header>
        <TodoList />
      </div>
    </div>
  );
}
