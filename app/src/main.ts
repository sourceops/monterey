import 'bootstrap';
import {LogManager, Aurelia}             from 'aurelia-framework';
import {MonteryLogAppender}              from './shared/monterey-logger';
import {BootstrapFormValidationRenderer} from './shared/bootstrap-validation-renderer';
import {KendoAureliaDialogRenderer}      from './shared/kendo-aurelia-dialog-renderer';
import {ApplicationState}                from './shared/application-state';
import {Cleanup}                         from './shared/cleanup';
import {IPC}                             from './shared/ipc';
import {GlobalExceptionHandler}          from './shared/global-exception-handler';
import {FileSystemLogger}                from './shared/file-system-logger';

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-dialog', config => {
      config.useStandardResources();
      config.useCSS('');
      config.useRenderer(KendoAureliaDialogRenderer)
    })
    .plugin('aurelia-v-grid')
    .plugin('aurelia-validation')
    .plugin('aurelia-validatejs')
    .plugin('context-menu')
    .feature('landing')
    .feature('main')
    .feature('scaffolding')
    .feature('plugins');

  LogManager.addAppender(aurelia.container.get(MonteryLogAppender));
  LogManager.setLevel(LogManager.logLevel.debug);

  try {
    let logger = aurelia.container.get(FileSystemLogger);
    await logger.activate();
  } catch (e) {
    console.log('failed to initialize logger');
    console.log(e);
  }

  let cleanup = new Cleanup();
  let ipc = new IPC(aurelia);
  let globalExceptionHandler = new GlobalExceptionHandler(aurelia);

  
  
  // register the bootstrap validation error renderer under the bootstrap-form key
  // so that aurelia-validation uses this renderer when validation-renderer="bootstrap-form" is put on a form
  aurelia.container.registerHandler('bootstrap-form', container => container.get(BootstrapFormValidationRenderer));

  aurelia.start().then(() => aurelia.setRoot()).then(() => {
    // Monterey has been loaded, let the main process know
    // so that the main process can trigger the auto update process
    ipc.notifyMainOfStart();
  });
}
