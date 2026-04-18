import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PatientData, RiskResult } from './RiskEngine';

export async function generateAndSharePDF(data: PatientData, result: RiskResult, explanation: string) {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 30px; }
          .header h1 { color: #1d4ed8; margin: 0 0 8px 0; font-size: 28px; letter-spacing: -0.5px; }
          .subtitle { color: #64748b; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          
          .risk-banner { text-align: center; padding: 24px; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .high { background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; }
          .medium { background: #fffbeb; color: #d97706; border: 2px solid #fde68a; }
          .low { background: #f0fdf4; color: #16a34a; border: 2px solid #bbf7d0; }
          .risk-text { font-size: 32px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
          .risk-score { font-size: 18px; font-weight: 600; opacity: 0.9; }

          h2 { color: #0f172a; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 40px; margin-bottom: 16px; }
          
          .explanation { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 12px 12px 0; font-size: 16px; color: #334155; }
          
          .factors-grid { display: flex; flex-direction: column; gap: 10px; }
          .factor-row { display: flex; justify-content: space-between; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .factor-name { font-weight: 600; color: #334155; }
          .factor-weight { color: #dc2626; font-weight: 800; background: #fee2e2; padding: 2px 8px; border-radius: 12px; font-size: 14px; }

          table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: #f8fafc; color: #475569; font-weight: 800; width: 45%; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
          td { font-weight: 600; color: #1e293b; }
          tr:last-child th, tr:last-child td { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Maternal Health Clinical Report</h1>
          <p class="subtitle">Official Decision Support Assessment</p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="risk-banner ${result.riskLevel.toLowerCase()}">
          <div class="risk-text">${result.riskLevel} RISK</div>
          <div class="risk-score">Evaluated Score: ${(result.riskScore * 100).toFixed(0)}%</div>
        </div>

        <h2>Clinical Rationale & Guidance</h2>
        <div class="explanation">
          ${explanation.replace(/\n/g, '<br/>')}
        </div>

        <h2>Primary Vitals Recorded</h2>
        <table>
          <tr><th>Blood Pressure</th><td>${data.bpSystolic || '--'} / ${data.bpDiastolic || '--'} mmHg</td></tr>
          <tr><th>Hemoglobin (Hb)</th><td>${data.hb || '--'} g/dL</td></tr>
          <tr><th>SpO2</th><td>${data.spo2 || '--'}%</td></tr>
          <tr><th>Temperature</th><td>${data.temperature || '--'} °C</td></tr>
          <tr><th>Weight</th><td>${data.weight || '--'} kg</td></tr>
          <tr><th>Trimester</th><td>${data.trimester || '--'}</td></tr>
        </table>

        <h2>Triggered Risk Factors</h2>
        <div class="factors-grid">
          ${result.triggeredFactors.length > 0 
            ? result.triggeredFactors.map(f => `
                <div class="factor-row">
                  <span class="factor-name">${f.name}</span>
                  <span class="factor-weight">+${f.weight.toFixed(1)}</span>
                </div>
              `).join('')
            : '<div class="factor-row"><span class="factor-name">No critical triggers detected. Patient healthy.</span></div>'
          }
        </div>
        
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Share Clinical Assessment' });
    }
  } catch (error) {
    console.warn("PDF Generation or Sharing failed:", error);
  }
}
