<template>
  <div class="settings-fields">
    <section class="box">
      <div class="box__content">
        <MenuItem
          label="Upload mode."
          description="The uploaded photos will be added to the selected section.">
          <select v-model="currentValue.app.uploadMode"
                  class="input">
            <option value="none">
              Pending
            </option>
            <option value="go-preferences">
              Pending -> Preferences
            </option>
            <option value="add-queue">
              Queue
            </option>
          </select>
        </MenuItem>

        <MenuItem
          label="Use hardware acceleration."
          description="Can improve performance on some devices. (Requires restart to take effect)">
          <select v-model="currentValue.app.disableHardwareAcceleration"
                  class="input">
            <option :value="false">
              Enabled
            </option>
            <option :value="true">
              Disabled
            </option>
          </select>
        </MenuItem>

        <MenuItem
          label="Queue position."
          description="Change the position of the queue bar to the place that is most comfortable for you.">
          <select v-model="currentValue.app.queuePosition"
                  class="input">
            <option value="right">
              Right
            </option>
            <option value="left">
              Left
            </option>
          </select>
        </MenuItem>
      </div>
    </section>
  </div>
</template>

<script>
import { VModel } from '~/mixins'

export default {
  mixins: [VModel],
}
</script>
