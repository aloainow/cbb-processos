import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { FiLogOut, FiUser, FiHome, FiFolder, FiFolderPlus } from 'react-icons/fi';

export default function Header() {
  const { usuario, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
      <div className="h-20 flex items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-4 group">
            <div className="relative w-14 h-14 bg-white rounded-lg p-1.5 shadow-md group-hover:shadow-xl transition-shadow">
              <Image
                src="/images/logo-cbb.png"
                alt="CBB Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CBB</h1>
              <p className="text-sm text-blue-200">Sistema de Processos Eletrônicos</p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-2 ml-8">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all"
            >
              <FiHome size={18} />
              <span>Início</span>
            </Link>
            <Link 
              href="/processos" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all"
            >
              <FiFolder size={18} />
              <span>Processos</span>
            </Link>
            <Link 
              href="/processos/novo" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all"
            >
              <FiFolderPlus size={18} />
              <span>Novo Processo</span>
            </Link>
          </nav>
        </div>
        
        {usuario && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white" size={20} />
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white">{usuario.nome}</p>
                <p className="text-xs text-blue-200">{usuario.cargo || 'Usuário'}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Sair"
            >
              <FiLogOut />
              <span className="hidden md:inline font-medium">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
