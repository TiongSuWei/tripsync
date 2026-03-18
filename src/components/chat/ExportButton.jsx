import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportButton({ messages, title }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      const maxW = pageW - margin * 2;
      let y = margin;

      const addPage = () => {
        doc.addPage();
        y = margin;
      };

      const checkY = (needed = 10) => {
        if (y + needed > 280) addPage();
      };

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('✈  TripSync', margin, 17);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageW - margin, 17, { align: 'right' });

      y = 38;

      // Trip title
      if (title) {
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text(title, margin, y);
        y += 10;
      }

      // Filter only assistant messages
      const planMessages = messages.filter(m => m.role === 'assistant');

      planMessages.forEach((msg, idx) => {
        checkY(15);

        if (idx > 0) {
          doc.setDrawColor(220, 220, 230);
          doc.line(margin, y, pageW - margin, y);
          y += 5;
        }

        const lines = doc.splitTextToSize(msg.content || '', maxW);
        const lineHeight = 5.5;

        lines.forEach((line) => {
          checkY(lineHeight);
          // Style headers
          if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
            const cleanLine = line.replace(/^#+\s/, '');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(line.startsWith('# ') ? 13 : line.startsWith('## ') ? 11 : 10);
            doc.setTextColor(37, 99, 235);
            doc.text(cleanLine, margin, y);
            y += lineHeight + 2;
          } else if (line.startsWith('**') || line.startsWith('__')) {
            const cleanLine = line.replace(/\*\*|__/g, '');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 41, 59);
            doc.text(cleanLine, margin, y);
            y += lineHeight;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            doc.text('•  ' + line.slice(2), margin + 3, y);
            y += lineHeight;
          } else if (line.trim() === '' || line.trim() === '---') {
            y += 2;
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            doc.text(line, margin, y);
            y += lineHeight;
          }
        });

        y += 4;
      });

      // Footer on each page
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 190);
        doc.text(`TripSync — Page ${i} of ${totalPages}`, pageW / 2, 292, { align: 'center' });
      }

      const safeName = (title || 'trip-plan').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeName}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  if (!messages || messages.filter(m => m.role === 'assistant').length === 0) return null;

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={loading}
      className="gap-2 rounded-xl text-xs font-medium border-border hover:bg-secondary hover:border-primary/30 transition-all"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      Export PDF
    </Button>
  );
}