import {OS, FS}               from 'monterey-pal';
import {Project}              from '../../shared/project';
import {CommandRunnerService} from '../task-manager/command-runner-service';
import {Task}                 from '../task-manager/task';
import {Command}              from '../task-manager/command';

export class CommandService implements CommandRunnerService {
  async getCommands(project: Project, useCache: boolean): Promise<Array<Command>> {
    return [
      { command: 'au', args: ['run', '--watch'] },
      { command: 'au', args: ['run'] }
    ];
  }

  runCommand(project: Project, command: Command, task: Task, stdout, stderr) {
    // Application Available At: http://localhost:9000
    let cmd = OS.getPlatform() === 'win32' ? `${command.command}.cmd` : command.command;

    let result = OS.spawn(cmd, command.args, { cwd:  project.path }, out => {
      this.tryGetPort(project, out, task);
      stdout(out);
    }, err => stderr(err));
    return result;
  }

  // parse the output, try and find what url the project is running under
  tryGetPort(project: Project, text: string, task: Task) {
    let matches = text.match(/Application Available At: (.*)/);
    if (matches && matches.length === 2) {
      project.__meta__.url = matches[1];
      task.estimation = null;
      task.description = `Project running at <a href="${project.__meta__.url}" target="_blank">${project.__meta__.url}</a>`;
    }
  }

  stopCommand(process) {
    return OS.kill(process);
  }
}