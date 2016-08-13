import {Project}              from '../../shared/project';
import {ApplicationState}     from '../../shared/application-state';
import {inject, NewInstance}  from 'aurelia-framework';
import {ValidationRules}      from 'aurelia-validatejs';
import {ValidationController} from 'aurelia-validation';
import {Notification}         from '../../shared/notification';
import {FS}                   from 'monterey-pal';
import {Main}                 from '../../main/main';

@inject(ApplicationState, NewInstance.of(ValidationController), Notification, Main)
export class Screen {
  project: Project;

  constructor(private state: ApplicationState,
              private validation: ValidationController,
              private notification: Notification,
              private main: Main) {
  }

  async activate(model) {
    this.project = model.selectedProject;
  }

  async browser() {
    let paths = await FS.showOpenDialog({
      title: 'Select gulpfile.js',
      properties: ['openFile'],
      defaultPath: this.project.path,
      filters: [
        { name: 'Javascript', extensions: ['js'] }
      ]
    });

    if (paths.length === 1) {
      this.project.gulpfile = paths[0];
    } else {
      this.notification.error('Please select one gulpfile.js file');
    }
  }

  async save() {
    if (this.validation.validate().length > 0) {
      this.notification.error('There are validation errors');
      return;
    }

    await this.state._save();
    this.notification.success('Changes saved');
  }

  goBack() {
    this.main.returnToPluginList();
  }
}
