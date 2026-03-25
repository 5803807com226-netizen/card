'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Archive,
  Settings,
  LogIn,
  Layers,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/portfolio', label: 'ประวัติการซื้อขาย', icon: TrendingUp },
  { href: '/analytics', label: 'วิเคราะห์', icon: BarChart3 },
  { href: '/backup', label: 'สำรอง', icon: Archive },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center h-14 px-4 max-w-[1600px] mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-8 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs text-primary font-bold tracking-widest uppercase">CQ</span>
            <span className="text-sm font-bold text-text leading-tight">CardQuant TH</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-text-muted hover:text-text hover:bg-surface2'
                )}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface2 transition-colors">
            <LogIn size={14} />
            <span>เข้าสู่ระบบ</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
