import fs from "fs";
import path from "path";

export interface AgentConfig {
  identifier: string;
  name: string;
  systemPrompt: string;
  whenToUse: string;
  isActive: boolean;
}

export class AgentService {
  private agentsFile: string = path.join(process.cwd(), "deployed_agents.json");
  private agents: AgentConfig[] = [];

  constructor() {
    this.loadAgents();
  }

  private loadAgents() {
    if (fs.existsSync(this.agentsFile)) {
      try {
        const data = fs.readFileSync(this.agentsFile, "utf-8");
        this.agents = JSON.parse(data);
      } catch (e) {
        this.agents = [];
      }
    }
  }

  private saveAgents() {
    fs.writeFileSync(this.agentsFile, JSON.stringify(this.agents, null, 4), "utf-8");
  }

  public deployAgent(config: AgentConfig) {
    const existingIndex = this.agents.findIndex(a => a.identifier === config.identifier);
    if (existingIndex > -1) {
      this.agents[existingIndex] = config;
    } else {
      this.agents.push(config);
    }
    this.saveAgents();
    return { success: true, identifier: config.identifier };
  }

  public listAgents() {
    return this.agents;
  }

  public getAgent(identifier: string) {
    return this.agents.find(a => a.identifier === identifier);
  }

  public deleteAgent(identifier: string) {
    this.agents = this.agents.filter(a => a.identifier !== identifier);
    this.saveAgents();
    return { success: true };
  }
}
