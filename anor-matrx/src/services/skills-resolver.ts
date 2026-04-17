// src/services/skills-resolver.ts
// Skills Resolver Service - Unified skills from all layers

import fs from "node:fs";
import path from "node:path";
import { runtime } from "../config/runtime";

export type SkillSource =
  | "workspace"
  | "project-agent"
  | "personal-agent"
  | "shared";

export type ResolvedSkill = {
  name: string;
  displayName: string;
  skillFile: string;
  source: SkillSource;
  description?: string;
};

/**
 * Find all skill directories under a root path
 */
function findSkillDirs(root: string): string[] {
  if (!root || !fs.existsSync(root)) return [];
  
  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(root, d.name))
      .filter((dir) => fs.existsSync(path.join(dir, "SKILL.md")));
  } catch (err) {
    console.error(`[SkillsResolver] Failed to read directory: ${root}`, err);
    return [];
  }
}

/**
 * Read skill metadata from SKILL.md file
 */
function readSkillMetadata(skillDir: string): { displayName: string; description: string } {
  const skillFile = path.join(skillDir, "SKILL.md");
  try {
    const content = fs.readFileSync(skillFile, "utf-8");
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const displayName = titleMatch ? titleMatch[1].trim() : path.basename(skillDir);
    
    // Extract description from first paragraph after title
    const descMatch = content.match(/#{1,2}\s+.+\n\n(.+)/);
    const description = descMatch ? descMatch[1].trim().substring(0, 200) : "";
    
    return { displayName, description };
  } catch {
    return { displayName: path.basename(skillDir), description: "" };
  }
}

/**
 * Collect skills from a specific root and source type
 */
function collect(root: string, source: SkillSource): ResolvedSkill[] {
  const dirs = findSkillDirs(root);
  return dirs.map((dir) => {
    const metadata = readSkillMetadata(dir);
    return {
      name: path.basename(dir),
      displayName: metadata.displayName,
      skillFile: path.join(dir, "SKILL.md"),
      source,
      description: metadata.description,
    };
  });
}

/**
 * Resolve all skills from all layers with proper precedence
 * Precedence: workspace > project-agent > personal-agent > shared
 * First occurrence wins (no duplicates)
 */
export function resolveSkills(): ResolvedSkill[] {
  const ordered: ResolvedSkill[] = [
    ...collect(runtime.skills.workspaceDir, "workspace"),
    ...collect(runtime.skills.projectAgentDir, "project-agent"),
    ...collect(runtime.skills.personalAgentDir, "personal-agent"),
    ...collect(runtime.skills.sharedDir, "shared"),
  ];

  // Deduplicate by name, keeping first occurrence (highest precedence)
  const map = new Map<string, ResolvedSkill>();
  for (const skill of ordered) {
    if (!map.has(skill.name)) {
      map.set(skill.name, skill);
    }
  }
  
  const result = [...map.values()];
  console.log(`[SkillsResolver] Loaded ${result.length} skills from ${ordered.length} total found`);
  return result;
}

/**
 * Get skills by source
 */
export function getSkillsBySource(source: SkillSource): ResolvedSkill[] {
  const all = resolveSkills();
  return all.filter((s) => s.source === source);
}

/**
 * Get skill by name
 */
export function getSkillByName(name: string): ResolvedSkill | null {
  const all = resolveSkills();
  return all.find((s) => s.name === name) || null;
}

/**
 * Get skill content
 */
export function getSkillContent(name: string): string | null {
  const skill = getSkillByName(name);
  if (!skill) return null;
  
  try {
    return fs.readFileSync(skill.skillFile, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Get all skill names for debugging
 */
export function getAllSkillNames(): string[] {
  const all = resolveSkills();
  return all.map((s) => s.name);
}

export default {
  resolveSkills,
  getSkillsBySource,
  getSkillByName,
  getSkillContent,
  getAllSkillNames,
};