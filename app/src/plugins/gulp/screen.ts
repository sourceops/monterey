import {Main} from '../../main/main';
import {SelectedProject, autoinject} from '../../shared/index';

@autoinject()
export class Screen {

  constructor(private main: Main,
              private selectedProject: SelectedProject) {
  }

  goBack() {
    this.main.returnToPluginList();
  }
}
