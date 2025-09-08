import Link from 'next/link';
import TodoListSSR from '../components/features/TodoListSSR';

export default function SSRPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-light text-black mb-4">
            Todo (SSR)
          </h1>
          <p className="text-gray-600 text-sm">
            Server-side rendered version
          </p>
          <div className="mt-8">
            <Link 
              href="/" 
              className="text-black hover:text-gray-600 text-sm underline underline-offset-4 transition-colors"
            >
              View Client Version
            </Link>
          </div>
        </header>
        <TodoListSSR />
      </div>
    </div>
  );
}
