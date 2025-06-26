export const getCategoryEmoji = (category: string): string => {
  const emojiMap: { [key: string]: string } = {
    '도서/콘텐츠': '📖',
    식음료: '🍽️',
    편의점: '🏪',
    '뷰티/생활': '💄',
    패션: '👕',
    카페: '☕',
    치킨: '🍗',
    베이커리: '🥐',
  };

  return emojiMap[category] || '🎁';
};
