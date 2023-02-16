import router from 'kolibri.coreVue.router';
import { IsPinAuthenticated } from 'kolibri.coreVue.vuex.constants';
import { getCookie } from 'kolibri.utils.cookieUtils';
import RootVue from './views/DeviceIndex';
import routes from './routes';
import pluginModule from './modules/pluginModule';
import KolibriApp from 'kolibri_app';
import plugin_data from 'plugin_data';

class DeviceManagementModule extends KolibriApp {
  get routes() {
    return routes;
  }
  get RootVue() {
    return RootVue;
  }
  get pluginModule() {
    return pluginModule;
  }
  checkIfPinAuthenticationIsRequired(store, next) {
    const isLearnOnlyDevice = plugin_data.isSubsetOfUsersDevice;
    const isSuperuser = store.getters.isSuperuser;
    const isFacilityAdmin = store.getters.isFacilityAdmin;
    if (isLearnOnlyDevice && isSuperuser && !isFacilityAdmin) {
      const authenticate = !getCookie(IsPinAuthenticated);
      store.dispatch('displayPinModal', { authenticate, next });
    } else {
      next(true);
    }
  }
  ready() {
    // reset module states after leaving their respective page
    router.beforeEach((to, from, next) => {
      if (this.store.state.core.facilities.length === 0) {
        this.store.dispatch('getFacilities').then(next, next);
      }
      next();
    });
    router.afterEach((toRoute, fromRoute) => {
      this.store.dispatch('resetModuleState', { toRoute, fromRoute });
    });
    router.beforeResolve((to, from, next) => {
      this.checkIfPinAuthenticationIsRequired(this.store, next);
    });
    super.ready();
  }
}

export default new DeviceManagementModule();
