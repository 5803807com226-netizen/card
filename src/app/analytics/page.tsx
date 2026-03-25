import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'วิเคราะห์ | CardQuant TH',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-2">วิเคราะห์</h1>
          <p className="text-text-muted">กำลังพัฒนา...</p>
        </div>
      </div>
    </div>
  );
}
