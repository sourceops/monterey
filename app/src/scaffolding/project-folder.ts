import {inject, NewInstance} from 'aurelia-framework';
import {ValidationRules}      from 'aurelia-validatejs';
import {ValidationController} from 'aurelia-validation';
import {FS}                   from 'monterey-pal';
import {IStep}                from './istep';

/**
 * The ProjectFolder screen asks the user where the project should be created.
 */
@inject(NewInstance.of(ValidationController))
export class ProjectFolder {
  step: IStep;
  state;

  constructor(private validation: ValidationController) {
  }

  async activate(model) {
    this.state = model.state;
    this.step = model.step;
    this.step.execute = () => this.execute();
    this.step.previous = () => this.previous();

    ValidationRules
    .ensure('path').required()
    .on(this.state);
  }

  async previous() {
    return {
      goToPreviousStep: false
    };
  }

  async execute() {
    return {
      goToNextStep: this.validation.validate().length === 0
    };
  }

  async directoryBrowser() {
    let path = await FS.showOpenDialog({
      title: 'Select folder where the Aurelia project will be created in',
      properties: ['openDirectory']
    });

    if (path && path.length > 0) {
      this.state.path = path[0];
    }
    this.state.folder = this.state.path;
  }
}
