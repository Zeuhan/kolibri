<template>

  <OnboardingStepBase
    :title="$tr('setUpFacilityTitle')"
    :description="$tr('setUpFacilityDescription')"
    @continue="handleContinue"
  >
    <KRadioButton
      v-model="selected"
      :label="$tr('joinFacilityLabel')"
      :value="Options.JOIN"
      class="radio-button"
      :autofocus="isJoinSetup"
    />
    <KRadioButton
      v-model="selected"
      :label="$tr('importFromFacilityLabel')"
      :value="Options.IMPORT"
      class="radio-button"
      :autofocus="isImportSetup"
    />
    <SelectDeviceModalGroup
      v-if="showSelectAddressModal"
      :filterLODAvailable="true"
      :filterByFacilityCanSignUp="selected === Options.JOIN ? true : null"
      @cancel="showSelectAddressModal = false"
      @submit="handleContinueImport"
    />
  </OnboardingStepBase>

</template>


<script>

  import { SelectDeviceModalGroup } from 'kolibri.coreVue.componentSets.sync';
  import { LodTypePresets as Options } from '../constants';
  import OnboardingStepBase from './OnboardingStepBase';

  export default {
    name: 'JoinOrNewLOD',
    components: {
      OnboardingStepBase,
      SelectDeviceModalGroup,
    },
    inject: ['wizardService'],
    data() {
      return {
        Options,
        selected: Options.JOIN,
        showSelectAddressModal: false,
      };
    },
    computed: {
      isJoinSetup() {
        return this.selected === Options.JOIN;
      },
      isImportSetup() {
        return this.selected === Options.IMPORT;
      },
    },
    methods: {
      handleContinueImport(address) {
        this.wizardService.send({
          type: 'CONTINUE',
          value: { importDeviceId: address.id, importOrJoin: this.selected },
        });
      },
      handleContinue() {
        this.showSelectAddressModal = true;
      },
    },
    $trs: {
      setUpFacilityTitle: {
        message: 'Select a facility setup for this learn-only device',
        context: '',
      },
      setUpFacilityDescription: {
        message:
          'This device will have Kolibri features for learners, but not those for coaches and admins',
        context: '',
      },
      joinFacilityLabel: {
        message: 'Create a new user account for an existing facility',
        context: '',
      },
      importFromFacilityLabel: {
        message: 'Import one or more existing user accounts from an existing facility',
        context: '',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .radio-button {
    padding-bottom: 8px;
    font-size: 0.875em;
  }

</style>
