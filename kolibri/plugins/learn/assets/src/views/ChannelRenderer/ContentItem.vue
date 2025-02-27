<template>

  <div>
    <template v-if="sessionReady">
      <ContentRenderer
        v-if="!assessment"
        class="content-renderer"
        v-bind="contentProps"
        v-on="contentHandlers"
      />

      <AssessmentWrapper
        v-else
        class="content-renderer"
        v-bind="exerciseProps"
        v-on="contentHandlers"
      />
    </template>
    <KCircularLoader v-else />

  </div>

</template>


<script>

  import { mapState, mapGetters } from 'vuex';
  import { assessmentMetaDataState } from 'kolibri.coreVue.vuex.mappers';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import { setContentNodeProgress } from '../../composables/useContentNodeProgress';
  import useProgressTracking from '../../composables/useProgressTracking';
  import AssessmentWrapper from '../AssessmentWrapper';

  export default {
    name: 'ContentItem',
    components: {
      AssessmentWrapper,
    },
    setup() {
      const {
        progress,
        time_spent,
        extra_fields,
        pastattempts,
        complete,
        totalattempts,
        initContentSession,
        updateContentSession,
        startTrackingProgress,
        stopTrackingProgress,
      } = useProgressTracking();
      return {
        progress,
        time_spent,
        extra_fields,
        pastattempts,
        complete,
        totalattempts,
        initContentSession,
        updateContentSession,
        startTracking: startTrackingProgress,
        stopTracking: stopTrackingProgress,
      };
    },
    props: {
      contentNode: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        wasIncomplete: false,
        sessionReady: false,
      };
    },
    computed: {
      ...mapGetters(['currentUserId']),
      ...mapState({
        fullName: state => state.core.session.full_name,
      }),
      contentIsExercise() {
        return this.contentNode.kind === ContentNodeKinds.EXERCISE;
      },
      contentHandlers() {
        return {
          startTracking: this.startTracking,
          stopTracking: this.stopTracking,
          updateProgress: this.updateProgress,
          addProgress: this.addProgress,
          updateContentState: this.updateContentState,
          updateInteraction: this.updateInteraction,
        };
      },
      contentProps() {
        if (this.contentIsExercise) {
          return {};
        }
        return {
          kind: this.contentNode.kind,
          lang: this.contentNode.lang,
          files: this.contentNode.files,
          options: this.contentNode.options,
          available: this.contentNode.available,
          extraFields: this.extra_fields,
          progress: this.progress,
          userId: this.currentUserId,
          userFullName: this.fullName,
          timeSpent: this.time_spent,
        };
      },
      exerciseProps() {
        if (!this.contentIsExercise) {
          return {};
        }
        const assessment = assessmentMetaDataState(this.contentNode);
        return {
          kind: this.contentNode.kind,
          files: this.contentNode.files,
          lang: this.contentNode.lang,
          randomize: this.contentNode.randomize,
          masteryModel: assessment.masteryModel,
          assessmentIds: assessment.assessmentIds,
          available: this.contentNode.available,
          extraFields: this.extra_fields,
          progress: this.progress,
          userId: this.currentUserId,
          userFullName: this.fullName,
          timeSpent: this.time_spent,
          pastattempts: this.pastattempts,
          mastered: this.complete,
          totalattempts: this.totalattempts,
        };
      },
      assessment() {
        if (this.contentNode.kind !== ContentNodeKinds.EXERCISE) {
          return null;
        } else {
          return assessmentMetaDataState(this.contentNode);
        }
      },
    },
    created() {
      return this.initContentSession({
        node: this.contentNode,
      }).then(() => {
        this.sessionReady = true;
        this.setWasIncomplete();
        // Set progress into the content node progress store in case it was not already loaded
        this.cacheProgress();
      });
    },
    methods: {
      setWasIncomplete() {
        this.wasIncomplete = this.progress < 1;
      },
      /*
       * Update the progress of the content node in the shared progress store
       * in the useContentNodeProgress composable. Do this to have a single
       * source of truth for referencing progress of content nodes.
       */
      cacheProgress() {
        setContentNodeProgress({ content_id: this.content.content_id, progress: this.progress });
      },
      updateInteraction({ progress, interaction }) {
        this.updateContentSession({
          interaction,
          progress,
        }).then(this.cacheProgress);
      },
      updateProgress(progress) {
        this.updateContentSession({ progress }).then(this.cacheProgress);
      },
      addProgress(progressDelta) {
        this.updateContentSession({ progressDelta }).then(this.cacheProgress);
      },
      updateContentState(contentState) {
        this.updateContentSession({ contentState });
      },
    },
  };

</script>


<style lang="scss" scoped>

  .content-renderer {
    // Needs to be one less than the ScrollingHeader's z-index of 4
    z-index: 3;
  }

</style>
