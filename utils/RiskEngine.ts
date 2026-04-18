export interface RiskFactor {
  name: string;
  weight: number;
  implication: string;
}

export interface PatientData {
  bpSystolic?: number;
  bpDiastolic?: number;
  hb?: number;
  spo2?: number;
  temperature?: number;
  weight?: number;
  trimester?: string;
  symptoms?: string[];
  previousData?: {
    bpSystolic?: number;
    bpDiastolic?: number;
  };
}

export interface RiskResult {
  isValid: boolean;
  errorMessage?: string;
  
  riskScore: number;
  riskLevel: 'STABLE' | 'NEEDS ATTENTION' | 'HIGH';
  triggeredFactors: RiskFactor[];
  
  rationale: string;
  referralUrgency: string;
  reassuringLine: string;
  multipleInsightFlag: boolean;
  trendWarningFlag?: string;
}

export function calculateDeterministicRisk(data: PatientData): RiskResult {
  // 1. Data Validation
  if (!data.bpSystolic || !data.bpDiastolic || !data.hb || !data.spo2) {
    return {
      isValid: false,
      errorMessage: "Insufficient data for accurate assessment. Please ensure BP, Hb, and SpO2 are provided.",
      riskScore: 0, riskLevel: 'STABLE', triggeredFactors: [], rationale: '', referralUrgency: '', reassuringLine: '', multipleInsightFlag: false
    };
  }

  // 2. Emergency Danger Signs (WHO Short Circuit)
  const dangerSigns = [
    'vaginal bleeding', 'convulsions/seizures', 'loss of consciousness', 
    'severe abdominal pain', 'no fetal movement', 'severe breathlessness'
  ];

  let hasEmergency = false;
  let emergencyFactor = '';

  if (data.symptoms) {
    for (const sym of dangerSigns) {
      if (data.symptoms.includes(sym)) {
        hasEmergency = true;
        emergencyFactor = sym;
        break;
      }
    }
  }

  let score = 0;
  const factors: RiskFactor[] = [];
  let majorConditionsCount = 0;

  if (hasEmergency) {
    score = 1.0;
    factors.push({ name: `Danger Sign: ${emergencyFactor}`, weight: 1.0, implication: 'Immediate life-threatening urgency' });
    majorConditionsCount += 1;
  } else {
    // 3. Weighted Scoring Criteria
    
    // Hypertension / Pre-eclampsia
    if (data.bpSystolic >= 160 || data.bpDiastolic >= 110) {
      score += 0.5;
      factors.push({ name: `High BP (${data.bpSystolic}/${data.bpDiastolic})`, weight: 0.5, implication: 'High risk of severe pre-eclampsia' });
      majorConditionsCount += 1;
    } else if (data.bpSystolic >= 140 || data.bpDiastolic >= 90) {
      score += 0.4;
      factors.push({ name: `Elevated BP (${data.bpSystolic}/${data.bpDiastolic})`, weight: 0.4, implication: 'Risk of mild pre-eclampsia' });
      majorConditionsCount += 1;
    }

    if (data.symptoms) {
      if (data.symptoms.includes('severe headache')) factors.push({ name: 'Severe Headache', weight: 0.1, implication: 'Possible pre-eclampsia symptom' }), score += 0.1;
      if (data.symptoms.includes('blurred vision')) factors.push({ name: 'Blurred Vision', weight: 0.2, implication: 'Pre-eclampsia symptom affecting nervous system' }), score += 0.2;
      if (data.symptoms.includes('swelling of face/hands')) factors.push({ name: 'Swelling of Face/Hands', weight: 0.2, implication: 'Warning sign of systemic pre-eclampsia' }), score += 0.2;
    }

    // Anemia
    if (data.hb < 7) {
      score += 0.5;
      factors.push({ name: `Severe Anemia (Hb: ${data.hb} g/dL)`, weight: 0.5, implication: 'High risk of hemorrhage and maternal exhaustion' });
      majorConditionsCount += 1;
    } else if (data.hb >= 7 && data.hb < 9) {
      score += 0.3;
      factors.push({ name: `Moderate Anemia (Hb: ${data.hb} g/dL)`, weight: 0.3, implication: 'Anemia risk restricting fetal growth' });
    }

    if (data.symptoms) {
      if (data.symptoms.includes('dizziness')) factors.push({ name: 'Dizziness', weight: 0.1, implication: 'May indicate low oxygen/anemia' }), score += 0.1;
      if (data.symptoms.includes('weakness')) factors.push({ name: 'Weakness', weight: 0.1, implication: 'May relate to anemia/malnutrition' }), score += 0.1;
    }

    // Infection
    if ((data.temperature && data.temperature >= 38) || (data.symptoms && data.symptoms.includes('fever'))) {
      score += 0.2;
      factors.push({ name: `Fever`, weight: 0.2, implication: 'Infection risk potentially affecting amniotic fluid' });
      majorConditionsCount += 1;
    }
    
    if (data.symptoms) {
      if (data.symptoms.includes('chills')) factors.push({ name: 'Chills', weight: 0.1, implication: 'Possible systemic infection' }), score += 0.1;
      if (data.symptoms.includes('burning urination')) factors.push({ name: 'Burning Urination', weight: 0.2, implication: 'Urinary Tract Infection risk' }), score += 0.2;
    }

    // Oxygen / Respiratory
    if (data.spo2 < 92) {
      score += 0.5;
      factors.push({ name: `Critical SpO2 (${data.spo2}%)`, weight: 0.5, implication: 'Severe hypoxemia restricting oxygen to fetus' });
      majorConditionsCount += 1;
    } else if (data.spo2 < 95) {
      score += 0.3;
      factors.push({ name: `Low SpO2 (${data.spo2}%)`, weight: 0.3, implication: 'Marginal oxygenation risk' });
    }

    // Nutrition
    if (data.weight && data.weight < 45) {
      score += 0.2;
      factors.push({ name: `Low Weight (${data.weight}kg)`, weight: 0.2, implication: 'Malnutrition affecting fetal development' });
    }
    if (data.symptoms && data.symptoms.includes('poor appetite')) {
      factors.push({ name: 'Poor Appetite', weight: 0.1, implication: 'Nutritional deficit risk' }), score += 0.1;
    }

    // Additional requested symptoms
    if (data.symptoms) {
      if (data.symptoms.includes('persistent vomiting')) factors.push({ name: 'Persistent Vomiting', weight: 0.2, implication: 'Risk of severe dehydration (Hyperemesis gravidarum)' }), score += 0.2;
      if (data.symptoms.includes('chest pain')) factors.push({ name: 'Chest Pain', weight: 0.3, implication: 'Potential cardiac or severe pulmonary event' }), score += 0.3, majorConditionsCount += 1;
      if (data.symptoms.includes('reduced urine output')) factors.push({ name: 'Reduced Urine Output', weight: 0.3, implication: 'Sign of kidney distress or severe pre-eclampsia' }), score += 0.3, majorConditionsCount += 1;
    }
  }

  score = Math.min(1.0, score);

  let riskLevel: 'STABLE' | 'NEEDS ATTENTION' | 'HIGH' = 'STABLE';
  if (score >= 0.7 || hasEmergency) {
    riskLevel = 'HIGH';
  } else if (score >= 0.4) {
    riskLevel = 'NEEDS ATTENTION';
  }

  // Generate Referral Urgency & Reassuring Lines
  let referralUrgency = '';
  let reassuringLine = '';
  if (riskLevel === 'HIGH') {
    referralUrgency = "Immediate referral to hospital required";
    reassuringLine = "This condition requires immediate medical attention. Early care can prevent complications.";
  } else if (riskLevel === 'NEEDS ATTENTION') {
    referralUrgency = "Visit nearest health center within 24–48 hours";
    reassuringLine = "This condition needs attention. Visiting a doctor soon is recommended for safety.";
  } else {
    referralUrgency = "Continue routine antenatal care";
    reassuringLine = "You are currently stable. Continue regular checkups and maintain a healthy routine.";
  }

  // Trend Flags
  let trendWarningFlag = '';
  if (data.previousData && data.previousData.bpSystolic && data.bpSystolic) {
    if (data.bpSystolic - data.previousData.bpSystolic >= 15) {
      trendWarningFlag = "Condition worsening compared to previous reading (Rising BP)";
    }
  }

  // Paragraph-style Clinical Rationale (Offline Fallback)
  let rationale = '';
  if (factors.length === 0) {
    rationale = `Patient vitals are currently within normal functional ranges for maternity, indicating stable progression. There are no immediate physiological concerns detected across cardiovascular or respiratory parameters impacting the mother or baby at this time. It is recommended to proceed with routine antenatal care and maintain standard clinical checkups.`;
    rationale += `\n\n(Hindi: मरीज़ के वाइटल्स गर्भावस्था के लिए सामान्य सीमा के भीतर हैं, जो स्थिर प्रगति का संकेत देते हैं। अभी माँ या बच्चे को प्रभावित करने वाली कोई तत्काल शारीरिक चिंता नहीं है। नियमित प्रसवपूर्व देखभाल और चेकअप जारी रखने की सलाह दी जाती है।)`;
  } else {
    // Dynamically build offline paragraph explaining risks
    let opening = '';
    let complication = '';
    
    // Attempt rudimentary condition matching for paragraph
    const bpIssues = factors.some(f => f.name.includes('BP'));
    const anemiaIssues = factors.some(f => f.name.includes('Anemia'));
    
    if (bpIssues && anemiaIssues) {
      opening = `Blood pressure of ${data.bpSystolic}/${data.bpDiastolic} mmHg alongside a sharply low Hemoglobin of ${data.hb} g/dL are highly alarming structural markers.`;
      complication = `This indicates simultaneous compound issues including dangerous hypertensive disorders and severe clinical anemia, directly limiting fetal growth and risking life-threatening hemorrhaging.`;
    } else if (bpIssues) {
      opening = `Blood pressure of ${data.bpSystolic}/${data.bpDiastolic} mmHg is above the optimal range during pregnancy.`;
      complication = `This indicates highly probable hypertensive disorder such as pre-eclampsia, leading to restricted blood flow to the baby and risking severe systemic maternal complications.`;
    } else if (anemiaIssues) {
      opening = `A recorded Hemoglobin value of ${data.hb} g/dL marks severe clinical anemia.`;
      complication = `This condition critically deprives the progressing fetus of oxygenated resources and places the mother at severe vulnerability to exhaustion and postpartum hemorrhage.`;
    } else {
      opening = `The reported symptoms including ${factors.map(f => f.name.replace('Danger Sign: ', '')).join(' and ')} lie outside standard, healthy parameters.`;
      complication = `These physiological markers raise immediate concern for overlapping structural complications risking fetal oxygenation and maternal systemic stability.`;
    }

    if (hasEmergency) {
      opening = `The explicit presence of ${emergencyFactor} constitutes an absolute and immediate danger sign.`;
      complication = `This is a life-threatening indicator risking catastrophic maternal trauma or total fetal loss.`;
    }

    rationale = `${opening} ${complication} If not managed rapidly and correctly, this condition may lead to serious complications. It is strongly recommended to securely follow the advised action: ${referralUrgency.toLowerCase()} as soon as functionally possible.`;
  }

  return {
    isValid: true,
    riskScore: score,
    riskLevel,
    triggeredFactors: factors,
    rationale,
    referralUrgency,
    reassuringLine,
    multipleInsightFlag: majorConditionsCount >= 2,
    trendWarningFlag
  };
}
