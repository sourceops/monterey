import {Workflow}      from '../../workflow/workflow';
import {Phase}         from '../../workflow/phase';
import {Step}          from '../../workflow/step';
import {Command}       from './command';
import {CommandRunner} from './command-runner';
import {Task}          from '../task';
import {TaskManager}   from '../task-manager';
import {Project, RandomNumber} from '../../../shared/index';

/**
 * A serializable collection of Commands that can be converted into a Workflow
 */
export class CommandTree {
  id?: number;
  command?: Command;
  tile?: boolean;
  name?: string = 'Workflow';
  children?: Array<CommandTree> = [];

  constructor(obj?: any) {
    if (!obj) return;

    Object.assign(this, obj);

    if (!this.id) {
      this.id = new RandomNumber().create();
      obj.id = this.id;
    }
  }

  createWorkflow(project: Project, commandRunner: CommandRunner, taskManager: TaskManager) {
    let workflow = new Workflow(taskManager, project);
    let phase = new Phase(this.name);
    workflow.addPhase(phase);

    this._addSteps(phase, project, commandRunner, this, null);

    return workflow;
  }

  fromObject(t: CommandTree) {
    function useCommands(tree: CommandTree) {
      if (tree.command) {
        tree.command = new Command().fromObject(tree.command);
      }

      if (!tree.children || tree.children.length === 0) {
        return;
      }

      for (let x = 0; x < tree.children.length; x++) {
        useCommands(tree.children[x]);
      }
    }

    Object.assign(this, t);

    useCommands(this);

    return this;
  }

  _addSteps(phase: Phase, project: Project, commandRunner: CommandRunner, tree: CommandTree, parentStep: Step) {
    let step;

    if (tree.command) {
      step = phase.addStep(this._createStep(tree.command, commandRunner, project));

      if (parentStep) {
        step.task.dependsOn = parentStep.task;
      }
    }

    if (tree.children) {
      for (let child of tree.children) {
        this._addSteps(phase, project, commandRunner, child, step);
      }
    }
  }

  _createStep(command: Command, commandRunner: CommandRunner, project: Project) {
    let cmd = `${command.command} ${command.args.join(' ')}`;
    return new Step(cmd, cmd, commandRunner.run(project, command));
  }
}