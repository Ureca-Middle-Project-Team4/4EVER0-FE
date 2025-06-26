const tailwindColors: { [key: string]: string } = {
  'bg-pink-500': '#ec4899',
  'bg-emerald-500': '#10b981',
  'bg-orange-500': '#f97316',
  'bg-brown-600': '#7e3b2a',
  'bg-red-500': '#ef4444',
  'bg-indigo-500': '#6366f1',
  'bg-green-600': '#16a34a',
  'bg-teal-500': '#14b8a6',
  'bg-gray-500': '#6b7280',
};

export const getBrandBackgroundColor = (brand: string): string => {
  const colorMap: { [key: string]: string } = {
    배스킨라빈스: 'bg-pink-500',
    CU: 'bg-emerald-500',
    파리바게뜨: 'bg-orange-500', // 추가 색상 예시
    메가MGC커피: 'bg-brown-600', // 추가 색상 예시
    파파존스: 'bg-red-500', // 추가 색상 예시
    올리브영: 'bg-green-600',
    스파오: 'bg-teal-500', // 추가 색상 예시
    다이소: 'bg-gray-500', // 추가 색상 예시
  };

  return colorMap[brand] || 'bg-gray-400';
};

export const getrawBackgroundColor = (brand: string): string => {
  const colorMap: { [key: string]: string } = {
    배스킨라빈스: 'bg-pink-500',
    CU: 'bg-emerald-500',
    파리바게뜨: 'bg-orange-500', // 추가 색상 예시
    메가MGC커피: 'bg-brown-600', // 추가 색상 예시
    파파존스: 'bg-red-500', // 추가 색상 예시
    올리브영: 'bg-green-600',
    스파오: 'bg-teal-500', // 추가 색상 예시
    다이소: 'bg-gray-500', // 추가 색상 예시
  };

  const tailwindClass = colorMap[brand] || 'bg-gray-400'; // 기본 색상
  return tailwindColors[tailwindClass] || '#000000'; // 색상 코드 반환
};

export const getBrandDotColor = (brand: string): string => {
  const dotColorMap: { [key: string]: string } = {
    배스킨라빈스: 'bg-pink-300',
    CU: 'bg-emerald-300',
    파리바게뜨: 'bg-orange-300', // 추가 색상 예시
    메가MGC커피: 'bg-brown-300', // 추가 색상 예시
    파파존스: 'bg-red-300', // 추가 색상 예시
    올리브영: 'bg-green-300',
    스파오: 'bg-teal-300', // 추가 색상 예시
    다이소: 'bg-gray-300', // 추가 색상 예시
  };

  return dotColorMap[brand] || 'bg-gray-300';
};
