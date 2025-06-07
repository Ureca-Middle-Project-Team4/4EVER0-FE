const DesignSystemTest = () => {
  return (
    <div className="min-h-screen font-pretendard p-6 space-y-8">
      <h1 className="text-3xl font-bold">디자인 시스템 테스트</h1>
      <section>
        <h2 className="text-xl font-bold mb-2">메인 색상 테스트</h2>
        <div className="flex gap-4">
          <div className="bg-brand-red text-white px-4 py-2 rounded">Red</div>
          <div className="bg-brand-yellow text-black px-4 py-2 rounded">Yellow</div>
          <div className="bg-brand-darkblue text-white px-4 py-2 rounded">Dark Blue</div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-2">타이포그래피 시스템 테스트</h2>
        <div className="space-y-4">
          <p className="title-1">.title-1 (20px / 28px / Bold)</p>
          <p className="title-2">.title-2 (20px / 28px / SemiBold)</p>
          <p className="title-3">.title-3 (18px / 26px / SemiBold)</p>
          <p className="subtitle-1">.subtitle-1 (16px / 24px / Bold)</p>
          <p className="subtitle-2">.subtitle-2 (16px / 24px / SemiBold)</p>
          <p className="body-1">.body-1 (17px / 25.5px / Medium)</p>
          <p className="body-2">.body-2 (15px / 22px / Normal)</p>
          <p className="caption-1">.caption-1 (14px / 20px / Normal)</p>
          <p className="caption-2">.caption-2 (12px / 16px / Bold)</p>
          <p className="label">.label (12px / 16px / Medium)</p>
          <p className="button-text">.button-text (14px / 20px / Medium)</p>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemTest;
