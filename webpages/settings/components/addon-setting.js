export default async function ({ template }) {
  const AddonSetting = Vue.extend({
    props: ["addon", "setting", "addon-settings"],
    template,
    computed: {
      show() {
        if (!this.setting.if) return true;

        if (this.setting.if.addonEnabled) {
          const arr = Array.isArray(this.setting.if.addonEnabled)
            ? this.setting.if.addonEnabled
            : [this.setting.if.addonEnabled];
          if (arr.some((addon) => this.$root.manifestsById[addon]._enabled === true)) return true;
        }

        if (this.setting.if.settings) {
          const anyMatches = Object.keys(this.setting.if.settings).some((settingName) => {
            const arr = Array.isArray(this.setting.if.settings[settingName])
              ? this.setting.if.settings[settingName]
              : [this.setting.if.settings[settingName]];
            return arr.some((possibleValue) => this.addonSettings[settingName] === possibleValue);
          });
          if (anyMatches === true) return true;
        }

        return false;
      },
      isNewOption() {
        if (!this.addon.latestUpdate) return false;

        const [extMajor, extMinor, _] = window.vue.version.split(".");
        const [addonMajor, addonMinor, __] = this.addon.latestUpdate.version.split(".");
        if (!(extMajor === addonMajor && extMinor === addonMinor)) return false;

        if (this.addon.latestUpdate.newSettings && this.addon.latestUpdate.newSettings.includes(this.setting.id))
          return true;
        else return false;
      },
    },
    methods: {
      settingsName(addon) {
        const name = this.setting.name;
        const regex = /([\\]*)(@|#)([a-zA-Z0-9.\-\/_]*)/g;
        return name.replace(regex, (icon) => {
          if (icon[0] === "\\") {
            return icon.slice(1);
          }
          if (icon[0] === "@") {
            return `<img class="inline-icon" src="../../images/icons/${icon.split("@")[1]}"/>`;
          }
          if (icon[0] === "#") {
            return `<img class="inline-icon" src="../../addons/${addon._addonId}/${icon.split("#")[1]}"/>`;
          }
        });
      },

      showResetDropdown() {
        return (
          this.addon.presets &&
          this.addon.presets.some((preset) =>
            Object.prototype.hasOwnProperty.call(preset.values, this.setting.id) && this.setting.type === "color"
              ? preset.values[this.setting.id].toLowerCase() !== this.setting.default.toLowerCase()
              : preset.values[this.setting.id] !== this.setting.default
          )
        );
      },
      checkValidity() {
        // Needed to get just changed input to enforce it's min, max, and integer rule if the user "manually" sets the input to a value.
        let input = document.querySelector(
          `input[data-addon-id='${this.addon._addonId}'][data-setting-id='${this.setting.id}']`
        );
        this.addonSettings[this.setting.id] = input.validity.valid ? input.value : this.setting.default;
      },
      keySettingKeyDown(e) {
        e.preventDefault();
        e.target.value = e.ctrlKey
          ? "Ctrl" +
            (e.shiftKey ? " + Shift" : "") +
            (e.key === "Control" || e.key === "Shift"
              ? ""
              : (e.ctrlKey ? " + " : "") +
                (e.key.toUpperCase() === e.key
                  ? e.code.includes("Digit")
                    ? e.code.substring(5, e.code.length)
                    : e.key
                  : e.key.toUpperCase()))
          : "";
      },
      keySettingKeyUp(e) {
        // Ctrl by itself isn't a hotkey
        if (e.target.value === "Ctrl") e.target.value = "";
        this.updateOption(e.target.value);
      },
      msg(...params) {
        return this.$root.msg(...params);
      },
      updateSettings(...params) {
        if (!params[0]) params[0] = this.addon;
        this.$root.updateSettings(...params);
      },
      updateOption(newValue) {
        this.addonSettings[this.setting.id] = newValue;
        this.updateSettings();
      },
    },
    events: {
      closePickers(...params) {
        return this.$root.closePickers(...params);
      },
      closeResetDropdowns(...params) {
        return this.$root.closeResetDropdowns(...params);
      },
    },
  });
  Vue.component("addon-setting", AddonSetting);
}
