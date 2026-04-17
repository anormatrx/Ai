// Skills Resolver - Backend version
import fs from 'node:fs';
import path from 'node:path';

function getSkillDir(key: string): string {
  return process.env[key] || '';
}

export type SkillSource = 'workspace' | 'project-agent' | 'personal-agent' | 'shared';

export type ResolvedSkill = {
  name: string;
  displayName: string;
  skillFile: string;
  source: SkillSource;
  description?: string;
};

function findSkillDirs(root: string): string[] {
  if (!root || !fs.existsSync(root)) return [];

  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(root, d.name))
      .filter((dir) => fs.existsSync(path.join(dir, 'SKILL.md')));
  } catch {
    return [];
  }
}

function readSkillMetadata(skillDir: string): { displayName: string; description: string } {
  const skillFile = path.join(skillDir, 'SKILL.md');
  try {
    const content = fs.readFileSync(skillFile, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const displayName = titleMatch ? titleMatch[1].trim() : path.basename(skillDir);
    const descMatch = content.match(/#{1,2}\s+.+\n\n(.+)/);
    const description = descMatch ? descMatch[1].trim().substring(0, 200) : '';
    return { displayName, description };
  } catch {
    return { displayName: path.basename(skillDir), description: '' };
  }
}

function collect(root: string, source: SkillSource): ResolvedSkill[] {
  const dirs = findSkillDirs(root);
  return dirs.map((dir) => {
    const metadata = readSkillMetadata(dir);
    return {
      name: path.basename(dir),
      displayName: metadata.displayName,
      skillFile: path.join(dir, 'SKILL.md'),
      source,
      description: metadata.description,
    };
  });
}

export function resolveSkills(): ResolvedSkill[] {
  console.log('[resolveSkills] SKILLS_WORKSPACE_DIR:', process.env.SKILLS_WORKSPACE_DIR);
  
  const ordered: ResolvedSkill[] = [
    ...collect(getSkillDir('SKILLS_WORKSPACE_DIR'), 'workspace'),
    ...collect(getSkillDir('SKILLS_PROJECT_AGENT_DIR'), 'project-agent'),
    ...collect(getSkillDir('SKILLS_PERSONAL_AGENT_DIR'), 'personal-agent'),
    ...collect(getSkillDir('SKILLS_SHARED_DIR'), 'shared'),
  ];

  const map = new Map<string, ResolvedSkill>();
  for (const skill of ordered) {
    if (!map.has(skill.name)) {
      map.set(skill.name, skill);
    }
  }

  return [...map.values()];
}