import {autoinject}       from 'aurelia-framework';
import {PluginManager}    from '../../shared/plugin-manager';
import {ApplicationState} from '../../shared/application-state';
import {BasePlugin}       from '../base-plugin';

export function configure(aurelia) {
  let pluginManager = aurelia.container.get(PluginManager);

  pluginManager.registerPlugin(aurelia.container.get(Plugin));
}

@autoinject()
class Plugin extends BasePlugin {
  constructor(private state: ApplicationState) {
    super();
    this.state = state;
  }

  getTiles(project, showIrrelevant) {
    let tiles = [{
      viewModel: 'plugins/app-launcher/editor-tile',
      model: null
    }];

    this.state.appLaunchers.forEach(launcher => {
      tiles.push({
        viewModel: 'plugins/app-launcher/tile',
        model: launcher
      });
    });

    return tiles;
  }

  createId() {
    return Math.floor((Math.random() * 999999999) + 111111111);
  }
}