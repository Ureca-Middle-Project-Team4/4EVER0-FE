import { NavLink } from 'react-router-dom';
import {
  CalendarIcon,
  ChatBubbleIcon,
  HomeIcon,
  LightningBoltIcon,
  PersonIcon,
} from '@radix-ui/react-icons';

const navItems = [
  { label: '미션', icon: CalendarIcon, path: '/mission' },
  { label: '무너톡', icon: ChatBubbleIcon, path: '/chatbot' },
  { label: '홈', icon: HomeIcon, path: '/' },
  { label: '핫플', icon: LightningBoltIcon, path: '/hotplace' },
  { label: 'MY', icon: PersonIcon, path: '/me' },
];

const BottomNav = () => {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 mx-auto max-w-[420px] w-full bg-[var(--color-background)] z-20 px-6 py-3 h-[56px]"
      style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    >
      <nav className="flex justify-around h-full items-center">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center text-xs transition-colors px-2 py-1 rounded-lg',
                path === '/'
                  ? 'text-[var(--color-brand-red)] hover:bg-gray-50'
                  : isActive
                    ? 'text-[var(--color-brand-red)] bg-red-50'
                    : 'text-[var(--color-gray-600)] hover:text-[var(--color-brand-red-hover)] hover:bg-gray-50',
              ].join(' ')
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
};

export default BottomNav;
