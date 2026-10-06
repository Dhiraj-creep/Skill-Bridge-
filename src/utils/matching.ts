import { DemoOpportunity } from '../types/opportunity';
import { StudentProfile } from '../types/content';

export interface MatchEvaluation {
  opportunity: DemoOpportunity;
  score: number; // 0 to 100
  matchLevel: 'High Fit' | 'Moderate Fit' | 'Partial Fit' | 'General Opportunity';
  matchedReasons: string[];
  mismatchReasons: string[];
  eligibilityStatus: 'Appears Eligible' | 'Check Criteria' | 'Potential Ineligibility';
  explanation: string;
}

export function evaluateOpportunityMatch(
  opp: DemoOpportunity,
  profile: StudentProfile
): MatchEvaluation {
  const matchedReasons: string[] = [];
  const mismatchReasons: string[] = [];
  let score = 0;

  // 1. Department match (Weight: 40 points)
  if (opp.relevantDepartments.includes(profile.department)) {
    score += 40;
    matchedReasons.push(`Open to your department (${profile.department})`);
  } else {
    mismatchReasons.push(
      `Advertised primarily for ${opp.relevantDepartments.join(', ')} rather than ${profile.department}`
    );
  }

  // 2. Role preference match (Weight: 25 points)
  const roleKeywords = profile.preferredRoles.map((r) => r.toLowerCase());
  const oppTitleLower = opp.title.toLowerCase();
  const matchedRole = roleKeywords.find((r) => oppTitleLower.includes(r) || r.includes(oppTitleLower));

  if (matchedRole) {
    score += 25;
    matchedReasons.push(`Title aligns with your preferred role target`);
  } else {
    mismatchReasons.push(`Title does not directly contain your preferred role keywords`);
  }

  // 3. Skill overlap (Weight: 20 points)
  const profileSkillsLower = profile.skills.map((s) => s.toLowerCase());
  const overlappingSkills = opp.skills.filter((sk) =>
    profileSkillsLower.some((ps) => ps.includes(sk.toLowerCase()) || sk.toLowerCase().includes(ps))
  );

  if (overlappingSkills.length > 0) {
    const skillScore = Math.min(20, overlappingSkills.length * 7);
    score += skillScore;
    matchedReasons.push(
      `Matches ${overlappingSkills.length} of your listed skills: ${overlappingSkills.join(', ')}`
    );
  } else {
    mismatchReasons.push(`Requires skills you haven't listed: ${opp.skills.slice(0, 3).join(', ')}`);
  }

  // 4. Location match (Weight: 10 points)
  const profileLocsLower = profile.preferredLocations.map((l) => l.toLowerCase());
  const oppLocLower = opp.location.toLowerCase();
  const isRemote = opp.workMode === 'Remote';
  const locationMatches =
    isRemote || profileLocsLower.some((pl) => oppLocLower.includes(pl) || pl.includes(oppLocLower));

  if (locationMatches) {
    score += 10;
    matchedReasons.push(
      isRemote
        ? 'Remote work mode aligns with flexible location preference'
        : `Location (${opp.location}) matches preferred city`
    );
  } else {
    mismatchReasons.push(`Located in ${opp.location}, outside your preferred locations`);
  }

  // 5. Explicit eligibility checking (Weight: 5 points bonus)
  let eligibilityStatus: 'Appears Eligible' | 'Check Criteria' | 'Potential Ineligibility' = 'Check Criteria';

  if (profile.academicPercentage !== undefined) {
    const elLower = opp.explicitEligibility.toLowerCase();
    const matchPercent = elLower.match(/(\d{2})%/);
    if (matchPercent) {
      const requiredCutoff = parseInt(matchPercent[1], 10);
      if (profile.academicPercentage >= requiredCutoff) {
        score += 5;
        matchedReasons.push(
          `Meets explicit percentage cutoff (${profile.academicPercentage}% >= ${requiredCutoff}%)`
        );
        eligibilityStatus = 'Appears Eligible';
      } else {
        mismatchReasons.push(
          `Your percentage (${profile.academicPercentage}%) is below stated cutoff (${requiredCutoff}%)`
        );
        eligibilityStatus = 'Potential Ineligibility';
      }
    } else {
      eligibilityStatus = 'Check Criteria';
      matchedReasons.push('No rigid percentage cutoff detected; review specific terms');
    }
  } else {
    eligibilityStatus = 'Check Criteria';
    matchedReasons.push('Academic score not entered; eligibility needs checking');
  }

  score = Math.min(100, Math.max(0, score));

  let matchLevel: 'High Fit' | 'Moderate Fit' | 'Partial Fit' | 'General Opportunity' = 'General Opportunity';
  if (score >= 75) matchLevel = 'High Fit';
  else if (score >= 50) matchLevel = 'Moderate Fit';
  else if (score >= 30) matchLevel = 'Partial Fit';

  const explanation =
    matchedReasons.length > 0
      ? `Identified as ${matchLevel} based on: ${matchedReasons.slice(0, 2).join('; ')}.`
      : 'General opportunity available for exploration.';

  return {
    opportunity: opp,
    score,
    matchLevel,
    matchedReasons,
    mismatchReasons,
    eligibilityStatus,
    explanation,
  };
}
