import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiFolder, 
  FiFolderPlus, 
  FiSend, 
  FiCheckCircle,
  FiFileText,
  FiSearch,
  FiSettings
} from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/dashboard', label: 'Início', icon: FiHome },
    { href: '/processos', label: 'Listar Processos', icon: FiFolder },
    { href: '/processos/novo', label: 'Novo Processo', icon: FiFolderPlus },
    { href: '/meus-processos', label: 'Meus Processos', icon: FiFileText },
    { href: '/processos-setor', label: 'Processos do Setor', icon: FiSend },
    { href: '/processos/buscar', label: 'Pesquisar', icon: FiSearch },
  ];
  
  return (
    <aside className="sidebar w-64">
      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-600 mb-4">MENU PRINCIPAL</h2>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="mr-3" size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-sei-border p-4 mt-4">
        <h2 className="text-sm font-bold text-gray-600 mb-4">OUTRAS OPÇÕES</h2>
        
        <nav className="space-y-1">
          <Link href="/configuracoes" className="menu-item">
            <FiSettings className="mr-3" size={18} />
            <span>Configurações</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
