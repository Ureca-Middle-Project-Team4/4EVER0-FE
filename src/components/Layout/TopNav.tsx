import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/Button';
import { IMAGES } from '@/constant/imagePath';
import { useAuthStore } from '@/stores/useAuthStore';
import { logout as apiLogout } from '@/utils/auth';
import { sonnerToast } from '@/components/Sooner';
import { useModalStore } from '@/stores/useModalStore';

const TopNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn, logout: stateLogout } = useAuthStore();
  const { openModal } = useModalStore();

  const excludedPaths = ['/', '/landing'];
  const showBack = !excludedPaths.includes(pathname);

  const handleLogout = () => {
    openModal({
      id: 'logout-confirm',
      title: '정말 무너즈를 떠나실 건가요...? 🐙',
      description: '로그아웃하시면 다시 로그인해야 해요 🥲',
      variant: 'alert',
      showCancel: true,
      showConfirm: true,
      cancelText: '아니요, 계속 있을래요!',
      confirmText: '네, 로그아웃할래요',
      confirmVariant: 'secondary',
      onConfirm: async () => {
        try {
          await apiLogout();
          stateLogout();
          sonnerToast('로그아웃되었습니다. 다음에 또 만나요 👋');
          navigate('/');
        } catch {
          sonnerToast.error('로그아웃에 실패했어요 🥲');
        }
      },
    });
  };

  const handleClick = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 mx-auto max-w-[600px] w-full bg-[var(--color-background)] z-20 px-6 py-3 h-[56px]"
      style={{ boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)}>
              <ChevronLeftIcon className="w-4 h-4 text-gray-600 cursor-pointer" />
            </button>
          )}
          <Link to="/">
            <img
              src={IMAGES.MOONER['moonoz-logo']}
              alt="MoonoZ 로고"
              className="w-30 cursor-pointer"
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLoggedIn ? 'outline' : 'login'}
            size="sm"
            onClick={handleClick}
            className="cursor-pointer"
          >
            {isLoggedIn ? '로그아웃' : '로그인'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
