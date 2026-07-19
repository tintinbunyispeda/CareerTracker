import type { UserSkill } from '../types';

export interface MatchResult {
  score: number;
  priority: 'High' | 'Medium' | 'Low';
  strongMatches: string[];
  partialMatches: string[];
  skillGaps: string[];
  recommendedSkills: string[];
}

/**
 * Deterministically calculates alignment metrics between user profile and job requirements.
 * Weighted: Required Skills = 80%, Preferred Skills = 20%
 * Includes Skill Confidence weights and Work Experience Title matching bonuses!
 */
export const calculateMatchMetrics = (
  userSkills: UserSkill[],
  requiredSkills: string[] = [],
  preferredSkills: string[] = [],
  experiences: { role: string }[] = [],
  jobTitle: string = ''
): MatchResult => {
  // Normalize user skills for easy lookup
  const userSkillsMap = new Map<string, number>();
  userSkills.forEach(s => userSkillsMap.set(s.name.toLowerCase(), s.confidence));

  const strongMatches: string[] = [];
  const partialMatches: string[] = [];
  const skillGaps: string[] = [];

  let requiredEarnedPoints = 0;

  // 1. Evaluate Required Skills (80% weight)
  requiredSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    
    if (userSkillsMap.has(sLower)) {
      strongMatches.push(skill);
      // Add points weighted by confidence (e.g., 90% confidence = 0.9 points)
      const confidence = userSkillsMap.get(sLower) || 100;
      requiredEarnedPoints += confidence / 100;
    } else {
      // Check for partial substring matches (e.g., "JS" in "JavaScript")
      let partialFound = false;
      for (const [uSkill, uConfidence] of userSkillsMap.entries()) {
        if (uSkill.includes(sLower) || sLower.includes(uSkill)) {
          partialMatches.push(skill);
          // Partial matches get 50% of the confidence score
          requiredEarnedPoints += (uConfidence / 100) * 0.5;
          partialFound = true;
          break;
        }
      }
      if (!partialFound) {
        skillGaps.push(skill);
      }
    }
  });

  const reqTotal = requiredSkills.length;
  const reqScore = reqTotal > 0 ? requiredEarnedPoints / reqTotal : 1.0;

  // 2. Evaluate Preferred Skills (20% weight)
  let preferredEarnedPoints = 0;
  const preferredMatches: string[] = [];

  preferredSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (userSkillsMap.has(sLower)) {
      preferredMatches.push(skill);
      const confidence = userSkillsMap.get(sLower) || 100;
      preferredEarnedPoints += confidence / 100;
    }
  });

  const prefTotal = preferredSkills.length;
  const prefScore = prefTotal > 0 ? preferredEarnedPoints / prefTotal : 1.0;

  // 3. Base Weighted Skill Score
  let baseScore = 100;
  if (reqTotal > 0 || prefTotal > 0) {
    const reqWeight = reqTotal > 0 ? 0.8 : 0;
    const prefWeight = prefTotal > 0 ? 0.2 : 0;
    const divisor = reqWeight + prefWeight;
    baseScore = ((reqScore * reqWeight) + (prefScore * prefWeight)) / divisor * 100;
  }

  // 4. Role Experience Matching Bonus (+15 Points)
  let experienceBonus = 0;
  if (jobTitle && experiences.length > 0) {
    const titleLower = jobTitle.toLowerCase();
    const experienceRoles = experiences.map(e => e.role.toLowerCase());
    
    // Core keywords to analyze
    const matchingKeywords = ['backend', 'frontend', 'fullstack', 'react', 'typescript', 'python', 'design', 'ui', 'ux', 'mobile', 'data'];
    
    const matched = matchingKeywords.filter(keyword => {
      // Check if keyword is in the job title AND in any of the previous roles
      const inJobTitle = titleLower.includes(keyword);
      const inExperience = experienceRoles.some(role => role.includes(keyword));
      return inJobTitle && inExperience;
    });

    if (matched.length > 0) {
      // Add +15 points if they have aligned experience
      experienceBonus = 15;
    }
  }

  // Calculate final score, capped at 100%
  const score = Math.round(Math.min(100, baseScore + experienceBonus));

  // 5. Determine Priority Rank
  let priority: 'High' | 'Medium' | 'Low' = 'Medium';
  if (score >= 80) priority = 'High';
  else if (score < 50) priority = 'Low';

  // 6. Select recommended skills to learn next (top 3 missing required skills)
  const recommendedSkills = [...skillGaps].slice(0, 3);
  if (recommendedSkills.length === 0 && preferredSkills.length > 0) {
    preferredSkills.forEach(skill => {
      if (!userSkillsMap.has(skill.toLowerCase()) && recommendedSkills.length < 3) {
        recommendedSkills.push(skill);
      }
    });
  }

  return {
    score,
    priority,
    strongMatches,
    partialMatches,
    skillGaps,
    recommendedSkills
  };
};
