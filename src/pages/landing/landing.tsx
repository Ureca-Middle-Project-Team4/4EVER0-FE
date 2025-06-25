import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { IMAGES } from '@/constant/imagePath';

// 브랜드 컬러 정의
const brandColors = {
  yellow: '#FFE066',
  darkblue: '#1E3A8A',
  red: '#DC2626',
};

// 애니메이션 variants - 타입 오류 수정
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
      duration: 0.8,
    },
  },
};

const slideUpVariants = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 120,
      duration: 1,
    },
  },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.3,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

const scaleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      damping: 15,
      stiffness: 200,
      delay: 0.2,
    },
  },
};

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const lastRef = useRef(null);

  const lastInView = useInView(lastRef, { once: true });

  // 실제 휴대폰 이미지가 포함된 컨텐츠 데이터
  const CONTENTS = [
    {
      id: 1,
      titleHeader: '무너톡한테 물어보기',
      title: '간단하게 무너톡에게\n물어보세요',
      imagePath: IMAGES.PHONE.PHONE_MOONOTALK,
    },
    {
      id: 2,
      titleHeader: '내 근처에 있는 정보 탐색하기',
      title: '내 근처의 팝업스토어/쿠폰 등의 \n다양한 혜택을 즐겨보세요',
      imagePath: IMAGES.PHONE.PHONE_HOTPLACE,
    },
    {
      id: 3,
      titleHeader: '매일매일 다양한 혜택이 우수수!',
      title: '나만의 캘린더와 함께\nU+의 혜택을 확인하고, 보상 포인트까지!',
      imagePath: IMAGES.PHONE.PHONE_MISSON,
    },
    {
      id: 4,
      titleHeader: '모든 걸 한번에 모아두다!',
      title: '내가 저장해둔 혜택들과 요금제를\n한눈에 확인해볼까요?',
      imagePath: IMAGES.PHONE.PHONE_MYPAGE,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartClick = () => {
    alert('시작하기 버튼이 클릭되었습니다!');
  };

  return (
    <div
      className="flex flex-col w-full max-w-[600px] min-h-screen mx-auto overflow-x-hidden relative"
      style={{
        background: '#FFF',
      }}
    >
      {/* Start Section */}
      <motion.div
        className="flex flex-col items-center w-full pt-6 min-h-screen relative"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? 'visible' : 'hidden'}
      >
        {/* Main Logo */}
        <motion.div
          className="w-[calc(100%-152px)] h-10 mb-4 rounded-lg flex items-center justify-center font-bold text-lg"
          style={{ backgroundColor: `${brandColors.darkblue}`, color: `${brandColors.yellow}` }}
          variants={itemVariants}
        >
          MoonoZ
        </motion.div>
        {/* Illustration */}
        <motion.div
          className="w-64 h-48 rounded-2xl flex items-center justify-center mb-8 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${brandColors.yellow} 0%, ${brandColors.red}40 100%)`,
          }}
          variants={scaleVariants}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div className="text-6xl" variants={floatingVariants} animate="animate">
            <img
              src={IMAGES.MOONER['moonoz-hello']}
              alt="MoonoZ Logo"
              className="h-50 w-50 mx-auto"
            />
          </motion.div>
        </motion.div>
        {/* 노란 박스 */}
        <motion.div className="px-4">
          <img src={IMAGES.BANNER.GUIDE} className="w-full h-auto"></img>
        </motion.div>
        {/* <motion.div className="w-[calc(100%-42px)] mb-8" variants={slideUpVariants}>
          <motion.div
            className="w-full h-64 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(90deg, ${brandColors.yellow}60 0%, ${brandColors.red}40 100%)`,
            }}
            whileHover={{ scale: 1.02, rotateY: 5 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="text-4xl">💬</div>
          </motion.div>
        </motion.div> */}

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-row items-center gap-2 font-semibold mb-12"
          style={{ color: `${brandColors.darkblue}` }}
          variants={itemVariants}
          animate={{
            y: [0, 8, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-4 h-5 flex items-center justify-center">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
              <path d="M8 0L16 8H12V20H4V8H0L8 0Z" transform="rotate(180 8 10)" />
            </svg>
          </div>
          스크롤해보세요
        </motion.div>
        {/* MoonoZ 로고와 텍스트 */}
        <motion.div
          className="flex flex-col items-center gap-2"
          variants={staggerContainerVariants}
        >
          <motion.div
            className="w-48 mx-2 rounded-lg h-8 flex items-center justify-center font-bold"
            style={{ backgroundColor: `${brandColors.darkblue}`, color: `${brandColors.yellow}` }}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            MoonoZ
          </motion.div>
          <motion.div
            className="text-lg font-medium"
            style={{ color: `${brandColors.darkblue}` }}
            variants={itemVariants}
          >
            무너즈가 도와드릴게요!
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Contents Section */}
      <div className="flex flex-col gap-24 pt-32 whitespace-pre-line">
        {CONTENTS.map((item, index) => {
          const ref = useRef(null);
          const inView = useInView(ref, { once: true });

          return (
            <motion.div
              key={item.id}
              ref={ref}
              className="flex flex-col items-center w-full text-xl"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              {/* Title Section */}
              <motion.div
                className="flex flex-col justify-center items-center gap-2 text-center whitespace-pre-line pb-8"
                variants={slideUpVariants}
              >
                <motion.div
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: `${brandColors.red}` }}
                  variants={itemVariants}
                >
                  {item.titleHeader}
                </motion.div>
                <motion.div
                  className="text-2xl font-semibold leading-tight"
                  style={{ color: `${brandColors.darkblue}` }}
                  variants={itemVariants}
                >
                  {item.title}
                </motion.div>
              </motion.div>

              {/* Phone Image */}
              <motion.div className="flex justify-center" variants={containerVariants}>
                <motion.img
                  src={item.imagePath}
                  alt={`${item.titleHeader} 화면`}
                  className="w-[280px] h-auto max-w-[calc(100%-40px)] rounded-xl shadow-lg"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.03,
                    y: -5,
                    boxShadow:
                      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', damping: 20 }}
                  onError={(e) => {
                    console.error('이미지 로드 실패:', item.imagePath);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('이미지 로드 성공:', item.imagePath);
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Last Section */}
      <motion.div
        ref={lastRef}
        className="mt-44 whitespace-pre-line text-center"
        variants={slideUpVariants}
        initial="hidden"
        animate={lastInView ? 'visible' : 'hidden'}
      >
        <div className="text-lg font-medium px-4" style={{ color: `${brandColors.darkblue}` }}>
          {`간편하고 빠르게 요금제를 정하고 싶다면
무너즈와 함께 해보세요!`}
        </div>
        <img
          src={IMAGES.MOONER['moonoz-logo']}
          alt="MoonoZ 로고"
          className="w-20 h-auto mt-4 cursor-pointer mx-auto block"
        />
      </motion.div>

      {/* Bottom Button */}
      <motion.div
        className="mt-16 mb-8 px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', damping: 20 }}
      >
        <motion.button
          onClick={handleStartClick}
          className="w-full font-semibold py-4 px-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: `${brandColors.red}`,
            color: 'white',
          }}
          whileHover={{
            scale: 1.02,
            backgroundColor: `${brandColors.darkblue}`,
            boxShadow: '0 10px 25px -3px rgba(220, 38, 38, 0.3)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
        >
          시작하기
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Landing;
