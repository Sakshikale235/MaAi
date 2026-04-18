import protocols from '../constants/protocols.json';

export function calculateRisk(data) {
  let riskFactors = [];
  let isEmergency = false;

  const { bpSystolic, bpDiastolic, muac, fetalHr, symptoms } = data;

  // BP Check
  if (bpSystolic >= protocols.bp_high.systolic || bpDiastolic >= protocols.bp_high.diastolic) {
    riskFactors.push(protocols.bp_high.reason);
  }

  // MUAC Check
  if (muac && muac < protocols.muac_low.threshold) {
    riskFactors.push(protocols.muac_low.reason);
  }

  // Fetal HR Check
  if (fetalHr && (fetalHr < protocols.fetal_hr.low || fetalHr > protocols.fetal_hr.high)) {
    riskFactors.push(protocols.fetal_hr.reason);
    isEmergency = true;
  }

  // Symptoms Check
  if (symptoms && symptoms.includes('bleeding')) {
    riskFactors.push('Patient reported bleeding');
    isEmergency = true;
  }
  
  if (symptoms && symptoms.includes('swelling')) {
    riskFactors.push('Patient reported swelling');
  }

  let riskLevel = 'LOW';
  let action = 'Routine monitoring';

  if (isEmergency) {
    riskLevel = 'EMERGENCY';
    action = 'Immediate hospital referral';
  } else if (riskFactors.length >= 2) {
    riskLevel = 'HIGH';
    action = 'Doctor consultation';
  } else {
    riskLevel = 'LOW';
    action = 'Routine monitoring';
  }

  return {
    risk: riskLevel,
    factors: riskFactors,
    action: action
  };
}
