import { execSync } from "child_process";

export class GitHubService {
  /**
   * Gets the current git status
   */
  private safeExec(command: string): string {
    try {
      return execSync(command, { encoding: "utf-8", timeout: 30000 });
    } catch (error: any) {
      if (error.stdout) return error.stdout.toString();
      if (error.stderr) return error.stderr.toString();
      return `Git Error: ${error.message}`;
    }
  }

  public getStatus(): string {
    return this.safeExec("git status");
  }

  public commit(message: string): string {
    const addResult = this.safeExec("git add .");
    const commitResult = this.safeExec(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    return `Add Result: ${addResult}\nCommit Result: ${commitResult}`;
  }

  public push(branch: string = "main"): string {
    return this.safeExec(`git push origin ${branch}`);
  }

  public pull(branch: string = "main"): string {
    return this.safeExec(`git pull origin ${branch}`);
  }

  public init(): string {
    return this.safeExec("git init");
  }

  public addRemote(url: string): string {
    return this.safeExec(`git remote add origin ${url}`);
  }
}

export const gitHubService = new GitHubService();
